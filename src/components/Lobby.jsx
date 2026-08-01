import LobbyRoom from './LobbyRoom'
import CrewMember from './CrewMember'
import { seatFor, crewScale, seatPitch, castFor, AIRLOCK } from '../game/layout'
import { CREW_COLORS } from '../game/constants'
import { displayName } from '../game/state'

const colorById = (id) => CREW_COLORS.find((c) => c.id === id) ?? CREW_COLORS[0]

/**
 * The stage: the room SVG with every crew member positioned over it.
 *
 * Art and name tags live in TWO separate layers. Each crew node carries a
 * transform (for the bob and the launch), and a transform creates a stacking
 * context — so a name nested inside its own crew node can never draw above a
 * neighbour's artwork. Hoisting the tags into their own layer guarantees every
 * name stays legible no matter how tightly the room is packed.
 *
 * `pickMode` turns the tags into real <button>s so the teacher can tap whoever
 * answered a volunteer question — keyboard and touch both work.
 */
export default function Lobby({
  students,
  spotlightId,
  caughtId,
  phase,
  alarm,
  airlockOpen,
  launching,
  pickMode,
  showNames,
  answeredById,
  displayCap,
  onPick,
}) {
  // The room seats a cast, not the whole roster — everyone still draws from the
  // full pool. Whoever is spotlit, caught or answering is forced on deck so a
  // selection is never invisible.
  const cast = castFor(students, displayCap, [spotlightId, caughtId, answeredById])
  const aboardCount = students.filter((s) => !s.ejected).length
  const offDeck = aboardCount - cast.length

  const flags = (student, i) => {
    const isSpot = student.id === spotlightId && phase === 'spinning'
    const isCaught = student.id === caughtId && phase !== 'lobby'
    return {
      slot: seatFor(i, cast.length),
      isSpot,
      isCaught,
      isFlying: launching && student.id === caughtId,
      isAnswerer: student.id === answeredById,
    }
  }

  return (
    <div className="stage">
      {/* .deck locks the same 3:2 box the room SVG renders into, so crew
          percentage coordinates line up with the artwork at every size. */}
      <div className="deck">
        <LobbyRoom alarm={alarm} airlockOpen={airlockOpen} />

        {/* Crew shrink as the class grows so 45 aboard still reads clearly. */}
        <div
          className="deck-layers"
          style={(() => {
            const pitch = seatPitch(cast.length)
            return {
              '--crew-w': `${crewScale(cast.length)}cqw`,
              // Cap tag width at the seat pitch (less a gap) so neighbouring
              // tags butt up but never overlap, whatever the names are.
              '--tag-max': `${(pitch * 0.94).toFixed(2)}cqw`,
              // Scale the type to that same pitch so a ~9-character name FITS
              // instead of ellipsising. Empirically: 9 chars ≈ 5.2em of text
              // plus 1.2em padding, so em-width ≈ pitch / 7.5.
              '--tag-fs': `clamp(8px, ${(pitch / 7.5).toFixed(3)}cqw, 19px)`,
            }
          })()}
        >
        {/* ---------- layer 1: artwork ---------- */}
        <div className="crew-layer">
          {cast.map((student, i) => {
            const { slot, isSpot, isCaught, isFlying, isAnswerer } = flags(student, i)
            const pos = isFlying ? AIRLOCK : slot

            const cls = [
              'crew',
              isSpot && 'crew--spotlight',
              isCaught && 'crew--caught',
              isFlying && 'crew--flying',
              isAnswerer && 'crew--answerer',
              student.participated && 'crew--done',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <div
                key={student.id}
                className={cls}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  // Deterministic per-index offsets so the idle bob is not in lockstep.
                  '--bob-delay': `${(i % 7) * 0.31}s`,
                  '--bob-dur': `${3.1 + (i % 5) * 0.24}s`,
                  // Top-down depth sort: crew lower on the deck draw in front.
                  zIndex: isCaught || isSpot ? 60 : 5 + Math.round(slot.y),
                }}
                // In pick mode the character itself is tappable, but the tag
                // below carries the accessible name — so this one is hidden
                // from assistive tech to avoid a duplicate control.
                onClick={pickMode ? () => onPick?.(student.id) : undefined}
                aria-hidden="true"
              >
                <span className="crew-art">
                  <CrewMember
                    color={colorById(student.colorId)}
                    state={isSpot ? 'alert' : 'idle'}
                  />
                </span>
              </div>
            )
          })}
        </div>

        {/* ---------- layer 2: name tags, always on top ----------
            Hidden by default — with a full class the tags bury the room. Only
            the spotlit / caught / answering crew member shows a name, unless
            the teacher turns them all on or is picking a volunteer. */}
        <div
          className={[
            'tag-layer',
            pickMode && 'tag-layer--picking',
            (showNames || pickMode) && 'tag-layer--names',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {cast.map((student, i) => {
            const { slot, isSpot, isCaught, isFlying, isAnswerer } = flags(student, i)

            const cls = [
              'tag',
              isSpot && 'tag--spotlight',
              isCaught && 'tag--caught',
              isFlying && 'tag--hidden',
              isAnswerer && 'tag--answerer',
              student.participated && 'tag--done',
            ]
              .filter(Boolean)
              .join(' ')

            const style = {
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              zIndex: isCaught || isSpot || isAnswerer ? 300 : 200 + Math.round(slot.y),
            }

            const Tag = pickMode ? 'button' : 'div'
            const interactive = pickMode
              ? {
                  type: 'button',
                  onClick: () => onPick?.(student.id),
                  'aria-pressed': isAnswerer,
                  'aria-label': `Select ${displayName(student)} as the student who answered`,
                }
              : {}

            return (
              <Tag key={student.id} className={cls} style={style} {...interactive}>
                {/* title as a safety net: a very long name still ellipsises in
                    a big class, and hovering must always recover it in full. */}
                <span className="tag-name" title={displayName(student)}>
                  {displayName(student)}
                  {/* Not while they're the one on the spot — the tick means
                      "has had a turn", not a verdict on this round. */}
                  {student.participated && !isCaught && !isSpot && (
                    <span className="tag-tick" title="Already participated">
                      ✓
                    </span>
                  )}
                </span>
              </Tag>
            )
          })}
        </div>
        </div>

        {/* Be honest that the room is a cast, not the whole class — otherwise
            "why isn't my student in there?" looks like a bug. */}
        {offDeck > 0 && (
          <span className="off-deck" title={`${offDeck} more crew are in the pool but not seated`}>
            +{offDeck} more in pool
          </span>
        )}
      </div>

      {students.length === 0 && (
        <div className="stage-empty">
          <strong>No crew aboard</strong>
          <span>
            Add students in the <b>Roster</b> tab, or paste your whole class list
            at once.
          </span>
        </div>
      )}

      {students.length > 0 && students.every((s) => s.ejected) && (
        <div className="stage-empty stage-empty--out">
          <strong>The craft is empty</strong>
          <span>
            Every crew member has been ejected. Use <b>Reset progress</b> to bring
            them all back aboard.
          </span>
        </div>
      )}
    </div>
  )
}
