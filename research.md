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
- The three distinct interaction-led stories are: tap the train headlamp then drag/select a ghost to the cab; hold a turquoise ghost then tap its lit passenger window; and tap three pumpkins in sequence. Because progress is action-driven, duration varies with the player.
- Preserve the start screen, reduced-motion support, title reset, coordinated pause, and progressive active-time hints at 26, 61, and 108 seconds. Pause freezes scene, hold/story, audio, and hint progression; clues wait until an active story finishes.
- Update Pages delivery to include `Assets/` as well as the app and credits. The deployment continues to use GitHub's documented [custom workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and the `configure-pages`, `upload-pages-artifact`, and `deploy-pages` actions.

Research limitation: a source, rights statement, or creator attribution for the three supplied PNGs was not found in their folder; the local generation transcript identifies them as generated images. Credits identify that provenance without making a public-domain claim for the PNGs.

## Revisions

Update decisions when new evidence changes the direction, linking to playtest observations in `plan.md` rather than copying them. Keep chosen behavior and asset requirements in `spec.md`. The Developer confirms when the inquiry is sufficient to continue building; exhaustive research is not a prerequisite.

## Saving the transcript

When directed, save the complete conversation as `transcripts/research-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
