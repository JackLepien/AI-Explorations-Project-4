# Implementation Plan

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose: Track the next useful build checkpoints, verification, and consequential revisions.

## Working agreement

Developer: Keep the browser preview running, choose priorities, test results directly, and plan only the next few checkpoints.

Agent: Read the project documents and inspect the files. Keep each checkpoint small enough to run and judge. Do not expand scope or mark Developer verification complete.

Start or continue a fresh chat with:

`Read the project documents, inspect the current build, and help me complete the next unchecked checkpoint.`

## Checkpoints

1. **Superseded — Original cave-platform build** — Kept in Git history; replaced by the approved image-layer redesign.
2. **Done — Layered scene and controls** — Added cave, ghost, and pumpkin-train image layers with ambient ghost drift, mist, and train glow; preserved start, reduced motion, pause, and title reset.
3. **Done — Interaction-led stories** — Browser-verified headlamp + ghost drag and keyboard-select fallback, ghost hold + carriage tap, and the three-pumpkin sequence. Progress reached 3 / 3; story replay remains available.
4. **Done — Responsive and timed behavior** — Verified 320×640 and 390×844 without document scrolling, reduced-motion toggle, pause/resume, hold progress frozen over pause, reset from completed state, and the first active-time hint deferred until after pause.
5. **In progress — Playtest revision** (source: `playtest-notes.md`). Steps: (a) update spec/plan; (b) diegetic hint glows and visible reject feedback; (c) lantern story cues; (d) trace-path ghost story; (e) fog-scrub bat story; (f) rewrite card text to the approved drafts; (g) browser check at 320×640 and 390×844. (a)–(g) done pending Developer review. The approved card text for all three stories is in `app.js`. Steps 5 to 7 added the fog-scrub bat story (three fog banks; bats cut from the cave art into `Assets/Bat-1..3.png`; Enter or Space keyboard alternative; bats circle the train at the finale; fog and bats reset on replay), removed the pumpkin targets, and checked 320×640 and 390×844 screenshots, pause, reset and a reduced-motion finale. Scripted headless-Chrome checks passed for the arrow-key trace, a pointer stroke lifted early (visible reject, brightness reset), a completed stroke, and the lantern drag with a miss and a hit. Physical-phone testing is still pending.
6. **In progress — Updated Pages deployment** — Workflow now includes all three `Assets/` images; deploy the redesign and verify the public image URLs and interactions.
7. **Pending — External playtesting** — Peer playtesting and physical-phone verification remain outstanding; record observations when available.

## Evidence and revisions

Record non-identifying playtest observations, separating what Users did or said from your interpretation. Use the findings to choose revision priorities and record what changed and how you verified the improvement.

Implementation checkpoint: Developer approved a complete visual rework using the three supplied PNGs and approved three interaction patterns. Replaced the inline SVG platform scene with the cave background, transparent ghost/steam layer, and transparent pumpkin train. The train and ghosts are full-viewport image layers; hotspots target the lamp/cab, passenger ghost/window, and three pumpkins. In browser testing at 320×640 and 390×844, document dimensions matched the viewport. Verified mouse drag onto the cab, keyboard-select-and-target fallback, a held ghost followed by a window tap, ordered pumpkin taps, progress to 3 / 3, reset to 0 / 3, and accessible keyboard/touch target sizing. Held a ghost for about 450 ms, paused for 1 second, resumed, and completed with another 450 ms hold, confirming pause time did not advance the hold. Verified reduced-motion behavior before and after entry; waited to the first clue threshold, confirmed it remained hidden during pause, then appeared after resuming. The Pages workflow now copies `Assets/`; publish and verify the redesign before marking delivery complete. Peer playtesting and physical-phone testing remain pending.

Keep implementation progress and verification here. Update `research.md` when evidence changes a decision and `spec.md` when intended behavior changes; link to those updates rather than duplicating them. Record consequential changes, not every small adjustment.

## Saving transcripts

When directed, save the complete conversation as `transcripts/plan-YYYY-MM-DD_HHMMSS.md` or `transcripts/build-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
