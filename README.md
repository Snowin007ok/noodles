# NOODLES — From Scroll to Soul

A projector-first game for running a 10-question live session on the theme
**From Scroll to Soul: How Digital Evolution Shaped Generations**. The class
stands as townsfolk of every age on a warm, hand-drawn street: the old world on
the left (post office, radio & TV shop, telephone booth, newspaper stand, a
tree with a swing), the new world on the right (café full of laptops, phone
billboard, glass offices, a signal tower). For student questions the algorithm
scrolls the crowd and stops on someone; the question takes over the whole
screen and the host starts a two-minute clock. When it reaches zero, whoever is
on the clock is **logged out** — permanently, for the rest of the session.

Everything is original artwork and code. No third-party game assets are used.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open the URL Vite prints. For a projector, build once and serve the static
output:

```bash
npm run build && npm run preview
```

Fonts are bundled locally (Fredoka + Nunito via `@fontsource`), so there are no
CDN calls and the app runs fully offline — which matters in a classroom.

Run the selection-fairness and edge-case suites:

```bash
npm test
```

## Presenting

The audience should only ever see the street. Two ways to make sure of that:

- **Present** (`H`) — folds the control panel away so the street fills the
  entire display. A slim host bar in the corner keeps the round's actions:
  pick, reveal, start the clock, guest answered, next. `H` again brings the
  full panel back. The choice is remembered per browser window.
- **Projector** — opens a host-free `?view=stage` window that mirrors the
  session live (via `localStorage`). Drag it to the projector; keep the panel
  on your laptop.

`F` toggles fullscreen.

## The three kinds of question

Every question has an audience. It's set per question in the **Questions** tab,
so you can re-balance the session in seconds.

| Mode | Who answers | How it runs |
| --- | --- | --- |
| **Students** | one student, chosen by the algorithm | Host presses **Let the algorithm choose**. Figures light up in a decelerating scroll, the sting lands on the lock-in, **THE ALGORITHM CHOSE: NAME** slams in, the question takes over the screen. |
| **Guest** | the invited guest speaker | No pick. The street shows **GUEST QUESTION — over to our guest**; on reveal the question fills the screen. Host starts the clock, marks **✓ Guest answered** (`G`). No guest in the room? **No guest? Algorithm picks** runs the normal pick instead. |
| **Volunteer** | anyone who raises a hand | Street shows **RAISE YOUR HAND**. On reveal the question fills the screen with the class as tappable name chips; host taps whoever answered. (Figures on the street are tappable too.) Nobody? **Nobody? Algorithm picks**. |

The shipped deck: students on 1, 3, 5, 7, 8, 9, 10 · guest on 2 and 4 ·
volunteer on 6.

## The clock

The 2:00 clock is available on every question type once it's revealed. The host
starts it (**Start 2:00** / `Space`); after that there is no pause, no
extension and no reprieve.

At zero, **whoever is on the clock is logged out**: the student the algorithm
picked, or the volunteer who was tapped. Their figure walks off the street,
they leave the pool, and they cannot be drawn again this session. On a guest
round nobody is on the clock, so the round simply closes as **time up**.

**Reset progress** brings everyone back.

## Fair selection

`src/game/shuffle.js` keeps a Fisher–Yates-shuffled deck of eligible student
IDs and pops from the tail. Nobody can be drawn twice until the whole class has
had a turn. When the deck empties it reshuffles, re-drawing if the new top card
matches the student just picked — so there is no repeat across the seam either.
Randomness comes from `crypto.getRandomValues` with a `Math.random` fallback.

The draw happens in `App.spin()`, not in the reducer: reducers must be pure, and
React StrictMode double-invokes them in development, which would burn two cards
per pick.

Students added mid-session join the pool immediately. Students who answered stay
on the street, dimmed. Logged-out students leave the street and the pool but
remain in the roster — the **Status** tab lists everyone as online, took-part,
or logged out.

Verified over 45,000 simulated draws with a 45-student class: 1000 complete
cycles, zero repeats within a cycle, zero back-to-back repeats across the
reshuffle seam, and a perfectly flat distribution.

## The street and the townsfolk

The scene is one SVG, drawn 3:2 and scaled to *cover* whatever the display is,
anchored to the pavement — so on a wide projector the sky crops rather than the
picture stretching, and the class always stands on the ground. A then→now
ribbon along the top gives life and technology equal weight: letters and
landlines, radio & TV evenings and street games, SMS and cyber cafés,
smartphones and selfies, always-on and AI.

Townsfolk are one parametric figure with eight silhouettes — grandparents,
parents, a teen, a kid, an office worker — each holding something from either
world (newspaper, letter, landline handset, cricket bat / phone, camera,
laptop, coffee and earbuds). The student's colour drives the outfit; the
silhouette is hashed from the student id so it never changes between rounds.

## Audio

All synthesised with Web Audio except the licensed sting, and all on theme:

