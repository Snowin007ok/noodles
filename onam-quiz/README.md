# The Great Onam Quiz — Maveli's Challenge

An immersive Onam-festival quiz built with **HTML + CSS + vanilla JavaScript only** — no frameworks, no external JS libraries. King Mahabali (Maveli) himself hosts it: he greets you, cheers your right answers, explains the wrong ones, teases you for dawdling, laughs when you pet him and cries when you poke him.

## Run it

Open `index.html` in any browser — it's fully static. Or serve the folder:

```bash
npx vite onam-quiz --port 8643
```

Click **Start Quiz** once and the festival music begins (browsers require one gesture before audio).

## What's inside

- **12 questions** spread across the Onam story, pookalam, sadya, vallam kali, the Malayalam calendar, arts, dress and geography — stored as a `QUESTIONS` array (`question / options / answer / explanation`), shuffled each run, options shuffled too.
- **Progress**: "Question X of 12", percentage, and a gold bar with a lit nilavilakku riding the fill.
- **Feedback loop**: pick an answer → the right one glows leaf-green, a wrong pick shakes vermilion → Maveli explains why → Next.
- **Results**: score, total, a blessing sized to your score, Play Again, and your **royal record** kept in `localStorage`.
- **Maveli, the talking king**: typewriter speech bubbles, three poses, idle taunts after ~13s ("The payasam is getting cold!"), hover = belly laugh, click = comic crying with tears (Talking-Tom style), 4 quick pokes summon the guards.
- **Sound**: the bundled Onam song loops as background music (toggle, top right); every click, correct, wrong, laugh, cry and the final fanfare are synthesized live with the Web Audio API — no sound files.
- **Day / Thiruvonam-night switch**: the slider under the music button flips the whole world to a lamplit night — glowing petals, lamp auras, gold-on-midnight palette. Persists.
- **Keyboard**: `1–4` answer, `F` fullscreen, `Enter` follows the focused button.
- **Craft details**: the pookalam mandala is generated SVG (six petal rings in marigold/gold/vermilion), kasavu zari bands frame the page, the question sits on a banana-leaf stage, line-art nilavilakku, chundan vallam and a nettipattam elephant carry the iconography. `prefers-reduced-motion` is respected throughout.

## Files

```
onam-quiz/
├── index.html      structure + inline SVG iconography
├── style.css       kasavu/gold/marigold world, night theme, animations
├── script.js       quiz engine, Maveli, pookalam generator, Web Audio SFX
└── assets/
    ├── maveli-1..3.png   the king's three poses (cut from the provided art)
    └── onam-music.mp3    background song (provided, no-copyright)
```
