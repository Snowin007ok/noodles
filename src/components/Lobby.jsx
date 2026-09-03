import StreetScene from './StreetScene'
import Townsfolk from './Townsfolk'
import { feedLayout, castFor, SWIPE_OUT } from '../game/layout'
import { CREW_COLORS, ERAS } from '../game/constants'
import { displayName } from '../game/state'

const colorById = (id) => CREW_COLORS.find((c) => c.id === id) ?? CREW_COLORS[0]

/**
 * The stage: the street, with the class standing on the pavement as
 * townsfolk. Old world on the left, new world on the right, everyone
 * together in the middle.
 *
 * `pickMode` turns the figures into real <button>s so the host can tap
 * whoever answered a volunteer question — keyboard and touch both work.
 */
export default function Lobby({
  students,
  spotlightId,
  caughtId,
  phase,
  mode,
  alarm,
  launching,
  pickMode,
  showNames,
  answeredById,
  displayCap,
  onPick,
  onLoadSample,
}) {
  // The street shows a cast, not the whole roster — everyone still draws from
  // the full pool. Whoever is lit, picked or answering is always brought on.
  const cast = castFor(students, displayCap, [spotlightId, caughtId, answeredById])
  const onlineCount = students.filter((s) => !s.ejected).length
  const offStage = onlineCount - cast.length
  const grid = feedLayout(cast.length)

  /* The moment the algorithm locks in: the picked figure's spot, so the stage
     light, shockwave and sparks all originate from where they stand. */
  const caughtIndex = cast.findIndex((s) => s.id === caughtId)
  const caughtSlot = phase === 'caught' && caughtIndex >= 0 ? grid.at(caughtIndex) : null

  // Size the name plates so the LONGEST name on stage fits its slot.
  // Empirically (Fredoka, bold) a character is ~0.62em wide.
  const maxLen = Math.min(14, Math.max(6, ...cast.map((s) => displayName(s).length)))
  const nameFs = Math.min((grid.card * 1.05) / (0.62 * maxLen), grid.card * 0.17)

  return (
    <div className="stage">
      {/* .deck locks the 3:2 box the scene renders into, so figure percentage
          coordinates line up with the pavement at every size. */}
      <div className={`deck${caughtSlot ? ' deck--punch' : ''}`}>
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

        <div
          className={[
            'deck-layers',
            pickMode && 'deck-layers--picking',
            showNames && 'deck-layers--names',
            phase === 'spinning' && 'deck-layers--scrolling',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            '--folk-w': `${grid.card.toFixed(3)}cqw`,
            '--name-fs': `clamp(8px, ${nameFs.toFixed(3)}cqw, 24px)`,
          }}
        >
          {/* ---------- the pick: stage light, shockwave, sparks ---------- */}
          {caughtSlot && (
            <>
              <div
                className="fx-spot"
                style={{ '--fx-x': `${caughtSlot.x}%`, '--fx-y': `${caughtSlot.y}%` }}
              />
              <div className="fx-burst" style={{ left: `${caughtSlot.x}%`, top: `${caughtSlot.y}%` }}>
                <span className="fx-glow" />
                <span className="fx-ring" />
                <span className="fx-ring fx-ring--2" />
              </div>
              <div className="fx-sparks" style={{ left: `${caughtSlot.x}%`, top: `${caughtSlot.y}%` }}>
                {Array.from({ length: 12 }, (_, s) => (
                  <span
                    key={s}
                    style={{
                      '--a': `${s * 30 + (s % 3) * 7}deg`,
                      '--d': `${7 + (s % 4) * 2.6}cqw`,
                      '--sd': `${(s % 5) * 0.035}s`,
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* ---------- the townsfolk ---------- */}
          {cast.map((student, i) => {
            const slot = grid.at(i)
            const isSpot = student.id === spotlightId && phase === 'spinning'
            const isCaught = student.id === caughtId && phase !== 'lobby'
            const isFlying = launching && student.id === caughtId
            const isAnswerer = student.id === answeredById
            const pos = isFlying ? SWIPE_OUT : slot
            // Stable per-student silhouette: hash the id so re-sorting the
            // roster never turns a grandma into a teenager.
            const variant = [...student.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 8

            const cls = [
              'folk',
              isSpot && 'folk--spotlight',
              isCaught && 'folk--caught',
              isFlying && 'folk--flying',
              isAnswerer && 'folk--answerer',
              student.participated && 'folk--done',
            ]
              .filter(Boolean)
              .join(' ')

            const Tag = pickMode ? 'button' : 'div'
            const interactive = pickMode
              ? {
                  type: 'button',
                  onClick: () => onPick?.(student.id),
                  'aria-pressed': isAnswerer,
                  'aria-label': `Select ${displayName(student)} as the student who answered`,
                }
              : { 'aria-hidden': 'true' }

            return (
              <Tag
                key={student.id}
                className={cls}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  '--bob-delay': `${(i % 7) * 0.31}s`,
                  '--bob-dur': `${3.4 + (i % 5) * 0.26}s`,
                  // Rows further down the pavement are nearer the viewer.
                  zIndex: isCaught || isSpot ? 150 : isAnswerer ? 120 : 10 + Math.round(slot.y),
                }}
                {...interactive}
              >
                {(isCaught || isAnswerer) && (
                  <span className={`folk-bubble${isCaught ? ' folk-bubble--pick' : ' folk-bubble--hand'}`}>
                    {isCaught ? '!' : '✋'}
                  </span>
                )}
                <span className="folk-art">
                  <Townsfolk
                    color={colorById(student.colorId)}
                    variant={variant}
                    state={isSpot ? 'alert' : 'idle'}
                  />
                </span>
                {/* title as a safety net: a very long name still ellipsises in a
                    big class, and hovering must always recover it in full. */}
                <span className="folk-name" title={displayName(student)}>
                  {displayName(student)}
                </span>
              </Tag>
            )
          })}
        </div>

        {/* Be honest that the street shows a cast, not the whole class —
            otherwise "why isn't my student in there?" looks like a bug. */}
        {offStage > 0 && (
          <span className="off-deck" title={`${offStage} more students are in the pool but not on the street`}>
            +{offStage} more in pool
          </span>
        )}
      </div>

      {students.length === 0 && (
        <div className="stage-empty">
          <strong>The street is empty</strong>
          <span>
            Add students in the <b>Roster</b> tab, or paste your whole class list
            at once.
          </span>
          <button className="btn btn--good stage-empty-btn" onClick={onLoadSample}>
            ▶ Load sample class
          </button>
        </div>
      )}

      {students.length > 0 && students.every((s) => s.ejected) && (
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
