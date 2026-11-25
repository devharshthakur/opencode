#!/usr/bin/env python3
"""Print a bounded, read-only project recon report for the current directory.

Usage: python3 recon.py   (project directory as working directory)

Lists repository state, agent/contributor instructions, manifests, lockfiles and
the package managers they imply, package scripts, task-runner targets, CI files,
and tooling configuration. Reads only manifest and task-runner files; never
opens environment, credential, or key files. Never writes or uses the network.
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

MAX_DEPTH = 3          # directory depth searched below the root
SECTION_LINES = 25     # lines per section before truncation
TOTAL_BYTES = 6000     # whole report budget

SKIP_DIRS = {
    ".git", "node_modules", ".venv", "venv", "__pycache__", ".cache", ".next",
    ".nuxt", ".output", ".turbo", "dist", "build", "coverage", "target",
    "vendor", ".terraform", ".gradle", ".pytest_cache", ".mypy_cache",
    ".ruff_cache", ".tox", ".idea", ".vscode",
}
INSTRUCTIONS = [
    "AGENTS.md", "CLAUDE.md", "GEMINI.md", ".cursorrules", ".cursor/rules",
    ".github/copilot-instructions.md", ".opencode", "opencode.json",
    "opencode.jsonc", "CONTRIBUTING.md", ".github/CONTRIBUTING.md",
    "GLOSSARY.md", "docs/GLOSSARY.md", "ARCHITECTURE.md", "docs/adr",
    "docs/adrs", "docs/decisions", "adr", "README.md", "SECURITY.md",
]
MANIFESTS = {
    "package.json", "pnpm-workspace.yaml", "lerna.json", "nx.json", "turbo.json",
    "deno.json", "deno.jsonc", "pyproject.toml", "setup.py", "setup.cfg",
    "requirements.txt", "requirements-dev.txt", "Pipfile", "Cargo.toml",
    "go.mod", "go.work", "Gemfile", "composer.json", "pom.xml", "build.gradle",
    "build.gradle.kts", "settings.gradle", "settings.gradle.kts", "mix.exs",
    "Package.swift", "pubspec.yaml", "CMakeLists.txt", "flake.nix",
    "Dockerfile", "docker-compose.yml", "docker-compose.yaml", "compose.yml",
    "compose.yaml",
}
TASK_FILES = {"Makefile", "makefile", "GNUmakefile", "justfile", "Justfile",
              "Taskfile.yml", "Taskfile.yaml"}
LOCKFILES = {
    "pnpm-lock.yaml": "pnpm", "package-lock.json": "npm", "npm-shrinkwrap.json": "npm",
    "yarn.lock": "yarn", "bun.lockb": "bun", "bun.lock": "bun", "deno.lock": "deno",
    "uv.lock": "uv", "poetry.lock": "poetry", "Pipfile.lock": "pipenv",
    "pdm.lock": "pdm", "Cargo.lock": "cargo", "go.sum": "go",
    "Gemfile.lock": "bundler", "composer.lock": "composer", "mix.lock": "mix",
    "pubspec.lock": "pub", "gradle.lockfile": "gradle",
}
TOOL_CONFIG = re.compile(
    r"^(tsconfig(\..+)?\.json|jsconfig\.json|\.eslintrc(\..+)?|eslint\.config\..+|"
    r"\.prettierrc(\..+)?|prettier\.config\..+|biome\.jsonc?|\.oxlintrc\.json|"
    r"vitest\.config\..+|vite\.config\..+|jest\.config\..+|playwright\.config\..+|"
    r"cypress\.config\..+|\.pre-commit-config\.yaml|lefthook\.ya?ml|\.husky|"
    r"\.editorconfig|\.nvmrc|\.node-version|\.python-version|\.tool-versions|"
    r"mise\.toml|\.mise\.toml|rust-toolchain(\.toml)?|ruff\.toml|\.ruff\.toml|"
    r"mypy\.ini|pytest\.ini|tox\.ini|noxfile\.py|\.golangci\.ya?ml|"
    r"commitlint\.config\..+|\.commitlintrc(\..+)?|renovate\.json5?|"
    r"\.github/dependabot\.ya?ml)$"
)
CI_PATTERNS = re.compile(
    r"^(\.github/workflows/[^/]+\.ya?ml|\.gitlab-ci\.yml|\.circleci/config\.yml|"
    r"azure-pipelines\.yml|bitbucket-pipelines\.yml|\.buildkite/.+|Jenkinsfile|"
    r"\.drone\.yml|\.woodpecker\.ya?ml|\.travis\.yml)$"
)
SENSITIVE = re.compile(r"(^|/)(\.env[^/]*|.*\.(pem|key|p12|pfx)|id_rsa|id_ed25519|\.npmrc|\.netrc|\.pypirc)$")


def git(root, *args):
    env = dict(os.environ, GIT_OPTIONAL_LOCKS="0", GIT_NO_LAZY_FETCH="1",
               GIT_TERMINAL_PROMPT="0", LC_ALL="C")
    try:
        result = subprocess.run(
            ["git", "--no-pager", "-c", "core.fsmonitor=false",
             "-c", "core.hooksPath=/dev/null", *args],
            cwd=root, env=env, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            check=False, timeout=15,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    return result.stdout.decode("utf-8", "replace") if result.returncode == 0 else None


def list_files(root, in_git):
    """Relative file paths up to MAX_DEPTH, honoring .gitignore in Git repos."""
    paths = []
    if in_git:
        out = git(root, "ls-files", "--cached", "--others", "--exclude-standard", "-z")
        if out is not None:
            for rel in out.split("\0"):
                if rel and rel.count("/") <= MAX_DEPTH and not (set(rel.split("/")[:-1]) & SKIP_DIRS):
                    paths.append(rel)
            return sorted(paths)
    for dirpath, dirnames, filenames in os.walk(root):
        rel_dir = os.path.relpath(dirpath, root)
        depth = 0 if rel_dir == "." else rel_dir.count(os.sep) + 1
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS and depth < MAX_DEPTH)
        for name in filenames:
            rel = name if rel_dir == "." else os.path.join(rel_dir, name).replace(os.sep, "/")
            paths.append(rel)
    return sorted(paths)


def read_text(path, limit=200_000):
    try:
        if path.is_symlink() or not path.is_file() or path.stat().st_size > limit:
            return None
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None


def clip(text, width=100):
    text = " ".join(text.split())
    return text if len(text) <= width else text[: width - 3] + "..."


class Report:
    def __init__(self):
        self.parts = []
        self.size = 0
        self.truncated = False

    def section(self, title, lines):
        lines = lines or ["(none)"]
        body = lines[:SECTION_LINES]
        if len(lines) > SECTION_LINES:
            body.append(f"[{len(lines) - SECTION_LINES} more; inspect separately]")
        block = f"\n## {title}\n" + "\n".join(body) + "\n"
        if self.size + len(block) > TOTAL_BYTES:
            self.truncated = True
            return
        self.parts.append(block)
        self.size += len(block)

    def emit(self):
        sys.stdout.write("".join(self.parts))
        if self.truncated:
            sys.stdout.write("\n[report budget reached; remaining sections omitted]\n")


def main():
    if len(sys.argv) != 1:
        print("Usage: python3 recon.py (project directory as working directory)", file=sys.stderr)
        return 2
    cwd = Path.cwd()
    top = git(cwd, "rev-parse", "--show-toplevel")
    in_git = top is not None
    root = Path(top.strip()) if in_git else cwd
    report = Report()

    # Repository state
    repo = [f"root: {root}"]
    if cwd != root:
        repo.append(f"working directory: {cwd}")
    if in_git:
        status = git(root, "status", "--porcelain=v1", "--branch", "--untracked-files=normal") or ""
        lines = status.splitlines()
        if lines and lines[0].startswith("## "):
            repo.append("branch: " + lines[0][3:])
            lines = lines[1:]
        head = git(root, "log", "-1", "--format=%h %s")
        repo.append("HEAD: " + (clip(head.strip()) if head else "(unborn)"))
        repo.append(f"changed paths: {len(lines)}")
    else:
        repo.append("not a Git repository")
    report.section("Repository", repo)

    files = list_files(root, in_git)
    file_set = set(files)
    dirs = {p.rsplit("/", 1)[0] for p in files if "/" in p}
    for d in list(dirs):
        while "/" in d:
            d = d.rsplit("/", 1)[0]
            dirs.add(d)

    report.section("Instructions and docs", [
        name + ("/" if name in dirs else "")
        for name in INSTRUCTIONS if name in file_set or name in dirs
    ])

    manifests = [p for p in files if p.rsplit("/", 1)[-1] in MANIFESTS]
    report.section("Manifests", manifests)

    managers = {}
    for p in files:
        name = p.rsplit("/", 1)[-1]
        if name in LOCKFILES:
            managers.setdefault(LOCKFILES[name], []).append(p)
    pm_lines = [f"{tool}: {', '.join(paths[:4])}" + (" ..." if len(paths) > 4 else "")
                for tool, paths in sorted(managers.items())]
    pkg = read_text(root / "package.json") if "package.json" in file_set else None
    pkg_data = None
    if pkg:
        try:
            pkg_data = json.loads(pkg)
        except ValueError:
            pm_lines.append("package.json: invalid JSON")
    if isinstance(pkg_data, dict):
        if pkg_data.get("packageManager"):
            pm_lines.append(f"packageManager field: {clip(str(pkg_data['packageManager']), 60)}")
        if pkg_data.get("workspaces"):
            pm_lines.append(f"workspaces: {clip(json.dumps(pkg_data['workspaces']), 80)}")
        engines = pkg_data.get("engines")
        if isinstance(engines, dict) and engines:
            pm_lines.append("engines: " + clip(", ".join(f"{k} {v}" for k, v in engines.items()), 80))
    js_lockfiles = {"npm", "pnpm", "yarn", "bun"} & set(managers)
    if pkg_data is not None and not js_lockfiles:
        pm_lines.append("note: package.json without a JS lockfile")
    if len(js_lockfiles) > 1:
        pm_lines.append("note: multiple JS lockfiles: " + ", ".join(sorted(js_lockfiles)))
    report.section("Package managers (from lockfiles)", pm_lines)

    scripts = []
    for p in [m for m in manifests if m.endswith("package.json")][:6]:
        data = pkg_data if p == "package.json" else None
        if data is None:
            text = read_text(root / p)
            try:
                data = json.loads(text) if text else None
            except ValueError:
                data = None
        if isinstance(data, dict) and isinstance(data.get("scripts"), dict):
            for name, command in data["scripts"].items():
                prefix = "" if p == "package.json" else p[: -len("/package.json")] + ": "
                scripts.append(f"{prefix}{name}: {clip(str(command), 90)}")
    if "pyproject.toml" in file_set:
        text = read_text(root / "pyproject.toml") or ""
        tools = sorted(set(re.findall(r"^\[tool\.([A-Za-z0-9_-]+)", text, re.M)))
        if tools:
            scripts.append("pyproject tools: " + ", ".join(tools))
        block = re.search(r"^\[project\.scripts\]\n((?:[^\[\n].*\n?)*)", text, re.M)
        if block:
            names = re.findall(r"^([A-Za-z0-9_.-]+)\s*=", block.group(1), re.M)
            if names:
                scripts.append("pyproject scripts: " + ", ".join(names[:15]))
    report.section("Package scripts", scripts)

    targets = []
    for name in sorted(TASK_FILES & file_set):
        text = read_text(root / name) or ""
        if name.lower().startswith("taskfile"):
            found = re.findall(r"^  ([A-Za-z0-9_.:-]+):\s*$", text, re.M)
        elif name.lower() == "justfile":
            found = re.findall(r"^@?([A-Za-z0-9_-]+)(?:\s[^:\n]*)?:(?!=)", text, re.M)
        else:
            found = [t for t in re.findall(r"^([A-Za-z0-9_./-]+)\s*:(?!=)", text, re.M)
                     if not t.startswith(".")]
        unique = list(dict.fromkeys(found))
        if unique:
            targets.append(f"{name}: " + ", ".join(unique[:30]) + (" ..." if len(unique) > 30 else ""))
    report.section("Task-runner targets", targets)

    report.section("CI", [p for p in files if CI_PATTERNS.match(p)])

    tooling = sorted({p for p in files if TOOL_CONFIG.match(p) and not SENSITIVE.search(p)}
                     | {d for d in (".husky",) if d in dirs})
    report.section("Tooling config (root and .github)", [p for p in tooling if "/" not in p or p.startswith(".github/")])

    report.emit()
    return 0


if __name__ == "__main__":
    sys.exit(main())
