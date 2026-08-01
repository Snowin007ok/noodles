/**
 * NOODLES — shared configuration.
 * Everything a teacher might reasonably want to tweak without touching logic
 * lives in this file.
 */

export const STORAGE_KEY = 'noodles.session.v1'
export const TOTAL_ROUNDS = 10

/**
 * Volunteer (open) rounds — anyone may answer, no spin.
 * Every other round draws one crew member at random.
 * Edit this set to re-balance the lesson.
 */
export const OPEN_ROUNDS = new Set([2, 4, 7, 9, 10])

export const isOpenRound = (roundNumber) => OPEN_ROUNDS.has(roundNumber)

/** How long a caught crew member has to answer before the airlock cycles. */
export const ANSWER_SECONDS = 120

/* ------------------------------------------------------------------ *
 * SELECTION timeline (milliseconds from the Spin button press).
 *
 * The supplied sting is 4.97s long and its dramatic impact peaks at
 * 1.18s. We therefore schedule the clip LATE so the peak collides with
 * the lock-in frame, and cover the earlier cycling with a synthesised
 * riser. See game/audio.js.
 *
 * Nobody is ejected here — the catch only starts the clock.
 * ------------------------------------------------------------------ */
export const TIMING = {
  spin: 2800, // name-cycling duration → lock-in happens at this mark
  audioPeakOffset: 1180, // measured offset of the sting's impact
  alarm: 2800, // red strobe begins
  banner: 2900, // "CHALLENGER CAUGHT" slams in
  alarmOff: 4400,
  audioFade: 4200, // begin fading the sting out
  audioFadeDur: 600,
  settle: 4600, // question appears and the 2:00 countdown starts
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
 * EJECTION timeline (milliseconds from the moment the timer hits zero).
 * This is where the airlock actually opens and the crew member goes.
 * ------------------------------------------------------------------ */
export const EJECT = {
  alarm: 0, // strobe + airlock doors part
  launch: 700, // pulled toward the open airlock
  audioPeakOffset: 1180, // sting peak lands on the launch frame
  gone: 2600, // cleared the hull — off the craft for good, doors close
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
 * Original crew palette — vivid hull colours with a matching dark shade
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

export const SAMPLE_STUDENTS = [
  'Aarav', 'Priya', 'Rohan', 'Meera', 'Kabir', 'Ananya',
  'Vikram', 'Diya', 'Arjun', 'Ishita', 'Nikhil', 'Saanvi',
  'Rahul', 'Tara', 'Aditya', 'Nisha',
]

/* Rounds 2, 4, 7, 9 and 10 are volunteer rounds — those prompts are written
   open-ended so anyone can jump in. */
export const SAMPLE_QUESTIONS = [
  'What is the largest planet in our solar system, and what is it mostly made of?',
  'VOLUNTEER: Who can name three states of matter and give an everyday example of each?',
  'What does the water cycle do with the water in a puddle after it rains?',
  'VOLUNTEER: Can anyone explain why we see lightning before we hear thunder?',
  'What is the difference between a herbivore, a carnivore, and an omnivore?',
  'If a spacecraft is in orbit, why do the crew inside appear to float?',
  'VOLUNTEER: Who wants to tell us what gas plants take in during photosynthesis — and what they give out?',
  'Explain in your own words what gravity does.',
  'VOLUNTEER: Describe one thing you learned today that surprised you.',
  'VOLUNTEER: If our class could run one experiment aboard a space station, what would it be and why?',
]