| Moment | What plays |
| --- | --- |
| Pick pressed | `AudioContext` resumes (the host gesture that satisfies autoplay policy); a **dial-up modem handshake** riser scores the scroll, with a notification **ping** on every figure that lights |
| `spin − 1180ms` | The sting is scheduled via `AudioBufferSourceNode.start(when)` so its measured 1.18s impact lands exactly on the lock-in |
| Guest round revealed / answered | A two-note **verified** chime |
| Volunteer tapped | A warm rising chime |
| Clock hits zero | A descending **logout** tone (plus the sting on the walk-off when a student goes) |

Nothing is ever played before the host's first click.

## Roster

The **Roster** tab has **Paste whole class list** — paste names one per line (or
comma-separated) and load them in one action. Students whose names are unchanged
keep their colour and history, so pasting again to fix a typo is safe. Add,
rename and remove work at any time, mid-session included.

The street shows a cast (default 16 figures) so a class of 45 isn't a wall of
thumbnails; everyone is still in the pool, and whoever is lit, picked or
answering is always brought on. **Cards shown** in the Control tab adjusts it.
Figure size and name plates scale with the cast so names never truncate into
ambiguity.

## End of session

Once all ten rounds have an outcome, a **SESSION COMPLETE** summary takes the
screen: answered, logged out, time-up and still-online counts, and who was
logged out. **New session** brings the whole class back and clears the board;
**Review rounds** dismisses it so you can page back through.

## Edge cases handled

Covered by the reducer suite in `scratchpad/edge.mjs` (run with `npm test`):

| Case | Behaviour |
| --- | --- |
| Two students with the same name | Each pasted line becomes its own student. |
| Re-paste the class list mid-session | Unchanged names keep id, colour, participation and logged-out status. |
| Name field emptied | Renders as *Unnamed student* rather than blank. |
| Student deleted mid-countdown | Clock stops — nobody left to log out. |
| Re-pick while a clock is running | Old deadline cancelled; the previous student is not logged out into the new round. |
| Re-run a finished round | Its previous outcome (including *Guest answered*) is voided first. |
| Double-click on the pick button | A ref guard stops two cards coming off the deck. |
| Keys pressed mid-scroll | `R`/`G`/`N`/`P`/`Space` are ignored while scrolling or logging out. |
| Tab backgrounded | Deadline-based clock re-syncs on `visibilitychange`. |
| Everyone logged out | The street says so and the pick is disabled, with Reset progress called out. |
| Empty roster | Prompts you to add students, paste a list, or load the sample class. |
| Saved session from the previous build | 8-round sessions migrate: `open` rounds become volunteer, missing slots fill from the sample deck, no NaN. |
| Audio blocked or missing | Synth continues; the visuals never depend on it. |
| `localStorage` full or disabled | Saves fail silently; the game keeps working for the session. |

## Keyboard

| Key | Action |
| --- | --- |
| `S` | Let the algorithm pick (any mode) |
| `R` | Reveal question |
| `Space` | Start the 2:00 clock |
| `G` | Guest answered (guest rounds) |
| `N` / `P` | Next / previous round |
| `H` | Present — hide/show the control panel |
| `F` | Fullscreen |
| `M` | Mute |

Shortcuts are ignored while typing in a field. Everything is also reachable by
tab-and-enter, and all controls are at least 44px for touch.

## Accessibility

Honours `prefers-reduced-motion` and offers a manual **Reduced motion** toggle.
Both compress the timeline and switch off every ambient loop while keeping the
sequence legible. Banners use `role="status"` with live regions.

## Layout

Everything persists to `localStorage` under `noodles.session.v1` — roster,
questions (text and audience), round results, audio preference and progress.

```
src/
  App.jsx                 timeline orchestration, countdown, keyboard, presenter mode
  game/
    constants.js          session title, question deck + modes, timings, palette
    shuffle.js            Fisher–Yates deck and no-repeat pool
    state.js              reducer + localStorage persistence + migration
    layout.js             pavement rows (best-fit columns, staggered, centred)
    audio.js              Web Audio engine: modem riser, pings, chimes, sting
  components/
    Lobby.jsx             the street stage: townsfolk, pick FX, empty states
    StreetScene.jsx       the town, one SVG — old world left, new world right
    Townsfolk.jsx         parametric original figure, eight silhouettes
    HostBar.jsx           presenter-mode controls
    TeacherPanel.jsx      Control / Roster / Questions / Status
    Overlays.jsx          banners, full-screen question takeover, clock, summary
  styles/                 base, lobby, panel, overlays
public/audio/reveal-sting.mp3
```

## Tuning

- Session title and question deck: `SESSION`, `SAMPLE_QUESTIONS` in `game/constants.js`
- Round timings and the audio anchor: `TIMING`, `EJECT`
- Answer time: `ANSWER_SECONDS` (default 120)
- Then→now ribbon labels: `ERAS`
- Where the class stands: `FEED_AREA` in `game/layout.js`
