/**
 * Full-stage overlays: the catch banner, the open-question call, and the
 * question card. All sized for a classroom projector.
 */

export function CaughtBanner({ name, visible }) {
  return (
    <div
      className={`banner${visible ? ' banner--in' : ''}`}
      role="status"
      aria-live="assertive"
    >
      <div className="banner-inner">
        <span className="banner-kicker">⚠ AIRLOCK CYCLE INITIATED</span>
        <span className="banner-title">IMPOSTOR</span>
        <span className="banner-name">{name}</span>
      </div>
    </div>
  )
}

export function OpenBanner({ visible }) {
  return (
    <div
      className={`banner banner--open${visible ? ' banner--in' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="banner-inner">
        <span className="banner-kicker">✦ ALL HANDS</span>
        <span className="banner-title">OPEN QUESTION</span>
        <span className="banner-name">ANYONE MAY ANSWER</span>
        <span className="banner-sub">Volunteers — raise a hand</span>
      </div>
    </div>
  )
}

/**
 * End of session. Appears once every round has an outcome — otherwise a class
 * finishes round 10 and the screen just sits there with nothing to say.
 */
export function SessionSummary({ ejected, answered, aboard, total, onRestart, onDismiss }) {
  return (
    <section className="summary" role="dialog" aria-modal="true" aria-label="Session complete">
      <div className="summary-inner">
        <p className="summary-kicker">✦ All ten rounds complete</p>
        <h1 className="summary-title">MISSION COMPLETE</h1>

        <div className="summary-stats">
          <div className="sstat">
            <strong>{answered}</strong>
            <span>Answered</span>
          </div>
          <div className="sstat sstat--bad">
            <strong>{ejected.length}</strong>
            <span>Ejected</span>
          </div>
          <div className="sstat sstat--good">
            <strong>
              {aboard}
              <i>/{total}</i>
            </strong>
            <span>Still aboard</span>
          </div>
        </div>

        {ejected.length > 0 && (
          <div className="summary-list">
            <h2>Lost to space</h2>
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

export function QuestionCard({
  round,
  question,
  status,
  challengerName,
  answererName,
  pickMode,
  timeLeft,
  running,
  totalSeconds,
  ejecting,
  onStart,
}) {
  /* Once somebody has been caught, the name and the question take the whole
     stage — this is what the class is reading from the back of the room.
     Volunteer rounds keep the compact bottom card so the teacher can still see
     the lobby and tap whoever answered. */
  if (challengerName) {
    return (
      <section className="takeover" aria-live="polite">
        <div className="takeover-inner">
          <p className="takeover-kicker">
            <span>⚠ Impostor identified</span>
            <span className="takeover-round">Round {round.number} / 10</span>
          </p>

          <h1 className="takeover-name">{challengerName}</h1>

          {status !== 'pending' && (
            <span className={`qcard-status qcard-status--${status}`}>
              {status === 'answered' ? '✓ Answered in time' : '⏻ Ejected — time up'}
            </span>
          )}

          <p className="takeover-question">{question?.text || '(no question set)'}</p>

          {timeLeft != null && (
            <Countdown
              seconds={timeLeft}
              total={totalSeconds}
              running={running}
              ejecting={ejecting}
              done={status === 'ejected'}
              big
            />
          )}

          <div className="takeover-actions">
            {timeLeft == null && status === 'pending' && (
              <button className="btn btn--hero" onClick={onStart}>
                ▶ Start 2:00 <kbd>Space</kbd>
              </button>
            )}
            {status === 'ejected' && (
              <button className="btn btn--warn" onClick={onStart}>
                ↻ Another 2:00
              </button>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="qcard" aria-live="polite">
      <header className="qcard-head">
        <span className="qcard-round">
          Round {round.number} / 10 {round.open && <em>· volunteer round</em>}
        </span>
        {status !== 'pending' && (
          <span className={`qcard-status qcard-status--${status}`}>
            {status === 'answered' ? '✓ Answered in time' : '⏻ Ejected — time up'}
          </span>
        )}
      </header>

      <p className="qcard-text">{question?.text || '(no question set)'}</p>

      {round.open && (
        <p className="qcard-hint">
          {answererName ? (
            <>
              Answering: <strong>{answererName}</strong>
            </>
          ) : pickMode ? (
            <>Tap a crew member in the lobby to record who answered.</>
          ) : null}
        </p>
      )}

      {/* No clock here: a volunteer round with nobody caught is untimed. The
          moment a name is drawn, the full-stage takeover above owns the round
          instead. */}
    </section>
  )
}

/** MM:SS countdown with a draining bar. Turns amber under 30s, red under 10s. */
function Countdown({ seconds, total, running, ejecting, done, big }) {
  const spent = ejecting || done
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const pct = spent ? 0 : Math.max(0, Math.min(100, (seconds / total) * 100))
  const tone = spent || seconds <= 10 ? 'crit' : seconds <= 30 ? 'warn' : 'ok'

  const label = ejecting
    ? 'AIRLOCK CYCLING'
    : done
      ? 'EJECTED — TIME UP'
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
