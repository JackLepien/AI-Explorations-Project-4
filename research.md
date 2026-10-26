# Research

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose: Keep the evidence and creative decisions that currently guide the build.

## Working agreement

Developer: Run the starter first. Direct the inquiry, judge sources and options, make consequential decisions, and keep this file current.

Agent: Read `AGENTS.md`, `brief.md`, and this file, then inspect the project. Help compare possibilities, test assumptions quickly, and verify external sources without delaying the prototype for exhaustive research.

Start a fresh chat with:

`Read brief.md and research.md, inspect the running project, and help me develop the scene and three spooky stories.`

## Inquiry and decisions

Record only what informs the next build decisions:

- creative alternatives for the scene, stories, and audiovisual direction, with reasons for your choices
- useful sources and references, what they support, and important limitations
- experiments that resolve uncertainty, the results, and consequential trade-offs

Investigate unfamiliar techniques or asset sources as needed. Verify usage terms and keep source links and required credits here. Distinguish evidence from assumptions; the Agent's recommendation alone is not evidence.

### Current build decision

- The Developer approved a full visual rework using three supplied AI-generated transparent/opaque PNG layers: the purple mist cave backdrop, pumpkin ghost train, and turquoise ghosts/spectral steam. Their prompts and generation record are in `transcripts/ChatGPT Web Image Generation Transcript.txt`.
- Keep a dependency-free static HTML/CSS/JavaScript implementation. Synthesize a subtle drone and story tones with Web Audio API oscillators/noise; no external audio files are used. Technical reference: [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).
- The three distinct interaction-led stories (revised after peer playtest, see below) are: *The Midnight Conductor* (tap the train headlamp, then drag or select a ghost onto the cab); *Passengers of the Mist* (press the lead ghost and trace a path with a finger along the steam to a carriage window; arrow keys steer for keyboard players); and *Roosting in the Mist* (rub three fog banks away to wake and release bats; Enter or Space clears a bank in steps). Because progress is action-driven, duration varies with the player.
- Preserve the start screen, reduced-motion support, title reset, and coordinated pause. Pause freezes scene, story, audio, and hint progression.

### Revision after peer playtest (2026-10-19)

- **Evidence:** Peer playtesters found the imagery and UI good but the interactions unintuitive and poorly signaled, and the bottom story text barely relevant to the story. Full notes: `playtest-notes.md`.
- **Hints are now visual and diegetic only.** Each story's starting point glows and breathes from the first second in a colour matched to the art (amber lamp, teal ghost, white fog), and strengthens over about 12 seconds of idle time. This replaces the earlier text hints at 26, 61, and 108 seconds. **Deviation:** `brief.md` asks for progressive *text* hints. The Developer approved the visual-only approach and `spec.md` records it. The risk is that the brief is not met literally; this is worth confirming against the assignment's grading.
- **Visible feedback for wrong input:** A target dims and shakes (or a hint flares) instead of reacting only through audio or the screen-reader status.
- **Card text:** The story card tells the story only, with no instructions; instructions stay in the screen-reader status.
- **Story replacements:** The hold-then-tap ghost story became the trace-a-path story, and the pumpkin story became fog-scrubbing that releases bats. The bat sprites (`Assets/Bat-1.png` to `Bat-3.png`) are cut from the supplied cave art; see `credits.txt`.
- **Unverified:** Only scripted headless-Chrome checks have run. Live animation, audio, pause mid-trace, reduced motion, and a physical phone are untested. Whether the glow reads clearly on same-coloured art is a judgement still to be made live.
- **Known weak points:** Any stroke that gets near the carriage window completes the trace story, so a straight swipe counts. A stray touch on a story's target starts it and locks the other stories, with no way to back out.
- Update Pages delivery to include `Assets/` as well as the app and credits. The deployment continues to use GitHub's documented [custom workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and the `configure-pages`, `upload-pages-artifact`, and `deploy-pages` actions.

Research limitation: a source, rights statement, or creator attribution for the three supplied PNGs was not found in their folder; the local generation transcript identifies them as generated images. Credits identify that provenance without making a public-domain claim for the PNGs.

## Revisions

Update decisions when new evidence changes the direction, linking to playtest observations in `plan.md` rather than copying them. Keep chosen behavior and asset requirements in `spec.md`. The Developer confirms when the inquiry is sufficient to continue building; exhaustive research is not a prerequisite.

## Saving the transcript

When directed, save the complete conversation as `transcripts/research-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
