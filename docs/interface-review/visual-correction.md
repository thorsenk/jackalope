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
