"""Fixture tests plus a real, read-only checkout smoke test; no Git mutations."""

import hashlib
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "skills/git-isolation/scripts/preflight.sh"
TEMP_ROOT = Path(os.environ.get("OPENCODE_TMP_DIR", str(Path(tempfile.gettempdir()) / "opencode")))
if not TEMP_ROOT.is_dir():
    TEMP_ROOT = None

FAKE_GIT = r'''#!/usr/bin/env python3
import json, os, sys
args = sys.argv[1:]
assert args[:5] == ["--no-pager", "-c", "core.fsmonitor=false", "-c", "core.hooksPath=/dev/null"]
args = args[5:]
assert os.environ["GIT_OPTIONAL_LOCKS"] == "0"
assert os.environ["GIT_NO_LAZY_FETCH"] == "1"
assert os.environ["GIT_TERMINAL_PROMPT"] == "0"
with open(os.environ["CALLS"], "a") as f: f.write(json.dumps(args) + "\n")
case = os.environ["CASE"]
if case == "not-git": print("fatal: not a git repository", file=sys.stderr); sys.exit(128)
if args == ["rev-parse", "--is-inside-work-tree"]: print("false" if case == "bare" else "true")
elif args == ["rev-parse", "--show-toplevel"]: print("/fixture/repo with spaces")
elif args == ["symbolic-ref", "--quiet", "--short", "HEAD"]:
    if case == "detached": sys.exit(1)
    print("feature/example")
elif args == ["rev-parse", "--verify", "--quiet", "HEAD"]:
    if case == "unborn": sys.exit(1)
    print("a" * 40)
elif args == ["status", "--porcelain=v1", "--untracked-files=all"]:
    if case == "failure": print("fatal: index unreadable", file=sys.stderr); sys.exit(7)
    if case == "dirty": print('M  staged.txt\n M unstaged.txt\n?? "untracked file.txt"')
    if case == "bounded": print("\n".join("?? file-" + str(i) for i in range(200)))
    if case == "long-line": print("X" * 10000)
elif args in (["diff", "--no-ext-diff", "--no-textconv", "--stat"],
              ["diff", "--cached", "--no-ext-diff", "--no-textconv", "--stat"]):
    if case == "dirty": print(" tracked.txt | 1 +")
elif args == ["worktree", "list", "--porcelain"]:
    print("worktree /fixture/repo with spaces\nHEAD " + "a" * 40 + "\nbranch refs/heads/feature/example")
    if case == "worktrees": print("\nworktree /fixture/second\nHEAD " + "b" * 40 + "\ndetached")
else: raise AssertionError("unexpected command: " + repr(args))
'''


class PreflightTest(unittest.TestCase):
    def fixture(self, case, *args):
        with tempfile.TemporaryDirectory(prefix="preflight-test-", dir=TEMP_ROOT) as directory:
            directory = Path(directory)
            git = directory / "git"
            git.write_text(FAKE_GIT)
            git.chmod(0o755)
            calls = directory / "calls"
            env = {**os.environ, "PATH": str(directory) + os.pathsep + os.environ["PATH"],
                   "CASE": case, "CALLS": str(calls)}
            result = subprocess.run(["sh", str(SCRIPT), *args], cwd=directory, env=env,
                                    capture_output=True, text=True, timeout=15)
            return result, calls.read_text() if calls.exists() else ""

    def test_clean(self):
        result, calls = self.fixture("clean")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("(none)", result.stdout)
        self.assertEqual(len(calls.splitlines()), 8)

    def test_dirty(self):
        result, _ = self.fixture("dirty")
        self.assertEqual(result.returncode, 0, result.stderr)
        for status in ["M  staged.txt", " M unstaged.txt", '?? "untracked file.txt"']:
            self.assertIn(status, result.stdout)

    def test_detached_and_unborn(self):
        for case, expected in [("detached", "(detached)"), ("unborn", "(unborn; no commit yet)")]:
            with self.subTest(case=case):
                result, _ = self.fixture(case)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertIn(expected, result.stdout)

    def test_worktrees(self):
        result, _ = self.fixture("worktrees")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("worktree /fixture/second", result.stdout)

    def test_errors_preserved(self):
        for case, code, message in [("not-git", 128, "not a git repository"),
                                    ("bare", 1, "not a bare repository"),
                                    ("failure", 7, "index unreadable")]:
            with self.subTest(case=case):
                result, _ = self.fixture(case)
                self.assertEqual(result.returncode, code)
                self.assertIn(message, result.stderr)

    def test_bounds(self):
        for case in ["bounded", "long-line"]:
            with self.subTest(case=case):
                result, _ = self.fixture(case)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertIn("[truncated; inspect this section separately]", result.stdout)
                self.assertLess(len(result.stdout), 5000)

    def test_arguments_rejected(self):
        result, calls = self.fixture("clean", "--anything")
        self.assertEqual(result.returncode, 2)
        self.assertEqual(calls, "")

    def test_real_checkout_unchanged(self):
        env = {**os.environ, "GIT_OPTIONAL_LOCKS": "0"}
        def status():
            return subprocess.check_output(["git", "status", "--porcelain=v1"], cwd=ROOT, env=env)
        index = Path(subprocess.check_output(["git", "rev-parse", "--git-path", "index"],
                                            cwd=ROOT, env=env, text=True).strip())
        if not index.is_absolute(): index = ROOT / index
        before_status = status()
        before_index = hashlib.sha256(index.read_bytes()).digest()
        result = subprocess.run(["sh", str(SCRIPT)], cwd=ROOT, env=env,
                                capture_output=True, text=True, timeout=15)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(before_status, status())
        self.assertEqual(before_index, hashlib.sha256(index.read_bytes()).digest())
        self.assertNotIn("https://", result.stdout)


if __name__ == "__main__":
    unittest.main()
