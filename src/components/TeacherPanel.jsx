import { useState } from 'react'
import { CREW_COLORS, TOTAL_ROUNDS, MODES, MODE_LABEL, MODE_COPY, SESSION } from '../game/constants'
import { displayName, modeOf } from '../game/state'

/**
 * The host's rail. Four tabs so the feed keeps the screen:
 *   Control · Roster · Questions · Status
 */
export default function TeacherPanel({ state, dispatch, actions, clock }) {
  const [tab, setTab] = useState('control')

  return (
    <aside className="panel" aria-label="Host controls">
      <div className="panel-brand">
        <span className="panel-logo" aria-hidden="true">
          <NoodleMark />
        </span>
        <span>
          <strong>NOODLES</strong>
          <em>{SESSION.title}</em>
        </span>
        {/* The audience never needs this panel. One key hides it and lets the
            street take the whole display; the second button is for a real
            two-screen setup (control here, stage on the projector). */}
        <span className="brand-actions">
          <button
            className="btn btn--ghost"
            onClick={actions.togglePresenter}
            title="Hide the controls — the street fills the screen. Press H to bring them back."
          >
            ▶ Present <kbd>H</kbd>
          </button>
          <button
            className="btn btn--ghost"
            onClick={actions.openProjector}
            title="Open a host-free stage view in a new window for a second screen"
          >
            ↗ Projector
          </button>
        </span>
      </div>

      <nav className="tabs" role="tablist">
        {[
          ['control', 'Control'],
          ['roster', 'Roster'],
          ['questions', 'Questions'],
          ['status', 'Status'],
        ].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            className={`tab${tab === key ? ' tab--on' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="panel-body">
        {tab === 'control' && (
          <ControlTab state={state} dispatch={dispatch} actions={actions} clock={clock} />
        )}
        {tab === 'roster' && <RosterTab state={state} dispatch={dispatch} />}
        {tab === 'questions' && <QuestionsTab state={state} dispatch={dispatch} />}
        {tab === 'status' && <StatusTab state={state} />}
      </div>
    </aside>
  )
}

/* ================================================================= */

const HERO_LABEL = {
  students: (round) => (round.selectedId ? 'ALGORITHM, CHOOSE AGAIN' : 'LET THE ALGORITHM CHOOSE'),
  guest: () => 'NO GUEST? ALGORITHM PICKS',
  volunteer: () => 'NOBODY? ALGORITHM PICKS',
}

function ControlTab({ state, dispatch, actions, clock }) {
  const round = state.rounds.find((r) => r.number === state.currentRound)
  const question = state.questions[state.currentRound - 1]
  const mode = modeOf(state, state.currentRound)
  const busy = state.phase === 'spinning' || state.phase === 'ejecting'
  const remaining = state.pool.length
  const eligible = state.students.filter((s) => !s.ejected).length

  // Who is on the clock, for the countdown label.
  const onClock = round.selectedId
    ? 'the picked student'
    : mode === 'volunteer' && round.answeredById
      ? 'the volunteer'
      : null

  return (
    <>
      <div className="round-nav">
        <button
          className="btn btn--ghost"
          onClick={() => dispatch({ type: 'round/goto', number: state.currentRound - 1 })}
          disabled={state.currentRound === 1 || busy}
          aria-label="Previous round"
        >
          ‹ Prev <kbd>P</kbd>
        </button>
        <span className="round-pill">
          Round <strong>{state.currentRound}</strong>
          <i>/ {TOTAL_ROUNDS}</i>
        </span>
        <button
          className="btn btn--ghost"
          onClick={() => dispatch({ type: 'round/goto', number: state.currentRound + 1 })}
          disabled={state.currentRound === TOTAL_ROUNDS || busy}
          aria-label="Next round"
        >
          Next › <kbd>N</kbd>
        </button>
      </div>

      <ol className="round-dots" aria-label="Round progress">
        {state.rounds.map((r) => {
          const m = modeOf(state, r.number)
          return (
            <li key={r.number}>
              <button
                className={[
                  'dot',
                  `dot--${r.status}`,
                  `dot--${m}`,
                  r.number === state.currentRound && 'dot--now',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => dispatch({ type: 'round/goto', number: r.number })}
                disabled={busy}
                title={`Round ${r.number} — ${MODE_LABEL[m]} — ${r.status}`}
                aria-label={`Go to round ${r.number}, ${MODE_LABEL[m]}, ${r.status}`}
              >
                {r.number}
              </button>
            </li>
          )
        })}
      </ol>

      <div className={`card card--${mode}`}>
        <span className="card-label">{MODE_COPY[mode].card}</span>
        <p className="card-q">
          {round.revealed ? question?.text : '••••••  hidden until revealed  ••••••'}
        </p>
      </div>

      {mode === 'guest' && (
        <div className="open-note open-note--guest">
          <strong>✓ GUEST QUESTION</strong>
          <span>
            Reveal, then hand it to the guest and start the clock. No guest in the room?
            Let the algorithm pick a student instead.
          </span>
        </div>
      )}

      {mode === 'volunteer' && (
        <div className="open-note">
          <strong>✋ VOLUNTEER ROUND</strong>
          <span>Reveal, then tap the name of whoever answered — or let the algorithm pick if nobody does.</span>
        </div>
      )}

      <button className="btn btn--hero" onClick={actions.spin} disabled={busy || eligible === 0}>
        {busy ? 'SCROLLING…' : HERO_LABEL[mode](round)}
        <kbd>S</kbd>
      </button>
      <p className="pool-line">
        Pool: <strong>{remaining}</strong> of {eligible} online
        {state.students.length !== eligible && ` · ${state.students.length - eligible} logged out`}
      </p>

      <button
        className="btn btn--reveal"
        onClick={actions.reveal}
        disabled={
          round.revealed ||
          busy ||
          (mode === 'students' && !round.selectedId) ||
          state.phase === 'caught'
        }
      >
        Reveal Question <kbd>R</kbd>
      </button>

      {mode === 'guest' && (
        <button
          className="btn btn--good"
          onClick={actions.guestAnswered}
          disabled={!round.revealed || round.status !== 'pending' || busy}
        >
          ✓ Guest answered <kbd>G</kbd>
        </button>
      )}

      {/* Clock: the host decides when the two minutes begin — on every mode. */}
      {round.revealed && round.status === 'pending' && (
        <div className="clock-controls">
          <span className="clock-controls-label">
            {clock.running
              ? `Counting down — ${fmt(clock.secondsLeft)} ${onClock ? 'to logout' : 'until time up'}`
              : 'Clock not started'}
          </span>
          {clock.running ? (
            <p className="hint">
              {onClock
                ? `No pause, no extension. At zero ${onClock} is logged out.`
                : 'No pause, no extension. At zero the round closes as time up.'}
            </p>
          ) : (
            <button className="btn btn--hero" onClick={clock.start}>
              ▶ Start 2:00 <kbd>Space</kbd>
            </button>
          )}
        </div>
      )}

      {round.revealed && (
        <p className="pool-line">
          {round.status === 'ejected'
            ? 'Time ran out — the student on the clock was logged out.'
            : round.status === 'timeup'
              ? 'Time ran out. Nobody was logged out — move to the next round.'
              : round.status === 'answered'
                ? round.guestAnswered
                  ? 'Answered by the guest. Move to the next round.'
                  : 'Answered by a volunteer. Move to the next round.'
                : round.selectedId
                  ? 'Question is on screen. Start the clock when ready.'
                  : mode === 'guest'
                    ? 'Over to the guest. Start the clock, then mark Guest answered.'
                    : 'Volunteer round — tap whoever answered, or start the clock.'}
        </p>
      )}

      {/* At-a-glance counters, so the host never has to leave Control to know
          where the session stands. */}
      <div className="mini-stats">
        <div className="mini">
          <strong>{state.rounds.filter((r) => r.status !== 'pending').length}</strong>
          <span>Done</span>
        </div>
        <div className="mini mini--cool">
          <strong>{remaining}</strong>
          <span>In pool</span>
        </div>
        <div className="mini mini--bad">
          <strong>{state.students.length - eligible}</strong>
          <span>Logged out</span>
        </div>
      </div>

      <hr className="rule" />

      <div className="field">
        <label className="switch">
          <input
            type="checkbox"
            checked={state.audio.enabled}
            onChange={(e) => actions.setAudio({ enabled: e.target.checked })}
          />
          <span>Audio {state.audio.enabled ? 'on' : 'muted'}</span>
          <kbd>M</kbd>
        </label>
        <label className="slider">
          <span>Volume</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(state.audio.volume * 100)}
            // Drives the filled portion of the track (see .slider input).
            style={{ '--fill': `${Math.round(state.audio.volume * 100)}%` }}
            onChange={(e) => actions.setAudio({ volume: Number(e.target.value) / 100 })}
            disabled={!state.audio.enabled}
          />
          <i>{Math.round(state.audio.volume * 100)}%</i>
        </label>
        <label className="switch">
          <input
            type="checkbox"
            checked={state.reducedMotion}
            onChange={(e) => dispatch({ type: 'motion/set', value: e.target.checked })}
          />
          <span>Reduced motion</span>
        </label>
      </div>

      <hr className="rule" />

      <div className="btn-row">
        <Danger
          label="Reset progress"
          confirm="Clear participation and all round results?"
          onConfirm={() => dispatch({ type: 'session/resetProgress' })}
        />
        <Danger
          label="Reset everything"
          confirm="Restore the sample roster and questions? This erases your edits."
          onConfirm={() => dispatch({ type: 'session/resetAll' })}
        />
      </div>
    </>
  )
}

/* ================================================================= */

function RosterTab({ state, dispatch }) {
  const [name, setName] = useState('')
  const [bulk, setBulk] = useState('')
  const [showBulk, setShowBulk] = useState(false)

  const add = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'student/add', name })
    setName('')
  }

  const bulkCount = bulk
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean).length

  return (
    <>
      <form className="add-row" onSubmit={add}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a student…"
          aria-label="New student name"
          maxLength={22}
        />
        <button className="btn btn--good" type="submit" disabled={!name.trim()}>
          Add
        </button>
      </form>

      {/* Typing a 45-name class one field at a time is nobody's idea of fun. */}
      <button className="btn btn--ghost" onClick={() => setShowBulk((v) => !v)}>
        {showBulk ? '× Close paste list' : '⇪ Paste whole class list'}
      </button>

      {showBulk && (
        <div className="bulk">
          <textarea
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={'One name per line…\n\nAarav\nPriya\nRohan'}
            aria-label="Paste class list, one name per line"
            rows={7}
          />
          <p className="hint">
            {bulkCount} name{bulkCount === 1 ? '' : 's'} detected. Replaces the roster —
            students whose names are unchanged keep their history.
          </p>
          <button
            className="btn btn--good"
            disabled={bulkCount === 0}
            onClick={() => {
              dispatch({ type: 'student/bulkSet', text: bulk })
              setBulk('')
              setShowBulk(false)
            }}
          >
            Load {bulkCount} students
          </button>
        </div>
      )}

      <p className="hint">
        {state.students.length} in the roster · new students join the pool immediately, and
        the algorithm never repeats anyone until everyone has had a turn.
      </p>

      <ul className="roster">
        {state.students.map((s) => (
          <li key={s.id} className="roster-row">
            <select
              className="swatch"
              value={s.colorId}
              onChange={(e) =>
                dispatch({ type: 'student/color', id: s.id, colorId: e.target.value })
              }
              aria-label={`Avatar colour for ${s.name}`}
              style={{
                '--sw': CREW_COLORS.find((c) => c.id === s.colorId)?.base ?? '#888',
              }}
            >
              {CREW_COLORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              value={s.name}
              onChange={(e) => dispatch({ type: 'student/rename', id: s.id, name: e.target.value })}
              aria-label={`Name for ${s.name}`}
              maxLength={22}
            />
            {s.ejected ? (
              <span className="chip chip--out">out</span>
            ) : (
              s.participated && <span className="chip chip--done">done</span>
            )}
            <button
              className="icon-btn"
              onClick={() => dispatch({ type: 'student/remove', id: s.id })}
              aria-label={`Remove ${s.name}`}
              title="Remove"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

/* ================================================================= */

function QuestionsTab({ state, dispatch }) {
  return (
    <>
      <p className="hint">
        <strong>Students</strong> — the algorithm picks one. <strong>Guest</strong> — for the
        guest speaker, no pick (with an algorithm fallback). <strong>Volunteer</strong> — anyone
        may answer; tap who did. Change any question's audience below.
      </p>
      <ul className="qlist">
        {state.questions.map((q) => (
          <li key={q.id} className={`qrow qrow--${q.mode}`}>
            <span className="qnum">
              {q.number}
              <em>{MODE_LABEL[q.mode]}</em>
            </span>
            <div className="qbody">
              <select
                className="qmode"
                value={q.mode}
                onChange={(e) => dispatch({ type: 'question/mode', id: q.id, mode: e.target.value })}
                aria-label={`Who answers question ${q.number}`}
              >
                {MODES.map((m) => (
                  <option key={m} value={m}>
                    {MODE_LABEL[m]}
                  </option>
                ))}
              </select>
              <textarea
                value={q.text}
                onChange={(e) => dispatch({ type: 'question/edit', id: q.id, text: e.target.value })}
                aria-label={`Question ${q.number}`}
                rows={3}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

/* ================================================================= */

function StatusTab({ state }) {
  const roster = [...state.students].sort((a, b) => a.name.localeCompare(b.name))
  const answered = state.rounds.filter((r) => r.status === 'answered').length
  const timeUp = state.rounds.filter((r) => r.status === 'timeup').length
  const ejected = state.students.filter((s) => s.ejected).length
  const participated = state.students.filter((s) => s.participated).length
  const online = state.students.length - ejected

  return (
    <>
      <div className="stats">
        <Stat label="Round" value={`${state.currentRound}/${TOTAL_ROUNDS}`} />
        <Stat label="Online" value={online} tone="good" />
        <Stat label="Logged out" value={ejected} tone="bad" />
        <Stat label="Answered" value={answered} />
        <Stat label="Time up" value={timeUp} tone="warn" />
        <Stat label="Took part" value={`${participated}/${state.students.length}`} />
        <Stat label="In pool" value={state.pool.length} tone="cool" />
      </div>

      <h3 className="sub">Students</h3>
      <ul className="scores">
        {roster.map((s) => (
          <li key={s.id} className={s.ejected ? 'is-ejected' : undefined}>
            <i
              className="pip"
              style={{ background: CREW_COLORS.find((c) => c.id === s.colorId)?.base }}
            />
            <span className="score-name">{displayName(s)}</span>
            {s.ejected ? (
              <span className="chip chip--out">⏻ logged out</span>
            ) : s.participated ? (
              <span className="chip chip--done">✓ took part</span>
            ) : (
              <span className="chip chip--wait">waiting</span>
            )}
            {state.pool.includes(s.id) && <span className="chip chip--pool">in pool</span>}
          </li>
        ))}
      </ul>

      <h3 className="sub">Rounds</h3>
      <ul className="rounds-log">
        {state.rounds.map((r) => {
          const m = modeOf(state, r.number)
          const who = state.students.find((s) => s.id === (r.answeredById ?? r.selectedId))
          const whoLabel = r.guestAnswered ? 'Guest' : who ? displayName(who) : '—'
          return (
            <li key={r.number} className={`log log--${r.status}`}>
              <span className="log-n">{r.number}</span>
              <span className={`log-mode log-mode--${m}`}>{MODE_LABEL[m]}</span>
              <span className="log-who">{whoLabel}</span>
              <span className="log-st">{r.status === 'timeup' ? 'time up' : r.status}</span>
            </li>
          )
        })}
      </ul>
    </>
  )
}

const fmt = (s) =>
  s == null ? '—' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function Stat({ label, value, tone }) {
  return (
    <div className={`stat${tone ? ` stat--${tone}` : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

/** Two-step destructive button so a stray tap can't wipe the session. */
function Danger({ label, confirm, onConfirm }) {
  const [armed, setArmed] = useState(false)
  return armed ? (
    <button
      className="btn btn--danger"
      onClick={() => {
        onConfirm()
        setArmed(false)
      }}
      onBlur={() => setArmed(false)}
      title={confirm}
      autoFocus
    >
      Confirm?
    </button>
  ) : (
    <button className="btn btn--ghost" onClick={() => setArmed(true)} title={confirm}>
      {label}
    </button>
  )
}

/** Original wordmark: a noodle curl inside a porthole. */
function NoodleMark() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="#1b2238" stroke="#0d1120" strokeWidth="4" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#4fe3ff" strokeWidth="2" opacity="0.6" />
      <path
        d="M12 25c0-8 7-11 11-7s-1 10-4 6 3-8 8-4"
        fill="none"
        stroke="#ffd23d"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
