import { reducer, initialState, displayName, save, load, modeOf } from '../src/game/state.js'
import { TOTAL_ROUNDS, SAMPLE_QUESTIONS, SAMPLE_STUDENTS } from '../src/game/constants.js'

// Minimal localStorage shim so save()/load() are testable in Node.
globalThis.localStorage = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
})()

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
check('blank name -> placeholder', displayName(u.students[0]) === 'Unnamed student',
  JSON.stringify(displayName(u.students[0])))

// --- 4. removing a student cleans every reference
let v = initialState()
const vid = v.students[3].id
v = reducer(v, { type: 'spin/commit', id: vid, pool: v.pool.filter(x=>x!==vid) })
v = reducer(v, { type: 'student/remove', id: vid })
check('remove clears caughtId', v.caughtId === null)
check('remove clears round.selectedId', v.rounds[0].selectedId === null)
check('remove clears pool entry', !v.pool.includes(vid))

// --- 5. logging everyone out leaves an empty pool, no crash
let w = initialState()
for (const st of w.students) w = reducer(w, { type: 'student/eject', id: st.id })
check('all logged out -> empty pool', w.pool.length === 0, `pool=${w.pool.length}`)
check('all logged out -> roster intact', w.students.length === initialState().students.length)
w = reducer(w, { type: 'session/resetProgress' })
check('reset brings everyone back', w.students.every(x=>!x.ejected) && w.pool.length === w.students.length)

// --- 6. the session deck: ten rounds, modes come from the questions
let x = initialState()
check('ten rounds', x.rounds.length === 10 && TOTAL_ROUNDS === 10)
check('guest rounds are 2 and 4',
  x.rounds.filter(r => modeOf(x, r.number) === 'guest').map(r=>r.number).join(',') === '2,4')
check('volunteer round is 6',
  x.rounds.filter(r => modeOf(x, r.number) === 'volunteer').map(r=>r.number).join(',') === '6')
check('the rest are student rounds',
  x.rounds.filter(r => modeOf(x, r.number) === 'students').length === 7)
check('questions are the session prompts verbatim',
  x.questions.every((q, i) => q.text === SAMPLE_QUESTIONS[i].text))

// --- 7. volunteer pick marks answered, but not when the algorithm picked someone
let y = initialState()
y = reducer(y, { type: 'round/goto', number: 6 })
y = reducer(y, { type: 'round/pickAnswerer', id: y.students[0].id })
check('volunteer tap -> answered', y.rounds[5].status === 'answered')
check('volunteer tap -> participated', y.students[0].participated === true)
let z = initialState()
z = reducer(z, { type: 'round/goto', number: 6 })
const zid = z.students[1].id
z = reducer(z, { type: 'spin/commit', id: zid, pool: z.pool.filter(i=>i!==zid) })
z = reducer(z, { type: 'round/pickAnswerer', id: z.students[0].id })
check('picked volunteer round stays pending', z.rounds[5].status === 'pending', z.rounds[5].status)

// --- 8. guest rounds: guest answered closes the round without touching students
let g = initialState()
g = reducer(g, { type: 'round/goto', number: 2 })
g = reducer(g, { type: 'round/reveal' })
g = reducer(g, { type: 'round/guestAnswered' })
check('guest answered -> answered', g.rounds[1].status === 'answered' && g.rounds[1].guestAnswered === true)
check('guest answered -> no student marked', g.students.every(st => !st.participated))
check('guest answered -> pool untouched', g.pool.length === g.students.length)

// --- 9. time up closes a round without logging anyone out
let tu = initialState()
tu = reducer(tu, { type: 'round/goto', number: 2 })
tu = reducer(tu, { type: 'round/reveal' })
tu = reducer(tu, { type: 'round/timeup' })
check('time up -> status timeup', tu.rounds[1].status === 'timeup')
check('time up -> nobody logged out', tu.students.every(st => !st.ejected))

// --- 10. a host can change who a question is for
let qm = initialState()
qm = reducer(qm, { type: 'question/mode', id: 'q1', mode: 'guest' })
check('question mode edit re-labels round', modeOf(qm, 1) === 'guest')
qm = reducer(qm, { type: 'question/mode', id: 'q1', mode: 'bogus' })
check('bogus mode rejected', modeOf(qm, 1) === 'guest')

// --- 11. re-running a round voids its previous outcome
let rr = initialState()
rr = reducer(rr, { type: 'round/goto', number: 2 })
rr = reducer(rr, { type: 'round/guestAnswered' })
rr = reducer(rr, { type: 'spin/start' })
check('re-run clears guestAnswered + status',
  rr.rounds[1].status === 'pending' && rr.rounds[1].guestAnswered === false)

