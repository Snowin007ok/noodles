import { useState } from 'react'
import { CREW_COLORS, TOTAL_ROUNDS } from '../game/constants'
import { displayName } from '../game/state'

/**
 * The teacher's rail. Four tabs so the lobby keeps the screen:
 *   Control · Roster · Questions · Status
 */
export default function TeacherPanel({ state, dispatch, actions, clock }) {
  const [tab, setTab] = useState('control')

  return (
    <aside className="panel" aria-label="Teacher controls">
      <div className="panel-brand">
        <span className="panel-logo" aria-hidden="true">
          <NoodleMark />
        </span>
        <span>
          <strong>NOODLES</strong>
          <em>crew selection</em>
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

function ControlTab({ state, dispatch, actions, clock }) {
  const round = state.rounds.find((r) => r.number === state.currentRound)
  const question = state.questions[state.currentRound - 1]
  const busy = state.phase === 'spinning'
  const remaining = state.pool.length
  const eligible = state.students.filter((s) => !s.ejected).length

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
        {state.rounds.map((r) => (
          <li key={r.number}>
            <button
              className={[
                'dot',
                `dot--${r.status}`,
                r.number === state.currentRound && 'dot--now',
                r.open && 'dot--open',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => dispatch({ type: 'round/goto', number: r.number })}
              disabled={busy}
              title={`Round ${r.number} — ${r.open ? 'open' : 'random'} — ${r.status}`}
              aria-label={`Go to round ${r.number}, ${r.status}`}
            >
              {r.number}
            </button>
          </li>
        ))}
      </ol>

      <div className="card">
        <span className="card-label">
          {round.open ? 'Open question' : 'Individual challenge'}
        </span>
        <p className="card-q">
          {round.revealed ? question?.text : '••••••  hidden until revealed  ••••••'}
        </p>
      </div>

      {round.open && (
        <div className="open-note">
          <strong>VOLUNTEER ROUND</strong>
          <span>Tap the crew member who answered — or spin if nobody volunteers.</span>
        </div>
      )}

      <button
        className="btn btn--hero"
        onClick={actions.spin}
        disabled={busy || eligible === 0}
      >
        {busy
          ? 'SELECTING…'
          : round.open
            ? 'NO VOLUNTEERS? SPIN'
            : round.selectedId
              ? 'RE-SPIN'
              : 'SELECT RANDOM STUDENT'}
        <kbd>S</kbd>
      </button>
      <p className="pool-line">
        Pool: <strong>{remaining}</strong> of {eligible} aboard
        {state.students.length !== eligible &&
          ` · ${state.students.length - eligible} ejected`}
      </p>

      <button
        className="btn btn--reveal"
        onClick={() => dispatch({ type: 'round/reveal' })}
        disabled={
          round.revealed || busy || (!round.open && !round.selectedId) || state.phase === 'caught'
        }
      >
        Reveal Question <kbd>R</kbd>
      </button>

      {/* Clock: the teacher decides when the two minutes begin. */}
      {round.selectedId && round.revealed && round.status !== 'answered' && (
        <div className="clock-controls">
          <span className="clock-controls-label">
            {clock.running
              ? `Counting down — ${fmt(clock.secondsLeft)} to ejection`
              : 'Clock not started'}
          </span>
          {clock.running ? (
            <p className="hint">
              No pause, no extension. At zero the airlock cycles.
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
            ? 'Time ran out — the impostor was ejected to space.'
            : round.status === 'answered'
              ? 'Answered by a volunteer. Move to the next round.'
              : round.selectedId
                ? 'Question is on screen. Start the clock when ready.'
                : 'Volunteer round — tap whoever answered.'}
        </p>
      )}

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
            onChange={(e) => actions.setAudio({ volume: Number(e.target.value) / 100 })}
            disabled={!state.audio.enabled}
          />
          <i>{Math.round(state.audio.volume * 100)}%</i>
        </label>
        <label className="switch">
          <input
            type="checkbox"
            checked={state.showNames}
            onChange={(e) => dispatch({ type: 'names/set', value: e.target.checked })}
          />
          <span>Show all names</span>
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
          placeholder="Add crew member…"
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
            Load {bulkCount} crew
          </button>
        </div>
      )}

      <p className="hint">{state.students.length} aboard</p>

      <ul className="roster">
        {state.students.map((s) => (
          <li key={s.id} className="roster-row">
            <select
              className="swatch"
              value={s.colorId}
              onChange={(e) =>
                dispatch({ type: 'student/color', id: s.id, colorId: e.target.value })
              }
              aria-label={`Suit colour for ${s.name}`}
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
            {s.participated && <span className="chip chip--done">done</span>}
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
        Rounds <strong>2, 4, 7, 9, 10</strong> are volunteer rounds — anyone may answer.
        The rest pick one crew member at random.
      </p>
      <ul className="qlist">
        {state.questions.map((q) => (
          <li key={q.id} className={`qrow${q.open ? ' qrow--open' : ''}`}>
            <span className="qnum">
              {q.number}
              {q.open && <em>open</em>}
            </span>
            <textarea
              value={q.text}
              onChange={(e) => dispatch({ type: 'question/edit', id: q.id, text: e.target.value })}
              aria-label={`Question ${q.number}`}
              rows={3}
            />
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
  const ejected = state.students.filter((s) => s.ejected).length
  const participated = state.students.filter((s) => s.participated).length
  const aboard = state.students.length - ejected

  return (
    <>
      <div className="stats">
        <Stat label="Round" value={`${state.currentRound}/${TOTAL_ROUNDS}`} />
        <Stat label="Aboard" value={aboard} tone="good" />
        <Stat label="Ejected" value={ejected} tone="bad" />
        <Stat label="Answered" value={answered} />
        <Stat label="Took part" value={`${participated}/${state.students.length}`} />
        <Stat label="In pool" value={state.pool.length} tone="cool" />
      </div>

      <h3 className="sub">Crew</h3>
      <ul className="scores">
        {roster.map((s) => (
          <li key={s.id} className={s.ejected ? 'is-ejected' : undefined}>
            <i
              className="pip"
              style={{ background: CREW_COLORS.find((c) => c.id === s.colorId)?.base }}
            />
            <span className="score-name">{displayName(s)}</span>
            {s.ejected ? (
              <span className="chip chip--out">⏻ ejected</span>
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
          const who = state.students.find((s) => s.id === (r.answeredById ?? r.selectedId))
          return (
            <li key={r.number} className={`log log--${r.status}`}>
              <span className="log-n">{r.number}</span>
              <span className="log-mode">{r.open ? 'open' : 'random'}</span>
              <span className="log-who">{who ? displayName(who) : '—'}</span>
              <span className="log-st">{r.status}</span>
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
