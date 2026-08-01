import { reducer, initialState, displayName } from '../src/game/state.js'

const results = []
const check = (name, pass, detail='') => results.push({ name, pass, detail })

// --- 1. duplicate names in a pasted class list must become distinct students
let s = initialState()
s = reducer(s, { type: 'student/bulkSet', text: 'Aarav\nPriya\nAarav\nAarav\nPriya' })
const ids = s.students.map(x => x.id)
check('duplicate names -> unique ids', new Set(ids).size === ids.length,
  `${s.students.length} students, ${new Set(ids).size} unique ids`)
check('duplicate names -> all kept', s.students.length === 5,
  s.students.map(x=>x.name).join(','))
check('pool matches roster', s.pool.length === 5, `pool=${s.pool.length}`)

// --- 2. bulk paste preserves history for unchanged names
let t = initialState()
t = reducer(t, { type: 'student/bulkSet', text: 'Ana\nBen\nCid' })
const anaId = t.students[0].id
t = reducer(t, { type: 'student/eject', id: anaId })
t = reducer(t, { type: 'student/bulkSet', text: 'Ana\nBen\nCid\nDot' })
check('re-paste keeps ejected flag', t.students.find(x=>x.name==='Ana')?.ejected === true)
check('re-paste keeps same id', t.students.find(x=>x.name==='Ana')?.id === anaId)
check('ejected stays out of pool', !t.pool.includes(anaId), `pool=${t.pool.length}`)
check('new name joins pool', t.pool.includes(t.students.find(x=>x.name==='Dot').id))

// --- 3. blank name never renders empty
let u = initialState()
u = reducer(u, { type: 'student/rename', id: u.students[0].id, name: '   ' })
check('blank name -> placeholder', displayName(u.students[0]) === 'Unnamed crew',
  JSON.stringify(displayName(u.students[0])))

// --- 4. removing a student cleans every reference
let v = initialState()
const vid = v.students[3].id
v = reducer(v, { type: 'spin/commit', id: vid, pool: v.pool.filter(x=>x!==vid) })
v = reducer(v, { type: 'student/remove', id: vid })
check('remove clears caughtId', v.caughtId === null)
check('remove clears round.selectedId', v.rounds[0].selectedId === null)
check('remove clears pool entry', !v.pool.includes(vid))

// --- 5. ejecting everyone leaves an empty pool, no crash
let w = initialState()
for (const st of w.students) w = reducer(w, { type: 'student/eject', id: st.id })
check('all ejected -> empty pool', w.pool.length === 0, `pool=${w.pool.length}`)
check('all ejected -> roster intact', w.students.length === initialState().students.length)
w = reducer(w, { type: 'session/resetProgress' })
check('reset brings everyone back', w.students.every(x=>!x.ejected) && w.pool.length === w.students.length)

// --- 6. round statuses
let x = initialState()
check('rounds 2,4,7,9,10 are volunteer',
  x.rounds.filter(r=>r.open).map(r=>r.number).join(',') === '2,4,7,9,10')

// --- 7. volunteer pick marks answered, but not when someone was spun for
let y = initialState()
y = reducer(y, { type: 'round/goto', number: 2 })
y = reducer(y, { type: 'round/pickAnswerer', id: y.students[0].id })
check('volunteer pick -> answered', y.rounds[1].status === 'answered')
let z = initialState()
z = reducer(z, { type: 'round/goto', number: 2 })
const zid = z.students[1].id
z = reducer(z, { type: 'spin/commit', id: zid, pool: z.pool.filter(i=>i!==zid) })
z = reducer(z, { type: 'round/pickAnswerer', id: z.students[0].id })
check('spun volunteer round stays pending', z.rounds[1].status === 'pending', z.rounds[1].status)

const failed = results.filter(r => !r.pass)
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail?'  — '+r.detail:''}`)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length) process.exitCode = 1

/* --- migration: a session saved by an older build must not produce NaN --- */
import { load as _load } from '../src/game/state.js'
const store = {}
globalThis.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v },
}
// Simulate an old save: no displayCap, no ejected flag, legacy points field.
store['noodles.session.v1'] = JSON.stringify({
  version: 1, currentRound: 3, phase: 'lobby',
  students: [{ id: 'a', name: 'Ana', colorId: 'lime', points: 4, participated: true }],
  pool: ['a'], rounds: [], audio: { enabled: true },
})
const m = _load()
const ok = Number.isFinite(m.displayCap) && Number.isFinite(m.audio.volume)
  && Number.isFinite(m.currentRound) && m.students[0].ejected === false
  && Number.isFinite(m.students[0].timesSelected)
console.log(`${ok ? 'PASS' : 'FAIL'}  legacy save migrates without NaN` +
  `  — displayCap=${m.displayCap} volume=${m.audio.volume} ejected=${m.students[0].ejected}`)
if (!ok) process.exitCode = 1
