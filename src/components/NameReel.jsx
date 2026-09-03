import { useEffect, useRef, useState } from 'react'
import { CREW_COLORS, MODE_COPY } from '../game/constants'
import { displayName } from '../game/state'

/**
 * The retro name reel — a vintage wood-and-brass machine with a window of
 * name plates. Idle, the reel drifts slowly. On a pick it spins hard, blurs,
 * decelerates with the clack of the ratchet, and lands the chosen plate dead
 * centre as the marquee bulbs flash. The surprise is the deceleration: the
 * room watches the names slow down and nobody knows where it stops.
 *
 * The strip is the online roster repeated several times. Positions are in
 * PLATES (one plate = --plate-h), so no pixel measuring is ever needed: the
 * strip's translateY is just a count of plates.
 */

const TURNS = 3 // full rotations before the reel is allowed to stop
const COPIES = TURNS + 3 // enough plates for the current position + the turns + the landing

const colorById = (id) => CREW_COLORS.find((c) => c.id === id) ?? CREW_COLORS[0]

export default function NameReel({
  students,
  spinTarget,
  caughtId,
  phase,
  mode,
  roundNumber,
  spinMs,
  alarm,
  ejecting,
}) {
  const n = Math.max(1, students.length)

  // Resting position in plates; starts one full copy in so there is always a
  // plate visible above the centre.
  const posRef = useRef(n)
  const [offset, setOffset] = useState(n)
  const [instant, setInstant] = useState(true)

  // The parent re-filters the roster every render, so `students` is a new
  // array each time. Key the spin on the ids and roll ONCE per target —
  // otherwise every spotlight re-render adds another three turns and the strip
  // flies off into the distance.
  const idsKey = students.map((s) => s.id).join('|')
  const rolledFor = useRef(null)

  /* A pick: compute how far to roll so the target lands in the centre after
     at least TURNS full rotations, then let the CSS transition do the spin. */
  useEffect(() => {
    if (phase !== 'spinning' || !spinTarget) return
    if (rolledFor.current === spinTarget) return
    const ids = idsKey.split('|')
    const targetIdx = ids.indexOf(spinTarget)
    if (targetIdx < 0) return
    rolledFor.current = spinTarget
    const cur = posRef.current
    const curIdx = ((cur % n) + n) % n
    const delta = (targetIdx - curIdx + n) % n
    const next = cur + TURNS * n + delta
    posRef.current = next
    setInstant(false)
    setOffset(next)
  }, [phase, spinTarget, idsKey, n])

  /* Back in the lobby for a new round: silently snap the position back into
     the first copy so the strip never grows and the next spin has room. */
  useEffect(() => {
    if (phase !== 'lobby') return
    rolledFor.current = null
    const cur = posRef.current
    const rest = (((cur % n) + n) % n) + n
    posRef.current = rest
    setInstant(true)
    setOffset(rest)
  }, [phase, n])

  const idle = phase === 'lobby' && students.length > 1
  const locked = phase === 'caught' || phase === 'question' || phase === 'ejecting'
  const showMode = mode !== 'students' && phase === 'lobby'

  const cls = [
    'reel',
    idle && !showMode && 'reel--idle',
    phase === 'spinning' && 'reel--spinning',
    locked && 'reel--locked',
    alarm && 'reel--alarm',
    ejecting && 'reel--ejecting',
  ]
    .filter(Boolean)
    .join(' ')

  const stripStyle = {
    '--n': n,
    '--offset': offset,
    transition: instant ? 'none' : `transform ${spinMs}ms cubic-bezier(0.1, 0.86, 0.14, 1)`,
  }

  return (
    <div className={cls} aria-hidden="true">
      <div className="reel-bulbs reel-bulbs--top">
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ '--i': i }} />
        ))}
      </div>

      <div className="reel-cabinet">
        <div className="reel-plaque">
          <span>NOODLES</span>
          <b>THE ALGORITHM</b>
          <span>ROUND {roundNumber}</span>
        </div>

        <div className="reel-window">
          <div className="reel-strip" style={stripStyle}>
            {Array.from({ length: COPIES }, (_, c) =>
              students.map((s) => {
                const isWinner = locked && s.id === caughtId
                return (
                  <div
                    key={`${c}-${s.id}`}
                    className={[
                      'plate',
                      isWinner && 'plate--winner',
                      s.participated && !isWinner && 'plate--done',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ '--accent': colorById(s.colorId).base }}
                  >
                    <i className="plate-dot" />
                    <span className="plate-name">{displayName(s)}</span>
                    {s.participated && !isWinner && <em className="plate-tag">✓</em>}
                  </div>
                )
              }),
            )}
            {students.length === 0 && <div className="plate plate--empty">— nobody in the pool —</div>}
          </div>

          {/* glass: shading top and bottom, brass pointers at the centre line */}
          <div className="reel-glass" />
          <i className="reel-pointer reel-pointer--l" />
          <i className="reel-pointer reel-pointer--r" />

          {showMode && (
            <div className={`reel-mode reel-mode--${mode}`}>
              <b>{mode === 'guest' ? '✓ Guest question' : '✋ Volunteer round'}</b>
              <span>{MODE_COPY[mode].hud}</span>
              <small>
                {mode === 'guest'
                  ? 'Over to our speaker · no guest? the algorithm picks'
                  : 'Reveal, then tap who answered · nobody? the algorithm picks'}
              </small>
            </div>
          )}
        </div>

        <div className="reel-lever">
          <i className="reel-lever-arm" />
          <i className="reel-lever-knob" />
        </div>
      </div>

      <div className="reel-bulbs reel-bulbs--bottom">
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ '--i': i }} />
        ))}
      </div>

      <div className="reel-feet" />
    </div>
  )
}
