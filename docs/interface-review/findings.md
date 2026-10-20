# Workshop interface review — October 20, 2026

Baseline: deployed commit 55fe6c0, using an isolated Interface review fixture. Saved screenshots: before-capture.png, before-clarify.png, before-review.png. No real project decisions were approved.

1. Capture: the primary task starts below a large navigation rail, repeated stage explanation, oversized title panel, and toolbar. Repeated instructions compete with the source. Consolidate title/status; compact the stage rail; keep one document toolbar and one next action.
2. Clarify: a generic “Start from your captured wording” option hides the actual proposal behind selection. Show actual wording immediately; use concise Accept / Edit / Reject actions with consistent icons.
3. Review: repeated “Accepted” prose and six full-width panels dilute the actual decisions. Use a compact decision checklist with explicit missing/accepted indicators; retain concern disposition and approval gating.
4. Capture concern actions: link-like text controls lack consistent target sizes and visual hierarchy. Use shared icon buttons with accessible names and keyboard/focus tooltips; keep consequential actions labeled.
5. Global: custom per-screen controls and cascading stylesheet overrides produce inconsistent sizing and states. Reuse the existing Base UI/shadcn primitives, Lucide icons, semantic tokens, and one responsive stylesheet.
6. Mobile: the current CSS hides previous-stage controls and substitutes a prose stage string. Retain the actual four navigation controls, short labels, and icon state at narrow widths.

Preservation requirements: original capture; all accepted/rejected/reframed records; pending wording; concern resolution/defer/removal history and restoration; approval invalidation; backup import/export; isolated Cornell draft. Reading/marking reviewed must not imply approval. No full accessibility verdict follows from baseline screenshots; keyboard, tooltip, mobile and flow checks are required after changes.

Implementation direction: preserve the current charcoal/indigo visual language; remove duplicated explanation and excess containers. Use icons for familiar secondary actions and state, not as a replacement for primary decisions or necessary error messages. Tooltip help must also work on focus; touch users retain visible primary labels and named menu actions.
