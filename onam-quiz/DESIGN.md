# Design — The Great Onam Quiz (onam-quiz/ only)

Scope: this file governs the standalone `onam-quiz/` surface, not the NOODLES game.
World: the festival itself is the interface — Maveli's kingdom hosting a quiz.
User-pinned palette and motifs; documented here from the built code.

## Tokens (style.css `:root`)

| Token | Value | Role |
|---|---|---|
| `--kasavu` | `#F9F6EE` | page ground (woven cream) |
| `--kasavu-deep` | `#F1EAD6` | warmed panel tint, track bed |
| `--gold` / `--gold-deep` | `#D4AF37` / `#A8801C` | brass, zari bands, borders |
| `--gold-ink` | `#7D5E10` | gold dark enough to read on cream |
| `--marigold` / `--sunshine` | `#FFA500` / `#FFD700` | petals, progress fill, buttons |
| `--vermilion` | `#C13A2B` | shawl red: threads, wrong states, flame |
| `--ink` | `#26312A` | body text |
| `--forest` | `#1B4332` | display headings |
| `--leaf` / `--leaf-deep` | `#256B45` / `#17452E` | banana-leaf question stage |
| `--cream-text` | `#F6F2E4` | text on green |

Night theme (`body[data-theme="night"]`) re-declares the same tokens: ground
`#12271D`, ink `#EDE6D2`, headings `#F0E6C4`, gold-ink `#E8C560`; lamps, petals
and the pookalam gain gold glows. Both themes must keep body text ≥ 4.5:1.

## Type

- Display: **Marcellus** (Google Fonts; falls back Palatino → Georgia). Used for
  h1/h2, question text, progress label, score numerals. Never bolded — it has one weight.
- Body/UI: **Nunito Sans** (falls back Avenir Next → system). Weights 600–800.
- Malayalam (`lang="ml"`): system fallback; **never letter-space it** — tracking
  breaks Indic shaping.

## Components & rules

- **Kasavu bands**: fixed 18px zari gradients top/bottom with a 3px vermilion
  thread; they frame every screen and never scroll.
- **Pookalam**: generated SVG (`buildPookalam`, viewBox 480 — outer petal tips
  reach r 232, keep viewBox ≥ 2×240 or petals clip square). 90s linear spin;
  disabled under reduced motion.
- **Question stage**: banana-leaf panel — leaf gradient, asymmetric radius
  `30px 90px`, center midrib line, cream display text.
- **Options**: cream cards, 2px gold border, numbered brass roundels (1–4 =
  keyboard keys); correct → leaf greens + drawn check, wrong → vermilion +
  shake + drawn cross, others dim to 0.45.
- **Buttons**: brass pill (gold gradient, inset bevel top+bottom). Focus =
  3px forest outline.
- **Progress**: gold track (overflow hidden) + `scaleX` fill (never animate
  width) + nilavilakku marker riding OUTSIDE the track in `.progress-wrap`
  (inside gets clipped). Lamp position clamps to 1.5–98.5%.
- **Maveli**: fixed bottom-right; pose 1 = neutral/sad, 2 = celebrating,
  3 = greeting. Speech bubble is `pointer-events: none`, auto-dismisses
  (~2.6s + 50ms/char), and feedback lines hold against hover-laughs for 8s.
  **Exclusion corridor**: `.quiz-foot` reserves right padding ≥721px, and on
  mobile footer controls left-align + `#btn-restart` is block-left — nothing
  clickable may sit under his box. Hover = laugh, click = cry + tears, 4 quick
  pokes = guards line.
- **Icon language**: authored line-art SVGs only (nilavilakku, chundan vallam,
  nettipattam elephant, sun/moon, notes) — one stroke voice, no emoji icons.
- **Audio**: MP3 loop starts only from a user gesture; explicit mute
  (`audio.userMuted`) survives Start/Play Again. All SFX are Web Audio
  oscillators — no sound files.
- **Motion**: expo-out (`cubic-bezier(0.16,1,0.3,1)`) everywhere; petal layer
  caps at 18 nodes; everything honors `prefers-reduced-motion` (petals off,
  typewriter instant).

## Constraints

- Vanilla HTML/CSS/JS only — no frameworks, no external JS. Google Fonts is the
  single allowed external CSS fetch; the artifact/single-file build drops it.
- The shareable single-file build (`scratchpad` assembly script) inlines CSS/JS
  and converts the four assets to data URIs; keep new assets small enough for that.
- localStorage keys: `onamquiz.best`, `onamquiz.theme` — always wrapped in try/catch.
