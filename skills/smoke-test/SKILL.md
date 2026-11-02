---
name: smoke-test
description: Use this skill to smoke test a web application in the browser through the chrome-devtools CLI.
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
3. **Drive the browser**: perform every browser step through the `chrome-dev-tools` skill. Load that ID with the skill tool before the first command; it owns page selection, navigation, clicks, fills, snapshots, screenshots, and console and network inspection.
4. **Check each path**: the page loads, the expected content appears, and interactions reach the next screen.
5. **Check for errors**: review console errors and failed network requests on every visited page.
6. **Report**: list each path as pass or fail with the observed evidence, such as a screenshot path, console error, or failed request. Fix nothing unless asked.

Use a local or explicitly authorized environment; smoke tests create data through real forms.

**Done when:** every critical path has a pass or fail result with evidence, or the app is unreachable and the exact blocker is reported.

## Dependencies

- `chrome-dev-tools`: browser automation for every page interaction and inspection.
