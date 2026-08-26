/* ============================================================
   THE GREAT ONAM QUIZ — vanilla JS
   Quiz engine · generated pookalam · talking Maveli · audio
   ============================================================ */

"use strict";

/* ---------------- Question data ---------------- */

/* difficulty 1 = Atham-easy, 2 = mid-festival, 3 = Thiruvonam-hard.
   The quiz runs easy → hard (shuffled within each tier). */
const QUESTIONS = [
  {
    question: "Onam celebrates the yearly homecoming of which beloved king?",
    options: ["King Mahabali", "King Ravana", "King Vikramaditya", "King Ashoka"],
    answer: "King Mahabali",
    difficulty: 1,
    explanation: "Kerala welcomes King Mahabali — Maveli! — whose reign was a golden age when everyone was equal and happy."
  },
  {
    question: "What is the circular flower carpet laid during Onam called?",
    options: ["Pookalam", "Rangoli", "Kolam", "Alpana"],
    answer: "Pookalam",
    difficulty: 1,
    explanation: "The pookalam grows ring by ring for ten days, starting on Atham day."
  },
  {
    question: "The grand Onam feast served on a banana leaf is called…?",
    options: ["Onasadya", "Thali", "Bhandara", "Virundhu"],
    answer: "Onasadya",
    difficulty: 1,
    explanation: "The Onasadya can run past twenty dishes — and always ends with sweet payasam."
  },
  {
    question: "Which thrilling race takes over Kerala's rivers during Onam?",
    options: ["Vallam Kali — the snake boat race", "The camel race", "The bullock cart race", "The kite duel"],
    answer: "Vallam Kali — the snake boat race",
    difficulty: 2,
    explanation: "Chundan vallams over 100 feet long surge down the water with a hundred rowers singing in rhythm."
  },
  {
    question: "In which Malayalam month does Onam arrive?",
    options: ["Chingam", "Karkidakam", "Medam", "Dhanu"],
    answer: "Chingam",
    difficulty: 2,
    explanation: "Chingam (August–September) opens the Malayalam year with harvest and festivity."
  },
  {
    question: "The most important day of Onam is called…?",
    options: ["Thiruvonam", "Vishu", "Atham", "Uthradam"],
    answer: "Thiruvonam",
    difficulty: 2,
    explanation: "Thiruvonam is the day I am believed to visit every single home in Kerala!"
  },
  {
    question: "Pulikali performers paint themselves as which animal?",
    options: ["Tigers", "Peacocks", "Elephants", "Lions"],
    answer: "Tigers",
    difficulty: 1,
    explanation: "In Thrissur, painted 'tigers' prowl and dance to drumbeats on Onam's fourth day."
  },
  {
    question: "Which graceful clap-dance do women perform in a circle during Onam?",
    options: ["Kaikottikali", "Kathakali", "Mohiniyattam", "Oppana"],
    answer: "Kaikottikali",
    difficulty: 3,
    explanation: "Kaikottikali — also called Thiruvathirakali — is danced in a ring around a lit nilavilakku."
  },
  {
    question: "The new clothes gifted and worn for Onam are called…?",
    options: ["Onakkodi", "Pattu", "Mundu melmundu", "Zari"],
    answer: "Onakkodi",
    difficulty: 2,
    explanation: "Fresh Onakkodi stands for a fresh, prosperous new beginning."
  },
  {
    question: "Which avatar of Vishnu sent Mahabali to the netherworld — yet granted him a yearly visit?",
    options: ["Vamana", "Narasimha", "Parashurama", "Krishna"],
    answer: "Vamana",
    difficulty: 3,
    explanation: "The little Vamana covered all the worlds in two steps — and I offered my own head for the third."
  },
  {
    question: "The classic sweet that crowns every Onam sadya is…?",
    options: ["Payasam", "Jalebi", "Rasgulla", "Halwa"],
    answer: "Payasam",
    difficulty: 1,
    explanation: "Palada payasam, parippu payasam… the sadya is not over until the payasam is poured!"
  },
  {
    question: "Onam is the official state festival of…?",
    options: ["Kerala", "Tamil Nadu", "Karnataka", "Goa"],
    answer: "Kerala",
    difficulty: 1,
    explanation: "God's Own Country celebrates Onam for ten full days — schools, offices, everyone joins in."
  }
];

/* ---------------- Maveli's script ---------------- */

const LINES = {
  greeting: "Onam ashamsakal! I am Maveli, king of this land. Show me how well you know my festival!",
  begin: "First question, {name}! We start easy — Atham day. Think well…",
  golden: "The golden Thiruvonam question, {name}! Answer this and my whole court will cheer!",
  lifeline: "Hmm, {name}… I will blow away two wrong answers. But only ONCE — even Vamana asked only thrice!",
  copied: "Copied, {name}! Now spread the Onam cheer!",
  correct: [
    "Adipoli! Correct!",
    "Sherikkum! You know my kingdom well!",
    "Ha! My crown shines brighter because of you!",
    "Correct! You have earned a second helping of payasam!",
    "Wonderful! Even Vamana would applaud that answer!",
    "Yes! The conch shells sound for you!"
  ],
  wrong: [
    "Ayyo, no!",
    "Oh no, not that one…",
    "Che! Not quite, my friend.",
    "Hmm… even kings stumble, don't worry."
  ],
  idle: [
    "Ente ponno {name}… why take so long?",
    "I wait a whole year to visit, and YOU make me wait too?",
    "The payasam is getting cold, {name}!",
    "Even my umbrella is yawning. Pick an answer!",
    "Thinking harder than Vamana's third step, are we?"
  ],
  laugh: [
    "Ho ho ho ho!",
    "Hehehe… that tickles!",
    "Ho ho! Mind the royal belly!",
    "Careful with the umbrella, hehe!"
  ],
  hurt: [
    "AYYO! You dare beat your king?!",
    "Ouch! My royal belly!",
    "Ente amme! That hurt!",
    "Waaah… I came all the way from Patala for THIS?"
  ],
  guards: "GUARDS! GUAAARDS! …oh wait, I gave them Onam leave.",
  results: [
    { min: 1.0,  text: "PERFECT! You are truly a child of my golden kingdom. I shall visit your home first next Onam!", quip: "A full sadya in your honour! Adipoli!" },
    { min: 0.75, text: "Magnificent! My kingdom's spirit lives strong in you. Come, share the sadya with me!", quip: "Sherikkum, I am proud of you!" },
    { min: 0.5,  text: "Well done! A few more festivals with me and you will be a true expert.", quip: "Not bad at all! Extra payasam for you." },
    { min: 0.25, text: "Hmm… you need more payasam and more stories. Sit beside me next Onam and learn!", quip: "Ayyo… we have work to do, my friend." },
    { min: 0.0,  text: "Ayyo! We must feast together and study my story from the very beginning!", quip: "Even Vamana is shocked. Try again!" }
  ]
};

