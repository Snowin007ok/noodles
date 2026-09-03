import FeedFrame from './FeedFrame'
import CrewMember from './CrewMember'
import { feedLayout, castFor, SWIPE_OUT } from '../game/layout'
import { CREW_COLORS } from '../game/constants'
import { displayName } from '../game/state'

const colorById = (id) => CREW_COLORS.find((c) => c.id === id) ?? CREW_COLORS[0]

/**
 * The stage: the "For You" feed with every student as a profile card.
 *
 * `pickMode` turns the cards into real <button>s so the host can tap whoever
 * answered a volunteer question — keyboard and touch both work.
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
  // The feed shows a cast, not the whole roster — everyone still draws from
  // the full pool. Whoever is lit, picked or answering is forced onto the
  // feed so a selection is never invisible.
  const cast = castFor(students, displayCap, [spotlightId, caughtId, answeredById])
  const onlineCount = students.filter((s) => !s.ejected).length
  const offFeed = onlineCount - cast.length
  const grid = feedLayout(cast.length)

  /* The "gotcha" beat. When the algorithm locks in we need the picked card's
     centre so the spotlight, shockwave and sparks all originate from it. */
  const caughtIndex = cast.findIndex((s) => s.id === caughtId)
  const caughtSlot = phase === 'caught' && caughtIndex >= 0 ? grid.at(caughtIndex) : null

  // Size the name type so the LONGEST name on the feed fits its card.
  // Empirically (Fredoka, bold) a character is ~0.62em wide.
  const maxLen = Math.min(14, Math.max(6, ...cast.map((s) => displayName(s).length)))
  const nameFs = Math.min((grid.card * 0.9) / (0.62 * maxLen), grid.card * 0.155)

  return (
    <div className="stage">
      {/* .deck locks the 3:2 box the frame renders into, so card percentage
          coordinates line up with the artwork at every size. */}
      <div className={`deck${caughtSlot ? ' deck--punch' : ''}`}>
        <FeedFrame
          mode={mode}
          alarm={alarm}
          scrolling={phase === 'spinning'}
          lost={phase === 'ejecting'}
          online={onlineCount}
        />

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
            '--card-w': `${grid.card.toFixed(3)}cqw`,
            '--name-fs': `clamp(8px, ${nameFs.toFixed(3)}cqw, 24px)`,
          }}
        >
          {/* ---------- the pick: spotlight, shockwave, sparks ----------
              Three separate siblings rather than one wrapper: each needs its
              own z-index so the rings sit behind the picked card while the
              sparks fly in front of it. */}
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

          {/* ---------- the cards ---------- */}
          {cast.map((student, i) => {
            const slot = grid.at(i)
            const isSpot = student.id === spotlightId && phase === 'spinning'
            const isCaught = student.id === caughtId && phase !== 'lobby'
            const isFlying = launching && student.id === caughtId
            const isAnswerer = student.id === answeredById
            const pos = isFlying ? SWIPE_OUT : slot

            const cls = [
              'pcard',
              isSpot && 'pcard--spotlight',
              isCaught && 'pcard--caught',
              isFlying && 'pcard--flying',
              isAnswerer && 'pcard--answerer',
              student.participated && 'pcard--done',
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
                  // Deterministic per-index offsets so the idle float is not in lockstep.
                  '--bob-delay': `${(i % 7) * 0.31}s`,
                  '--bob-dur': `${3.4 + (i % 5) * 0.26}s`,
                  zIndex: isCaught || isSpot ? 150 : isAnswerer ? 120 : 10,
                }}
                {...interactive}
              >
                <span className="pcard-avatar">
                  <CrewMember color={colorById(student.colorId)} state={isSpot ? 'alert' : 'idle'} />
                </span>
                {/* title as a safety net: a very long name still ellipsises on a
                    big wall, and hovering must always recover it in full. */}
                <span className="pcard-name" title={displayName(student)}>
                  {displayName(student)}
                </span>
                <span className="pcard-meta">
                  {isCaught ? 'picked' : isAnswerer ? 'answering' : student.participated ? '✓ took part' : 'online'}
                </span>
                {isCaught && <span className="pcard-badge">1</span>}
              </Tag>
            )
          })}
        </div>

        {/* Be honest that the feed is a cast, not the whole class — otherwise
            "why isn't my student in there?" looks like a bug. */}
        {offFeed > 0 && (
          <span className="off-deck" title={`${offFeed} more students are in the pool but not on the feed`}>
            +{offFeed} more in pool
          </span>
        )}
      </div>

      {students.length === 0 && (
        <div className="stage-empty">
          <strong>Nobody on the feed</strong>
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
          <strong>Everyone is logged out</strong>
          <span>
            Every student has been logged out. Use <b>Reset progress</b> to bring
            them all back online.
          </span>
        </div>
      )}
    </div>
  )
}
