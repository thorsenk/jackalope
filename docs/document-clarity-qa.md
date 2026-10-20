# Interactive document clarity QA

Scope: improve the existing NiceThings workshop document and add a separate Cornell candidate. The family dashboard product is unchanged. The source capture remains authoritative and is never summarized or truncated by the reading projection.

## Worker loop 1

- Inspected the supplied screenshot: full-width yellow pills were removal buttons; concern text had already been truncated by the original extraction function.
- Replaced destructive whole-card targets with neutral records, explicit Edit / Mark resolved / Remove actions, Undo, and persistent removed-history restoration.
- Made the title a permanently labeled, outlined input. Added explicit reading/source-editing modes, source backups, and stage descriptions.
- Worker inspected rendered `main-desktop.png` and `main-top.png` supplied by root browser hands. Independent visual judge found the expanded outline still read like a wiki and asked for an active task.
- Actual browser-hands interaction results evaluated by worker: Remove reduced open count; Undo restored count; Resolve created a resolved record; Reopen restored the open count. Source text was unchanged.

## Worker loop 2

- Replaced the long accordion index with one active section, free outline navigation, optional review markers, Previous / Next, and a Read all mode. Review is explicitly separate from approval.
- Added a concern jump, bounded desktop concern pane, editable legacy excerpts, and exact-prefix recovery only when the original source match is unique.
- Made the Cornell candidate a separate route and browser draft with a cue tied to the current section, source notes, and synthesis. Loaded documents default to reading rather than an initial empty-state editor.
- Compacted mobile workflow chrome and the sticky next-action bar. Kept all source text available and preserved the main candidate independently.
- Worker inspected rendered `loop2-main.png`. The independent judge accepted the desktop direction and requested visibility/behavior checks of the section-review controls, undo state, Cornell, and mobile before final approval.

## Automated checks

- `npx tsc --noEmit`: passed after restoring missing baseline modules.
- `npm run lint`: passed after browser-storage hydration and save-result synchronization were made explicit.
- `npm test`: covers full backup/source roundtrip, separate candidate storage, quota failure, real Markdown line breaks, resolved/Cornell export, complete concern preservation and unique-prefix recovery, source-derived clarification proposals, and structured reading projection.
- Additional private-fixture domain run: exact 24,097-character source survived save/load; 19 reading sections; no unrelated research-diary sample proposals; full-length concern suggestions; real Markdown newlines. Private fixture and screenshots are excluded from the repository.

## Environment limits

Local Next dependencies were read-only symlinks to an existing dependency cache. Next version matched 16.3.4; cached React was 19.2.6 versus declared 19.2.8. Source dependency versions were not downgraded. Remote preview builds use the declared dependencies.

Local Playwright could not launch because this environment has no installed Chromium binary. The worker retained responsibility for the test plan, render inspection, and fixes; root provided browser hands for actual deployed UI interactions. A separate judge reviewed screenshots independently. No production alias was changed during these loops.

## Final behavior and review closure

Root browser hands executed the worker's deployed interaction plan. Worker evaluated the results: outline selection changed the active section; marking reviewed advanced and persisted the optional count without approval; removal survived reload and history restoration returned the record; a reframe draft survived Capture/Clarify navigation; accepting a decision retained the claim and position on return; rejection stayed on the question with feedback; approval remained blocked while open concerns existed. The original source remained unchanged. Cornell edits stayed in its independent candidate draft.

The independent visual judge accepted desktop guided review, Cornell desktop, and 390px mobile. No additional visual redesign was requested. The worker inspected both desktop iterations and Cornell screenshots and performed the corrective iteration.

Isolated Standards and Spec review of the pinned implementation commit identified three data-integrity issues: nested backup validation, full approved-snapshot restoration, and positional cue identities. The worker fixed each, added regression coverage, and obtained scoped rechecks. A further empty-source unlinked-cue recovery edge case was guarded so an unavailable attachment target cannot delete a preserved question.

Final automated suite has nine tests. The projection tests run in the same explicit CommonJS harness as the persistence tests; no package-wide module-mode change is required. CommonJS test harness imports are explicitly allowed only in `tests/**/*.cjs`; production lint rules remain intact.