/* ---------------- Festival data ---------------- */

const ONAM_DAYS = ["Atham", "Chithira", "Chodi", "Vishakam", "Anizham",
  "Thriketa", "Moolam", "Pooradam", "Uthradam", "Thiruvonam"];

const SADYA_DISHES = [
  { name: "Rice",             color: "#FFF9EC", detail: "#EFE3C4" },
  { name: "Pappadam",         color: "#F7E3B0", detail: "#E2C177" },
  { name: "Banana",           color: "#FFD84D", detail: "#E8B424" },
  { name: "Sambar",           color: "#C4722E", detail: "#9C5316" },
  { name: "Avial",            color: "#B9Cf8E", detail: "#8FAA5D" },
  { name: "Thoran",           color: "#7FA85B", detail: "#5C823B" },
  { name: "Olan",             color: "#EFEadA", detail: "#CFC49E" },
  { name: "Kichadi",          color: "#F3EFDC", detail: "#D8CBA4" },
  { name: "Pachadi",          color: "#E8A9A0", detail: "#C97F74" },
  { name: "Injipuli",         color: "#8A4A26", detail: "#68341A" },
  { name: "Sharkara varatti", color: "#B4763B", detail: "#8E5623" },
  { name: "Payasam",          color: "#E8B45A", detail: "#C08A2E" }
];

/* ---------------- Element handles ---------------- */

const $ = (id) => document.getElementById(id);
const els = {
  screens: {
    start: $("screen-start"),
    quiz: $("screen-quiz"),
    results: $("screen-results")
  },
  btnStart: $("btn-start"),
  btnNext: $("btn-next"),
  btnRestart: $("btn-restart"),
  progressLabel: $("progress-label"),
  progressPct: $("progress-pct"),
  progressTrack: $("progress-track"),
  progressFill: $("progress-fill"),
  progressLamp: $("progress-lamp"),
  questionText: $("question-text"),
  options: $("options"),
  scoreLive: $("score-live"),
  finalScore: $("final-score"),
  finalMessage: $("final-message"),
  bestLine: $("best-line"),
  startBest: $("start-best"),
  themeToggle: $("theme-toggle"),
  voiceToggle: $("voice-toggle"),
  kalam: $("kalam"),
  kalamDay: $("kalam-day"),
  sadya: $("sadya"),
  sadyaLine: $("sadya-line"),
  btnCard: $("btn-card"),
  btnShare: $("btn-share"),
  btnLifeline: $("btn-lifeline"),
  nameInput: $("name-input"),
  story: $("story"),
  pooram: $("pooram"),
  maveli: $("maveli"),
  maveliImg: $("maveli-img"),
  bubble: $("bubble"),
  bubbleText: $("bubble-text"),
  musicToggle: $("music-toggle"),
  bgm: $("bgm"),
  bgmEnd: $("bgm-end"),
  petalLayer: $("petal-layer")
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ---------------- State ---------------- */

const state = {
  index: 0,
  score: 0,
  streak: 0,
  answered: false,
  started: false,
  lifelineUsed: false,
  record: [],           /* true/false per question, for the share string */
  order: QUESTIONS.map((_, i) => i)
};

/* Player name — Maveli greets you by it */
const player = {
  get name() { return (store.get("onamquiz.name") || "").trim().slice(0, 20); },
  set(nm) { store.set("onamquiz.name", (nm || "").trim().slice(0, 20)); }
};

function personalize(text) {
  const nm = player.name;
  if (nm) return text.replaceAll("{name}", nm);
  return text
    .replaceAll(", {name}", ", my friend")
    .replaceAll(" {name}", " my friend")
    .replaceAll("{name}", "my friend");
}

/* Easy → hard journey: shuffle within each difficulty tier, then chain them */
function tieredOrder() {
  const tiers = [1, 2, 3].map((d) =>
    shuffle(QUESTIONS.map((_, i) => i).filter((i) => QUESTIONS[i].difficulty === d)));
  return tiers.flat();
}

/* ---------------- Persistence (best score, theme) ---------------- */

const store = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* private mode */ }
  }
};

const BEST_KEY = "onamquiz.best";
const THEME_KEY = "onamquiz.theme";

function bestScore() {
  const n = parseInt(store.get(BEST_KEY), 10);
  return Number.isFinite(n) ? n : null;
}

/* ---------------- Utilities ---------------- */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ---------------- Pookalam generator ----------------
   Concentric petal rings in the festival palette. */

function buildPookalam(container, seedRotate = 0) {
  const NS = "http://www.w3.org/2000/svg";
  const size = 480, c = size / 2; /* outer petal tips reach 232 — keep inside the viewBox */
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("aria-hidden", "true");

  const rings = [
    { r: 186, petals: 24, len: 46, wid: 24, fill: "#FFA500", stroke: "#C77F00" },
    { r: 150, petals: 20, len: 42, wid: 24, fill: "#FFD700", stroke: "#A8801C" },
    { r: 116, petals: 18, len: 38, wid: 22, fill: "#C13A2B", stroke: "#8E2417" },
    { r: 86,  petals: 14, len: 34, wid: 20, fill: "#FFA500", stroke: "#C77F00" },
    { r: 58,  petals: 12, len: 28, wid: 17, fill: "#F9F6EE", stroke: "#D4AF37" },
    { r: 34,  petals: 8,  len: 24, wid: 15, fill: "#FFD700", stroke: "#A8801C" }
  ];

  const ground = document.createElementNS(NS, "circle");
  ground.setAttribute("cx", c); ground.setAttribute("cy", c); ground.setAttribute("r", 196);
  ground.setAttribute("fill", "#256B45"); ground.setAttribute("opacity", "0.16");
  svg.appendChild(ground);

  rings.forEach((ring, ri) => {
    const g = document.createElementNS(NS, "g");
    for (let i = 0; i < ring.petals; i++) {
      const angle = (360 / ring.petals) * i + seedRotate + ri * 8;
      const petal = document.createElementNS(NS, "path");
      const l = ring.len, w = ring.wid;
      petal.setAttribute("d",
        `M0 0 C ${w / 2} ${-l * 0.35}, ${w / 2} ${-l * 0.75}, 0 ${-l} C ${-w / 2} ${-l * 0.75}, ${-w / 2} ${-l * 0.35}, 0 0 Z`);
      petal.setAttribute("fill", ring.fill);
      petal.setAttribute("stroke", ring.stroke);
      petal.setAttribute("stroke-width", "1.5");
      petal.setAttribute("transform", `translate(${c} ${c}) rotate(${angle}) translate(0 ${-ring.r})`);
      g.appendChild(petal);
    }
    svg.appendChild(g);
  });

  const heart = document.createElementNS(NS, "circle");
  heart.setAttribute("cx", c); heart.setAttribute("cy", c); heart.setAttribute("r", 20);
  heart.setAttribute("fill", "#D4AF37"); heart.setAttribute("stroke", "#A8801C");
  heart.setAttribute("stroke-width", "2");
  svg.appendChild(heart);

  container.replaceChildren(svg);
}

