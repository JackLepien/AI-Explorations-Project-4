# Implementation Plan

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose: Track the next useful build checkpoints, verification, and consequential revisions.

## Working agreement

Developer: Keep the browser preview running, choose priorities, test results directly, and plan only the next few checkpoints.

Agent: Read the project documents and inspect the files. Keep each checkpoint small enough to run and judge. Do not expand scope or mark Developer verification complete.

Start or continue a fresh chat with:

`Read the project documents, inspect the current build, and help me complete the next unchecked checkpoint.`

## Checkpoints

1. **Done — Scene and controls** — Built the portrait cave railway, start screen, reduced-motion choice, in-scene motion toggle, and keyboard/touch targets. Verified at 320×640 and 390×844 with no page scrolling.
2. **Done — Ambient systems** — Added drifting mist, bats, fireflies, lantern flicker, and synthesized ambient audio; Play/Pause coordinates the experience.
3. **Done — Three stories** — Verified three distinct stories at 7–8 seconds each, interaction lockout, completion, progress, and replay.
4. **Done — Timed hints** — Added progressive hints after the stories; browser-clock checks confirmed the 26/61/108-second schedule, no progression during pause, and deferred display during a story.
5. **In progress — Delivery** — The GitHub Pages workflow and repository are set up, and the Developer has enabled Pages with GitHub Actions as the source. The first run failed before artifact creation because Pages was not yet enabled; a follow-up push will trigger a retry. Public URL verification, peer playtesting, and physical-phone verification remain pending.

## Evidence and revisions

Record non-identifying playtest observations, separating what Users did or said from your interpretation. Use the findings to choose revision priorities and record what changed and how you verified the improvement.

Implementation checkpoint: Developer approved the cave railway scope and requested that timed hints be added after the three story sequences. There was no app source or run configuration in the workspace, so this is a new static web app. In the integrated browser at 320×640 and 390×844, confirmed no page scrolling or header collision, all three stories, target lockout during playback, approximately 7.5-second active sequence timing, one-time progress credit, replay, and pause/resume. Reduced-motion emulation, in-scene motion toggling, and keyboard activation were also verified. Browser-clock checks confirmed all hint thresholds and freezing during pause; hints due during a story appeared after it ended. A pause overlay initially intercepted the Resume control; setting the overlay to ignore pointer events fixed it. GitHub Pages is enabled in the connected repository; the initial deployment run failed before artifact creation, and the next push will trigger a retry. Peer playtesting and physical-phone testing remain pending. A local preview-process check was denied.

Keep implementation progress and verification here. Update `research.md` when evidence changes a decision and `spec.md` when intended behavior changes; link to those updates rather than duplicating them. Record consequential changes, not every small adjustment.

## Saving transcripts

When directed, save the complete conversation as `transcripts/plan-YYYY-MM-DD_HHMMSS.md` or `transcripts/build-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
