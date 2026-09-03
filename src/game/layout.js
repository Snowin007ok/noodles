/**
 * Feed layout.
 *
 * The class appears as profile cards on a wall — the "For You" feed. Cards sit
 * in a centred grid inside the device frame; the grid picks whatever column
 * count gives the biggest card that still fits, so 6 students get big cards
 * and 45 get a tidy 9-wide wall instead of a smudge.
 *
 * Positions are percentages of the deck box (which is locked to 3:2), so the
 * feed scales cleanly from a laptop to a classroom projector. A card's slot
 * depends only on its index and the cast size, so nobody jumps around the
 * wall when scores change.
 */

/** Deck is 3:2, so one horizontal percent is 1.5x taller in vertical percent. */
const ASPECT = 1200 / 800

/** Card height as a multiple of its width (avatar + name + status line). */
const CARD_RATIO = 1.24

/** The scrollable feed region inside the device frame, in deck percent. */
export const FEED_AREA = { left: 3.5, right: 96.5, top: 17, bottom: 86.5 }

/** Off the right edge of the feed — where a logged-out card is swiped to. */
export const SWIPE_OUT = { x: 132, y: 50 }

/**
 * Work out the grid for `total` cards.
 * Returns the card width (as % of deck width — usable directly as cqw) and an
 * `at(i)` that maps a card index to its centre in deck percent.
 */
export function feedLayout(total) {
  const n = Math.max(1, total)
  const areaW = FEED_AREA.right - FEED_AREA.left
  const areaH = FEED_AREA.bottom - FEED_AREA.top

  let best = null
  for (let cols = 1; cols <= 12; cols++) {
    const rows = Math.ceil(n / cols)
    const cellW = areaW / cols
    const cellH = areaH / rows
    // A card S wide (width-%) is CARD_RATIO*S tall in width units, which is
    // CARD_RATIO*S*ASPECT in height-%. Leave breathing room in both axes.
    const s = Math.min(cellW * 0.86, (cellH * 0.9) / (CARD_RATIO * ASPECT))
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
      // Centre a short final row instead of leaving it ragged-left.
      const inRow = row === rows - 1 ? n - row * cols : cols
      const offset = ((cols - inRow) / 2) * cellW
      return {
        x: FEED_AREA.left + offset + (col + 0.5) * cellW,
        y: FEED_AREA.top + (row + 0.5) * cellH,
      }
    },
  }
}

/**
 * Choose which students actually appear on the feed.
 *
 * The roster and the cast are deliberately separate: a class of 45 all stands
 * in the pool and can be drawn, but 45 cards on screen shrinks everyone to a
 * thumbnail. So we show a fixed-size cast and let the rest wait off-feed —
 * they are still fully eligible for selection.
 *
 * Rules:
 *   · logged-out students are gone entirely
 *   · whoever is currently lit, picked or answering is ALWAYS on the feed, so
 *     a pick is never invisible
 *   · otherwise take roster order, which keeps cards stable between rounds
 */
export function castFor(students, cap, focusIds = []) {
  const aboard = students.filter((s) => !s.ejected)
  if (!cap || aboard.length <= cap) return aboard

  const focus = aboard.filter((s) => focusIds.includes(s.id))
  const rest = aboard.filter((s) => !focusIds.includes(s.id))
  return [...focus, ...rest.slice(0, Math.max(0, cap - focus.length))]
}
