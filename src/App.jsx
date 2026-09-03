import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import Lobby from './components/Lobby'
import TeacherPanel from './components/TeacherPanel'
import { CaughtBanner, ModeBanner, QuestionCard, SessionSummary } from './components/Overlays'
import { reducer, load, save, displayName, modeOf } from './game/state'
import { drawFrom } from './game/shuffle'
import { audio } from './game/audio'
import {
  TIMING,
  TIMING_REDUCED,
  EJECT,
  EJECT_REDUCED,
  ANSWER_SECONDS,
  CLOCK_KEY,
  STORAGE_KEY,
  TOTAL_ROUNDS,
  MODE_COPY,
} from './game/constants'

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const appRef = useRef(null)
  const viewMode = useMemo(() => new URLSearchParams(window.location.search).get('view'), [])
  const stageOnly = viewMode === 'stage' || viewMode === 'projector'

  /* Transient animation flags — deliberately kept out of the reducer so they
     are never persisted and a refresh can't strand us mid-logout. */
  const [alarm, setAlarm] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [bannerIn, setBannerIn] = useState(false)
  const [summaryHidden, setSummaryHidden] = useState(false)

  /* Answer countdown. Deadline-based rather than a decrementing counter, so a
     throttled background tab can't slow the clock down.

     The host starts it; after that it is unstoppable and runs itself down.
     Whoever is on the clock at zero is logged out; if nobody is (a guest
     round, or no volunteer tapped yet) the round simply closes as time up. */
  const [deadline, setDeadline] = useState(null) // ms epoch, or null = not running
  const [timeLeft, setTimeLeft] = useState(null)

  const timers = useRef([])
  const spinning = useRef(false)
  const prefersReduced = usePrefersReducedMotion()
  const reduced = state.reducedMotion || prefersReduced
  const T = reduced ? TIMING_REDUCED : TIMING
  const E = reduced ? EJECT_REDUCED : EJECT

  const round = state.rounds.find((r) => r.number === state.currentRound)
  const question = state.questions[state.currentRound - 1]
  const mode = modeOf(state, state.currentRound)

  /* ---------------- persistence ---------------- */
  useEffect(() => {
    if (stageOnly) return
    save(state)
  }, [stageOnly, state])

  useEffect(() => {
    if (!stageOnly) return

    const sync = (e) => {
      if (e.key === STORAGE_KEY) {
        dispatch({ type: 'session/replace', state: load() })
      }
      if (e.key === CLOCK_KEY) {
        const clock = readClock()
        setDeadline(clock?.deadline ?? null)
        setTimeLeft(clock ? Math.max(0, Math.ceil((clock.deadline - Date.now()) / 1000)) : null)
      }
    }

    const clock = readClock()
    setDeadline(clock?.deadline ?? null)
    setTimeLeft(clock ? Math.max(0, Math.ceil((clock.deadline - Date.now()) / 1000)) : null)
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [stageOnly])

  /* Re-arm the end-of-session summary once the session is no longer finished
     (a reset, or the host re-running an earlier round). */
  useEffect(() => {
    if (state.rounds.some((r) => r.status === 'pending')) setSummaryHidden(false)
  }, [state.rounds])

  /* ---------------- audio settings ---------------- */
  useEffect(() => {
    audio.setEnabled(state.audio.enabled)
  }, [state.audio.enabled])

  useEffect(() => {
    audio.setVolume(state.audio.volume)
  }, [state.audio.volume])

  /* ---------------- timer housekeeping ---------------- */
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const at = useCallback((ms, fn) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  const stopClock = useCallback(() => {
    setDeadline(null)
    setTimeLeft(null)
    if (!stageOnly) clearClock()
  }, [stageOnly])

  const resetStage = useCallback(() => {
    clearTimers()
    setAlarm(false)
    setLaunching(false)
    setBannerIn(false)
    audio.stopAll()
  }, [clearTimers])

  /* Changing rounds mid-flight must never leave a card half swiped or the
     previous round's clock running. */
  useEffect(() => {
    resetStage()
    stopClock()
    spinning.current = false
  }, [state.currentRound, resetStage, stopClock])

  /* Safety net: if the student on the clock is deleted or replaced (roster
     edit, bulk paste) mid-countdown, there is nobody left to log out — stop. */
  useEffect(() => {
    if (deadline == null) return
    const target = round?.selectedId
    if (target && !state.students.some((s) => s.id === target)) stopClock()
  }, [deadline, round, state.students, stopClock])

  /* A backgrounded tab throttles timers, so the countdown can wake up already
     past zero. Re-check the deadline the moment we become visible again. */
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && deadline != null) {
        setTimeLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [deadline])

  /* ---------------- the logout ----------------
     Runs when the clock hits zero on a student. This is the only path that
     swipes a card off the feed — being picked merely starts the countdown. */
  const ejectSequence = useCallback(
    async (victim) => {
      clearTimers()
      dispatch({ type: 'round/eject' })

      const ok = await audio.unlock()
      if (ok) {
        await audio.load()
        audio.logout()
        // Land the sting's 1.18s impact on the swipe frame.
        audio.playSting(Math.max(0, E.launch - E.audioPeakOffset))
      }

      setAlarm(true)
      at(E.launch, () => setLaunching(true))
      // Once they are off the feed they are gone for good — no drift back in.
      at(E.gone, () => {
        dispatch({ type: 'student/eject', id: victim })
        setLaunching(false)
      })
      at(E.audioFade, () => {
        audio.fadeSting(E.audioFadeDur)
        setAlarm(false)
      })
      at(E.settle, () => clearTimers())
    },
    [E, at, clearTimers],
  )

  /* Time ran out with nobody to log out. A short red pulse, the logout tone,
     and the round closes as time up. */
  const timeUpSequence = useCallback(async () => {
    clearTimers()
    dispatch({ type: 'round/timeup' })
    const ok = await audio.unlock()
    if (ok) audio.logout()
    setAlarm(true)
    at(reduced ? 600 : 1400, () => setAlarm(false))
  }, [at, clearTimers, reduced])

  /* ---------------- countdown tick ---------------- */
  useEffect(() => {
    if (deadline == null) return
    let raf
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setTimeLeft(left)
      if (left <= 0) {
        setDeadline(null)
        if (stageOnly) return
        clearClock()
        // Whoever is on the clock goes. A picked student always; on a volunteer
        // round the student who was tapped; on a guest round nobody.
        const victim =
          round?.selectedId ?? (mode === 'volunteer' ? round?.answeredById : null) ?? null
        if (victim) ejectSequence(victim)
        else timeUpSequence()
        return
      }
      raf = setTimeout(tick, 250)
    }
    tick()
    return () => clearTimeout(raf)
  }, [deadline, ejectSequence, timeUpSequence, round, mode, stageOnly])

  /** Host-initiated, and the only manual step in the countdown. */
  const startClock = useCallback(
    (seconds = ANSWER_SECONDS) => {
      if (stageOnly) return
      const nextDeadline = Date.now() + seconds * 1000
      setTimeLeft(seconds)
      setDeadline(nextDeadline)
      saveClock({ deadline: nextDeadline, totalSeconds: seconds })
    },
    [stageOnly],
  )

  /* ---------------- the pick ---------------- */
  // Allowed on every mode: it's the "no guest in the room" / "nobody put a
  // hand up" fallback, and it runs the exact same dramatic sequence.
  const spin = useCallback(async () => {
    if (stageOnly) return
    if (state.phase === 'spinning' || spinning.current) return
    if (state.students.length === 0 || state.students.every((s) => s.ejected)) return

    // A ref, not just phase: two clicks in the same tick both read the stale
    // 'lobby' phase and would each draw a card off the deck.
    spinning.current = true

    // Re-running abandons whoever was on the clock. Without this the old
    // deadline keeps running and logs out the PREVIOUS student mid-pick.
    stopClock()
    resetStage()
    dispatch({ type: 'spin/start' })

    // Draw once, here, from the current deck. Keeping the RNG out of the
    // reducer makes the reducer pure and StrictMode-safe.
    // Logged-out students are off the feed and out of the running.
    const ids = state.students.filter((s) => !s.ejected).map((s) => s.id)
    const draw = drawFrom(state.pool, ids, state.lastDrawn)
    if (!draw.id) {
      spinning.current = false
      return
    }

    // Unlock inside the click handler — this is the user gesture that satisfies
    // the browser's autoplay policy. Nothing has played before now.
    const ok = await audio.unlock()
    if (ok) {
      await audio.load()
      audio.playModem(T.spin)
      // Schedule the sting LATE so its 1.18s impact peak collides with lock-in.
      const lead = T.spin - T.audioPeakOffset
      if (lead >= 0) {
        audio.playSting(lead)
      } else {
        // Reduced-motion scroll is shorter than the sting's own build-up, so
        // just fire it immediately and accept a slightly early peak.
        audio.playSting(0)
      }
    }

    /* The scroll: cards light up fast at first, easing out into the lock-in. */
    let elapsed = 0
    let last = null
    while (elapsed < T.spin - 60) {
      const p = elapsed / T.spin
      const gap = 55 + 245 * Math.pow(p, 2.3)
      const when = elapsed
      timers.current.push(
        setTimeout(() => {
          let pick = ids[Math.floor(Math.random() * ids.length)]
          if (ids.length > 1 && pick === last) {
            pick = ids[(ids.indexOf(pick) + 1) % ids.length]
          }
          last = pick
          dispatch({ type: 'spin/spotlight', id: pick })
          audio.ping(0.6 + p * 0.4)
        }, when),
      )
      elapsed += gap
    }

    /* Lock-in → notification pulse → banner → question on screen.
       No logout here: the feed only drops someone if the clock runs out. */
    at(T.spin, () => dispatch({ type: 'spin/commit', id: draw.id, pool: draw.pool }))
    at(T.alarm, () => setAlarm(true))
    at(T.banner, () => setBannerIn(true))
    at(T.audioFade, () => {
      audio.fadeSting(T.audioFadeDur)
    })
    at(T.alarmOff, () => setAlarm(false))
    // The question appears by itself once the pick has landed. The clock does
    // NOT start here — the host starts it when the room is ready.
    at(T.settle, () => {
      dispatch({ type: 'round/reveal' })
      spinning.current = false
      clearTimers()
    })
  }, [
    state.phase,
    state.students,
    state.pool,
    state.lastDrawn,
    T,
    at,
    resetStage,
    clearTimers,
    stopClock,
    stageOnly,
  ])

  /* ---------------- other host actions ---------------- */
  const setAudio = useCallback((patch) => {
    dispatch({ type: 'audio/set', patch })
    audio.unlock()
  }, [])

  const reveal = useCallback(() => {
    if (stageOnly || round?.revealed) return
    dispatch({ type: 'round/reveal' })
    audio.unlock().then((ok) => {
      if (!ok) return
      if (mode === 'guest') audio.verified()
      else if (mode === 'volunteer') audio.chime()
    })
  }, [stageOnly, round, mode])

  const pickAnswerer = useCallback(
    (id) => {
      if (stageOnly) return
      dispatch({ type: 'round/pickAnswerer', id })
      audio.unlock().then((ok) => ok && audio.chime())
    },
    [stageOnly],
  )

  const guestAnswered = useCallback(() => {
    if (stageOnly) return
    stopClock()
    dispatch({ type: 'round/guestAnswered' })
    audio.unlock().then((ok) => ok && audio.verified())
  }, [stageOnly, stopClock])

  const actions = useMemo(
    () => ({ spin, setAudio, reveal, guestAnswered }),
    [spin, setAudio, reveal, guestAnswered],
  )

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await (appRef.current ?? document.documentElement).requestFullscreen()
      }
    } catch {
      // Browsers can reject fullscreen outside trusted user gestures.
    }
  }, [])

  /* ---------------- keyboard shortcuts ---------------- */
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // Mid-scroll the only safe keys are mute and the pick's own guard.
      const busy = state.phase === 'spinning' || state.phase === 'ejecting'

      const k = e.key === ' ' ? 'space' : e.key.toLowerCase()
      const map = {
        s: () => spin(),
        r: () => !busy && reveal(),
        g: () => !busy && mode === 'guest' && round.revealed && round.status === 'pending' && guestAnswered(),
        // Space starts the clock. Once running nothing stops it.
        space: () => {
          if (!busy && deadline == null && round.revealed && round.status === 'pending')
            startClock(ANSWER_SECONDS)
        },
        n: () => !busy && dispatch({ type: 'round/goto', number: state.currentRound + 1 }),
        p: () => !busy && dispatch({ type: 'round/goto', number: state.currentRound - 1 }),
        m: () => setAudio({ enabled: !state.audio.enabled }),
        f: () => toggleFullscreen(),
      }
      if (map[k]) {
        e.preventDefault()
        map[k]()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    round,
    mode,
    state.currentRound,
    state.audio.enabled,
    state.phase,
    spin,
    reveal,
    guestAnswered,
    setAudio,
    toggleFullscreen,
    deadline,
    startClock,
  ])

  /* ---------------- derived view state ---------------- */
  const caught = state.students.find((s) => s.id === state.caughtId)
  const answerer = state.students.find((s) => s.id === round?.answeredById)
  // Tap-to-pick stays live on a volunteer round until the algorithm has been
  // asked to pick someone instead.
  const pickMode = mode === 'volunteer' && !round?.selectedId
  const stageAlarm = stageOnly ? state.phase === 'caught' || state.phase === 'ejecting' : alarm
  const stageLaunching = stageOnly ? state.phase === 'ejecting' : launching
  const showCaughtBanner = stageOnly ? state.phase === 'caught' : bannerIn

  const sessionDone =
    state.students.length > 0 &&
    state.rounds.every((r) => r.status !== 'pending') &&
    state.phase !== 'spinning' &&
    state.phase !== 'ejecting'
  const ejectedNames = state.students.filter((s) => s.ejected).map(displayName)

  return (
    <div
      ref={appRef}
      className={['app', reduced && 'app--reduced', stageOnly && 'app--stage']
        .filter(Boolean)
        .join(' ')}
    >
      <main className="stage-wrap">
        <div className="hud">
          <span className="hud-round">
            ROUND <strong>{state.currentRound}</strong> / {TOTAL_ROUNDS}
          </span>
          <span className={`hud-mode hud-mode--${mode}`}>{MODE_COPY[mode].hud}</span>
          <span className="hud-pool">
            IN POOL <strong>{state.pool.length}</strong>
          </span>
        </div>

        <Lobby
          students={state.students}
          spotlightId={state.spotlightId}
          caughtId={state.caughtId}
          phase={state.phase}
          mode={mode}
          alarm={stageAlarm}
          launching={stageLaunching}
          pickMode={pickMode}
          showNames={state.showNames}
          displayCap={state.displayCap}
          answeredById={round?.answeredById}
          onPick={pickAnswerer}
          onLoadSample={() => dispatch({ type: 'roster/loadSample' })}
        />

        {state.phase === 'caught' && caught && (
          <CaughtBanner name={displayName(caught).toUpperCase()} visible={showCaughtBanner} />
        )}

        {mode !== 'students' && state.phase === 'lobby' && !round.revealed && (
          <ModeBanner mode={mode} visible />
        )}

        {(state.phase === 'question' || state.phase === 'ejecting') && (
          <QuestionCard
            round={round}
            mode={mode}
            question={question}
            status={round.status}
            challengerName={caught ? displayName(caught) : undefined}
            answererName={answerer ? displayName(answerer) : undefined}
            pickMode={pickMode}
            timeLeft={timeLeft}
            running={deadline != null}
            totalSeconds={ANSWER_SECONDS}
            ejecting={state.phase === 'ejecting'}
            onStart={() => startClock(ANSWER_SECONDS)}
            onGuestAnswered={guestAnswered}
          />
        )}

        {sessionDone && !summaryHidden && (
          <SessionSummary
            ejected={ejectedNames}
            answered={state.rounds.filter((r) => r.status === 'answered').length}
            timeUp={state.rounds.filter((r) => r.status === 'timeup').length}
            aboard={state.students.length - ejectedNames.length}
            total={state.students.length}
            onRestart={() => {
              setSummaryHidden(false)
              dispatch({ type: 'session/resetProgress' })
            }}
            onDismiss={() => setSummaryHidden(true)}
          />
        )}
      </main>

      {!stageOnly && (
        <TeacherPanel
          state={state}
          dispatch={dispatch}
          actions={actions}
          clock={{
            running: deadline != null,
            secondsLeft: timeLeft,
            start: () => startClock(ANSWER_SECONDS),
          }}
        />
      )}
    </div>
  )
}

function readClock() {
  try {
    const raw = localStorage.getItem(CLOCK_KEY)
    if (!raw) return null
    const clock = JSON.parse(raw)
    return Number.isFinite(clock?.deadline) ? clock : null
  } catch {
    return null
  }
}

function saveClock(clock) {
  try {
    localStorage.setItem(CLOCK_KEY, JSON.stringify(clock))
  } catch {
    /* storage unavailable — host still runs the clock locally */
  }
}

function clearClock() {
  try {
    localStorage.removeItem(CLOCK_KEY)
  } catch {
    /* storage unavailable — nothing to clear */
  }
}

/** Live-updating `prefers-reduced-motion` reader. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = (e) => setReduced(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}
