import StreetScene from './StreetScene'
import NameReel from './NameReel'
import { ERAS } from '../game/constants'

/** Where the reel window sits on the deck, in percent — the pick FX fire here. */
const REEL_CENTER = { x: 50, y: 56 }

/**
 * The stage: the street as backdrop, the retro name reel in the middle of it.
 * No figures — the class lives inside the machine as name plates, and the
 * drama is the reel slowing down.
 */
export default function Lobby({
  students,
  spinTarget,
  caughtId,
  phase,
  mode,
  alarm,
  launching,
  roundNumber,
  spinMs,
  onLoadSample,
}) {
  const online = students.filter((s) => !s.ejected)
  const punch = phase === 'caught'

  return (
    <div className="stage">
      <div className={`deck${punch ? ' deck--punch' : ''}`}>
        <StreetScene alarm={alarm} lost={phase === 'ejecting'} />

        {/* Then → now ribbon along the top of the street. */}
        <ol className="era-ribbon" aria-hidden="true">
          {ERAS.map((era) => (
            <li key={era.year}>
              <b>{era.year}</b>
              <span>{era.label}</span>
            </li>
          ))}
        </ol>

        <div className="deck-layers">
          {/* ---------- the pick: stage light, shockwave, sparks ---------- */}
          {punch && (
            <>
              <div
                className="fx-spot"
                style={{ '--fx-x': `${REEL_CENTER.x}%`, '--fx-y': `${REEL_CENTER.y}%` }}
              />
              <div className="fx-burst" style={{ left: `${REEL_CENTER.x}%`, top: `${REEL_CENTER.y}%` }}>
                <span className="fx-glow" />
                <span className="fx-ring" />
                <span className="fx-ring fx-ring--2" />
              </div>
              <div className="fx-sparks" style={{ left: `${REEL_CENTER.x}%`, top: `${REEL_CENTER.y}%` }}>
                {Array.from({ length: 14 }, (_, s) => (
                  <span
                    key={s}
                    style={{
                      '--a': `${s * 26 + (s % 3) * 7}deg`,
                      '--d': `${9 + (s % 4) * 3}cqw`,
                      '--sd': `${(s % 5) * 0.035}s`,
                    }}
                  />
                ))}
              </div>
            </>
          )}

          <NameReel
            students={online}
            spinTarget={spinTarget}
            caughtId={caughtId}
            phase={phase}
            mode={mode}
            roundNumber={roundNumber}
            spinMs={spinMs}
            alarm={alarm}
            ejecting={launching}
          />
        </div>
      </div>

      {students.length === 0 && (
        <div className="stage-empty">
          <strong>The reel is empty</strong>
          <span>
            Add students in the <b>Roster</b> tab, or paste your whole class list
            at once.
          </span>
          <button className="btn btn--good stage-empty-btn" onClick={onLoadSample}>
            ▶ Load sample class
          </button>
        </div>
      )}

      {students.length > 0 && online.length === 0 && (
        <div className="stage-empty stage-empty--out">
          <strong>Everyone has logged out</strong>
          <span>
            Every student has been logged out. Use <b>Reset progress</b> to bring
            them all back.
          </span>
        </div>
      )}
    </div>
  )
}
