# Playtest & Peer Review Notes — The Hollow Line

Source: peer review and playtesting by the project owner (compiled 2026-10-19).
Audience: later AI agents working on this repo. Read `AGENTS.md` first. Its rules still apply: clarify, write a short spec, checkpoint before multi-step changes, and prove results by running them.

## Summary verdict

| Area | Verdict |
|---|---|
| Overall imagery (cave, ghost train, turquoise ghosts) | Good. Keep as is. |
| UI (top bar, pause, progress icons, intro/paused screens) | Good and functional. Keep as is. |
| Interactions | **Problem.** Unintuitive and poorly signaled to the player. |
| Bottom story text (`#story-card`) | **Problem.** Reads as barely relevant to the "story". |

Do not redesign the imagery or the UI chrome. The work is confined to the two problem areas below.

## Issue 1 — Interactions are unintuitive and poorly signaled

Reported by playtesters: players don't know what to touch, what each interaction is, or whether they are making progress.

Where this lives in the code (verify before editing; line numbers drift):
- `index.html`: interaction targets are empty `<button class="target …">` elements. They have no visible affordance of their own. Their only descriptions are `aria-label`s, which sighted players never see.
- `styles.css`: target appearance, the `is-next` and `complete` states, the `--hint` glow variable.
- `app.js`:
  - `updateIdleGlow` / `IDLE_GLOW_RAMP_MS` (108 s) is the only wordless hint. The circles reach full glow after about 108 s of idle time. This is probably too slow for a playtester to benefit from.
  - `getNextInstruction` and `setStatus` write instructions only to the `sr-only` `#live-status`, so sighted players never see them.
  - The interaction types are mixed:
    - Lantern story: tap the lamp, then drag a ghost token to the cab. This is a drag-and-drop with a select-then-tap fallback.
    - Ghosts story: press-and-hold the ghost for 850 ms, then tap a window.
    - Pumpkins story: tap three pumpkins in a fixed order.
  - A story starts implicitly from whichever target the player happens to touch first.
  - Wrong-order pumpkin taps and a too-short hold only produce a hidden status string and a tone.

Candidate causes to investigate (hypotheses, not confirmed by playtesters):
1. The targets are invisible or low-contrast at the start, and the hint glow arrives too late.
2. Nothing tells the player which gesture is expected (tap, hold, or drag).
3. Feedback for wrong or partial input is audio or screen-reader only.
4. The drag-to-cab step has no visible start point, path or destination cue.
5. The hold has no visible progress indicator.

Direction for a fix: find the governing rule and fix it once, for example one shared "signal" language across all targets. Avoid per-story special cases.

## Issue 2 — Bottom text barely relates to the story

Reported by playtesters: the text in the card at the bottom of the screen (`#story-card`, filled from `story.opening` and `story.progressLines` in `app.js`) feels barely relevant to what is happening in the story.

Context:
- Current stories are *The Midnight Conductor* (lantern), *Passengers of the Mist* (ghosts), and *The Pumpkin Parade* (pumpkins).
- The opening and progress lines are atmospheric, but they don't clearly tie to what the player just did or to the story's premise. Some lines hint at actions without stating the goal or consequence.
- The `eyebrow` kicker reads "A LITTLE MYSTERY · {title}" for every story.
- Check the story design in `brief.md`, `spec.md` and `research.md` for intended narrative beats. The text should be reconciled with that intent, not rewritten blindly.

Possible directions (name the trade-off to the owner before choosing):
- Rewrite each line to react directly to the player's last action and set up the next one.
- Give each story a clear premise or question at the opening, and pay it off in the final line.
- Decide whether the card should carry story only, or story plus a short action cue. This overlaps with Issue 1.

## Open questions for the owner

1. Should the instruction cue ("what to do") be shown on screen, for example in the story card? Or should it be conveyed only through visual signals on the scene?
2. Is a fixed "hint is visible from the start" acceptable, or should discovery still be part of the experience?
3. Should the three stories keep their current premises, with only the text rewritten, or do their premises also need rework?
4. Is a single shared interaction type across the stories desirable, or is variety (tap, hold, drag) intentional?

## Suggested acceptance checks (from the notes; extend in `spec.md`)

- A first-time player can start any story and finish it without outside help.
- It is obvious which element is interactive, and which gesture it expects, before touching it.
- Wrong or partial input gets visible feedback, not only audio or screen-reader output.
- Each story-card line is clearly about the story's premise and responds to the player's last action.
- The imagery and UI chrome are unchanged.
- Verify on a phone-sized viewport, with keyboard and touch. Retest the hold, the drag, pause/resume, reduced motion and reset.
