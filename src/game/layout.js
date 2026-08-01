/**
 * Seating plan.
 *
 * The crew sit around the edge of the common room, on the bench run that
 * follows all four walls — the way a waiting lobby actually reads from above.
 *
 * Seats are placed by walking the bench perimeter and dropping each student at
 * an equal arc-length interval. Doing it by arc length (rather than picking
 * from a fixed list of candidate seats) means the class is always evenly
 * spaced, corners are never double-booked, and a class of 6 rings the room just
 * as neatly as a class of 30.
 *
 * Positions are percentages of the deck box so the room scales cleanly from a
 * laptop to a classroom projector. A seat depends only on the student's index
 * and the class size, so nobody swaps chairs when scores change.
 */

/** The bench ring, in deck percentages. Matches the benches drawn in LobbyRoom. */
const RING = { left: 11.5, right: 89, top: 24, bottom: 85.5 }

/** Deck is 3:2, so one horizontal percent is 1.5x wider in pixels than one vertical. */
const ASPECT = 1200 / 800

/** The airlock hatch owns this band of the right wall — no seats in the doorway. */
const HATCH = { from: 36, to: 64 }

/** Second row of seating, inset from the benches. Clears the holo-table. */
const RING_2 = { left: 22.5, right: 77.5, top: 34, bottom: 76 }

/** Third row: a tight ellipse around the holo-table itself. */
const RING_3 = { rx: 13.5, ry: 17.5, cx: 50, cy: 50.5, start: -90 }
const RING_3_CAP = 10

/**
 * The bench perimeter as a list of straight runs, clockwise from the top-left
 * corner. The hatch is simply left out, so no seat can ever land in it.
 * `len` is in pixel-equivalents so horizontal and vertical runs are comparable.
 */
const seg = (x1, y1, x2, y2) => ({
  x1,
  y1,
  x2,
  y2,
  len: Math.abs(x2 - x1) * ASPECT + Math.abs(y2 - y1),
})

/** Build a closed rectangular walk, optionally with a gap in the right wall. */
function rectRuns({ left, right, top, bottom }, gap) {
  const runs = gap
    ? [
        seg(left, top, right, top),
        seg(right, top, right, gap.from),
        seg(right, gap.to, right, bottom),
        seg(right, bottom, left, bottom),
        seg(left, bottom, left, top),
      ]
    : [
        seg(left, top, right, top),
        seg(right, top, right, bottom),
        seg(right, bottom, left, bottom),
        seg(left, bottom, left, top),
      ]
  return runs.filter((r) => r.len > 0)
}

function makePath(runs) {
  const total = runs.reduce((n, r) => n + r.len, 0)
  return {
    total,
    /** Map a distance along the path to an {x, y} deck percentage. */
    at(distance) {
      let d = ((distance % total) + total) % total
      for (const r of runs) {
        if (d <= r.len) {
          const t = r.len === 0 ? 0 : d / r.len
          return { x: r.x1 + (r.x2 - r.x1) * t, y: r.y1 + (r.y2 - r.y1) * t }
        }
        d -= r.len
      }
      const last = runs[runs.length - 1]
      return { x: last.x2, y: last.y2 }
    },
  }
}

const BENCH_PATH = makePath(rectRuns(RING, HATCH))
const SECOND_PATH = makePath(rectRuns(RING_2))

/** Seats per row, sized so nobody is sitting in a neighbour's lap. */
const BENCH_CAP = Math.max(4, Math.floor(BENCH_PATH.total / 12))
const SECOND_CAP = Math.max(4, Math.floor(SECOND_PATH.total / 13))

/**
 * Decide how many students go in each row, outermost first. Doing the split up
 * front lets every row space its own occupants evenly, so a class of 45 reads
 * as three tidy rings rather than one packed ring and a ragged remainder.
 */
function allocate(n) {
  const r1 = Math.min(n, BENCH_CAP)
  const r2 = Math.min(n - r1, SECOND_CAP)
  const r3 = Math.min(n - r1 - r2, RING_3_CAP)
  return { r1, r2, r3, rest: n - r1 - r2 - r3 }
}

export function seatFor(index, total) {
  const n = Math.max(1, total)
  const { r1, r2, r3 } = allocate(n)

  // Row 1 — the wall benches. Half-step offset keeps seats off the corners.
  if (index < r1) return BENCH_PATH.at(((index + 0.5) / r1) * BENCH_PATH.total)

  let k = index - r1
  // Row 2 — a second rectangle inside the benches.
  if (k < r2) return SECOND_PATH.at(((k + 0.5) / r2) * SECOND_PATH.total)

  k -= r2
  // Row 3 — ringed around the holo-table.
  if (k < r3) {
    const angle = ((RING_3.start + (360 / r3) * k) * Math.PI) / 180
    return {
      x: RING_3.cx + Math.cos(angle) * RING_3.rx,
      y: RING_3.cy + Math.sin(angle) * RING_3.ry,
    }
  }

  // Anyone still standing packs into a tidy grid on the middle deck.
  const j = k - r3
  return { x: 30 + (j % 6) * 8, y: 46 + Math.floor(j / 6) * 8 }
}

/**
 * Horizontal gap between neighbouring seats on the tightest occupied row, as a
 * percentage of deck WIDTH. Name tags are capped to this so two adjacent tags
 * can never overlap, however long the names are.
 *
 * Path lengths are in pixel-equivalents (horizontal runs were multiplied by
 * ASPECT), so dividing by ASPECT converts a spacing back into deck-width
 * percent — the axis a tag actually grows along.
 */
export function seatPitch(total) {
  const n = Math.max(1, total)
  const { r1, r2, r3 } = allocate(n)
  const pitches = []
  if (r1) pitches.push(BENCH_PATH.total / r1 / ASPECT)
  if (r2) pitches.push(SECOND_PATH.total / r2 / ASPECT)
  // Row 3 is an ellipse; its tightest horizontal spacing is across the top.
  if (r3) pitches.push((2 * Math.PI * RING_3.rx) / r3)
  return pitches.length ? Math.min(...pitches) : 100
}

/**
 * Crew scale as a fraction of the room width. Big classes need smaller crew or
 * the rings collide — 6.6% of the room at 16 students, easing down to ~4.4% by
 * the time a full 45 are aboard.
 */
export function crewScale(total) {
  const n = Math.max(1, total)
  return Math.max(4.2, Math.min(6.8, 6.8 - Math.max(0, n - 18) * 0.075))
}

/** Where the ejected crew member ends up: outside the hull, in open space. */
export const AIRLOCK = { x: 128, y: 50 }
