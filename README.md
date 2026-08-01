# NOODLES — classroom crew selection

A top-down spacecraft lobby for running a 10-question class quiz. The teacher
spins for a random crew member, the question appears, and the teacher starts a
two-minute clock. When it reaches zero the airlock cycles and the challenger is
ejected into space — permanently. Their seat stays empty for the rest of the
session and they cannot be drawn again.

Everything is original artwork and code. No third-party game assets are used.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173. For a classroom projector, build once and
serve the static output:

```bash
npm run build && npm run preview
```

Fonts are bundled locally (Fredoka + Nunito via `@fontsource`), so there are no
CDN calls and the app runs fully offline — which matters in a classroom.

Run the selection-fairness and edge-case suites:

```bash
npm test
```

## How a round works

**Individual rounds (1, 3, 5, 6, 8)**

1. Teacher presses **Select Random Student**.
2. Names flash around the room, easing to a stop; the sting's impact lands on
   the exact frame the choice locks in.
3. Red strobe, **CHALLENGER CAUGHT: <NAME>**.
4. The screen is taken over: the caught name fills it in huge type with the
   question underneath, sized to read from the back of the room. The lobby is
   fully covered — nothing ghosts through.
5. Teacher presses **Start 2:00** when the class is ready. *Only the start is
   manual.* Once running there is no pause, no extension and no reprieve.
6. At zero the airlock opens and the challenger is ejected. They do **not**
   come back: they leave the pool, their seat stays empty, and the round is
   marked **ejected**.

**Volunteer rounds (2, 4, 7, 9, 10)**

Shows **OPEN QUESTION — ANYONE MAY ANSWER**. These keep the compact bottom card
rather than the full-screen takeover, so the room stays visible: names are
turned on automatically and the teacher taps whoever spoke up, which marks the
round **answered**. No clock runs. If nobody volunteers, **NO VOLUNTEERS? SPIN** runs the identical
dramatic selection, and from then on the round behaves exactly like an
individual one: clock, ejection and all.

There is no scoring. Once a challenger is on the clock the only outcome is
ejection.

Everyone comes back aboard with **Reset progress**.

## Fair selection

`src/game/shuffle.js` keeps a Fisher–Yates-shuffled deck of eligible student
IDs and pops from the tail. Nobody can be drawn twice until the whole class has
had a turn. When the deck empties it reshuffles, re-drawing if the new top card
matches the student just picked — so there is no repeat across the seam either.
Randomness comes from `crypto.getRandomValues` with a `Math.random` fallback.

The draw happens in `App.spin()`, not in the reducer: reducers must be pure, and
React StrictMode double-invokes them in development, which would burn two cards
per spin.

Students who answered stay seated, dimmed and desaturated. Ejected students are
removed from the room and from the pool, but remain in the roster — the
**Status** tab lists everyone as aboard, took-part, or ejected.

Verified over 45,000 simulated draws with a 45-student class: 1000 complete
cycles, zero repeats within a cycle, zero back-to-back repeats across the
reshuffle seam, and a perfectly flat distribution (every student drawn exactly
1000 times). With progressive ejection, 40 rounds produced 40 distinct students.

## Audio sync

The supplied sting is 4.968s long and its dramatic impact peaks at **1.18s**
(measured, and re-confirmed by decoding it in the browser). The clip is
therefore scheduled *late* rather than at the start:

| Moment | What plays |
| --- | --- |
| Spin pressed | `AudioContext` resumes (the user gesture that satisfies autoplay policy) and an original oscillator riser + per-name ticks begin |
| `spin − 1180ms` | The MP3 is scheduled via `AudioBufferSourceNode.start(when)` |
| `spin` (2800ms) | The sting's impact lands exactly on lock-in, alarm and banner |
| 4200ms | A `GainNode` ramps the sting to silence |

The ejection reuses the same trick: the sting is scheduled so its peak hits the
launch frame.

Web Audio is used rather than `<audio>` because `AudioBufferSourceNode.start()`
is sample-accurate; `HTMLAudioElement.play()` has tens of milliseconds of
unpredictable latency and cannot be scheduled at all. Nothing is ever played
before the teacher's first click.

## Roster

The **Roster** tab has **Paste whole class list** — paste names one per line (or
comma-separated) and load them in one action, which is how you get 45 students
in without typing 45 fields. Students whose names are unchanged keep their
colour and participation history, so pasting again to fix a typo is safe.

