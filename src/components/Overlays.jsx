/**
 * Full-stage overlays: the pick banner, the guest/volunteer call, and the
 * question card. All sized for a classroom projector.
 */

import { TOTAL_ROUNDS, SESSION } from '../game/constants'

export function CaughtBanner({ name, visible }) {
  return (
    <div className={`banner${visible ? ' banner--in' : ''}`} role="status" aria-live="assertive">
      <div className="banner-inner">
        <span className="banner-kicker">🔔 New notification</span>
        <span className="banner-title">THE ALGORITHM CHOSE</span>
        <span className="banner-name">{name}</span>
      </div>
    </div>
  )
}

/** Guest and volunteer rounds open with a call to the room instead of a pick. */
export function ModeBanner({ mode, visible }) {
  const guest = mode === 'guest'
  return (
    <div
      className={`banner banner--open banner--${mode}${visible ? ' banner--in' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="banner-inner">
        <span className="banner-kicker">{guest ? '✓ Verified' : '✋ All hands'}</span>
        <span className="banner-title">{guest ? 'GUEST QUESTION' : 'RAISE YOUR HAND'}</span>
        <span className="banner-name">{guest ? 'OVER TO OUR GUEST' : 'ANYONE MAY ANSWER'}</span>
        <span className="banner-sub">
          {guest ? 'No guest in the room? Let the algorithm pick' : 'Host taps whoever speaks up'}
        </span>
      </div>
    </div>
  )
}

/**
 * End of session. Appears once every round has an outcome — otherwise a class
 * finishes round 10 and the screen just sits there with nothing to say.
 */
export function SessionSummary({ ejected, answered, timeUp, aboard, total, onRestart, onDismiss }) {
  return (
    <section className="summary" role="dialog" aria-modal="true" aria-label="Session complete">
      <div className="summary-inner">
        <p className="summary-kicker">✦ All {TOTAL_ROUNDS} rounds complete · {SESSION.title}</p>
        <h1 className="summary-title">SESSION COMPLETE</h1>

        <div className="summary-stats">
          <div className="sstat">
            <strong>{answered}</strong>
            <span>Answered</span>
          </div>
          <div className="sstat sstat--bad">
            <strong>{ejected.length}</strong>
            <span>Logged out</span>
          </div>
          {timeUp > 0 && (
            <div className="sstat sstat--warn">
              <strong>{timeUp}</strong>
              <span>Time up</span>
            </div>
          )}
          <div className="sstat sstat--good">
            <strong>
              {aboard}
              <i>/{total}</i>
            </strong>
            <span>Still online</span>
          </div>
        </div>

        {ejected.length > 0 && (
          <div className="summary-list">
            <h2>Logged out</h2>
            <ul>
              {ejected.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="summary-actions">
          <button className="btn btn--hero" onClick={onRestart}>
            ↻ New session
          </button>
          <button className="btn btn--ghost" onClick={onDismiss}>
            Review rounds
          </button>
        </div>
      </div>
    </section>
  )
}

const statusLabel = (status, round) => {
  if (status === 'answered') return round?.guestAnswered ? '✓ Guest answered' : '✓ Answered in time'
  if (status === 'ejected') return '⏻ Logged out — time up'
  if (status === 'timeup') return '⏱ Time up'
  return null
}

/**
 * The question takes the whole stage for EVERY kind of round — this is what
 * the room reads from the back. What sits above the question changes:
 *   students  — the picked student's name, huge
 *   guest     — "OVER TO OUR GUEST"
 *   volunteer — the volunteer's name once tapped; until then a wall of name
 *               chips the host taps, so recording who answered never needs the
 *               street to be visible
 */
export function QuestionCard({
  round,
  mode,
  question,
  status,
  challengerName,
  answererName,
  pickMode,
  students = [],
  onPick,
  timeLeft,
  running,
  totalSeconds,
  ejecting,
  onStart,
  onGuestAnswered,
}) {
  const label = statusLabel(status, round)
  const clockIdle = timeLeft == null && status === 'pending'
  const guest = mode === 'guest' && !challengerName
  const volunteer = mode === 'volunteer' && !challengerName
  const needsVolunteer = volunteer && pickMode && !answererName && status === 'pending'

  const kicker = challengerName
    ? '🔔 The algorithm chose'
    : guest
      ? '✓ Guest question'
      : '✋ Volunteer round'

  const headline = challengerName
    ? challengerName
    : guest
      ? round.guestAnswered
        ? 'OUR GUEST ANSWERED'
        : 'OVER TO OUR GUEST'
      : answererName
        ? answererName
        : 'WHO IS ANSWERING?'

  return (
    <section className={`takeover takeover--${mode}`} aria-live="polite">
      <div className="takeover-inner">
        <p className="takeover-kicker">
          <span>{kicker}</span>
          <span className="takeover-round">
            Round {round.number} / {TOTAL_ROUNDS}
          </span>
        </p>

        <h1 className={`takeover-name${challengerName || answererName ? '' : ' takeover-name--label'}`}>
          {headline}
        </h1>

        {label && <span className={`qcard-status qcard-status--${status}`}>{label}</span>}

        <p className="takeover-question">{question?.text || '(no question set)'}</p>

        {/* Volunteer round, nobody tapped yet: the class as name chips. The host
            taps one; the audience reads it as "raise your hand". */}
        {needsVolunteer && (
          <div className="takeover-picks" role="group" aria-label="Who answered?">
            {[...students]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`pick-chip${s.participated ? ' pick-chip--done' : ''}`}
                  onClick={() => onPick?.(s.id)}
                >
                  {s.name.trim() || 'Unnamed student'}
                </button>
              ))}
          </div>
        )}

        {timeLeft != null && (
          <Countdown
            seconds={timeLeft}
            total={totalSeconds}
            running={running}
            ejecting={ejecting}
            done={status === 'ejected' || status === 'timeup'}
            doneLabel={status === 'ejected' ? 'LOGGED OUT — TIME UP' : 'TIME UP'}
            big
          />
        )}

        <div className="takeover-actions">
          {clockIdle && (
            <button className="btn btn--hero" onClick={onStart}>
              ▶ Start 2:00 <kbd>Space</kbd>
            </button>
          )}
          {guest && status === 'pending' && (
            <button className="btn btn--good" onClick={onGuestAnswered}>
              ✓ Guest answered <kbd>G</kbd>
            </button>
          )}
          {(status === 'ejected' || status === 'timeup') && (
            <button className="btn btn--warn" onClick={onStart}>
              ↻ Another 2:00
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

/** MM:SS countdown with a draining bar. Turns amber under 30s, red under 10s. */
function Countdown({ seconds, total, running, ejecting, done, doneLabel, big }) {
  const spent = ejecting || done
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const pct = spent ? 0 : Math.max(0, Math.min(100, (seconds / total) * 100))
  const tone = spent || seconds <= 10 ? 'crit' : seconds <= 30 ? 'warn' : 'ok'

  const label = ejecting
    ? 'LOGGING OUT'
    : done
      ? doneLabel
      : running
        ? 'TIME TO ANSWER'
        : 'READY'

  return (
    <div
      className={`clock clock--${tone}${running ? ' clock--running' : ''}${
        spent ? ' clock--out' : ''
      }${big ? ' clock--big' : ''}`}
    >
      <div className="clock-row">
        <span className="clock-label">{label}</span>
        <time className="clock-time" role="timer" aria-live="off">
          {spent ? '00:00' : `${mm}:${ss}`}
        </time>
      </div>
      <div className="clock-track">
        <div className="clock-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
