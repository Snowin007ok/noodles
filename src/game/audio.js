/**
 * NOODLES audio engine.
 *
 * Built on the Web Audio API rather than <audio> elements for one reason:
 * AudioBufferSourceNode.start(when) is sample-accurate, so we can land the
 * sting's dramatic impact on an exact animation frame. HTMLAudioElement.play()
 * has tens of milliseconds of unpredictable latency and cannot be scheduled.
 *
 * Autoplay policy is handled by construction: the AudioContext is only created
 * and resumed inside the click handler for the teacher's Spin button, which is
 * a genuine user gesture. Nothing plays before that.
 */

import { TIMING } from './constants'

// Built from BASE_URL rather than a hardcoded '/', so this still resolves
// once the app is served from a subpath (e.g. GitHub Pages' /noodles/).
const STING_URL = `${import.meta.env.BASE_URL}audio/reveal-sting.mp3`

class AudioEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.buffer = null
    this.loading = null
    this.active = [] // nodes currently playing, so stopAll() can kill them
    this.volume = 0.8
    this.enabled = true
  }

  /** Must be called from a user gesture. Safe to call repeatedly. */
  async unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return false
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.enabled ? this.volume : 0
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume()
      } catch {
        return false
      }
    }
    return true
  }

  /** Fetch + decode the sting once, then cache the AudioBuffer. */
  async load() {
    if (this.buffer) return this.buffer
    if (!this.ctx) return null
    if (!this.loading) {
      this.loading = fetch(STING_URL)
        .then((r) => {
          if (!r.ok) throw new Error(`sting ${r.status}`)
          return r.arrayBuffer()
        })
        .then((ab) => this.ctx.decodeAudioData(ab))
        .then((buf) => {
          this.buffer = buf
          return buf
        })
        .catch((err) => {
          console.warn('[noodles] sting unavailable, falling back to synth', err)
          this.loading = null
          return null
        })
    }
    return this.loading
  }

  setVolume(v) {
    this.volume = Math.min(1, Math.max(0, v))
    if (this.master) {
      const t = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(t)
      this.master.gain.setTargetAtTime(this.enabled ? this.volume : 0, t, 0.02)
    }
  }

  setEnabled(on) {
    this.enabled = on
    if (this.master) {
      const t = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(t)
      this.master.gain.setTargetAtTime(on ? this.volume : 0, t, 0.02)
    }
    if (!on) this.stopAll()
  }

  _track(node) {
    this.active.push(node)
    node.onended = () => {
      this.active = this.active.filter((n) => n !== node)
    }
  }

  stopAll() {
    for (const n of this.active) {
      try {
        n.stop()
      } catch {
        /* already stopped */
      }
    }
    this.active = []
  }

  /**
   * Original synthesised riser that covers the name-cycling phase, so there is
   * audio the instant the teacher presses the button (as the brief requires)
   * without burning the sting's impact early.
   *
   * A sawtooth sweeping upward through a resonant low-pass, plus a tick per
   * highlight step.
   */
  playRiser(durationMs) {
    if (!this.ctx || !this.enabled) return
    const t0 = this.ctx.currentTime
    const dur = durationMs / 1000

    const osc = this.ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(70, t0)
    osc.frequency.exponentialRampToValueAtTime(420, t0 + dur)

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.Q.value = 9
    filter.frequency.setValueAtTime(200, t0)
    filter.frequency.exponentialRampToValueAtTime(2600, t0 + dur)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(0.16, t0 + dur * 0.85)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

    osc.connect(filter).connect(gain).connect(this.master)
    osc.start(t0)
    osc.stop(t0 + dur + 0.05)
    this._track(osc)
  }

  /** Short blip fired on each name highlight during the spin. */
  tick(strength = 1) {
    if (!this.ctx || !this.enabled) return
    const t0 = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(880 + 260 * strength, t0)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.05 * strength, t0)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045)

    osc.connect(gain).connect(this.master)
    osc.start(t0)
    osc.stop(t0 + 0.06)
    this._track(osc)
  }

  /**
   * Schedule the supplied sting so its impact peak lands exactly `atMs` from
   * now. Returns the GainNode so the caller can fade it later.
   */
  playSting(atMs) {
    if (!this.ctx || !this.enabled || !this.buffer) return null
    const when = this.ctx.currentTime + Math.max(0, atMs) / 1000

    const src = this.ctx.createBufferSource()
    src.buffer = this.buffer

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(1, when)

    src.connect(gain).connect(this.master)
    src.start(when)
    this._track(src)
    this.stingGain = gain
    return gain
  }

  /** Fade whatever the sting is currently doing down to silence. */
  fadeSting(durationMs = TIMING.audioFadeDur) {
    if (!this.ctx || !this.stingGain) return
    const t = this.ctx.currentTime
    const g = this.stingGain.gain
    g.cancelScheduledValues(t)
    g.setValueAtTime(Math.max(g.value, 0.0001), t)
    g.exponentialRampToValueAtTime(0.0001, t + durationMs / 1000)
  }

  /** Warm, non-alarming chime for awarding a participation point. */
  chime() {
    if (!this.ctx || !this.enabled) return
    const t0 = this.ctx.currentTime
    ;[523.25, 659.25, 783.99].forEach((f, i) => {
      const osc = this.ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = f
      const gain = this.ctx.createGain()
      const start = t0 + i * 0.07
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42)
      osc.connect(gain).connect(this.master)
      osc.start(start)
      osc.stop(start + 0.45)
      this._track(osc)
    })
  }
}

export const audio = new AudioEngine()