Seating adapts to class size automatically: one row on the wall benches, a
second row inside it, then a ring around the holo-table. Crew shrink as the
class grows so a full 45 still reads clearly on a projector.

Name tags are **hidden by default** — 45 of them buries the room. Only the name
that matters right now is shown (spotlight, caught, or answering), plus hover
and focus. **Show all names** in the Control tab turns them all on.

## End of session

Once all ten rounds have an outcome, a **MISSION COMPLETE** summary takes the
screen: answered vs ejected counts, how many are still aboard, and the list of
everyone lost to space. **New session** brings the whole class back and clears
the board; **Review rounds** dismisses it so you can page back through.

## Edge cases handled

Covered deliberately, with a reducer test suite in `scratchpad/edge.mjs`
(17 assertions, all passing):

| Case | Behaviour |
| --- | --- |
| Two students with the same name | Each pasted line becomes its own student. Reusing one record twice would mint duplicate ids and corrupt the pool. |
| Re-paste the class list mid-session | Unchanged names keep their id, colour, participation and ejected status. |
| Name field emptied | Renders as *Unnamed crew* rather than a blank tag. |
| Student deleted mid-countdown | Clock stops — there is nobody left to eject. |
| Re-spin while a clock is running | The old deadline is cancelled, so the previous student is not ejected into the new round. |
| Double-click on Spin | A ref guard stops two cards coming off the deck in one tick. |
| Keys pressed mid-spin | `R`/`N`/`P`/`Space` are ignored while spinning or ejecting; only mute stays live. |
| Tab backgrounded | The clock is deadline-based, and re-syncs on `visibilitychange` — throttled timers can't slow it down. |
| Everyone ejected | The lobby says so and Spin is disabled, with Reset progress called out. |
| Empty roster | Prompts you to add students or paste a list. |
| Refresh mid-animation | Lands back in a stable lobby instead of stranding the airlock open. |
| Audio blocked or missing | Falls back to the synthesised riser; the visuals never depend on it. |
| `localStorage` full or disabled | Saves fail silently; the game keeps working for the session. |
| Corrupt saved state | Version-checked, falls back to a fresh session. |

## Keyboard

| Key | Action |
| --- | --- |
| `S` | Spin |
| `Space` | Start the 2:00 clock |
| `R` | Reveal question |
| `N` / `P` | Next / previous round |
| `M` | Mute |

Shortcuts are ignored while typing in a field. Everything is also reachable by
tab-and-enter, and all controls are at least 44px for touch.

## Accessibility

Honours `prefers-reduced-motion` and offers a manual **Reduced motion** toggle.
Both compress the timeline and switch off every ambient loop (bobbing, strobing,
twinkling, holo-rotation) while keeping the sequence legible. Banners use
`role="status"` with live regions.

## Layout

Everything persists to `localStorage` under `noodles.session.v1` — roster,
questions, round results, audio preference and progress. A refresh mid-spin
lands safely back in the lobby rather than stranding the animation.

```
src/
  App.jsx                 timeline orchestration, countdown, keyboard
  game/
    constants.js          timings, palette, sample data, which rounds are volunteer
    shuffle.js            Fisher–Yates deck and no-repeat pool
    state.js              reducer + localStorage persistence
    layout.js             seating plan (arc-length distribution around the benches)
    audio.js              Web Audio engine, scheduling and fades
  components/
    Lobby.jsx             stage; art and name tags in two separate layers
    LobbyRoom.jsx         the room itself, one top-down SVG
    CrewMember.jsx        original crew character
    TeacherPanel.jsx      Control / Roster / Questions / Status
    Overlays.jsx          banners, full-screen takeover, question card, clock
  styles/                 base, lobby, panel, overlays
public/audio/reveal-sting.mp3
```

Art and tags are deliberately in **two layers**: each crew node carries a
transform, and a transform creates a stacking context, so a name nested inside
its own crew node could never draw above a neighbour's artwork. Hoisting the
tags out guarantees every name stays legible however tightly the room is packed.

## Tuning

- Round timings and the audio anchor: `TIMING`, `EJECT` in `game/constants.js`
- Answer time: `ANSWER_SECONDS` (default 120)
- Which rounds are volunteer rounds: `OPEN_ROUNDS`
- Seating rings and crew scale: `game/layout.js`
