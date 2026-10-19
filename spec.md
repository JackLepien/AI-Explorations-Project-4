# Technical Specification

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose: Keep a concise, testable description of the experience currently being built.

## Approved direction

Rework the single-screen portrait experience around the three supplied image layers: a purple cave background, a transparent pumpkin train, and turquoise ghosts/steam. Keep the tone spooky, playful, and appropriate for ages 10+.

## Behavior and system

- Preserve a start screen, reduced-motion preference and toggle, coordinated Play/Pause, and title-based reset. Reset returns to the start screen and clears story and hint progress.
- Enter starts animation and synthesized ambience. Pause freezes motion, audio, story progression, hold timing, hint time, and scene interaction together. Audio failures are announced while visual play remains available.
- Each of three replayable stories uses two or three distinct player interactions, with immediate audiovisual feedback, a beginning, middle, and end, a short completion flourish, and progress credit. Actions include touching the train headlamp then dragging/selecting a ghost onto the cab; holding a ghost then tapping a carriage window; and tapping three pumpkins in order. Story duration varies with player input. Other story interactions are unavailable while a story sequence is active.
- Progressive, non-directive hints use unpaused scene time at 26, 61, and 108 seconds, and wait until an active story completes before displaying.
- Interaction targets are touch-friendly, keyboard reachable, and accessible by labels/status updates. Drag has a tap/select-and-target alternative; holding has keyboard support.
- Publish the three PNG layers with the static app.

## Acceptance checks

- At 320×640 and 390×844 portrait viewports, the scene and controls fit without page scrolling, and the three images form the intended cave/train/ghost composition.
- Start precedes motion and audio; the device reduced-motion preference is honored, and the toggle works before and after entering.
- Pause/resume freezes and restores motion, audio, hold/story progress, hint clocks, and scene interactions.
- Each story progresses only through its specified two or three separate interactions, gives feedback at each step, credits completion once, is replayable, and cannot be interrupted by another story. Hold/drag interactions have keyboard/touch alternatives.
- Hints appear in order at 26, 61, and 108 seconds of unpaused time, freeze during pause, and defer while a story is active.
- Clicking the title from active, paused, or completed play resets the experience, restores the start screen, and clears progress.
- The Pages artifact includes all three images; browser verification confirms the public HTTPS app loads with those assets.
- Physical-phone and peer-playtest verification remain pending.

## Scope and revisions

The Developer approved the full visual rework and the three story interaction patterns. The AI-generated image files in `Assets/` are supplied project assets; their generation transcript is retained in `transcripts/`. The new interaction-led stories intentionally replace the former fixed-duration sequences.

## Saving the transcript

When directed, save the complete conversation as `transcripts/spec-YYYY-MM-DD_HHMMSS.md` or `transcripts/build-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
