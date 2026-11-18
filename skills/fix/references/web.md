# Web diagnostic guidance

Read before diagnostic setup when the project involves browser applications,
web services, databases, or web storage. Core `fix` remains project-agnostic.

## Environment safety

- Identify the actual stack and documented commands; do not assume TypeScript,
  Vite, a package manager, port, database, or container runtime.
- Use disposable local databases, uploads, queues, caches, and storage. Inspect
  connection configuration before launching the app; a source copy can still
  point to production. Do not copy `.env` files or credentials automatically.
  Ask for sanitized configuration/data or explicitly scoped access when needed.
- Disable or locally substitute email, payments, webhooks, analytics, scheduled
  jobs, and other external writes. If safe configuration is uncertain, stop.
  Browser forms can mutate data; choose authorized disposable inputs.
- Do not treat a listening port as ownership proof. Identify existing services;
  never restart/stop them or silently test mutated diagnostics against the
  original app. A diagnostic service must run from the copied source with
  task-owned configuration/data and a local-only listener. Record identity/port.
- Account for browser cookies, sessions, local storage, service workers, and
  downloads. Prefer a separate task-owned browser context/profile when supported;
  a new tab alone is not isolated storage. If isolation is unavailable, disclose
  the limitation and resolve access before using sensitive sessions. Never clear
  the user's browser data for cleanup.

## Select methods only when needed

- Use `smoke-test` for a broad, shallow browser pass. Follow its server reuse,
  Chrome DevTools MCP, evidence, and no-unrequested-repair rules. Its default
  ports are not proof the server belongs to this diagnostic environment; resolve
  a target mismatch before running it, rather than silently starting a second app.
- Use focused temporary requests/tests/harnesses to discriminate causes when a
  smoke pass cannot. Capture actual commands/results; do not equate a passing
  entry page with regression coverage.
- Load `chrome-devtools` for browser investigation; `cookie-debugging`,
  `a11y-debugging`, `debug-optimize-lcp`, or `memory-leak-debugging` only for their
  specific symptoms. Load `troubleshooting` on browser connection/target failures.
- Load `modern-web-guidance` before HTML/CSS/client-side JavaScript work at its
  stated trigger, and current library documentation when relying on external APIs.

Verify the reported scenario, relevant console/network errors, and narrow causal
predictions. A passing smoke test alone does not establish the root cause.
Stop task-started services when idle during review; retain their safe setup
instructions and the environment for later reproduction.
