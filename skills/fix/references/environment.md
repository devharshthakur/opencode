# Disposable diagnostic environment

Read before any investigative command that may write. This protocol authorizes
only task-owned diagnostic storage/resources, not repairs or original-checkout
mutations. A standalone copy is not a process, network, or data sandbox.

## Prepare and copy

1. Load `cleanup`. Record task/source identity, original status/index/HEAD,
   relevant file-content evidence, and a new destination under approved temporary
   storage. Keep the source quiescent; if concurrent edits occur, reconcile and
   recreate only with known ownership. Do not freeze or move user changes.
2. `../scripts/diagnostic-env.py` is a trusted helper: run it with the subcommands
   below, do not read it. It requires Python 3.8+ on a POSIX host with no-follow
   file access and symlink-resistant removal, plus Git for source discovery.
   Unsupported hosts need an explicitly scoped alternative, not a silent
   weakening of safeguards. Run
   `python3 <fix-base>/scripts/diagnostic-env.py inspect <source-root>`.
   Review the inventory before copying: paths can reveal sensitive information.
   For Git projects the helper selects tracked and non-ignored untracked current
   files; deleted files stay absent. It copies current file contents, not historical
   staged versions, and records HEAD provenance. It does not reproduce the index.
   Non-Git projects use a filesystem inventory with the same exclusions.
3. Resolve relevance and sensitivity. The helper excludes Git/VCS metadata, common
   dependency/generated directories, common runtime data/log files, credential
   names, environment files,
   symlinks, special files, and Git submodule directories. Git-ignored untracked
   files are omitted without enumerating them. Patterns are not a secret scanner:
   inspect project-specific configuration and stop if additional files must be
   excluded. Use a separately approved, narrowly scoped copy method in that case;
   do not copy broadly and delete secrets afterward.
4. Run `python3 <fix-base>/scripts/diagnostic-env.py create <source-root> <destination>`.
   The parent directory must already exist; the destination must not. Record its
   returned token, canonical path, and ownership marker immediately. The helper
   verifies copied content/modes and rechecks source inventory before declaring
   `ready`. Original Git metadata is not copied or modified. Diagnostics must use
   explicit destination paths/workdirs; do not move the parent session.
5. Verify destination instructions, omissions, and actual tool targets before
   setup. Material excluded configuration, ignored source, assets, or symlink
   targets require an explicit scoped provisioning decision. Never follow a link
   back into original work or reuse original dependencies implicitly. Read unfamiliar
   setup/install commands and constrain their caches/config/data to task-owned
   storage. Ask before setup requiring host-wide changes or external mutations.
   Do not redirect normal package operations into the original checkout.

No automatic history is copied. Read original history with read-only Git commands
when sufficient. If a reproduction truly needs Git metadata, build behavior based
on the index, or nested repositories, resolve that requirement explicitly. A
standalone local repository may be provisioned only with separate Git-mutation
authority in disposable storage, without source writes, hardlinked mutable state,
or credential transfer. Do not silently substitute a linked worktree.

## Retain and reconcile

The root `.diagnostic-environment.json` records source provenance, selected
content hashes/modes, omissions, environment identity, token, and `copying`,
`incomplete`, or `ready` state. It is task-local ownership evidence, not a durable
approval record or authenticated safety boundary. Do not edit it as part of
diagnosis; record tests/services and approval state separately in conversation.

Use `python3 <fix-base>/scripts/diagnostic-env.py status <destination>` after
interruption and compare with the checkpoint. A copying/incomplete environment
is not runnable: inspect the exact failure and account for its resources, then
dispose of it safely before an explicitly reconciled retry. Never overwrite it,
resume a partial copy blindly, or infer ownership solely from its name.

Retain the environment and useful diagnostic tests during review. Before approval,
stop unused task-owned services and disclose retained resources. No cleanup is
implied by a session ending; reconcile the checkpoint on return.

## Dispose

After completion or explicit cancellation, first inspect all environment contents,
including new untracked/ignored files and mounted resources. Confirm every item
to be removed is attributable disposable diagnostic work. Preserve requested
deliverables and failing evidence needed for a blocker; stop on unexpected files
or uncertain ownership. Stop services/descendants, release listeners, and detach
task-owned mounts through their specific lifecycle before deleting files.

Then run:

`python3 <fix-base>/scripts/diagnostic-env.py remove <destination> --token <recorded-token> --confirm-disposable`

The helper rejects mismatched identity/token, symlink destinations, and source
overlap. It removes only that exact environment and verifies absence. These guards
do not replace the caller's ownership and resource checks. Separately remove
other recorded disposable artifacts under `cleanup`. Verify original source,
index, HEAD/branch, and relevant contents remain unchanged relative to the
checkpoint, allowing only independently attributable user edits. Never restore
differences with reset/clean; reconcile unexpected changes instead.