/* ---------------- Your pookalam: one ring per correct answer ---------------- */

const KALAM_COLORS = [
  { fill: "#FFA500", stroke: "#C77F00" },
  { fill: "#FFD700", stroke: "#A8801C" },
  { fill: "#C13A2B", stroke: "#8E2417" },
  { fill: "#F9F6EE", stroke: "#D4AF37" },
  { fill: "#2E7D4F", stroke: "#1E5A36" }
];

function buildKalam(container, count) {
  const NS = "http://www.w3.org/2000/svg";
  const size = 400, c = size / 2;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("aria-hidden", "true");

  const ground = document.createElementNS(NS, "circle");
  ground.setAttribute("cx", c); ground.setAttribute("cy", c); ground.setAttribute("r", 192);
  ground.setAttribute("fill", "#256B45"); ground.setAttribute("opacity", "0.14");
  svg.appendChild(ground);

  /* dashed guide for rings not yet laid */
  const guide = document.createElementNS(NS, "circle");
  guide.setAttribute("cx", c); guide.setAttribute("cy", c); guide.setAttribute("r", 186);
  guide.setAttribute("fill", "none");
  guide.setAttribute("stroke", "#D4AF37");
  guide.setAttribute("stroke-width", "2");
  guide.setAttribute("stroke-dasharray", "5 9");
  guide.setAttribute("opacity", count >= 10 ? "0" : "0.55");
  svg.appendChild(guide);

  const shown = Math.min(count, 10);
  for (let i = 0; i < shown; i++) {
    const r = 30 + i * 17.2;
    const petals = 8 + i * 3;
    const len = 15 + i * 2.1;
    const wid = 9 + i * 1.3;
    const col = KALAM_COLORS[i % KALAM_COLORS.length];
    const g = document.createElementNS(NS, "g");
    for (let p = 0; p < petals; p++) {
      const angle = (360 / petals) * p + i * 9;
      const petal = document.createElementNS(NS, "path");
      petal.setAttribute("d",
        `M0 0 C ${wid / 2} ${-len * 0.35}, ${wid / 2} ${-len * 0.75}, 0 ${-len} C ${-wid / 2} ${-len * 0.75}, ${-wid / 2} ${-len * 0.35}, 0 0 Z`);
      petal.setAttribute("fill", col.fill);
      petal.setAttribute("stroke", col.stroke);
      petal.setAttribute("stroke-width", "1.2");
      petal.setAttribute("transform", `translate(${c} ${c}) rotate(${angle}) translate(0 ${-r})`);
      g.appendChild(petal);
    }
    if (i === shown - 1) g.setAttribute("class", "kalam-newest");
    svg.appendChild(g);
  }

  const heart = document.createElementNS(NS, "circle");
  heart.setAttribute("cx", c); heart.setAttribute("cy", c); heart.setAttribute("r", 14);
  heart.setAttribute("fill", "#D4AF37"); heart.setAttribute("stroke", "#A8801C");
  heart.setAttribute("stroke-width", "2");
  svg.appendChild(heart);

  container.replaceChildren(svg);
}

function layKalamRing() {
  buildKalam(els.kalam, state.score);
  if (state.score <= 10) {
    els.kalamDay.textContent = state.score >= 10
      ? "Thiruvonam — pookalam complete!"
      : `${ONAM_DAYS[state.score - 1]} ring laid`;
    els.kalamDay.classList.remove("pulse");
    void els.kalamDay.offsetWidth;
    els.kalamDay.classList.add("pulse");
  }
}

/* ---------------- Sadya builder: dishes earned per correct answer ---------------- */

function buildSadya(count) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 760 330");
  svg.setAttribute("aria-hidden", "true");

  /* banana leaf */
  const leaf = document.createElementNS(NS, "path");
  leaf.setAttribute("d", "M18 165 C40 60 200 22 380 22 C560 22 720 60 742 165 C720 270 560 308 380 308 C200 308 40 270 18 165 Z");
  leaf.setAttribute("fill", "#2E7D4F");
  svg.appendChild(leaf);
  const leafShine = document.createElementNS(NS, "path");
  leafShine.setAttribute("d", "M40 165 C60 76 210 42 380 42 C550 42 700 76 720 165 C700 254 550 288 380 288 C210 288 60 254 40 165 Z");
  leafShine.setAttribute("fill", "#3A9161");
  svg.appendChild(leafShine);
  const rib = document.createElementNS(NS, "path");
  rib.setAttribute("d", "M24 165 L 736 165");
  rib.setAttribute("stroke", "#1E5A36"); rib.setAttribute("stroke-width", "5");
  rib.setAttribute("stroke-linecap", "round"); rib.setAttribute("opacity", "0.6");
  svg.appendChild(rib);
  for (let v = 0; v < 8; v++) {
    const vein = document.createElementNS(NS, "line");
    const x = 96 + v * 82;
    vein.setAttribute("x1", x); vein.setAttribute("y1", 52);
    vein.setAttribute("x2", x - 22); vein.setAttribute("y2", 278);
    vein.setAttribute("stroke", "#1E5A36"); vein.setAttribute("stroke-width", "1.6");
    vein.setAttribute("opacity", "0.25");
    svg.appendChild(vein);
  }

  /* 12 dishes in two rows of six, payasam last */
  SADYA_DISHES.forEach((dish, i) => {
    const row = i < 6 ? 0 : 1;
    const cx = 105 + (i % 6) * 110;
    const cy = row === 0 ? 105 : 225;
    const earned = i < count;
    const g = document.createElementNS(NS, "g");
    if (earned) {
      g.setAttribute("class", "dish-in");
      g.setAttribute("style", `animation-delay:${i * 90}ms`);
    }
    const plate = document.createElementNS(NS, "circle");
    plate.setAttribute("cx", cx); plate.setAttribute("cy", cy); plate.setAttribute("r", 34);
    if (earned) {
      plate.setAttribute("fill", dish.color);
      plate.setAttribute("stroke", dish.detail);
      plate.setAttribute("stroke-width", "3");
    } else {
      plate.setAttribute("fill", "rgba(249,246,238,0.10)");
      plate.setAttribute("stroke", "#F6F2E4");
      plate.setAttribute("stroke-width", "2");
      plate.setAttribute("stroke-dasharray", "4 7");
      plate.setAttribute("opacity", "0.55");
    }
    g.appendChild(plate);
    if (earned) {
      const blob = document.createElementNS(NS, "circle");
      blob.setAttribute("cx", cx - 7); blob.setAttribute("cy", cy - 8); blob.setAttribute("r", 11);
      blob.setAttribute("fill", "rgba(255,255,255,0.35)");
      g.appendChild(blob);
    }
    svg.appendChild(g);
  });

  els.sadya.replaceChildren(svg);
  els.sadyaLine.textContent = count === 0
    ? "Ayyo — an empty leaf! Play again and earn your feast."
    : count >= 12
      ? "A full Onasadya — all 12 dishes, payasam included!"
      : `Maveli served you ${count} of 12 sadya dishes${count >= 11 ? " — so close to the payasam!" : ""}.`;
}

