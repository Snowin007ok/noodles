/**
 * Street layout.
 *
 * The class stands on the pavement in rows — the "cast" of the street. Rows
 * pick whatever column count gives the biggest figure that still fits, so 6
 * students stand tall and 45 form a tidy crowd instead of a smudge.
 *
 * Positions are percentages of the deck box (locked to 3:2), so the street
 * scales cleanly from a laptop to a classroom projector. A figure's spot
 * depends only on its index and the cast size, so nobody wanders when scores
 * change.
 */

/** Deck is 3:2, so one horizontal percent is 1.5x taller in vertical percent. */
const ASPECT = 1200 / 800

/** Figure height as a multiple of its width (figure + name plate). */
const FIGURE_RATIO = 1.85

/** The pavement — the band the class stands on, in deck percent. The scene's
 *  buildings end at y≈62%; figures stand from there to just above the bottom. */
export const FEED_AREA = { left: 4, right: 96, top: 66, bottom: 95 }

/** Off the right edge of the street — where a logged-out figure walks to. */
export const SWIPE_OUT = { x: 130, y: 84 }

/**
 * Work out the rows for `total` figures.
 * Returns the figure width (as % of deck width — usable directly as cqw) and
 * an `at(i)` that maps an index to the figure's centre in deck percent.
 */
export function feedLayout(total) {
  const n = Math.max(1, total)
  const areaW = FEED_AREA.right - FEED_AREA.left
  const areaH = FEED_AREA.bottom - FEED_AREA.top

  let best = null
  for (let cols = 1; cols <= 15; cols++) {
    const rows = Math.ceil(n / cols)
    const cellW = areaW / cols
    const cellH = areaH / rows
    // A figure S wide (width-%) is FIGURE_RATIO*S tall in width units, which is
    // FIGURE_RATIO*S*ASPECT in height-%. Rows may overlap a little vertically
    // (people stand in front of each other), so allow 1.25x the cell height.
    const s = Math.min(cellW * 0.9, (cellH * 1.25) / (FIGURE_RATIO * ASPECT))
    if (!best || s > best.s) best = { cols, rows, s, cellW, cellH }
  }

  const { cols, rows, s, cellW, cellH } = best
  return {
    cols,
    rows,
    card: s,
    at(i) {
      const row = Math.floor(i / cols)
      const col = i % cols
      // Centre a short final row instead of leaving it ragged-left, and
      // stagger alternate rows half a step so a crowd reads as a crowd.
      const inRow = row === rows - 1 ? n - row * cols : cols
      const stagger = rows > 1 && row % 2 === 1 && inRow === cols ? cellW * 0.18 : 0
      const offset = ((cols - inRow) / 2) * cellW
      return {
        x: FEED_AREA.left + offset + stagger + (col + 0.5) * cellW,
        y: FEED_AREA.top + (row + 0.5) * cellH,
      }
    },
  }
}

/**
 * Choose which students actually appear on the street.
 *
 * The roster and the cast are deliberately separate: a class of 45 all stands
 * in the pool and can be drawn, but 45 figures on screen shrinks everyone to a
 * thumbnail. So we show a fixed-size cast and let the rest wait off-stage —
 * they are still fully eligible for selection.
 *
 * Rules:
 *   · logged-out students are gone entirely
 *   · whoever is currently lit, picked or answering is ALWAYS on stage, so a
 *     pick is never invisible
 *   · otherwise take roster order, which keeps places stable between rounds
 */
export function castFor(students, cap, focusIds = []) {
  const aboard = students.filter((s) => !s.ejected)
  if (!cap || aboard.length <= cap) return aboard

  const focus = aboard.filter((s) => focusIds.includes(s.id))
  const rest = aboard.filter((s) => !focusIds.includes(s.id))
  return [...focus, ...rest.slice(0, Math.max(0, cap - focus.length))]
}
