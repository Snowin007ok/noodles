import { buildPool, drawFrom } from '../src/game/shuffle.js'

const N = 45
const ids = Array.from({ length: N }, (_, i) => `s${i}`)

// 1) No repeat until everyone has had a turn, across many cycles.
let pool = buildPool(ids), last = null
let seen = new Set(), cycles = 0, violations = 0, seam = 0
for (let d = 0; d < 45000; d++) {
  const { id, pool: p } = drawFrom(pool, ids, last)
  if (seen.has(id)) violations++
  seen.add(id)
  if (last === id) seam++
  last = id; pool = p
  if (seen.size === N) { seen = new Set(); cycles++ }
}

// 2) Distribution flatness over one-cycle draws.
const counts = Object.fromEntries(ids.map(i => [i, 0]))
let pl = buildPool(ids), lastd = null
for (let d = 0; d < 45000; d++) {
  const r = drawFrom(pl, ids, lastd); counts[r.id]++; lastd = r.id; pl = r.pool
}
const vals = Object.values(counts)
const min = Math.min(...vals), max = Math.max(...vals), mean = vals.reduce((a,b)=>a+b,0)/N

// 3) Shrinking roster (people get ejected) still never repeats within a cycle.
let alive = [...ids], p3 = buildPool(alive), l3 = null, v3 = 0, s3 = new Set()
for (let r = 0; r < 40; r++) {
  const { id, pool: np } = drawFrom(p3, alive, l3)
  if (s3.has(id)) v3++
  s3.add(id); l3 = id; p3 = np
  alive = alive.filter(x => x !== id)      // ejected: off the craft
  p3 = p3.filter(x => alive.includes(x))
}

console.log(JSON.stringify({
  draws: 45000, cycles, repeatsWithinCycle: violations, backToBackAcrossSeam: seam,
  distribution: { min, max, mean, spreadPct: +(((max-min)/mean)*100).toFixed(2) },
  ejectionScenario: { rounds: 40, repeats: v3, distinct: s3.size, aliveLeft: alive.length },
}, null, 1))