/* ---------------- Falling petals ---------------- */

const PETAL_COLORS = ["#FFA500", "#FFD700", "#C13A2B", "#F9F6EE", "#E88B00"];

function petalSVG(color, sizePx) {
  return `<svg width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24">
    <path d="M12 2 C17 7 19 13 12 22 C5 13 7 7 12 2 Z" fill="${color}" stroke="rgba(90,62,8,0.35)" stroke-width="1"/>
  </svg>`;
}

function spawnPetal() {
  if (reducedMotion.matches || document.hidden) return;
  if (els.petalLayer.childElementCount > 18) return;
  const p = document.createElement("div");
  p.className = "petal";
  p.style.left = Math.random() * 100 + "vw";
  p.style.setProperty("--fall-time", (7 + Math.random() * 7).toFixed(1) + "s");
  p.style.setProperty("--sway-time", (2.2 + Math.random() * 2).toFixed(1) + "s");
  p.style.setProperty("--sway", (14 + Math.random() * 26).toFixed(0) + "px");
  p.style.setProperty("--spin", (180 + Math.random() * 360).toFixed(0) + "deg");
  p.innerHTML = petalSVG(pick(PETAL_COLORS), 14 + Math.random() * 14);
  els.petalLayer.appendChild(p);
  p.addEventListener("animationend", () => p.remove());
}
setInterval(spawnPetal, 1400);
for (let i = 0; i < 5; i++) setTimeout(spawnPetal, i * 350);

function burstPetals(x, y, count = 14) {
  if (reducedMotion.matches) return;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "petal burst";
    p.style.left = x + "px";
    p.style.top = y + "px";
    const ang = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 130;
    p.style.setProperty("--bx", Math.cos(ang) * dist + "px");
    p.style.setProperty("--by", (Math.sin(ang) * dist - 60) + "px");
    p.style.setProperty("--spin", (120 + Math.random() * 340).toFixed(0) + "deg");
    p.innerHTML = petalSVG(pick(PETAL_COLORS), 12 + Math.random() * 12);
    els.petalLayer.appendChild(p);
    p.addEventListener("animationend", () => p.remove());
  }
}

/* ---------------- Audio: music + hand-built SFX ---------------- */

const audio = {
  ctx: null,
  musicOn: false,
  userMuted: false, /* an explicit mute survives Start / Play Again */

  ensureCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  },

  tone(freq, start, dur, type = "sine", peak = 0.18) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.05);
  },

  click() { if (this.ensureCtx()) this.tone(760, 0, 0.08, "triangle", 0.10); },

  correct() {
    if (!this.ensureCtx()) return;
    this.tone(523.25, 0.00, 0.22, "triangle", 0.16);
    this.tone(659.25, 0.10, 0.22, "triangle", 0.16);
    this.tone(783.99, 0.20, 0.34, "triangle", 0.18);
  },

  wrong() {
    if (!this.ensureCtx()) return;
    this.tone(196, 0.00, 0.24, "sawtooth", 0.08);
    this.tone(147, 0.16, 0.34, "sawtooth", 0.08);
  },

  fanfare() {
    if (!this.ensureCtx()) return;
    const notes = [392, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.tone(n, i * 0.12, 0.3, "triangle", 0.15));
    this.tone(261.63, 0.6, 0.7, "sine", 0.12);
  },

  laugh() {
    if (!this.ensureCtx()) return;
    /* ho-ho-ho: bouncy alternating staccato */
    [392, 330, 392, 330, 349, 294].forEach((n, i) =>
      this.tone(n, i * 0.11, 0.09, "square", 0.06));
  },

  drums() {
    if (!this.ensureCtx()) return;
    /* chenda-style tiger-streak flourish: low toms + kombu swell */
    const ctx = this.ctx;
    [0, 0.13, 0.26, 0.34, 0.42].forEach((t, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t0 = ctx.currentTime + t;
      osc.type = "square";
      osc.frequency.setValueAtTime(i % 2 ? 96 : 150, t0);
      osc.frequency.exponentialRampToValueAtTime(60, t0 + 0.1);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.16, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0); osc.stop(t0 + 0.15);
    });
    const horn = ctx.createOscillator();
    const hg = ctx.createGain();
    const h0 = ctx.currentTime + 0.5;
    horn.type = "sawtooth";
    horn.frequency.setValueAtTime(392, h0);
    horn.frequency.linearRampToValueAtTime(523, h0 + 0.28);
    hg.gain.setValueAtTime(0.0001, h0);
    hg.gain.exponentialRampToValueAtTime(0.07, h0 + 0.06);
    hg.gain.exponentialRampToValueAtTime(0.0001, h0 + 0.42);
    horn.connect(hg).connect(ctx.destination);
    horn.start(h0); horn.stop(h0 + 0.46);
  },

  cry() {
    if (!this.ensureCtx()) return;
    /* sad comic wah-wah: sliding downward bends */
    const ctx = this.ctx;
    [440, 392, 349, 294].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t0 = ctx.currentTime + i * 0.22;
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, t0);
      osc.frequency.linearRampToValueAtTime(f * 0.82, t0 + 0.2);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.26);
    });
  },

  track: "main", /* 'main' during the quiz, 'finale' on the results screen */

  currentEl() { return this.track === "finale" ? els.bgmEnd : els.bgm; },

  startMusic() {
    const el = this.currentEl();
    el.volume = 0.32;
    const p = el.play();
    if (p) p.then(() => this.setMusicState(true)).catch(() => this.setMusicState(false));
  },

  setTrack(t) {
    if (this.track === t) return;
    const wasOn = this.musicOn;
    els.bgm.pause();
    els.bgmEnd.pause();
    this.track = t;
    this.setMusicState(false);
    if (wasOn && !this.userMuted) this.startMusic();
  },

  setMusicState(on) {
    this.musicOn = on;
    els.musicToggle.setAttribute("aria-pressed", String(on));
  },

  toggleMusic() {
    if (this.musicOn) {
      this.userMuted = true;
      els.bgm.pause();
      els.bgmEnd.pause();
      this.setMusicState(false);
    } else {
      this.userMuted = false;
      this.startMusic();
    }
  }
};

els.musicToggle.addEventListener("click", () => {
  audio.ensureCtx();
  audio.toggleMusic();
});

/* ---------------- Maveli's voice (Web Speech API) ---------------- */

