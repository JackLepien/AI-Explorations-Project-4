# Technical Specification

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose: Keep a concise, testable description of the experience currently being built.

## Approved direction

Rework the single-screen portrait experience around the three supplied image layers: a purple cave background, a transparent pumpkin train, and turquoise ghosts/steam. Keep the tone spooky, playful, and appropriate for ages 10+.

## Behavior and system

- Preserve a start screen, reduced-motion preference and toggle, coordinated Play/Pause, and title-based reset. Reset returns to the start screen and clears story and hint progress.
- Enter starts animation and synthesized ambience. Pause freezes motion, audio, story progression, hold timing, hint time, and scene interaction together. Audio failures are announced while visual play remains available.
- Each of three replayable stories uses two or three distinct player interactions, with immediate audiovisual feedback, a beginning, middle, and end, a short completion flourish, and progress credit. Actions include touching the train headlamp then dragging/selecting a ghost onto the cab; pressing a ghost and tracing a path to a carriage window; and rubbing three fog banks away to release bats. Story duration varies with player input. Other story interactions are unavailable while a story sequence is active.
- Hints are visual and diegetic only (revision after peer playtest, see `playtest-notes.md`). Each story starting point glows and breathes from the first second, in a colour that matches the thing it sits on. While no story is active, the glow brightens over about 12 seconds of unpaused idle time. Hints suggest where to interact but never show gesture icons or instructions. This **deliberately replaces the progressive text hints that `brief.md` calls for**; the Developer approved the deviation.
- Wrong or partial input gets a visible reaction on the target (it dims and shakes, or a hint target flares), not only audio or a screen-reader status. A plain tap on a fog bank makes the fog part and smear sideways, then settle back, instead of flaring.
- Fog banks hint at rubbing through motion alone: they sway and smear side to side from the first second, and once the bat story is under way the banks not yet cleared sway faster as the "next" cue.
- The story card carries narrative only, with no instructions. Instructions stay in the screen-reader status.
- Stories (revised after peer playtest): *The Midnight Conductor* (tap the headlamp, then drag or select the ghost onto the cab), *Passengers of the Mist* (trace a path with a finger to lead the ghost along the steam to a carriage window), and *Roosting in the Mist* (rub three fog banks away to wake and release the cave's bats; the bat sprites are cut from the cave art, and Enter or Space on a bank clears it in steps for keyboard players). The banks can be cleared in any order, and the fog and bats reset after the story. These replace the hold-then-tap ghost story and the three-pumpkin story.
- Interaction targets are touch-friendly, keyboard reachable, and accessible by labels/status updates. Drag has a tap/select-and-target alternative; tracing is steered with the arrow keys (Escape lets go); fog banks clear with Enter or Space.
- Publish the three PNG layers with the static app.

## Acceptance checks

- At 320×640 and 390×844 portrait viewports, the scene and controls fit without page scrolling, and the three images form the intended cave/train/ghost composition.
- Start precedes motion and audio; the device reduced-motion preference is honored, and the toggle works before and after entering.
- Pause/resume freezes and restores motion, audio, story progress (including a trace or half-cleared fog bank), hint clocks, and scene interactions.
- Each story progresses only through its specified two or three separate interactions, gives feedback at each step, credits completion once, is replayable, and cannot be interrupted by another story. Drag, trace, and rub interactions have keyboard/touch alternatives.
- Hint glows are visible on entry, strengthen over about 12 seconds of unpaused idle time, freeze during pause, and reset while a story is active.
- Rejected input (early lift, plain tap on fog, missed drop) visibly reacts, including under reduced motion. A tapped fog bank visibly thins and returns; uncleared banks sway faster during the bat story.
- Clicking the title from active, paused, or completed play resets the experience, restores the start screen, and clears progress.
- The Pages artifact includes all three images; browser verification confirms the public HTTPS app loads with those assets.
- Physical-phone and peer-playtest verification remain pending.

## Scope and revisions

The Developer approved the full visual rework and the three story interaction patterns. The AI-generated image files in `Assets/` are supplied project assets; their generation transcript is retained in `transcripts/`. The new interaction-led stories intentionally replace the former fixed-duration sequences.

## Saving the transcript

When directed, save the complete conversation as `transcripts/spec-YYYY-MM-DD_HHMMSS.md` or `transcripts/build-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
