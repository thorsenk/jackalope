# Visual correction after the rejected interface pass

The user rejected the first refactor's visual design. Its functional checks did not establish a satisfactory hierarchy, type scale, empty state, or composition. The earlier verification record must not be read as visual acceptance.

## Observed misses

The current rejected state is preserved in `rejected-pass.png` at the user's 1100-by-992 window size. A 12px word count floated above an oversized blank editor. The title, stage labels, toolbar, helper text, and detached concerns area had weak hierarchy. The empty state exposed zero counts and inactive tools rather than a clear starting task. The first typed paragraph also introduced an outline column and changed the editing width.

## Criteria for this correction

- Ordinary editor/body text is 16px; panel headings 18px; task headings 24px or above. Labels and controls use a consistent readable scale, with secondary metadata at least 13px.
- Empty notes show neither a zero word count nor inactive read/selection controls. Populated notes show a grammatically correct count inside the source panel.
- The project heading, four-stage progress, current task, notes surface, concerns, and primary action have distinct visual roles and consistent alignment.
- Concerns form a contained companion panel with an explicit add action. An untouched empty list must not imply that risks have already been reviewed.
- Typing must not introduce an outline column or narrow the editor. The outline belongs to multi-section reading, while Cornell retains its section-question workflow.
- Phone-width controls remain readable; the primary action stays reachable. The populated editor and later stages must be inspected as well as the empty screen.

## Implemented candidate

Shared typography tokens, larger source and decision text, a stronger project heading, contained four-stage progress, aligned note/concern panels, and a source-attached toolbar. Empty counts were removed; the populated word count is anchored in the document footer. Source entry has a visible input boundary and shorter placeholder. Duplicated help was consolidated. No data schema or storage key was changed.

## Observations collected

Actual DOM measurements confirmed 16px source text with 28.8px line height, 18px source-panel headings, and no empty count. A one-word input rendered `1 word` at 14px. At first input the editor retained its x position and 658px width; its top changed by one pixel, rather than the previous outline-column shift. Screenshots cover empty desktop/mobile, populated editing, section reading, and the decision view. These measurements establish the inspected properties, not overall visual acceptance.

## Evidence

- `rejected-pass.png`
- `visual-v2-empty-desktop.png`
- `visual-v2-empty-mobile.png`
- `visual-v2-editor-desktop.png`
- `visual-v2-read-desktop.png`
- `visual-v2-decisions-desktop.png`

Independent visual inspection and final production-build checks follow this candidate. Do not substitute prior tests or an agent's conclusion for inspecting the actual result.

## Populated phone walkthrough and follow-through

Inspected populated phone editing, selection-to-concern, Decisions, Review, and Export at 390 by 844. The selected source wording became a concern without changing the 68-word source. The approval bar exposed the blocking open concern; resolving it enabled approval. The shared type scale remained readable through the later stages.

This walkthrough exposed an existing navigation problem: following a bottom-of-page action could open the next stage at the old scroll position. Stage/question transitions now focus the main landmark and scroll to the top. A real Review-to-Export transition verified both focus and scroll position zero. This does not move focus while typing because the effect depends on the stage/question index, not draft text.

Also removed duplicated category headings from presentation only. The helper strips a leading heading only when it repeats the displayed category; meaningful source headings, including negative qualifiers, remain visible. Stored claims and Markdown export remain unchanged. A regression test covers source preservation and the meaningful-heading boundary.

Independent visual inspection of the six initial correction artifacts found meaningful hierarchy/readability improvement and no material visual defect. It correctly withheld a complete phone conclusion until the populated-phone artifacts existed. The added screenshots and runtime checks close that specific gap; they do not establish blanket design acceptance or accessibility compliance.

## Review closure for this iteration

The refreshed phone decision artifact was inspected independently after its footer correction. No material findings remained in the targeted visual/requirements review or the separate standards review. This is evidence against the stated criteria; it is not Kyle's design acceptance. The earlier functional verification must still not be used as a substitute for visual judgment.

The original empty workshop was restored after synthetic runtime tests. No real company positioning or project decisions were approved. The original Vercel deployment remains unchanged; this iteration updates the same local preview and draft pull request.

## Short desktop verification

The final production build was also inspected at 1280 by 720. A height-specific spacing rule reduces padding and editor depth without shrinking the type scale. The complete Continue control ends at 707.5px within the 720px viewport. The resulting clean starting state is preserved in `visual-v2-final-desktop.png`. The production build and type checking passed after this spacing adjustment; the thirteen passing regression tests cover the unchanged application/data logic.