const voice = {
  on: true,
  pick: null,

  init() {
    this.on = store.get("onamquiz.voice") !== "off";
    els.voiceToggle.setAttribute("aria-pressed", String(this.on));
    if (!("speechSynthesis" in window)) {
      els.voiceToggle.hidden = true;
      this.on = false;
      return;
    }
    const choose = () => {
      const vs = speechSynthesis.getVoices();
      this.pick = vs.find((v) => /en[-_]IN/i.test(v.lang))
        || vs.find((v) => /en[-_]GB/i.test(v.lang)) || null;
    };
    choose();
    speechSynthesis.addEventListener("voiceschanged", choose);
  },

  speak(text) {
    if (!this.on || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.04;
      u.pitch = 0.7; /* a king-sized chest */
      u.volume = 0.95;
      if (this.pick) u.voice = this.pick;
      speechSynthesis.speak(u);
    } catch { /* voice is a garnish, never a blocker */ }
  },

  toggle() {
    this.on = !this.on;
    els.voiceToggle.setAttribute("aria-pressed", String(this.on));
    store.set("onamquiz.voice", this.on ? "on" : "off");
    if (!this.on) { try { speechSynthesis.cancel(); } catch {} }
  }
};

els.voiceToggle.addEventListener("click", () => {
  audio.click();
  voice.toggle();
});

/* ---------------- Maveli, the talking king ---------------- */

const maveli = {
  typeTimer: null,
  idleTimer: null,
  idleCount: 0,
  holdUntil: 0,       /* bubble is protected (feedback being read) until this time */
  lastLaugh: 0,
  pokes: [],

  pose(n) {
    els.maveliImg.src = `assets/maveli-${n}.png`;
  },

  enter() {
    els.maveli.classList.remove("hidden-entry");
  },

  say(text, mood = "neutral", { hold = 0 } = {}) {
    text = personalize(text);
    clearInterval(this.typeTimer);
    clearTimeout(this.hideTimer);
    clearTimeout(this.fadeTimer);
    this.holdUntil = hold ? Date.now() + hold : 0;
    els.bubble.hidden = false;
    els.bubble.className = "bubble" + (mood === "happy" ? " mood-happy" : mood === "sad" ? " mood-sad" : "");
    els.maveli.classList.remove("talking");
    void els.maveli.offsetWidth; /* restart pop animation */
    els.maveli.classList.add("talking");

    if (reducedMotion.matches) {
      els.bubbleText.textContent = text;
    } else {
      els.bubbleText.textContent = "";
      let i = 0;
      this.typeTimer = setInterval(() => {
        els.bubbleText.textContent = text.slice(0, ++i);
        if (i >= text.length) clearInterval(this.typeTimer);
      }, 16);
    }

    /* auto-dismiss so the bubble never lingers over the options */
    const typing = reducedMotion.matches ? 0 : text.length * 16;
    const readable = Math.min(12000, 2600 + text.length * 50);
    this.fadeTimer = setTimeout(() => {
      els.bubble.classList.add("fade-out");
      this.hideTimer = setTimeout(() => { els.bubble.hidden = true; }, 500);
    }, typing + readable);

    voice.speak(text);
  },

  react(cls) {
    els.maveli.classList.remove("laughing", "crying", "talking");
    void els.maveli.offsetWidth;
    els.maveli.classList.add(cls);
    setTimeout(() => els.maveli.classList.remove(cls), 1000);
  },

  /* Hover: a jolly belly laugh (never steals a feedback bubble being read) */
  laugh() {
    const now = Date.now();
    if (now - this.lastLaugh < 2500) return;
    this.lastLaugh = now;
    this.react("laughing");
    audio.laugh();
    if (now > this.holdUntil) this.say(pick(LINES.laugh), "happy");
  },

  /* Click/poke: the king is wounded — Talking-Tom style */
  hurt() {
    const now = Date.now();
    this.pokes = this.pokes.filter((t) => now - t < 5000);
    this.pokes.push(now);
    this.react("crying");
    audio.cry();
    const line = this.pokes.length >= 4 ? LINES.guards : pick(LINES.hurt);
    if (this.pokes.length >= 4) this.pokes = [];
    this.say(line, "sad");
  },

  scheduleIdle() {
    this.cancelIdle();
    this.idleCount = 0;
    this.idleTimer = setInterval(() => {
      if (state.answered || !state.started) return this.cancelIdle();
      this.idleCount++;
      this.pose(1);
      this.say(pick(LINES.idle), "neutral");
      if (this.idleCount >= 3) this.cancelIdle();
    }, 13000);
  },

  cancelIdle() {
    clearInterval(this.idleTimer);
    this.idleTimer = null;
  }
};

/* Preload the three poses so swaps are instant */
[1, 2, 3].forEach((n) => { const img = new Image(); img.src = `assets/maveli-${n}.png`; });

/* ---------------- Screens ---------------- */

function showScreen(name) {
  Object.entries(els.screens).forEach(([key, el]) => {
    el.classList.toggle("active", key === name);
  });
  document.body.dataset.screen = name;
  window.scrollTo(0, 0);
}

/* ---------------- Quiz flow ---------------- */

const TOTAL = QUESTIONS.length;

function startQuiz() {
  player.set(els.nameInput.value);
  state.index = 0;
  state.score = 0;
  state.streak = 0;
  state.lifelineUsed = false;
  state.record = [];
  state.started = true;
  state.order = tieredOrder(); /* easy → hard, shuffled within each tier */
  audio.setTrack("main");
  els.scoreLive.textContent = "0";
  els.kalamDay.textContent = "Lay your pookalam";
  buildKalam(els.kalam, 0);
  audio.ensureCtx();
  audio.click();
  if (!audio.musicOn && !audio.userMuted) audio.startMusic();

  const begin = () => { showScreen("quiz"); renderQuestion(); };
  if (!store.get("onamquiz.storyseen")) {
    showStory(begin);
  } else {
    begin();
  }
}

function renderQuestion() {
  const q = QUESTIONS[state.order[state.index]];
  state.answered = false;

  /* progress */
  const humanIndex = state.index + 1;
  const pct = Math.round((state.index / TOTAL) * 100);
  els.progressLabel.textContent = `Question ${humanIndex} of ${TOTAL}`;
  els.progressPct.textContent = pct + "%";
  els.progressFill.style.transform = `scaleX(${pct / 100})`;
  els.progressLamp.style.left = Math.min(Math.max(pct, 1.5), 98.5) + "%";
  els.progressTrack.setAttribute("aria-valuenow", String(state.index));

  /* question + options */
  els.questionText.textContent = q.question;
  els.options.replaceChildren();
  shuffle(q.options).forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.dataset.value = opt;
    btn.innerHTML = `
      <span class="opt-mark">
        <span class="num">${i + 1}</span>
        <svg class="icon-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5 L10 18.5 L20 6"/></svg>
        <svg class="icon-cross" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6 L18 18 M18 6 L6 18"/></svg>
      </span>${opt}`;
    btn.addEventListener("click", () => selectAnswer(btn, q));
    els.options.appendChild(btn);
  });

  els.btnNext.hidden = true;
  els.btnLifeline.hidden = state.lifelineUsed;
  window.scrollTo(0, 0);
  els.questionText.focus({ preventScroll: true });

  /* the last question is the golden Thiruvonam question */
  const golden = state.index === TOTAL - 1;
  document.querySelector(".leaf-stage").classList.toggle("golden", golden);

  if (state.index === 0) {
    maveli.pose(3);
    maveli.say(LINES.begin, "neutral");
  } else if (golden) {
    maveli.pose(2);
    maveli.say(LINES.golden, "happy");
  }
  maveli.scheduleIdle();

  /* streak feeds the lamp flame */
  const scaler = els.progressLamp.querySelector(".flame-scaler");
  if (scaler) scaler.style.transform = `scale(${Math.min(1 + state.streak * 0.09, 1.55)})`;
}

