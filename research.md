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

- The Developer selected a ghost train platform inside a spooky cave and approved the proposed static HTML/CSS/JavaScript scope.
- Use hand-authored inline SVG/CSS for the setting and Web Audio API oscillators/noise for the ambience and story effects. These are original in-project assets; there are no external media files, libraries, or brand assets to license or fetch.
- The original audiovisual asset source is dedicated to the public domain under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). `credits.txt` records this dedication and the absence of external media. Web Audio API documentation: [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).
- The Developer requested story sequences before timed hints. See the accepted behavior and checks in `spec.md` and the checkpoints in `plan.md`.
- After implementing and browser-checking all three stories, progressive hints were added at 26, 61, and 108 seconds of unpaused scene time. They use indirect clues for the lantern, ticket booth, and bell and wait until a story ends if a threshold passes during playback.
- The Developer selected GitHub Pages for delivery. A minimal Actions workflow publishes only the app sources and credits, following [GitHub's custom workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). It uses the documented `configure-pages`, `upload-pages-artifact`, and `deploy-pages` actions; publishing remains unverified until a GitHub repository is connected and Pages is configured.

Research limitation: the workspace had no starter app. The attempted check for an independently running local preview was denied, so the current preview could not be inspected.

## Revisions

Update decisions when new evidence changes the direction, linking to playtest observations in `plan.md` rather than copying them. Keep chosen behavior and asset requirements in `spec.md`. The Developer confirms when the inquiry is sufficient to continue building; exhaustive research is not a prerequisite.

## Saving the transcript

When directed, save the complete conversation as `transcripts/research-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
