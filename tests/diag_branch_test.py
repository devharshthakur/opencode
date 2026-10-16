"""Integration and edge-case tests for skills/fix/scripts/diag-branch.sh in disposable temp Git repos."""

import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "skills/fix/scripts/diag-branch.sh"
TEMP_ROOT = Path(os.environ.get("OPENCODE_TMP_DIR", str(Path(tempfile.gettempdir()) / "opencode")))
if not TEMP_ROOT.is_dir():
    TEMP_ROOT = None


class DiagBranchTest(unittest.TestCase):
    def make_repo(self, directory: Path):
        self.git(directory, "init", "-q", "-b", "main")
        self.git(directory, "config", "user.name", "Test")
        self.git(directory, "config", "user.email", "test@example.com")
        (directory / "staged.txt").write_text("v0\n")
        (directory / "both.txt").write_text("line1-v0\nline2-v0\n")
        (directory / "unstaged.txt").write_text("v0\n")
        (directory / "to_delete_unstaged.txt").write_text("keep\n")
        (directory / "to_delete_staged.txt").write_text("keep\n")
        (directory / ".gitignore").write_text("*.env\n")
        self.git(directory, "add", ".")
        self.git(directory, "commit", "-q", "-m", "initial")

    def git(self, cwd: Path, *args, check=True):
        return subprocess.run(
            ["git", *args],
            cwd=cwd,
            capture_output=True,
            text=True,
            check=check,
            timeout=15,
        )

    def run_diag(self, cwd: Path, *args):
        return subprocess.run(
            ["sh", str(SCRIPT), *args],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=15,
        )

    def snapshot_state(self, cwd: Path):
        return {
            "head": self.git(cwd, "rev-parse", "HEAD").stdout.strip(),
            "branch": self.git(cwd, "branch", "--show-current").stdout.strip(),
            "status": self.git(cwd, "status", "--porcelain=v1", "-uall").stdout,
            "staged": self.git(cwd, "diff", "--cached").stdout,
            "unstaged": self.git(cwd, "diff").stdout,
        }

    def test_clean_repo_roundtrip_with_chaotic_diagnosis(self):
        with tempfile.TemporaryDirectory(prefix="diag-branch-clean-", dir=TEMP_ROOT) as tmp:
            repo = Path(tmp)
            self.make_repo(repo)
            before = self.snapshot_state(repo)

            enter = self.run_diag(repo, "enter", "clean-bug")
            self.assertEqual(enter.returncode, 0, enter.stderr)
            self.assertEqual(self.git(repo, "branch", "--show-current").stdout.strip(), "fix/diag-clean-bug")

            # Add debug instrumentation, untracked repro script, and an extra commit
            (repo / "unstaged.txt").write_text("v0\n[DEBUG-1] probe\n")
            (repo / "repro.sh").write_text("#!/bin/sh\nexit 1\n")
            self.git(repo, "add", "repro.sh")
            self.git(repo, "commit", "-q", "-m", "temp diag commit")

            leave = self.run_diag(repo, "leave", "clean-bug")
            self.assertEqual(leave.returncode, 0, leave.stderr)
            self.assertEqual(self.snapshot_state(repo), before)
            self.assertFalse((repo / "repro.sh").exists())
            self.assertEqual(self.git(repo, "branch", "--list", "fix/diag-*").stdout.strip(), "")

    def test_dirty_repo_preserves_staged_partially_staged_unstaged_deletions_untracked_and_ignored(self):
        with tempfile.TemporaryDirectory(prefix="diag-branch-dirty-", dir=TEMP_ROOT) as tmp:
            repo = Path(tmp)
            self.make_repo(repo)

            # 1. Staged modification
            (repo / "staged.txt").write_text("v1-staged\n")
            self.git(repo, "add", "staged.txt")

            # 2. Partially staged file (v1 staged, v2 unstaged)
            (repo / "both.txt").write_text("line1-v1-staged\nline2-v0\n")
            self.git(repo, "add", "both.txt")
            (repo / "both.txt").write_text("line1-v1-staged\nline2-v2-unstaged\n")

            # 3. Staged new file + unstaged edit on top
            (repo / "new_staged.txt").write_text("new-v1\n")
            self.git(repo, "add", "new_staged.txt")
            (repo / "new_staged.txt").write_text("new-v1\nnew-v2-unstaged\n")

            # 4. Unstaged modification
            (repo / "unstaged.txt").write_text("v1-unstaged\n")

            # 5. Staged deletion & unstaged deletion
            self.git(repo, "rm", "-q", "to_delete_staged.txt")
            (repo / "to_delete_unstaged.txt").unlink()

            # 6. Untracked file in nested directory with spaces + ignored .env
            nested = repo / "nested"
            nested.mkdir()
            untracked = nested / "untracked file.txt"
            untracked.write_text("untracked-original\n")
            (repo / ".env").write_text("SECRET=keep\n")

            before = self.snapshot_state(repo)

            enter = self.run_diag(repo, "enter", "dirty-bug")
            self.assertEqual(enter.returncode, 0, enter.stderr)
            self.assertEqual(self.git(repo, "status", "--porcelain=v1", "-uall").stdout, "")
            self.assertIn("line2-v2-unstaged", (repo / "both.txt").read_text())
            self.assertEqual(untracked.read_text(), "untracked-original\n")

            # Mutate files, delete untracked file, add throwaway files during diagnosis
            (repo / "both.txt").write_text("diag-mutated\n")
            (repo / "staged.txt").write_text("diag-mutated\n")
            untracked.unlink()
            (repo / "throwaway.log").write_text("debug\n")
            self.git(repo, "add", "both.txt")

            leave = self.run_diag(repo, "leave", "dirty-bug")
            self.assertEqual(leave.returncode, 0, leave.stderr)
            self.assertEqual(self.snapshot_state(repo), before)
            self.assertEqual(untracked.read_text(), "untracked-original\n")
            self.assertEqual((repo / ".env").read_text(), "SECRET=keep\n")
            self.assertFalse((repo / "throwaway.log").exists())
            self.assertEqual(self.git(repo, "branch", "--list", "fix/diag-*").stdout.strip(), "")

    def test_error_conditions_and_guards(self):
        with tempfile.TemporaryDirectory(prefix="diag-branch-err-", dir=TEMP_ROOT) as tmp:
            repo = Path(tmp)
            self.make_repo(repo)

            # Invalid slug or arguments
            self.assertEqual(self.run_diag(repo, "enter").returncode, 2)
            self.assertEqual(self.run_diag(repo, "enter", "bad/slug").returncode, 2)
            self.assertEqual(self.run_diag(repo, "unknown", "slug").returncode, 2)

            # Leave when not on diagnostic branch
            res = self.run_diag(repo, "leave", "slug")
            self.assertEqual(res.returncode, 1)
            self.assertIn("Expected current branch", res.stderr)

            # Nested enter from an active fix/diag-* branch is rejected
            self.assertEqual(self.run_diag(repo, "enter", "first").returncode, 0)
            nested = self.run_diag(repo, "enter", "second")
            self.assertEqual(nested.returncode, 1)
            self.assertIn("Already on a diagnostic branch", nested.stderr)
            self.assertEqual(self.run_diag(repo, "leave", "first").returncode, 0)

            # Detached HEAD is rejected
            self.git(repo, " checkout", "--detach", "HEAD") if False else self.git(repo, "checkout", "-q", "--detach", "HEAD")
            detached = self.run_diag(repo, "enter", "detached")
            self.assertEqual(detached.returncode, 1)
            self.assertIn("detached HEAD", detached.stderr)


if __name__ == "__main__":
    unittest.main()