function selectAnswer(btn, q) {
  if (state.answered) return;
  state.answered = true;
  maveli.cancelIdle();

  const chosen = btn.dataset.value;
  const isRight = chosen === q.answer;
  const optionButtons = els.options.querySelectorAll(".option");

  optionButtons.forEach((b) => {
    b.disabled = true;
    if (b.dataset.value === q.answer) b.classList.add("is-correct");
    else if (b === btn) b.classList.add("is-wrong");
    else b.classList.add("dimmed");
  });

  state.record.push(isRight);
  els.btnLifeline.hidden = true;

  if (isRight) {
    state.score++;
    state.streak++;
    els.scoreLive.textContent = String(state.score);
    audio.correct();
    const rect = btn.getBoundingClientRect();
    burstPetals(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
    layKalamRing();
    maveli.pose(2);
    if (state.streak >= 3 && state.streak % 3 === 0) {
      audio.drums();
      maveli.say(`ADIPOLI! ${state.streak} in a row — a Pulikali tiger streak! ${q.explanation}`, "happy", { hold: 8000 });
    } else {
      maveli.say(`${pick(LINES.correct)} ${q.explanation}`, "happy", { hold: 8000 });
    }
  } else {
    state.streak = 0;
    audio.wrong();
    maveli.pose(1);
    maveli.say(`${pick(LINES.wrong)} The answer is ${q.answer}. ${q.explanation}`, "sad", { hold: 8000 });
  }

  els.btnNext.textContent = state.index === TOTAL - 1 ? "See My Blessing" : "Next Question";
  els.btnNext.hidden = false;
  els.btnNext.focus({ preventScroll: true });
}

function nextQuestion() {
  audio.click();
  if (state.index === TOTAL - 1) return showResults();
  state.index++;
  renderQuestion();
}

/* Ask-Maveli lifeline: blows away two wrong options, once per game */
function useLifeline() {
  if (state.lifelineUsed || state.answered) return;
  state.lifelineUsed = true;
  els.btnLifeline.hidden = true;
  const q = QUESTIONS[state.order[state.index]];
  const wrongs = [...els.options.querySelectorAll(".option")]
    .filter((b) => b.dataset.value !== q.answer);
  shuffle(wrongs).slice(0, 2).forEach((b) => {
    b.disabled = true;
    b.classList.add("blown-away");
  });
  audio.drums();
  maveli.pose(3);
  maveli.say(LINES.lifeline, "happy");
}

function showResults() {
  state.started = false;
  maveli.cancelIdle();
  showScreen("results");
  audio.setTrack("finale"); /* the celebration song takes over at the end */

  els.progressFill.style.transform = "scaleX(1)";

  /* odometer count-up on the final score */
  els.finalScore.innerHTML = `You scored <strong><span id="score-odo">0</span> / ${TOTAL}</strong>`;
  const odo = $("score-odo");
  if (reducedMotion.matches || state.score === 0) {
    odo.textContent = String(state.score);
  } else {
    let n = 0;
    const tick = setInterval(() => {
      odo.textContent = String(++n);
      audio.click();
      if (n >= state.score) clearInterval(tick);
    }, 110);
  }

  const ratio = state.score / TOTAL;
  const band = LINES.results.find((b) => ratio >= b.min) || LINES.results[LINES.results.length - 1];
  els.finalMessage.textContent = band.text;

  /* bonus: royal record in localStorage */
  const prev = bestScore();
  const isRecord = prev === null || state.score > prev;
  if (isRecord) store.set(BEST_KEY, String(state.score));
  const shown = isRecord ? state.score : prev;
  els.bestLine.textContent = isRecord && prev !== null
    ? `A new royal record — your best was ${prev} / ${TOTAL}!`
    : `Your royal record: ${shown} / ${TOTAL}`;
  updateBestOnStart();

  buildSadya(state.score);
  state.lastBand = band.text;

  maveli.pose(ratio >= 0.5 ? 2 : 1);
  maveli.say(band.quip, ratio >= 0.5 ? "happy" : "sad");

  audio.fanfare();
  burstPetals(window.innerWidth / 2, window.innerHeight * 0.35, 26);

  /* a perfect score earns the full pooram */
  if (state.score === TOTAL) pooram();
}

function updateBestOnStart() {
  const best = bestScore();
  els.startBest.hidden = best === null;
  if (best !== null) {
    els.startBest.textContent = `Your royal record: ${best} / ${TOTAL}`;
  }
}

function restart() {
  audio.click();
  buildPookalam($("pookalam-hero"), Math.random() * 30);
  startQuiz();
}

/* ---------------- Vamana's Three Steps — skippable legend ---------------- */

const STORY_PANELS = [
  {
    art: `<svg viewBox="0 0 400 220">
      <circle cx="200" cy="70" r="44" fill="#FFD700" opacity="0.9"/>
      <circle cx="200" cy="70" r="58" fill="none" stroke="#FFA500" stroke-width="3" opacity="0.5"/>
      <path d="M120 190 q80 -70 160 0" fill="#2E7D4F" opacity="0.55"/>
      <g stroke="#F6F2E4" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M160 150 v28 M160 150 l-14 18 M160 150 l14 18 M160 136 a7 7 0 1 1 0.1 0"/>
        <path d="M200 142 v34 M200 142 l-16 20 M200 142 l16 20 M200 126 a8 8 0 1 1 0.1 0"/>
        <path d="M242 150 v28 M242 150 l-14 18 M242 150 l14 18 M242 136 a7 7 0 1 1 0.1 0"/>
      </g>`,
    caption: "Long ago, Kerala flourished under King Mahabali. All were equal, all were happy — a golden age."
  },
  {
    art: `<svg viewBox="0 0 400 220">
      <circle cx="110" cy="160" r="46" fill="none" stroke="#D4AF37" stroke-width="4"/>
      <circle cx="200" cy="120" r="72" fill="none" stroke="#FFA500" stroke-width="4" opacity="0.7"/>
      <circle cx="300" cy="80" r="100" fill="none" stroke="#C13A2B" stroke-width="4" opacity="0.5"/>
      <path d="M60 190 q22 -50 44 0 q-22 14 -44 0 Z" fill="#F6F2E4"/>
      <g stroke="#F6F2E4" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M330 60 v34 M330 60 l-13 18 M330 60 l13 18 M330 45 a7 7 0 1 1 0.1 0"/>
        <path d="M316 40 q14 -18 30 -2" opacity="0.8"/>
      </g>`,
    caption: "The gods sent little Vamana, who covered the three worlds in three steps — and Maveli offered his own head for the last."
  },
  {
    art: `<svg viewBox="0 0 400 220">
      <path d="M0 200 h400" stroke="#D4AF37" stroke-width="4"/>
      <path d="M130 60 a70 70 0 0 1 140 0 Z" fill="#8A5A2B" stroke="#5E3A18" stroke-width="3"/>
      <line x1="200" y1="60" x2="200" y2="130" stroke="#5E3A18" stroke-width="5"/>
      <g stroke="#FFD700" stroke-width="6" stroke-linecap="round" fill="none">
        <path d="M200 130 v46 M200 176 l-18 24 M200 176 l18 24 M200 112 a9 9 0 1 1 0.1 0"/>
      </g>
      <circle cx="90" cy="55" r="4" fill="#FFD700"/><circle cx="320" cy="45" r="4" fill="#FFA500"/>
      <circle cx="60" cy="110" r="3" fill="#F6F2E4"/><circle cx="345" cy="100" r="3" fill="#F6F2E4"/>`,
    caption: "Moved by his devotion, Vamana granted one wish: every Chingam, Maveli returns to his people. That homecoming is Onam."
  }
];

function showStory(done) {
  const overlay = els.story;
  let idx = 0, timer = null;
  overlay.hidden = false;

  const finish = () => {
    clearTimeout(timer);
    overlay.hidden = true;
    overlay.replaceChildren();
    store.set("onamquiz.storyseen", "yes");
    done();
  };

  const render = () => {
    if (idx >= STORY_PANELS.length) return finish();
    const p = STORY_PANELS[idx];
    overlay.replaceChildren();
    const panel = document.createElement("div");
    panel.className = "story-panel";
    panel.innerHTML = `
      <div class="story-art">${p.art}</svg></div>
      <p class="story-caption">${p.caption}</p>
      <div class="story-dots">${STORY_PANELS.map((_, i) =>
        `<span class="${i === idx ? "on" : ""}"></span>`).join("")}</div>
      <button type="button" class="story-skip">Skip the legend</button>`;
    overlay.appendChild(panel);
    panel.querySelector(".story-skip").addEventListener("click", (e) => { e.stopPropagation(); finish(); });
    voice.speak(p.caption);
    timer = setTimeout(() => { idx++; render(); }, reducedMotion.matches ? 3500 : 6000);
  };

  overlay.addEventListener("click", () => { clearTimeout(timer); idx++; render(); });
  render();
}

/* ---------------- Pooram finale: fireworks for a perfect score ---------------- */

function pooram() {
  if (reducedMotion.matches) return;
  const cv = els.pooram;
  cv.hidden = false;
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
  const c = cv.getContext("2d");
  const COLORS = ["#FFD700", "#FFA500", "#C13A2B", "#F9F6EE", "#7FE0A8"];
  let sparks = [];
  const boom = (x, y) => {
    for (let i = 0; i < 60; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 2 + Math.random() * 5;
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: 60 + Math.random() * 30, color: COLORS[i % COLORS.length], r: 1.5 + Math.random() * 2 });
    }
  };
  const start = performance.now();
  let nextBoom = 0;
  const frame = (t) => {
    const elapsed = t - start;
    c.clearRect(0, 0, cv.width, cv.height);
    if (elapsed > nextBoom && elapsed < 5200) {
      boom(cv.width * (0.15 + Math.random() * 0.7), cv.height * (0.12 + Math.random() * 0.35));
      nextBoom = elapsed + 420 + Math.random() * 380;
    }
    sparks.forEach((s) => {
      s.x += s.vx; s.y += s.vy; s.vy += 0.045; s.life--;
      c.globalAlpha = Math.max(s.life / 90, 0);
      c.fillStyle = s.color;
      c.beginPath(); c.arc(s.x, s.y, s.r, 0, Math.PI * 2); c.fill();
    });
    c.globalAlpha = 1;
    sparks = sparks.filter((s) => s.life > 0);
    if (elapsed < 6500 || sparks.length) {
      requestAnimationFrame(frame);
    } else {
      cv.hidden = true;
    }
  };
  requestAnimationFrame(frame);
  document.body.classList.add("parade");
  setTimeout(() => document.body.classList.remove("parade"), 7000);
  audio.drums();
  setTimeout(() => audio.drums(), 900);
}

