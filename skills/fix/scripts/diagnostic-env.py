#!/usr/bin/env python3
"""Copy current source into owned disposable storage; never mutate the source."""

import argparse
import hashlib
import json
import os
import shutil
import stat
import subprocess
import sys
import uuid
from pathlib import Path

MARKER = ".diagnostic-environment.json"
EXCLUDED_DIRS = {
    ".git", ".hg", ".svn", "node_modules", ".venv", "venv", "__pycache__",
    ".cache", ".next", ".nuxt", ".output", ".turbo", "dist", "build",
    "coverage", "target", ".ssh", ".aws", ".azure", ".config", ".gcloud",
    ".terraform", ".gradle", ".pytest_cache", ".mypy_cache", ".ruff_cache",
    "uploads", "logs", "tmp", "temp",
}
SECRET_NAMES = {
    ".npmrc", ".pypirc", ".netrc", "credentials", "credentials.json",
    "secrets.json", "secrets.yaml", "secrets.yml", "id_rsa", "id_ed25519",
}
SECRET_SUFFIXES = {".pem", ".key", ".p12", ".pfx", ".jks", ".keystore"}
DATA_SUFFIXES = {".db", ".sqlite", ".sqlite3", ".rdb", ".dump", ".log"}


def git(source, *args, required=True):
    env = dict(os.environ, GIT_OPTIONAL_LOCKS="0", GIT_NO_LAZY_FETCH="1",
               GIT_TERMINAL_PROMPT="0", LC_ALL="C")
    # Do not let inherited Git routing variables target a different repository.
    for key in list(env):
        if key.startswith("GIT_") and key not in {
            "GIT_OPTIONAL_LOCKS", "GIT_NO_LAZY_FETCH", "GIT_TERMINAL_PROMPT"
        }:
            del env[key]
    result = subprocess.run(
        ["git", "--no-pager", "-c", "core.fsmonitor=false",
         "-c", "core.hooksPath=/dev/null", *args],
        cwd=source, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        check=False,
    )
    if required and result.returncode:
        raise ValueError("Git source inspection failed: " + os.fsdecode(result.stderr).strip())
    return result


def exclusion(relative):
    parts = Path(relative).parts
    if any(part in EXCLUDED_DIRS for part in parts):
        return "metadata, dependencies, generated output, or private configuration"
    names = [part.lower() for part in parts]
    if any(name.startswith((MARKER, ".env")) or name in SECRET_NAMES for name in names):
        return "reserved ownership marker or potentially sensitive configuration"
    if any(Path(name).suffix in SECRET_SUFFIXES for name in names):
        return "potential credential/key"
    if any(Path(name).suffix in DATA_SUFFIXES for name in names):
        return "potential runtime data or log"
    return None


def regular_file(source, relative):
    path = source
    parts = Path(relative).parts
    if not parts or Path(relative).is_absolute() or ".." in parts:
        raise ValueError("Unsafe source path")
    for index, part in enumerate(parts):
        path = path / part
        try:
            mode = path.lstat().st_mode
        except FileNotFoundError:
            return None, "absent in current working tree"
        if stat.S_ISLNK(mode):
            return None, "symlink; never followed"
        if index < len(parts) - 1 and not stat.S_ISDIR(mode):
            return None, "non-directory ancestor"
    if not stat.S_ISREG(mode):
        return None, "non-regular file, submodule, or nested directory"
    return path, None


def fingerprint(path):
    # Ancestors were checked separately; this is not protection against a hostile
    # process replacing directories concurrently. Source must remain quiescent.
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(fd, "rb") as stream:
        info = os.fstat(stream.fileno())
        if not stat.S_ISREG(info.st_mode):
            raise ValueError("Source changed to a non-regular file")
        digest = hashlib.sha256()
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return {"sha256": digest.hexdigest(), "mode": stat.S_IMODE(info.st_mode)}


def inventory(source):
    root = git(source, "rev-parse", "--show-toplevel", required=False)
    is_git = root.returncode == 0
    if not is_git:
        bare = git(source, "rev-parse", "--is-bare-repository", required=False)
        if bare.returncode == 0 and bare.stdout.strip() == b"true":
            raise ValueError("Bare repositories are not working source directories")
        if (source / ".git").exists() or (source / ".git").is_symlink():
            raise ValueError("Git metadata is present but source inspection failed")
    if is_git and Path(os.fsdecode(root.stdout).strip()).resolve() != source:
        raise ValueError("Use the Git working-tree root, not a subdirectory")
    if is_git:
        raw = git(source, "ls-files", "--cached", "--others", "--exclude-standard", "-z")
        candidates = sorted(set(os.fsdecode(p) for p in raw.stdout.split(b"\0") if p))
        head = git(source, "rev-parse", "--verify", "HEAD", required=False)
        revision = os.fsdecode(head.stdout).strip() if head.returncode == 0 else None
    else:
        candidates = []
        revision = None
        def walk_error(error):
            raise error

        for current, dirs, files in os.walk(source, followlinks=False, onerror=walk_error):
            for name in list(dirs):
                path = Path(current) / name
                relative = str(path.relative_to(source))
                if exclusion(relative) or path.is_symlink():
                    candidates.append(relative)
                    dirs.remove(name)
                elif any((path / marker).exists() for marker in (".git", ".hg", ".svn")):
                    candidates.append(relative)
                    dirs.remove(name)
            candidates.extend(str((Path(current) / name).relative_to(source)) for name in files)
        candidates.sort()
    copied, skipped = {}, {}
    for relative in candidates:
        reason = exclusion(relative)
        if reason:
            skipped[relative] = reason
            continue
        path, reason = regular_file(source, relative)
        if reason:
            skipped[relative] = reason
        else:
            copied[relative] = fingerprint(path)
    return {"source": str(source), "head": revision, "git": is_git,
            "files": copied, "skipped": skipped}


