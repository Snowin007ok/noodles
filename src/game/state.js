/**
 * Session state: one reducer, persisted to localStorage on every change.
 *
 * Phases:
 *   'lobby'    — crew idle, teacher may spin (or, on a volunteer round, pick)
 *   'spinning' — names cycling, audio scheduled
 *   'caught'   — "IMPOSTOR" banner up
 *   'question' — question on screen, 2:00 countdown running
 *   'ejecting' — the clock ran out; airlock cycling
 *
 * Round status: 'pending' | 'answered' | 'ejected'
 */

import {
  STORAGE_KEY,
  TOTAL_ROUNDS,
  SAMPLE_STUDENTS,
  SAMPLE_QUESTIONS,
  colorFor,
  isOpenRound,
} from './constants'
import { buildPool, reconcilePool } from './shuffle'

let idSeq = 0
const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${(idSeq++).toString(36)}`

/** What to show when a name field has been emptied. */
export const displayName = (s) => (s?.name?.trim() ? s.name.trim() : 'Unnamed crew')

export function makeStudent(name, index) {
  const c = colorFor(index)
  return {
    id: uid('stu'),
    name: name.trim(),
    colorId: c.id,
    participated: false,
    timesSelected: 0,
    // Ejected crew are out of the craft for good: their seat stays empty and
    // they are no longer in the selection pool. Still listed under Status.
    ejected: false,
  }
}

function makeRounds() {
  return Array.from({ length: TOTAL_ROUNDS }, (_, i) => ({
    number: i + 1,
    open: isOpenRound(i + 1),
    status: 'pending', // 'pending' | 'answered' | 'ejected'
    selectedId: null, // who the spin caught (individual rounds)
    answeredById: null, // who actually answered (either mode)
    revealed: false,
  }))
}

export function initialState() {
  const students = SAMPLE_STUDENTS.map(makeStudent)
  return {
    version: 1,
    students,
    questions: SAMPLE_QUESTIONS.map((text, i) => ({
      id: `q${i + 1}`,
      number: i + 1,
      text,
      open: isOpenRound(i + 1),
    })),
    rounds: makeRounds(),
    currentRound: 1,
    pool: buildPool(students.map((s) => s.id)),
    lastDrawn: null,
    phase: 'lobby',
    spotlightId: null, // crew member currently highlighted by the cycler
    caughtId: null, // crew member locked in for this round
    audio: { enabled: true, volume: 0.8 },
    reducedMotion: false,
    // 45 name tags at once is noise. Off by default: the room stays clean and
    // only the name that matters right now is shown.
    showNames: false,
    // How many crew are SEATED in the room. The roster and the pool are
    // unaffected — a class of 45 still draws from all 45; the lobby just shows
    // a tidy cast instead of 45 shrunken characters. 0 = show everyone.
    displayCap: 16,
  }
}

/* ------------------------------------------------------------------ */

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const saved = JSON.parse(raw)
    if (saved.version !== 1 || !Array.isArray(saved.students)) return initialState()

    /* Self-heal: a saved session with ZERO students has nothing worth
       restoring — it just strands the next visitor on "No crew aboard"
       with an un-runnable game. Keep what the teacher may genuinely have
       edited (questions, audio, display settings) and bring the sample
       crew back so the link always lands on something playable. */
    if (saved.students.length === 0) {
      const fresh = initialState()
      return {
        ...fresh,
        questions:
          Array.isArray(saved.questions) && saved.questions.length
            ? saved.questions
            : fresh.questions,
        audio: saved.audio ?? fresh.audio,
        reducedMotion: saved.reducedMotion ?? fresh.reducedMotion,
        showNames: saved.showNames ?? fresh.showNames,
        displayCap: saved.displayCap ?? fresh.displayCap,
      }
    }

    // Never restore mid-animation — a refresh should land in a stable lobby.
    const phase = saved.phase === 'spinning' ? 'lobby' : saved.phase
    const base = initialState()
    const merged = { ...base, ...saved, phase, spotlightId: null }

    /* A session saved by an older build can carry a missing or malformed
       numeric field, which reaches an <input value> as NaN and breaks the
       control. Coerce anything numeric back to a sane value rather than
       trusting whatever is in storage. */
    const num = (v, fallback, min, max) =>
      typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback

    merged.displayCap = num(merged.displayCap, base.displayCap, 0, 500)
    merged.currentRound = num(merged.currentRound, 1, 1, TOTAL_ROUNDS)
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
    merged.pool = Array.isArray(merged.pool) ? merged.pool : []

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

/** Ids of everyone still on the craft — the only people who can be drawn. */
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
      return patchStudent(state, action.id, () => ({ name: action.name.slice(0, 40) }))

    case 'student/color':
      return patchStudent(state, action.id, () => ({ colorId: action.colorId }))

    case 'student/remove': {
      const students = state.students.filter((s) => s.id !== action.id)
      const ids = students.map((s) => s.id)
      return {
        ...state,
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
     *  hatch from "No crew aboard". Questions and settings are untouched. */
    case 'roster/loadSample': {
      const students = SAMPLE_STUDENTS.map(makeStudent)
      return {
        ...state,
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

    /* ---------- selection ---------- */
    /** A spin (or re-spin) restarts the round: any previous outcome on it is
     *  void, otherwise a re-spun round drags "EJECTED — TIME UP" and its old
     *  reveal into the fresh takeover. */
    case 'spin/start':
      return patchRound(
        { ...state, phase: 'spinning', caughtId: null, spotlightId: null },
        state.currentRound,
        { status: 'pending', revealed: false, selectedId: null, answeredById: null },
      )

    case 'spin/spotlight':
      return { ...state, spotlightId: action.id }

    /**
     * Commit an already-drawn result.
     *
     * The draw itself happens in App.spin() rather than here: reducers must be
     * pure, and React StrictMode double-invokes them in development — an RNG
     * call in this branch would burn two cards off the deck per spin.
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

    /** The clock ran out — out of the airlock they go. There is no reprieve. */
    case 'round/eject':
      return patchRound({ ...state, phase: 'ejecting' }, state.currentRound, {
        status: 'ejected',
      })

    /**
     * They have cleared the hull. Mark them off the craft and pull them out of
     * the pool — an ejected student cannot be drawn again, and their seat
     * stays empty for the rest of the session.
     */
    case 'student/eject': {
      if (!action.id) return { ...state, phase: 'question' }
      const next = patchStudent(state, action.id, () => ({ ejected: true }))
      return {
        ...next,
        phase: 'question',
        pool: next.pool.filter((id) => id !== action.id),
        // caughtId is deliberately kept: the card should still name who went
        // out. They are no longer drawn in the room, so nothing dangles.
      }
    }

    /**
     * Volunteer rounds: the teacher taps whoever spoke up. This is the only
     * way a round can end as 'answered' — and only when nobody has been spun
     * for. Once an impostor is on the clock, nothing cancels the airlock.
     */
    case 'round/pickAnswerer': {
      const round = state.rounds.find((r) => r.number === state.currentRound)
      let next = patchRound(state, state.currentRound, {
        answeredById: action.id,
        status: round?.selectedId ? round.status : 'answered',
      })
      return patchStudent(next, action.id, () => ({ participated: true }))
    }

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
    case 'session/resetProgress': {
      // Everyone comes back aboard.
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