/* ---------------- Wordle-style share ---------------- */

function shareScore() {
  audio.click();
  const flowers = state.record.map((ok) => (ok ? "🌼" : "🥀")).join("");
  const nm = player.name ? `${player.name} scored` : "I scored";
  const text = `🪔 ${nm} ${state.score}/${TOTAL} in The Great Onam Quiz!\n${flowers}\nOnam Ashamsakal! 🌸`;
  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch { /* best effort */ }
    ta.remove();
    maveli.say(LINES.copied, "happy");
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => maveli.say(LINES.copied, "happy"))
      .catch(fallback);
  } else {
    fallback();
  }
}

/* ---------------- Parallax festival depth ---------------- */

(() => {
  if (reducedMotion.matches) return;
  let raf = null;
  window.addEventListener("pointermove", (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const dx = (e.clientX / window.innerWidth - 0.5);
      const dy = (e.clientY / window.innerHeight - 0.5);
      document.documentElement.style.setProperty("--par-x", dx.toFixed(3));
      document.documentElement.style.setProperty("--par-y", dy.toFixed(3));
      raf = null;
    });
  }, { passive: true });
})();

/* ---------------- Option tilt (juice) ---------------- */

els.options.addEventListener("pointermove", (e) => {
  if (reducedMotion.matches) return;
  const btn = e.target.closest(".option");
  if (!btn || btn.disabled) return;
  const r = btn.getBoundingClientRect();
  const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
  const ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
  btn.style.transform = `perspective(620px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`;
});
els.options.addEventListener("pointerout", (e) => {
  const btn = e.target.closest(".option");
  if (btn) btn.style.transform = "";
});

/* ---------------- Blessing card (canvas download) ---------------- */