def destination_path(value):
    path = Path(value).expanduser().absolute()
    if path.is_symlink() or path.resolve() != path:
        raise ValueError("Destination and its ancestors must use canonical, non-symlink paths")
    return path


def write_state(destination, state):
    marker = destination / MARKER
    if marker.is_symlink():
        raise ValueError("Ownership marker must not be a symlink")
    temporary = destination / (MARKER + ".tmp")
    with temporary.open("x", encoding="utf-8") as stream:
        json.dump(state, stream, indent=2, sort_keys=True)
        stream.write("\n")
    temporary.replace(marker)


def read_state(destination):
    marker = destination / MARKER
    if not destination.is_dir() or marker.is_symlink():
        raise ValueError("Missing environment or unsafe ownership marker")
    state = json.loads(marker.read_text(encoding="utf-8"))
    info = destination.stat()
    if (state.get("destination") != str(destination)
            or state.get("identity") != [info.st_dev, info.st_ino]
            or not state.get("token")):
        raise ValueError("Environment identity mismatch; reconcile manually")
    return state


def main():
    if not hasattr(os, "O_NOFOLLOW"):
        raise ValueError("This helper requires POSIX no-follow file access")
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="action", required=True)
    inspect = commands.add_parser("inspect")
    inspect.add_argument("source")
    create = commands.add_parser("create")
    create.add_argument("source")
    create.add_argument("destination")
    for action in ("status", "remove"):
        command = commands.add_parser(action)
        command.add_argument("destination")
        if action == "remove":
            command.add_argument("--token", required=True)
            command.add_argument("--confirm-disposable", action="store_true", required=True)
    args = parser.parse_args()
    if args.action in {"inspect", "create"}:
        source = Path(args.source).expanduser().resolve(strict=True)
        if not source.is_dir():
            raise ValueError("Source must be a directory")
        if args.action == "inspect":
            print(json.dumps(inventory(source), indent=2, sort_keys=True))
            return
        destination = destination_path(args.destination)
        if destination == source or source in destination.parents or destination in source.parents:
            raise ValueError("Source and destination must be separate, non-nested directories")
        before = inventory(source)
        # The caller selects approved temporary storage and reviews the inventory.
        # Existing paths are never reused or overwritten.
        destination.mkdir(mode=0o700)
        info = destination.stat()
        state = {"version": 1, "token": uuid.uuid4().hex,
                 "destination": str(destination), "identity": [info.st_dev, info.st_ino],
                 "phase": "copying", "inventory": before}
        write_state(destination, state)
        print(json.dumps({"destination": str(destination), "token": state["token"],
                          "phase": "copying"}), flush=True)
        try:
            for relative, expected in before["files"].items():
                original, reason = regular_file(source, relative)
                if reason or fingerprint(original) != expected:
                    raise ValueError("Source changed during copy: " + relative)
                target = destination / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                fd = os.open(original, os.O_RDONLY | os.O_NOFOLLOW)
                with os.fdopen(fd, "rb") as reader, target.open("xb") as writer:
                    shutil.copyfileobj(reader, writer)
                target.chmod(expected["mode"])
                if fingerprint(target) != expected:
                    raise ValueError("Copied contents changed: " + relative)
            if inventory(source) != before:
                raise ValueError("Source inventory changed during copy")
        except Exception:
            state["phase"] = "incomplete"
            write_state(destination, state)
            raise
        state["phase"] = "ready"
        write_state(destination, state)
        print(json.dumps({"destination": str(destination), "token": state["token"],
                          "phase": "ready"}))
        return
    destination = destination_path(args.destination)
    state = read_state(destination)
    if args.action == "status":
        print(json.dumps(state, indent=2, sort_keys=True))
        return
    if args.token != state["token"]:
        raise ValueError("Ownership token mismatch")
    source = Path(state["inventory"]["source"])
    if destination == source or destination in source.parents or source in destination.parents:
        raise ValueError("Refusing removal overlapping the original source")
    # The token is an accidental-deletion guard, not authenticated ownership.
    # Caller must first stop resources and reconcile every retained file.
    if not shutil.rmtree.avoids_symlink_attacks:
        raise ValueError("This Python lacks symlink-resistant directory removal")
    shutil.rmtree(destination)
    if destination.exists() or destination.is_symlink():
        raise ValueError("Removal could not be verified")
    print(json.dumps({"removed": str(destination)}))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        print("diagnostic-env: " + str(error), file=sys.stderr)
        sys.exit(1)
