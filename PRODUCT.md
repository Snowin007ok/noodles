# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A single host (teacher or club organiser) running a live group session from a
laptop, projected onto a classroom display or meeting-room screen. The people
in the roster vary per session — sometimes adult colleagues in a workplace
speaking club, sometimes school students (user-confirmed: mixed, varies per
session). All copy and drama must therefore work for both audiences: playful
and game-like, never childish, never workplace-inappropriate, always
classroom-safe (no death/blood/violence framing).

The host is the only operator; participants never touch the app. Everything
participants see is on the projector, read from up to a classroom's length
away.

## Product Purpose

NOODLES turns "who answers the next question?" into a game built on the
session's own topic — *From Scroll to Soul: How Digital Evolution Shaped
Generations*. A warm, hand-drawn street is the backdrop: its left half the
older world (post office and letterbox, radio & TV shop, telephone booth,
newspaper stand, a tree with a swing), its right half the new one (café full
of laptops, phone billboard, glass offices, a signal tower), the sky grading
from a nostalgic sunset into a clear morning. In the middle stands a vintage
wood-and-brass **name reel**: the class lives inside it as name plates. On a
pick the reel spins hard, blurs, decelerates with the clack of a ratchet and
lands one plate dead centre as the marquee bulbs flash — nobody knows where
it stops until it does ("THE ALGORITHM CHOSE"). The question then takes over
the whole screen and a hard 2-minute clock decides whether they answered or
get logged out — permanently, for the rest of the session. A then→now ribbon
gives life and technology equal weight (user-confirmed: 50/50, "it's life
too"). No characters on stage (user-confirmed: removed in favour of the reel).

Success (user-confirmed): one specific upcoming event runs flawlessly —
projector-legible, every button works live in front of the room, the drama
lands. Polish for that day outranks speculative long-term features.

## Positioning

Not a quiz platform and not a randomiser widget: a projector-first *stage
show* for live sessions, with provably fair selection (Fisher–Yates deck, no
repeats until everyone has been drawn, verified by simulation) and stakes
(irreversible ejection) that classroom spinner tools don't have.

## Operating Context

- Run fullscreen in a browser on the host's laptop, mirrored to a projector.
  The audience must never see the roster or controls (user-confirmed):
  **Presenter mode** (`H`) folds the panel away so the street fills the entire
  display, with a slim host bar for the round's actions; **Projector** opens a
  host-free `?view=stage` window for two-screen setups. Every question type
  takes over the full screen once revealed — volunteer rounds show the class
  as name chips the host taps, so nothing depends on the street being visible.
- Sessions are 10 rounds. Each question has an audience, editable in the
  Questions tab: **students** (the algorithm picks one), **guest** (for the
  invited guest speaker — no pick; a "no guest? algorithm picks" fallback), or
  **volunteer** (anyone may answer; host taps who did, same fallback). The
  shipped deck is students on 1, 3, 5, 7–10; guest on 2 and 4; volunteer on 6.
- The 2:00 clock is available on every question type once revealed. Whoever is
  on the clock at zero is logged out (a picked student, or a tapped
  volunteer); on a guest round nobody is, so the round simply closes as time
  up.
- The host controls everything from a side rail (tabs: Control, Roster,
  Questions, Status) and keyboard shortcuts; audio must only start from a host
  gesture (browser autoplay policy).
- Real rosters are pasted in at session time and live only in that browser's
  localStorage. The public repo and live site carry a fictional 45-name
  sample roster.

## Capabilities and Constraints

- Stack: React 18 + Vite, plain CSS, no UI framework. Self-hosted fonts
  (@fontsource) — must work offline; no CDN calls.
- Deploys automatically to GitHub Pages at `/noodles/` on every push to main
  (public repo `Snowin007ok/noodles`); all asset URLs must respect
  `import.meta.env.BASE_URL`.
- State persists to localStorage (`noodles.session.v1`), with self-healing
  loads (empty roster → sample crew restored; corrupt/mid-animation state →
  stable lobby).
- Fair selection is a hard guarantee, covered by `npm test` (reducer edge
  suite + 45,000-draw fairness simulation). Any change to selection logic must
  keep those suites passing.
- Ejection is permanent by design: no pause, no extension, no reprieve;
  ejected students leave the pool and the room but stay in the roster. Reset
  progress brings everyone back.
- IP constraint (user's own brief): the visual world may echo a flat,
  desaturated "crew in a ship" aesthetic, but characters, names, logos,
  fonts, maps, sounds, and artwork must remain original. Among Us assets are
  explicitly off-limits regardless of offered licenses (editorial-only stock,
  texture rips).
- Reduced motion: every dramatic beat has a compressed, motion-free
  equivalent; the catch keeps its information (who was picked) without shake
  or particles.
- The reveal sting (`public/audio/reveal-sting.mp3`, licensed stock) has its
  impact peak at 1.18s; audio scheduling is sample-accurate via Web Audio and
  timed so the peak lands on the lock-in/launch frame.

## Brand Commitments

- Name: **NOODLES** (user-confirmed, committed — wordmark, repo, live URL).
  The curled "noodle" antenna on every crew character is the house motif.
- Tone: dramatic-playful game-show energy ("ANSWER NOW", "MISSION COMPLETE",
  airlock stakes) with classroom-safe execution.

## Evidence on Hand

- Live deployment: https://snowin007ok.github.io/noodles/ (auto-deploys in
  ~40s per push).
- Test evidence: 22-assertion reducer edge suite; fairness simulation (1000
  full cycles, zero repeats within cycle, zero seam repeats, flat
  distribution) — both run via `npm test`.
- Real participant roster exists but is deliberately NOT in the repo (PII);
  a 45-name fictional sample ships in `src/game/constants.js`.
- No testimonials, pricing, or usage metrics exist — do not fabricate any.

## Product Principles

1. **The projector is the product.** Every visual decision is judged from the
   back of the room; host-only UI may be dense, participant-facing text may
   not.
2. **Fairness is a feature, not an implementation detail.** No-repeat random
   selection stays provable and tested.
3. **Stakes are real but safe.** Irreversible ejection, permanent
   consequences, zero harm framing.
4. **Never break the show.** Self-heal bad state, degrade gracefully (audio
   blocked, reduced motion, offline), keep the last good build serving.
5. **Original world only.** Style may be inspired; assets, characters, and
   names are ours.

## Accessibility & Inclusion

- Full keyboard operation for the host (S/R/Space/N/P/M shortcuts + focus
  outlines) and touch support for tap-to-pick volunteer rounds.
- `prefers-reduced-motion` respected end-to-end, plus an in-app manual toggle.
- Projector legibility floor: participant-facing type is sized in viewport
  units with tested clamps; name tags auto-scale to seat pitch so no name is
  ever truncated into ambiguity.
