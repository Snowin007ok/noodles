/**
 * Presenter mode's host bar: everything the host needs during a round, in a
 * slim strip the audience can ignore. The full panel (roster, questions,
 * settings) stays one key away — H.
 */

import { TOTAL_ROUNDS, MODE_LABEL } from '../game/constants'

const fmt = (s) =>
  s == null ? '' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function HostBar({ state, round, mode, actions, clock, onNext, onPrev, onExit }) {
  const busy = state.phase === 'spinning' || state.phase === 'ejecting'
  const eligible = state.students.some((s) => !s.ejected)
  const canReveal =
    !round.revealed && !busy && !(mode === 'students' && !round.selectedId) && state.phase !== 'caught'
  const canStart = round.revealed && round.status === 'pending' && !clock.running && !busy
  const canGuest = mode === 'guest' && round.revealed && round.status === 'pending' && !busy

  return (
    <div className="hostbar" role="toolbar" aria-label="Host controls">
      <span className="hostbar-round">
        <b>{state.currentRound}</b>/{TOTAL_ROUNDS} · {MODE_LABEL[mode]}
        {clock.running && <i className="hostbar-clock">{fmt(clock.secondsLeft)}</i>}
      </span>

      <button
        className="btn btn--ghost hostbar-btn"
        onClick={onPrev}
        disabled={state.currentRound === 1 || busy}
        aria-label="Previous round"
      >
        ‹
      </button>

      <button className="btn btn--hero hostbar-btn" onClick={actions.spin} disabled={busy || !eligible}>
        {busy ? '…' : mode === 'students' ? 'Pick' : 'Algorithm picks'} <kbd>S</kbd>
      </button>

      <button className="btn btn--reveal hostbar-btn" onClick={actions.reveal} disabled={!canReveal}>
        Reveal <kbd>R</kbd>
      </button>

      {canStart && (
        <button className="btn btn--warn hostbar-btn" onClick={clock.start}>
          ▶ 2:00 <kbd>␣</kbd>
        </button>
      )}

      {canGuest && (
        <button className="btn btn--good hostbar-btn" onClick={actions.guestAnswered}>
          ✓ Guest <kbd>G</kbd>
        </button>
      )}

      <button
        className="btn btn--ghost hostbar-btn"
        onClick={onNext}
        disabled={state.currentRound === TOTAL_ROUNDS || busy}
        aria-label="Next round"
      >
        Next ›
      </button>

      <button className="btn btn--ghost hostbar-btn hostbar-exit" onClick={onExit} title="Show the full controls (H)">
        ⚙ <kbd>H</kbd>
      </button>
    </div>
  )
}
