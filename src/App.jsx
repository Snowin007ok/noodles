import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import Lobby from './components/Lobby'
import TeacherPanel from './components/TeacherPanel'
import { CaughtBanner, OpenBanner, QuestionCard, SessionSummary } from './components/Overlays'
import { reducer, load, save, displayName } from './game/state'
import { drawFrom } from './game/shuffle'
import { audio } from './game/audio'
import {
  TIMING,
  TIMING_REDUCED,
  EJECT,
  EJECT_REDUCED,
  ANSWER_SECONDS,
} from './game/constants'

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  /* Transient animation flags — deliberately kept out of the reducer so they
     are never persisted and a refresh can't strand us mid-launch. */
  const [alarm, setAlarm] = useState(false)
  const [airlockOpen, setAirlockOpen] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [bannerIn, setBannerIn] = useState(false)
  const [summaryHidden, setSummaryHidden] = useState(false)

  /* Answer countdown. Deadline-based rather than a decrementing counter, so a
     throttled background tab can't slow the clock down.

     The teacher starts it; after that it is unstoppable and runs itself down to
     the ejection. The only way out is answering in time. */
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

  /* ---------------- persistence ---------------- */
  useEffect(() => {
    save(state)
  }, [state])

  /* Re-arm the end-of-session summary once the session is no longer finished
     (a reset, or the teacher re-spinning an earlier round). */
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
  }, [])

  const resetStage = useCallback(() => {
    clearTimers()
    setAlarm(false)
    setAirlockOpen(false)
    setLaunching(false)
    setBannerIn(false)
    audio.stopAll()
  }, [clearTimers])

  /* Changing rounds mid-flight must never leave the airlock hanging open or
     the previous round's clock running. */
  useEffect(() => {
    resetStage()
    stopClock()
    spinning.current = false
  }, [state.currentRound, resetStage, stopClock])

  /* Safety net: if the crew member on the clock is deleted or replaced (roster
     edit, bulk paste) mid-countdown, there is nobody left to eject — stop. */
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

  /* ---------------- the ejection ----------------
     Runs when the clock hits zero. This is the only path that opens the
     airlock — being caught merely starts the countdown. */
  const ejectSequence = useCallback(async () => {
    clearTimers()
    const victim = round?.selectedId ?? state.caughtId
    dispatch({ type: 'round/eject' })

    const ok = await audio.unlock()
    if (ok) {
      await audio.load()
      // Land the sting's 1.18s impact on the launch frame.
      audio.playSting(Math.max(0, E.launch - E.audioPeakOffset))
    }

    setAlarm(true)
    setAirlockOpen(true)
    at(E.launch, () => setLaunching(true))
    // Once they clear the hull they are gone for good — no drift back in.
    at(E.gone, () => {
      dispatch({ type: 'student/eject', id: victim })
      setLaunching(false)
      setAirlockOpen(false)
    })
    at(E.audioFade, () => {
      audio.fadeSting(E.audioFadeDur)
      setAlarm(false)
    })
    at(E.settle, () => clearTimers())
  }, [E, at, clearTimers, round, state.caughtId])

  /* ---------------- countdown tick ---------------- */
  useEffect(() => {
    if (deadline == null) return
    let raf
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setTimeLeft(left)
      if (left <= 0) {
        setDeadline(null)
        ejectSequence()
        return
      }
      raf = setTimeout(tick, 250)
    }
    tick()
    return () => clearTimeout(raf)
  }, [deadline, ejectSequence])

  /** Teacher-initiated, and the only manual step in the countdown. */
  const startClock = useCallback((seconds = ANSWER_SECONDS) => {
    setTimeLeft(seconds)
    setDeadline(Date.now() + seconds * 1000)
  }, [])

  /* ---------------- the spin ---------------- */
  // Spinning is allowed on volunteer rounds too — it's the "nobody put a hand
  // up" fallback, and it runs the exact same dramatic sequence.
  const spin = useCallback(async () => {
    if (state.phase === 'spinning' || spinning.current) return
    if (state.students.length === 0 || state.students.every((s) => s.ejected)) return

    // A ref, not just phase: two clicks in the same tick both read the stale
    // 'lobby' phase and would each draw a card off the deck.
    spinning.current = true

    // Re-spinning abandons whoever was on the clock. Without this the old
    // deadline keeps running and ejects the PREVIOUS student mid-new-spin.
    stopClock()
    resetStage()
    dispatch({ type: 'spin/start' })

    // Draw once, here, from the current deck. Keeping the RNG out of the
    // reducer makes the reducer pure and StrictMode-safe.
    // Ejected crew are off the craft and out of the running.
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
      audio.playRiser(T.spin)
      // Schedule the sting LATE so its 1.18s impact peak collides with lock-in.
      const lead = T.spin - T.audioPeakOffset
      if (lead >= 0) {
        audio.playSting(lead)
      } else {
        // Reduced-motion spin is shorter than the sting's own build-up, so just
        // fire it immediately and accept a slightly early peak.
        audio.playSting(0)
      }
    }

    /* Name cycling: fast at first, easing out into the lock-in. */
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
          audio.tick(0.6 + p * 0.4)
        }, when),
      )
      elapsed += gap
    }

    /* Lock-in → alarm → banner → question on screen → clock starts.
       No ejection here: the airlock only cycles if the clock runs out. */
    at(T.spin, () => dispatch({ type: 'spin/commit', id: draw.id, pool: draw.pool }))
    at(T.alarm, () => setAlarm(true))
    at(T.banner, () => setBannerIn(true))
    at(T.audioFade, () => {
      audio.fadeSting(T.audioFadeDur)
    })
    at(T.alarmOff, () => setAlarm(false))
    // The question appears by itself once the catch has landed. The clock does
    // NOT start here — the teacher starts it when the class is ready.
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
    round,
    T,
    at,
    resetStage,
    clearTimers,
    stopClock,
  ])

  /* ---------------- other teacher actions ---------------- */
  const setAudio = useCallback((patch) => {
    dispatch({ type: 'audio/set', patch })
    audio.unlock()
  }, [])

  const pickAnswerer = useCallback((id) => {
    dispatch({ type: 'round/pickAnswerer', id })
  }, [])

  const actions = useMemo(
    () => ({ spin, setAudio }),
    [spin, setAudio],
  )

  /* ---------------- keyboard shortcuts ---------------- */
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // Mid-spin the only safe keys are mute and spin's own guard.
      const busy = state.phase === 'spinning' || state.phase === 'ejecting'

      const k = e.key === ' ' ? 'space' : e.key.toLowerCase()
      const map = {
        s: () => spin(),
        r: () => !busy && !round.revealed && dispatch({ type: 'round/reveal' }),
        // Space starts the clock. Once running nothing stops it.
        space: () => {
          if (
            !busy &&
            deadline == null &&
            round.revealed &&
            round.selectedId &&
            round.status === 'pending'
          )
            startClock(ANSWER_SECONDS)
        },
        n: () => !busy && dispatch({ type: 'round/goto', number: state.currentRound + 1 }),
        p: () => !busy && dispatch({ type: 'round/goto', number: state.currentRound - 1 }),
        m: () => setAudio({ enabled: !state.audio.enabled }),
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
    state.currentRound,
    state.audio.enabled,
    state.phase,
    spin,
    setAudio,
    deadline,
    startClock,
  ])

  /* ---------------- derived view state ---------------- */
  const caught = state.students.find((s) => s.id === state.caughtId)
  const answerer = state.students.find((s) => s.id === round?.answeredById)
  const pickMode = Boolean(round?.open)

  const sessionDone =
    state.students.length > 0 &&
    state.rounds.every((r) => r.status !== 'pending') &&
    state.phase !== 'spinning' &&
    state.phase !== 'ejecting'
  const ejectedNames = state.students.filter((s) => s.ejected).map(displayName)

  return (
    <div className={`app${reduced ? ' app--reduced' : ''}`}>
      <main className="stage-wrap">
        <div className="hud">
          <span className="hud-round">
            ROUND <strong>{state.currentRound}</strong> / 10
          </span>
          <span className={`hud-mode${round?.open ? ' hud-mode--open' : ''}`}>
            {round?.open ? 'OPEN — ANYONE MAY ANSWER' : 'INDIVIDUAL CHALLENGE'}
          </span>
          <span className="hud-pool">
            POOL <strong>{state.pool.length}</strong>
          </span>
        </div>

        <Lobby
          students={state.students}
          spotlightId={state.spotlightId}
          caughtId={state.caughtId}
          phase={state.phase}
          alarm={alarm}
          airlockOpen={airlockOpen}
          launching={launching}
          pickMode={pickMode}
          showNames={state.showNames}
          displayCap={state.displayCap}
          answeredById={round?.answeredById}
          onPick={pickAnswerer}
          onLoadSample={() => dispatch({ type: 'roster/loadSample' })}
        />

        {state.phase === 'caught' && caught && (
          <CaughtBanner name={displayName(caught).toUpperCase()} visible={bannerIn} />
        )}

        {pickMode && !round.revealed && <OpenBanner visible />}

        {(state.phase === 'question' || state.phase === 'ejecting') && (
          <QuestionCard
            round={round}
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
          />
        )}

        {sessionDone && !summaryHidden && (
          <SessionSummary
            ejected={ejectedNames}
            answered={state.rounds.filter((r) => r.status === 'answered').length}
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
    </div>
  )
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
