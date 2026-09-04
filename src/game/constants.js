/**
 * NOODLES — shared configuration.
 * Everything a host might reasonably want to tweak without touching logic
 * lives in this file.
 */

export const STORAGE_KEY = 'noodles.session.v1'
export const CLOCK_KEY = 'noodles.clock.v1'
export const TOTAL_ROUNDS = 10

/** Rounds are numbered 1..10 and displayed as-is. */
export const displayRoundNumber = (roundNumber) => roundNumber

/* ------------------------------------------------------------------ *
 * SESSION — the talk this game is built around. Shown on the feed's
 * status bar, the panel brand and the end-of-session card.
 * ------------------------------------------------------------------ */
export const SESSION = {
  title: 'From Scroll to Soul',
  subtitle: 'How Digital Evolution Shaped Generations',
  feedName: 'For You',
}

/* ------------------------------------------------------------------ *
 * ROUND MODES
 *   students  — the algorithm scrolls the feed and picks one student.
 *   guest     — for the invited guest speaker; no scroll. If no guest is
 *               in the room the host can hand it to the algorithm instead.
 *   volunteer — anyone may answer; host taps whoever spoke up. Same
 *               algorithm fallback if nobody raises a hand.
 * ------------------------------------------------------------------ */
export const MODES = ['students', 'guest', 'volunteer']

export const MODE_LABEL = {
  students: 'Students',
  guest: 'Guest',
  volunteer: 'Volunteer',
}

/** Copy the room reads on the feed, per mode. */
export const MODE_COPY = {
  students: { hud: 'STUDENTS — THE ALGORITHM PICKS ONE', card: 'Student question' },
  guest: { hud: 'GUEST — OVER TO OUR SPEAKER', card: 'Guest question' },
  volunteer: { hud: 'VOLUNTEER — RAISE YOUR HAND', card: 'Volunteer question' },
}

/** How long a selected student has to answer before they are logged out. */
export const ANSWER_SECONDS = 120

/* ------------------------------------------------------------------ *
 * SELECTION timeline (milliseconds from the Select button press).
 *
 * The supplied sting is 4.97s long and its dramatic impact peaks at
 * 1.18s. We therefore schedule the clip LATE so the peak collides with
 * the lock-in frame, and cover the earlier scrolling with a synthesised
 * modem-style riser. See game/audio.js.
 *
 * Nobody is logged out here — the pick only starts the clock.
 * ------------------------------------------------------------------ */
export const TIMING = {
  spin: 4200, // the feed scroll decelerates into the lock-in at this mark
  audioPeakOffset: 1180, // measured offset of the sting's impact
  alarm: 4200, // notification pulse begins
  banner: 4380, // "THE ALGORITHM CHOSE" banner slams in
  alarmOff: 5700,
  audioFade: 5450, // begin fading the sting out
  audioFadeDur: 600,
  settle: 6000, // question appears after the pick has landed
}

/** Reduced-motion runs the same beats, just compressed. */
export const TIMING_REDUCED = {
  spin: 900,
  audioPeakOffset: 1180,
  alarm: 900,
  banner: 950,
  alarmOff: 1600,
  audioFade: 1500,
  audioFadeDur: 400,
  settle: 1800,
}

/* ------------------------------------------------------------------ *
 * LOGOUT timeline (milliseconds from the moment the timer hits zero).
 * The card loses signal, greys out and is swiped off the feed for good.
 * ------------------------------------------------------------------ */
export const EJECT = {
  alarm: 0, // red "signal lost" pulse
  launch: 700, // card swipes away
  audioPeakOffset: 1180, // sting peak lands on the swipe frame
  gone: 2600, // off the feed — logged out for the session
  audioFade: 3000,
  audioFadeDur: 700,
  settle: 3400,
}

export const EJECT_REDUCED = {
  alarm: 0,
  launch: 250,
  audioPeakOffset: 1180,
  gone: 900,
  audioFade: 1100,
  audioFadeDur: 400,
  settle: 1300,
}

/* ------------------------------------------------------------------ *
 * The era dock under the feed — the generational arc both talks trace,
 * from scheduled and physical to instant and always-on.
 * ------------------------------------------------------------------ */
/* Half life, half tech — the talk's own balance. */
export const ERAS = [
  { year: 'Then', label: 'Letters, landlines & neighbours', icon: 'letter' },
  { year: '90s', label: 'Radio & TV evenings, street games', icon: 'radio' },
  { year: '00s', label: 'SMS, cyber cafés, first phones', icon: 'phone' },
  { year: '10s', label: 'Smartphones, social & selfies', icon: 'mobile' },
  { year: 'Now', label: 'Always-on, short-form & AI', icon: 'ai' },
]