// --- 12. an emptied roster self-heals on load, keeping edited questions
let e1 = initialState()
for (const st of [...e1.students]) e1 = reducer(e1, { type: 'student/remove', id: st.id })
e1 = reducer(e1, { type: 'question/edit', id: 'q1', text: 'CUSTOM QUESTION' })
save(e1)
const healed = load()
check('empty roster self-heals on load',
  healed.students.length === initialState().students.length,
  `restored ${healed.students.length} students`)
check('self-heal keeps edited questions', healed.questions[0].text === 'CUSTOM QUESTION')
check('self-heal rebuilds pool', healed.pool.length === healed.students.length)
localStorage.clear()

// --- 13. Load sample button refills an emptied roster in place
let e2 = initialState()
e2 = reducer(e2, { type: 'question/edit', id: 'q2', text: 'KEEP ME' })
for (const st of [...e2.students]) e2 = reducer(e2, { type: 'student/remove', id: st.id })
e2 = reducer(e2, { type: 'roster/loadSample' })
check('loadSample refills roster',
  e2.students.length > 0 && e2.pool.length === e2.students.length,
  `${e2.students.length} online, pool ${e2.pool.length}`)
check('loadSample keeps questions', e2.questions[1].text === 'KEEP ME')

// --- 14. migration: a session saved by the previous build (8 rounds, `open` flags)
localStorage.setItem('noodles.session.v1', JSON.stringify({
  version: 1, currentRound: 3, phase: 'lobby',
  students: [{ id: 'a', name: 'Ana', colorId: 'lime', points: 4, participated: true }],
  pool: ['a'],
  rounds: [{ number: 1, status: 'answered', open: false }, { number: 2, status: 'pending', open: true }],
  questions: [
    { id: 'q1', text: 'OLD ONE', open: false },
    { id: 'q2', text: 'OLD TWO', open: true },
  ],
  audio: { enabled: true },
}))
const m = load()
check('legacy save migrates without NaN',
  Number.isFinite(m.displayCap) && Number.isFinite(m.audio.volume) && Number.isFinite(m.currentRound)
  && m.students[0].ejected === false && Number.isFinite(m.students[0].timesSelected))
check('legacy open flag -> volunteer mode', m.questions[1].mode === 'volunteer' && m.questions[0].mode === 'students')
check('legacy text kept, missing slots filled', m.questions[0].text === 'OLD ONE' && m.questions.length === 10
  && m.questions[9].text === SAMPLE_QUESTIONS[9].text)
check('legacy rounds padded to ten', m.rounds.length === 10 && m.rounds[0].status === 'answered')
localStorage.clear()

// --- 15. the reel is told where to stop at spin start, and forgets it on load
let sp = initialState()
sp = reducer(sp, { type: 'spin/start', target: sp.students[4].id })
check('spin/start stores the reel target', sp.spinTarget === sp.students[4].id && sp.phase === 'spinning')
save(sp)
const reloaded = load()
check('reload lands in the lobby with no target', reloaded.phase === 'lobby' && reloaded.spinTarget === null)
localStorage.clear()

// --- 16. a rebuilt class list replaces an untouched saved roster, never an edited one
let rb = initialState()
rb.students = rb.students.map((s, i) => (i === 0 ? { ...s, name: 'OLD BUILD NAME' } : s)) // pretend the build changed
save(rb)
const refreshed = load()
check('untouched saved roster adopts the new build list',
  refreshed.students[0].name === SAMPLE_STUDENTS[0],
  refreshed.students[0].name)
check('adopted roster rebuilds the pool', refreshed.pool.length === refreshed.students.length)
let cu = initialState()
cu = reducer(cu, { type: 'student/rename', id: cu.students[0].id, name: 'Host Edited' })
save(cu)
const kept = load()
check('host-edited roster is left alone', kept.students[0].name === 'Host Edited' && kept.rosterSource === 'custom')
let st = initialState()
st.students = st.students.map((s, i) => (i === 0 ? { ...s, name: 'OLD BUILD NAME' } : s))
st = reducer(st, { type: 'round/reveal' }) // a round has started
save(st)
const started = load()
check('started session keeps its roster even if untouched', started.students[0].name === 'OLD BUILD NAME')
localStorage.clear()

const failed = results.filter(r => !r.pass)
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail?'  — '+r.detail:''}`)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length) process.exitCode = 1
