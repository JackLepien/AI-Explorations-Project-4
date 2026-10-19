# Technical Specification

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose: Keep a concise, testable description of the experience currently being built.

## Working agreement

Developer: Begin with the running prototype, approve the intended behavior, test it directly, and update this file when the intended result changes.

Agent: Read `AGENTS.md`, `brief.md`, `research.md`, and this file, then inspect the project. Turn decisions into acceptance checks without inventing product choices or freezing details that still require testing.

Start a fresh chat with:

`Read the project documents, inspect the running prototype, and help me specify the next useful build checkpoint.`

## Current build contract

### Approved direction

Create a single-screen, portrait-friendly ghost-train platform inside a moonlit cave. A distant train tunnel is the focal point; rails, a platform, a ticket booth, a signal lantern, cave formations, and bats/fireflies establish the setting. Use original inline SVG/CSS visuals and synthesized audio, with no external asset dependencies.

### Behavior and system

- The start screen shows the device's reduced-motion preference before entering. Reduced motion is enabled by default when the device requests it and can be toggled before or during play.
- Enter starts the scene and audio. A single Play/Pause control suspends/resumes ambient sound, animation, story progression, hint time, and scene interactions together.
- The lantern, ticket booth, and platform bell are independently keyboard- and touch-activatable story targets. Each gives immediate feedback and launches a distinct story of 7.5 seconds, with a beginning, middle, and end. Other scene targets are disabled during playback; each story can be replayed. Completion updates a three-story progress indicator.
- Add three progressively more specific but non-directive text hints after the stories are implemented, at 26, 61, and 108 seconds of unpaused scene time. Hints use active scene time, so pausing freezes their schedule. A hint due during a story appears after that story finishes.
- If audio initialization or playback is unavailable, show an explicit status message and preserve visual interaction rather than failing silently.

### Acceptance checks

- At a phone-sized portrait viewport, the entire scene and controls fit without page scrolling; targets are readable, high contrast, keyboard reachable, and at least 44 CSS pixels.
- The start screen precedes scene motion/audio; reduced-motion preference is visible and honored.
- At least three ambient visual effects and a looping ambient sound run after entry.
- Pause/resume freezes and restores all motion, audio, story/hint clocks, and scene interaction as one state.
- Each of the three distinct stories lasts 5–10 seconds, has a clear beginning/middle/end, produces visual and audio feedback, blocks other scene targets while playing, returns to the scene, increments progress once, and can be replayed.
- Progressive hints appear in order at 26, 61, and 108 seconds of unpaused scene time, do not advance while paused, and wait until the current story ends before appearing.
- `credits.txt` links the CC0 dedication and identifies original visual/audio material; no third-party media or code is bundled.
- Browser validation is in scope here. A GitHub Actions workflow is prepared for GitHub Pages; the public HTTPS URL and physical-phone validation remain pending repository setup and device access.

## Scope and revisions

The Developer approved this scope and specified that timed hints follow implementation of the three story sequences. The workspace contains no pre-existing app to preserve. No unapproved external assets or branding will be introduced.

## Saving the transcript

When directed, save the complete conversation as `transcripts/spec-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