/* ------------------------------------------------------------------ *
 * Original crew palette — vivid suit colours with a matching dark shade
 * used for the underside of each pod so the characters read as 3D.
 * ------------------------------------------------------------------ */
export const CREW_COLORS = [
  { id: 'tangerine', base: '#ff8a3d', dark: '#c9541a', name: 'Tangerine' },
  { id: 'lagoon', base: '#3ddbd0', dark: '#17948f', name: 'Lagoon' },
  { id: 'bubblegum', base: '#ff6fae', dark: '#c9337a', name: 'Bubblegum' },
  { id: 'lime', base: '#a8e05f', dark: '#5f9426', name: 'Lime' },
  { id: 'cobalt', base: '#5c8bff', dark: '#2c4fc4', name: 'Cobalt' },
  { id: 'saffron', base: '#ffd23d', dark: '#c99a10', name: 'Saffron' },
  { id: 'orchid', base: '#b478ff', dark: '#7538c9', name: 'Orchid' },
  { id: 'coral', base: '#ff5f5f', dark: '#c22b2b', name: 'Coral' },
  { id: 'mint', base: '#7dffb0', dark: '#2fa966', name: 'Mint' },
  { id: 'copper', base: '#d98b5f', dark: '#96522c', name: 'Copper' },
  { id: 'ice', base: '#bfe6ff', dark: '#6ba3c9', name: 'Ice' },
  { id: 'plum', base: '#8b6bd9', dark: '#503a94', name: 'Plum' },
  { id: 'sand', base: '#e8d5a3', dark: '#a89253', name: 'Sand' },
  { id: 'jade', base: '#3fbf8f', dark: '#1c7d5b', name: 'Jade' },
  { id: 'rose', base: '#ff9db5', dark: '#c95a78', name: 'Rose' },
  { id: 'slate', base: '#93a4c4', dark: '#525f7a', name: 'Slate' },
]

export const colorFor = (index) => CREW_COLORS[index % CREW_COLORS.length]

/* Fictional placeholder roster. Real class lists never go into the public
   repo: a gitignored roster.local.txt next to vite.config.js is baked into a
   LOCAL build instead (see vite.config.js), and overrides this list there. */
const FICTIONAL_STUDENTS = [
  'Aarav', 'Abinaya', 'Adhvik', 'Akilan', 'Amudha', 'Anitha Sri',
  'Balaji', 'Bhuvana', 'Chandran', 'Deepan', 'Devika', 'Dhanush',
  'Elakkiya', 'Ezhil', 'Gautham', 'Gowri Shree', 'Hariharan', 'Ilamathi',
  'Inba', 'Jeevitha', 'Kalyani', 'Kamalesh', 'Kaviya', 'Kumaran',
  'Lavanya', 'Madhavan', 'Malar', 'Mithran', 'Mohana Sri', 'Nandhini',
  'Nithesh', 'Oviya', 'Pandiyan', 'Poorani', 'Pranav', 'Ragavi',
  'Rajesh', 'Sabari', 'Selvi', 'Senthil', 'Thamizh', 'Uma Bharathi',
  'Vasanth', 'Vennila', 'Yuvan',
]

// eslint-disable-next-line no-undef
const LOCAL_ROSTER = typeof __LOCAL_ROSTER__ !== 'undefined' ? __LOCAL_ROSTER__ : []

export const SAMPLE_STUDENTS = LOCAL_ROSTER.length ? LOCAL_ROSTER : FICTIONAL_STUDENTS

/** True when this build carries a real class list rather than the sample. */
export const HAS_LOCAL_ROSTER = LOCAL_ROSTER.length > 0

/* The session's ten prompts, each with the audience it is addressed to.
   Every field is editable in the Questions tab; this is only the starting
   deck. */
export const SAMPLE_QUESTIONS = [
  { mode: 'students', text: 'One thing the internet taught you outside the classroom.' },
  { mode: 'guest', text: 'A workplace habit that technology has completely changed for you.' },
  { mode: 'students', text: 'Are we creating memories or just recording them?' },
  { mode: 'guest', text: 'Has technology made work easier, or has it increased the expectation to do more and stay available beyond working hours?' },
  { mode: 'students', text: 'Has scrolling ever changed your mood? If yes, share a recent example.' },
  { mode: 'volunteer', text: 'What would you miss the most if you had no phone for one day?' },
  { mode: 'students', text: 'Has instant access to information made us more curious or less patient?' },
  { mode: 'students', text: 'What is one old-school habit our generation should bring back? Why?' },
  { mode: 'students', text: 'What is one human quality that AI should never replace? Why?' },
  { mode: 'students', text: 'Think about your online feed. How has it influenced what you watch, buy or believe?' },
]
