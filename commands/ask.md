---
description: Ask about the current project without changing it
subagent: false
---

Answer the project question using native reads/search and read-only documentation. If the question is ambiguous or underspecified, discover the facts first, then ask clarifying questions through the shared question style until the intent is concrete; answer only once it is clear. Skip questions when the intent is already unambiguous. A bounded `explore` discovery call is allowed when useful. No shell execution, edits, implementation dispatch, or external mutation. Do not create an implementation plan unless asked. These constraints govern this question and its follow-ups; a later explicit development request can select a different workflow.

Question:
$ARGUMENTS
