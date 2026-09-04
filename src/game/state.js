/**
 * Session state: one reducer, persisted to localStorage on every change.
 *
 * Phases:
 *   'lobby'    — feed idle; host may let the algorithm pick, tap a volunteer,
 *                or hand a guest question to the guest
 *   'spinning' — the algorithm is scrolling the feed, audio scheduled
 *   'caught'   — "THE ALGORITHM CHOSE" banner up
 *   'question' — question on screen, 2:00 countdown available
 *   'ejecting' — the clock ran out on a student; they are being logged out
 *
 * Round mode (from the question): 'students' | 'guest' | 'volunteer'
 * Round status: 'pending' | 'answered' | 'ejected' | 'timeup'
 *   'ejected' — a student was on the clock and got logged out
 *   'timeup'  — the clock ran out with nobody to log out (guest round, or a
 *               volunteer round where nobody had been tapped)
 */

import {
  STORAGE_KEY,
  TOTAL_ROUNDS,
  MODES,
  SAMPLE_STUDENTS,
  SAMPLE_QUESTIONS,
  colorFor,
} from './constants'
import { buildPool, reconcilePool } from './shuffle'

let idSeq = 0
const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${(idSeq++).toString(36)}`

/** What to show when a name field has been emptied. */
export const displayName = (s) => (s?.name?.trim() ? s.name.trim() : 'Unnamed student')

const normalizeMode = (mode, legacyOpen) => {
  if (MODES.includes(mode)) return mode
  // Sessions saved before modes existed carried a boolean `open` flag.
  return legacyOpen ? 'volunteer' : 'students'
}

export function makeStudent(name, index) {
  const c = colorFor(index)
  return {
    id: uid('stu'),
    name: name.trim(),
    colorId: c.id,
    participated: false,
    timesSelected: 0,
    // Logged-out students are off the feed for good: their card is gone and
    // they are no longer in the selection pool. Still listed under Status.
    ejected: false,
  }
}

function makeQuestions() {
  return SAMPLE_QUESTIONS.map((q, i) => ({
    id: `q${i + 1}`,
    number: i + 1,
    text: q.text,
    mode: q.mode,
  }))
}

function makeRounds() {
  return Array.from({ length: TOTAL_ROUNDS }, (_, i) => ({
    number: i + 1,
    status: 'pending',
    selectedId: null, // who the algorithm picked
    answeredById: null, // which student actually answered (volunteer / picked)
    guestAnswered: false, // guest rounds: the guest took it
    revealed: false,
  }))
}

export function initialState() {
  const students = SAMPLE_STUDENTS.map(makeStudent)
  return {
    version: 1,
    students,
    questions: makeQuestions(),
    rounds: makeRounds(),
    currentRound: 1,
    pool: buildPool(students.map((s) => s.id)),
    lastDrawn: null,
    phase: 'lobby',
    spotlightId: null, // name currently lit by the scrolling algorithm (audio ticks)
    spinTarget: null, // where the reel will stop — decided at spin start, revealed at lock-in
    caughtId: null, // student locked in for this round
    audio: { enabled: true, volume: 0.8 },
    reducedMotion: false,
    // 'default' while the roster is still the build's own list (sample or the
    // baked-in class list); 'custom' the moment the host edits it. Lets a
    // rebuilt class list replace an untouched saved one — see load().
    rosterSource: 'default',
    showNames: true,
    // How many cards are on the feed at once. The roster and the pool are
    // unaffected — a class of 45 still draws from all 45; the feed just shows
    // a tidy wall instead of 45 shrunken cards. 0 = show everyone.
    displayCap: 16,
  }
}

/** The mode of a round comes from its question, so editing the question's
 *  mode re-labels the round instantly. */
export const modeOf = (state, roundNumber) =>
  state.questions[roundNumber - 1]?.mode ?? 'students'

/* ------------------------------------------------------------------ */

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const saved = JSON.parse(raw)
    if (saved.version !== 1 || !Array.isArray(saved.students)) return initialState()

    const base = initialState()

    /* A session saved by an older build can carry a missing or malformed
       numeric field, which reaches an <input value> as NaN and breaks the
       control. Coerce anything numeric back to a sane value rather than
       trusting whatever is in storage. */
    const num = (v, fallback, min, max) =>
      typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback

    /* Questions: keep the host's edited text and mode; fill anything missing
       from the sample deck. The previous build shipped 8 questions — the two
       new slots pick up the sample prompts. */
    const questions = makeQuestions().map((q, i) => {
      const savedQ = Array.isArray(saved.questions) ? saved.questions[i] : null
      return {
        ...q,
        text: typeof savedQ?.text === 'string' ? savedQ.text : q.text,
        mode: savedQ ? normalizeMode(savedQ.mode, savedQ.open) : q.mode,
      }
    })

    /* Self-heal: a saved session with ZERO students has nothing worth
       restoring — it just strands the next visitor on an empty feed with an
       un-runnable game. Keep what the host may genuinely have edited
       (questions, audio, display settings) and bring the sample crew back. */
    if (saved.students.length === 0) {
      return {
        ...base,
        questions,
        audio: saved.audio ?? base.audio,
        reducedMotion: saved.reducedMotion ?? base.reducedMotion,
        showNames: saved.showNames ?? base.showNames,
        displayCap: saved.displayCap ?? base.displayCap,
      }
    }

    // Never restore mid-animation — a refresh should land in a stable lobby.
    const phase = saved.phase === 'spinning' ? 'lobby' : saved.phase
    const merged = { ...base, ...saved, phase, spotlightId: null, spinTarget: null, questions }

    merged.displayCap = num(merged.displayCap, base.displayCap, 0, 500)
    merged.currentRound = num(merged.currentRound, 1, 1, TOTAL_ROUNDS)
    merged.showNames = typeof merged.showNames === 'boolean' ? merged.showNames : true
    merged.audio = {
      enabled: typeof merged.audio?.enabled === 'boolean' ? merged.audio.enabled : true,
      volume: num(merged.audio?.volume, 0.8, 0, 1),
    }
    merged.students = (Array.isArray(merged.students) ? merged.students : []).map((s) => ({
      ...s,
      points: undefined,
      timesSelected: num(s?.timesSelected, 0, 0, 1e6),
      participated: Boolean(s?.participated),
      ejected: Boolean(s?.ejected),
    }))
    merged.rounds = makeRounds().map((baseRound) => {
      const savedRound = Array.isArray(saved.rounds)
        ? saved.rounds.find((r) => r.number === baseRound.number)
        : null
      const status = ['pending', 'answered', 'ejected', 'timeup'].includes(savedRound?.status)
        ? savedRound.status
        : 'pending'
      return {
        ...baseRound,
        status,
        selectedId: savedRound?.selectedId ?? null,
        answeredById: savedRound?.answeredById ?? null,
        guestAnswered: Boolean(savedRound?.guestAnswered),
        revealed: Boolean(savedRound?.revealed),
      }
    })
    merged.pool = Array.isArray(merged.pool) ? merged.pool : []

    /* The class list changed in the build (roster.local.txt edited, rebuilt)
       but this browser still holds the OLD default list from before. If the
       host never edited the roster by hand and no round has started, adopt the
       new list silently — a name fix in the file should never need a manual
       reset in every browser. Anything the host touched is left alone. */
    const untouched = merged.rosterSource !== 'custom'
    const nothingStarted = merged.rounds.every((r) => r.status === 'pending' && !r.revealed)
    const savedNames = merged.students.map((s) => s.name)
    const differs =
      savedNames.length !== SAMPLE_STUDENTS.length ||
      savedNames.some((name, i) => name !== SAMPLE_STUDENTS[i])
    if (untouched && nothingStarted && differs) {
      const students = SAMPLE_STUDENTS.map(makeStudent)
      merged.students = students
      merged.pool = buildPool(students.map((s) => s.id))
      merged.lastDrawn = null
      merged.caughtId = null
      merged.rosterSource = 'default'
    }

    return merged
  } catch {
    return initialState()
  }
}

export function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* private browsing / quota — the game still works, it just won't persist */
  }
}

/* ------------------------------------------------------------------ */

const patchRound = (state, number, patch) => ({
  ...state,
  rounds: state.rounds.map((r) => (r.number === number ? { ...r, ...patch } : r)),
})

const patchStudent = (state, id, fn) => ({
  ...state,
  students: state.students.map((s) => (s.id === id ? { ...s, ...fn(s) } : s)),
})

/** Ids of everyone still on the feed — the only people who can be drawn. */
const aboard = (students) => students.filter((s) => !s.ejected).map((s) => s.id)

export function reducer(state, action) {
  switch (action.type) {
    /* ---------- roster ---------- */
    case 'student/add': {
      const name = action.name.trim()
      if (!name) return state
      const student = makeStudent(name, state.students.length)
      const students = [...state.students, student]
      return {
        ...state,
        rosterSource: 'custom',
        students,
        pool: reconcilePool(
          state.pool,
          aboard(students),
          students.filter((s) => s.participated).map((s) => s.id),
        ),
      }
    }

    /**
     * Replace the whole roster from pasted text, one name per line.
     * Existing students keep their colour, participation and history if their
     * name is unchanged — so a mid-session paste to fix a typo is non-destructive.
     */
    case 'student/bulkSet': {
      const names = action.text
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 200)
      if (names.length === 0) return state

      const byName = new Map(state.students.map((s) => [s.name.toLowerCase(), s]))
      // A class list can legitimately contain two "Aarav"s. Each line must
      // become its own student — reusing a matched record twice would mint two
      // entries sharing one id, which corrupts the pool and collides React keys.
      const claimed = new Set()
      const students = names.map((name, i) => {
        const key = name.toLowerCase()
        const existing = byName.get(key)
        if (existing && !claimed.has(existing.id)) {
          claimed.add(existing.id)
          return { ...existing, name }
        }
        return makeStudent(name, i)
      })
      const ids = students.map((s) => s.id)
      return {
        ...state,
        rosterSource: 'custom',
        students,
        pool: reconcilePool(
          state.pool.filter((id) => ids.includes(id)),
          aboard(students),
          students.filter((s) => s.participated).map((s) => s.id),
        ),
        rounds: state.rounds.map((r) => ({
          ...r,
          selectedId: ids.includes(r.selectedId) ? r.selectedId : null,
          answeredById: ids.includes(r.answeredById) ? r.answeredById : null,
        })),
        caughtId: ids.includes(state.caughtId) ? state.caughtId : null,
        spotlightId: null,
      }
    }

    /** Keeps the raw text so the field stays editable mid-typing; a name that
     *  is blank when it matters falls back to a placeholder at render time. */
    case 'student/rename':
      return {
        ...patchStudent(state, action.id, () => ({ name: action.name.slice(0, 40) })),
        rosterSource: 'custom',
      }

    case 'student/color':
      return patchStudent(state, action.id, () => ({ colorId: action.colorId }))

    case 'student/remove': {
      const students = state.students.filter((s) => s.id !== action.id)
      const ids = students.map((s) => s.id)
      return {
        ...state,
        rosterSource: 'custom',
        students,
        pool: state.pool.filter((id) => ids.includes(id)),
        caughtId: state.caughtId === action.id ? null : state.caughtId,
        spotlightId: null,
        rounds: state.rounds.map((r) => ({
          ...r,
          selectedId: r.selectedId === action.id ? null : r.selectedId,
          answeredById: r.answeredById === action.id ? null : r.answeredById,
        })),
      }
    }

    /** Refill an emptied roster with the sample crew — the on-screen escape
     *  hatch from an empty feed. Questions and settings are untouched. */
    case 'roster/loadSample': {
      const students = SAMPLE_STUDENTS.map(makeStudent)
      return {
        ...state,
        rosterSource: 'default',
        students,
        pool: buildPool(students.map((s) => s.id)),
        lastDrawn: null,
        caughtId: null,
        spotlightId: null,
        phase: 'lobby',
      }
    }

    case 'student/participated':
      return patchStudent(state, action.id, () => ({ participated: true }))

    /* ---------- questions ---------- */
    case 'question/edit':
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === action.id ? { ...q, text: action.text } : q,
        ),
      }

    /** Who a question is for. Changing it re-labels the round immediately. */
    case 'question/mode':
      if (!MODES.includes(action.mode)) return state
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === action.id ? { ...q, mode: action.mode } : q,
        ),
      }

    /* ---------- selection ---------- */
    /** A pick (or re-pick) restarts the round: any previous outcome on it is
     *  void, otherwise a re-run round drags "LOGGED OUT — TIME UP" and its old
     *  reveal into the fresh takeover. */
    case 'spin/start':
      return patchRound(
        {
          ...state,
          phase: 'spinning',
          caughtId: null,
          spotlightId: null,
          // The draw is already made; the reel needs to know where to stop.
          spinTarget: action.target ?? null,
        },
        state.currentRound,
        {
          status: 'pending',
          revealed: false,
          selectedId: null,
          answeredById: null,
          guestAnswered: false,
        },
      )

    case 'spin/spotlight':
      return { ...state, spotlightId: action.id }

    /**
     * Commit an already-drawn result.
     *
     * The draw itself happens in App.spin() rather than here: reducers must be
     * pure, and React StrictMode double-invokes them in development — an RNG
     * call in this branch would burn two cards off the deck per pick.
     */
    case 'spin/commit': {
      const { id, pool } = action
      if (!id) return { ...state, phase: 'lobby' }
      return patchRound(
        {
          ...state,
          pool,
          lastDrawn: id,
          caughtId: id,
          spotlightId: id,
          phase: 'caught',
          students: state.students.map((s) =>
            s.id === id
              ? { ...s, participated: true, timesSelected: s.timesSelected + 1 }
              : s,
          ),
        },
        state.currentRound,
        { selectedId: id },
      )
    }

    /* ---------- round flow ---------- */
    case 'round/reveal':
      return patchRound({ ...state, phase: 'question' }, state.currentRound, {
        revealed: true,
      })

    /** The clock ran out on a student — they are being logged out. */
    case 'round/eject':
      return patchRound({ ...state, phase: 'ejecting' }, state.currentRound, {
        status: 'ejected',
      })

    /** The clock ran out with nobody on it (guest round, or no volunteer
     *  tapped). Nobody leaves the feed; the round just closes as time up. */
    case 'round/timeup':
      return patchRound(state, state.currentRound, { status: 'timeup' })

    /**
     * They have been swiped off the feed. Mark them logged out and pull them
     * out of the pool — a logged-out student cannot be drawn again, and their
     * card stays gone for the rest of the session.
     */
    case 'student/eject': {
      if (!action.id) return { ...state, phase: 'question' }
      const next = patchStudent(state, action.id, () => ({ ejected: true }))
      return {
        ...next,
        phase: 'question',
        pool: next.pool.filter((id) => id !== action.id),
        // caughtId is deliberately kept: the card should still name who went
        // out. They are no longer drawn on the feed, so nothing dangles.
      }
    }

    /**
     * Volunteer rounds: the host taps whoever spoke up. Marks the round
     * answered only when nobody has been picked by the algorithm for it —
     * once a picked student is on the clock, only the clock decides.
     */
    case 'round/pickAnswerer': {
      const round = state.rounds.find((r) => r.number === state.currentRound)
      const next = patchRound(state, state.currentRound, {
        answeredById: action.id,
        status: round?.selectedId ? round.status : 'answered',
      })
      return patchStudent(next, action.id, () => ({ participated: true }))
    }

    /** Guest rounds: the guest took the question. */
    case 'round/guestAnswered':
      return patchRound(state, state.currentRound, {
        guestAnswered: true,
        status: 'answered',
      })

    case 'round/goto': {
      const number = Math.min(TOTAL_ROUNDS, Math.max(1, action.number))
      const round = state.rounds.find((r) => r.number === number)
      return {
        ...state,
        currentRound: number,
        // Re-entering a finished round shows its recorded outcome; a fresh one
        // returns to the lobby.
        phase: round?.revealed ? 'question' : 'lobby',
        caughtId: round?.selectedId ?? null,
        spotlightId: round?.selectedId ?? null,
      }
    }

    /* ---------- settings ---------- */
    case 'audio/set':
      return { ...state, audio: { ...state.audio, ...action.patch } }

    case 'motion/set':
      return { ...state, reducedMotion: action.value }

    case 'displayCap/set':
      return { ...state, displayCap: Math.max(0, action.value) }

    case 'names/set':
      return { ...state, showNames: action.value }

    /* ---------- reset ---------- */
    case 'session/replace':
      return action.state ?? state

    case 'session/resetProgress': {
      // Everyone comes back online.
      const students = state.students.map((s) => ({
        ...s,
        participated: false,
        timesSelected: 0,
        ejected: false,
      }))
      return {
        ...state,
        students,
        rounds: makeRounds(),
        currentRound: 1,
        pool: buildPool(aboard(students)),
        lastDrawn: null,
        phase: 'lobby',
        caughtId: null,
        spotlightId: null,
      }
    }

    case 'session/resetAll': {
      const fresh = initialState()
      return { ...fresh, audio: state.audio, reducedMotion: state.reducedMotion }
    }

    default:
      return state
  }
}
