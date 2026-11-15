---
name: smoke-test
description: Use this skill to smoke test a web application in the browser through Chrome DevTools MCP.
---

# Smoke test

A smoke test proves the running application is alive: the entry page loads and the critical paths reach their expected screens without runtime errors. It is a broad, shallow pass, not full regression coverage.

## Run the test

1. **Check for a running server first**: assume the app is already up. Check the ports with `lsof -nP -iTCP:<port> -sTCP:LISTEN` in this order:
   - `5173` — the Vite dev server, the normal case.
   - `3000` — another Vite dev server port in these projects.
   - `4173` — `vite preview` of a production build, only when the request targets the production build.

   When a port is listening, use it and start no server. Only when none of the relevant ports is listening, start one with the repository's documented command. A listening server whose pages fail is a smoke-test failure to report, not a reason to start a second server.
2. **Target**: identify the critical paths from the request or repository docs.
3. **Drive the browser**: load `chrome-devtools` with the skill tool, then use Chrome DevTools MCP for browser interaction and inspection. Select or create a page, navigate, take a snapshot for element UIDs, and interact using those UIDs. Refresh the snapshot when the page changes. If MCP is unavailable, report the blocker rather than switching to the CLI.
4. **Check each path**: the page loads, the expected content appears, and interactions reach the next screen.
5. **Check for errors**: use MCP to review console errors and failed network requests on every visited page; inspect relevant details as needed.
6. **Report**: list each path as pass or fail with the observed evidence, such as a screenshot path, console error, or failed request. Fix nothing unless asked.

Use a local or explicitly authorized environment; smoke tests create data through real forms.

**Done when:** every critical path has a pass or fail result with evidence, or the app is unreachable and the exact blocker is reported.

## Dependencies

- `chrome-devtools`: load for every smoke test; Chrome DevTools MCP browser automation and inspection.

## Related skills

Load these only when their specific task arises; they do not replace MCP for smoke testing.

- `chrome-devtools-cli`: shell-based browser automation and inspection for separate CLI tasks.
- `a11y-debugging`: accessibility audits, semantics, focus, keyboard navigation, tap targets, or contrast.
- `cookie-debugging`: cookie, session, authentication, or consent diagnosis.
- `debug-optimize-lcp`: slow page loads, Largest Contentful Paint, or Core Web Vitals optimization.
- `inspect-in-devtools`: interactive DevTools UI review, user selections, or comment threads.
- `memory-leak-debugging`: memory growth, out-of-memory errors, or heap snapshot analysis.
- `troubleshooting`: Chrome DevTools MCP connection, target, or server initialization failures.
