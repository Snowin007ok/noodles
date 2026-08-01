/**
 * Fair random selection.
 *
 * The pool is a shuffled "deck" of eligible student ids. Each draw pops the
 * tail of the deck, so nobody can be drawn twice until every eligible student
 * has had a turn. When the deck runs dry it is reshuffled — and re-drawn if the
 * new top card matches the student who was just picked, so there is no repeat
 * across the seam between cycles either.
 */

/** Cryptographically-backed random float in [0, 1) with a Math.random fallback. */
function rand() {
  const c = globalThis.crypto
  if (c && typeof c.getRandomValues === 'function') {
    const buf = new Uint32Array(1)
    c.getRandomValues(buf)
    return buf[0] / 4294967296
  }
  return Math.random()
}

/** Unbiased Fisher–Yates. Returns a new array; does not mutate the input. */
export function shuffle(items) {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Build a fresh deck from the roster.
 * @param {string[]} ids       every eligible student id
 * @param {string|null} avoidFirst  id that must not come out first (the student
 *                                  drawn immediately before the reshuffle)
 */
export function buildPool(ids, avoidFirst = null) {
  if (ids.length === 0) return []
  let deck = shuffle(ids)
  // The deck is popped from the tail, so "first out" is the last element.
  if (ids.length > 1 && avoidFirst && deck[deck.length - 1] === avoidFirst) {
    const swapAt = Math.floor(rand() * (deck.length - 1))
    ;[deck[swapAt], deck[deck.length - 1]] = [deck[deck.length - 1], deck[swapAt]]
  }
  return deck
}

/**
 * Draw one student.
 * @returns {{ id: string, pool: string[] }} the drawn id and the remaining deck
 */
export function drawFrom(pool, allIds, lastDrawn = null) {
  let deck = pool.filter((id) => allIds.includes(id))
  if (deck.length === 0) deck = buildPool(allIds, lastDrawn)
  if (deck.length === 0) return { id: null, pool: [] }
  const next = deck[deck.length - 1]
  return { id: next, pool: deck.slice(0, -1) }
}

/**
 * Keep an in-flight deck consistent with roster edits: drop departed students,
 * fold newly added ones into the remaining cards so they still get a turn this
 * cycle.
 */
export function reconcilePool(pool, allIds, alreadySelected = []) {
  const kept = pool.filter((id) => allIds.includes(id))
  const missing = allIds.filter(
    (id) => !kept.includes(id) && !alreadySelected.includes(id),
  )
  return missing.length ? shuffle([...kept, ...missing]) : kept
}