function drawKalamOnCanvas(ctx2d, cx, cy, scale, count) {
  const shown = Math.min(count, 10);
  ctx2d.save();
  ctx2d.translate(cx, cy);
  ctx2d.scale(scale, scale);
  ctx2d.beginPath();
  ctx2d.arc(0, 0, 195, 0, Math.PI * 2);
  ctx2d.fillStyle = "rgba(37,107,69,0.15)";
  ctx2d.fill();
  for (let i = 0; i < shown; i++) {
    const r = 30 + i * 17.2;
    const petals = 8 + i * 3;
    const len = 15 + i * 2.1;
    const wid = 9 + i * 1.3;
    const col = KALAM_COLORS[i % KALAM_COLORS.length];
    for (let p = 0; p < petals; p++) {
      const angle = ((360 / petals) * p + i * 9) * Math.PI / 180;
      ctx2d.save();
      ctx2d.rotate(angle);
      ctx2d.translate(0, -r);
      ctx2d.beginPath();
      ctx2d.moveTo(0, 0);
      ctx2d.bezierCurveTo(wid / 2, -len * 0.35, wid / 2, -len * 0.75, 0, -len);
      ctx2d.bezierCurveTo(-wid / 2, -len * 0.75, -wid / 2, -len * 0.35, 0, 0);
      ctx2d.fillStyle = col.fill;
      ctx2d.fill();
      ctx2d.lineWidth = 1.2;
      ctx2d.strokeStyle = col.stroke;
      ctx2d.stroke();
      ctx2d.restore();
    }
  }
  ctx2d.beginPath();
  ctx2d.arc(0, 0, 14, 0, Math.PI * 2);
  ctx2d.fillStyle = "#D4AF37";
  ctx2d.fill();
  ctx2d.restore();
}

function downloadBlessingCard() {
  audio.click();
  const W = 1080, H = 1350;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d");

  /* kasavu ground with warm glow */
  c.fillStyle = "#F9F6EE";
  c.fillRect(0, 0, W, H);
  const glow = c.createRadialGradient(W / 2, 430, 60, W / 2, 430, 620);
  glow.addColorStop(0, "rgba(255,215,0,0.18)");
  glow.addColorStop(1, "rgba(255,215,0,0)");
  c.fillStyle = glow;
  c.fillRect(0, 0, W, H);

  /* zari bands */
  const band = (y) => {
    for (let x = 0; x < W; x += 24) {
      const g = c.createLinearGradient(x, 0, x + 24, 0);
      g.addColorStop(0, "#A8801C"); g.addColorStop(0.35, "#D4AF37");
      g.addColorStop(0.5, "#FFD700"); g.addColorStop(0.75, "#D4AF37");
      g.addColorStop(1, "#A8801C");
      c.fillStyle = g;
      c.fillRect(x, y, 24, 34);
    }
    c.fillStyle = "#C13A2B";
    c.fillRect(0, y === 0 ? 34 : y - 5, W, 5);
  };
  band(0);
  band(H - 34);

  drawKalamOnCanvas(c, W / 2, 430, 1.55, Math.max(state.score, 3));

  c.textAlign = "center";
  c.fillStyle = "#C13A2B";
  c.font = "64px 'Malayalam MN', 'Noto Sans Malayalam', serif";
  c.fillText("ഓണാശംസകള്‍", W / 2, 830);

  c.fillStyle = "#1B4332";
  c.font = "72px Palatino, Georgia, serif";
  c.fillText("Onam Ashamsakal!", W / 2, 925);

  c.fillStyle = "#7D5E10";
  c.font = "bold 56px 'Avenir Next', 'Segoe UI', sans-serif";
  const who = player.name || "I";
  c.fillText(`${who} scored ${state.score} / ${TOTAL} in Maveli's quiz`, W / 2, 1030);

  /* wrap the blessing message */
  c.fillStyle = "#26312A";
  c.font = "38px 'Avenir Next', 'Segoe UI', sans-serif";
  const words = (state.lastBand || "").split(" ");
  let line = "", y = 1115;
  words.forEach((w) => {
    if (c.measureText(line + " " + w).width > 880) {
      c.fillText(line.trim(), W / 2, y);
      line = w; y += 52;
    } else {
      line += " " + w;
    }
  });
  if (line.trim()) c.fillText(line.trim(), W / 2, y);

  c.fillStyle = "#A8801C";
  c.font = "30px Palatino, Georgia, serif";
  c.fillText("The Great Onam Quiz · Maveli's Challenge", W / 2, H - 70);

  try {
    cv.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "onam-blessing-card.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, "image/png");
  } catch { /* canvas blocked — no card, no crash */ }
}

/* ---------------- Keyboard support ---------------- */

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

document.addEventListener("keydown", (e) => {
  if ((e.key === "f" || e.key === "F") && !e.metaKey && !e.ctrlKey && !e.altKey) {
    return toggleFullscreen();
  }
  if (!els.screens.quiz.classList.contains("active")) return;
  if (!state.answered && e.key >= "1" && e.key <= "4") {
    const btn = els.options.querySelectorAll(".option")[Number(e.key) - 1];
    if (btn) btn.click();
  }
});

/* ---------------- Wire up ---------------- */

els.btnStart.addEventListener("click", startQuiz);
els.btnNext.addEventListener("click", nextQuestion);
els.btnRestart.addEventListener("click", restart);
els.btnCard.addEventListener("click", downloadBlessingCard);
els.btnShare.addEventListener("click", shareScore);
els.btnLifeline.addEventListener("click", useLifeline);
els.nameInput.value = player.name;
els.nameInput.addEventListener("keydown", (e) => e.stopPropagation());

/* Talking-Tom interactions: hover = laugh, poke = cry */
els.maveli.addEventListener("pointerenter", (e) => {
  if (e.pointerType === "mouse") maveli.laugh();
});
els.maveli.addEventListener("click", () => maveli.hurt());

/* ---------------- Festive theme switcher (day / Thiruvonam night) ---------------- */

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  els.themeToggle.setAttribute("aria-checked", String(theme === "night"));
  store.set(THEME_KEY, theme);
}

els.themeToggle.addEventListener("click", () => {
  audio.click();
  applyTheme(document.body.dataset.theme === "night" ? "day" : "night");
});

applyTheme(store.get(THEME_KEY) === "night" ? "night" : "day");

voice.init();
buildPookalam($("pookalam-hero"));
buildKalam(els.kalam, 0);
els.kalamDay.textContent = "Lay your pookalam";
updateBestOnStart();

/* Maveli descends from the sky under his umbrella, then greets */
setTimeout(() => {
  maveli.enter();
  els.maveli.classList.add("descend");
  maveli.pose(3);
  const wait = reducedMotion.matches ? 100 : 2450;
  setTimeout(() => maveli.say(LINES.greeting, "neutral"), wait);
}, 500);

/* PWA: offline-capable install. Skipped on localhost so the dev server
   (with its module-transformed responses) never gets cached. */
const IS_DEV = /^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname);
if ("serviceWorker" in navigator && !IS_DEV) {
  try {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  } catch { /* sandboxed contexts */ }
} else if ("serviceWorker" in navigator && IS_DEV) {
  /* clean up any previously registered dev worker + its caches */
  navigator.serviceWorker.getRegistrations()
    .then((rs) => rs.forEach((r) => r.unregister()))
    .catch(() => {});
  if (window.caches) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
  }
}
