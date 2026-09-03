/**
 * NOODLES audio engine.
 *
 * Built on the Web Audio API rather than <audio> elements for one reason:
 * AudioBufferSourceNode.start(when) is sample-accurate, so we can land the
 * sting's dramatic impact on an exact animation frame. HTMLAudioElement.play()
 * has tens of milliseconds of unpredictable latency and cannot be scheduled.
 *
 * Autoplay policy is handled by construction: the AudioContext is only created
 * and resumed inside a click handler on the host's controls, which is a
 * genuine user gesture. Nothing plays before that.
 *
 * Everything except the licensed sting is synthesised here, on theme: the
 * scroll is scored with a dial-up modem handshake (the sound of the older
 * generation getting online), the ticks are notification pings, guests get a
 * "verified" chime, and a logout is a descending three-tone.
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

  /** One enveloped oscillator note. Returns nothing; tracked for stopAll. */
  _note({ type = 'sine', freq, at = 0, dur = 0.2, gain = 0.1, glideTo = null }) {
    const t0 = this.ctx.currentTime + at
    const osc = this.ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur)
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.02, dur / 4))
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(g).connect(this.master)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
    this._track(osc)
  }

  /**
   * The scroll bed: a dial-up modem handshake. Two dial tones, a burst of
   * answer-tone chirps, then a rising carrier sweep through a resonant filter
   * that peaks right as the feed locks in. Original, synthesised, and exactly
   * on topic for a talk about digital generations.
   */
  playModem(durationMs) {
    if (!this.ctx || !this.enabled) return
    const dur = durationMs / 1000
    const t0 = this.ctx.currentTime

    // Dial tones: DTMF-ish pairs.
    ;[
      [697, 1209],
      [770, 1336],
      [852, 1477],
    ].forEach(([a, b], i) => {
      this._note({ freq: a, at: i * 0.11, dur: 0.09, gain: 0.05 })
      this._note({ freq: b, at: i * 0.11, dur: 0.09, gain: 0.05 })
    })

    // Answer tone + chirps.
    this._note({ freq: 2100, at: 0.42, dur: 0.35, gain: 0.045 })
    for (let i = 0; i < 6; i++) {
      this._note({
        type: 'square',
        freq: 1200 + (i % 2) * 1000,
        at: 0.8 + i * 0.07,
        dur: 0.05,
        gain: 0.03,
      })
    }

    // Carrier sweep: the "connecting" hiss-and-rise that fills the scroll.
    const osc = this.ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(90, t0 + 1.1)
    osc.frequency.exponentialRampToValueAtTime(520, t0 + dur)

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 6
    filter.frequency.setValueAtTime(300, t0 + 1.1)
    filter.frequency.exponentialRampToValueAtTime(3200, t0 + dur)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t0 + 1.1)
    gain.gain.exponentialRampToValueAtTime(0.14, t0 + dur * 0.85)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

    osc.connect(filter).connect(gain).connect(this.master)
    osc.start(t0 + 1.1)
    osc.stop(t0 + dur + 0.05)
    this._track(osc)
  }

  /**
   * The ratchet of the reel: a short, woody clack per plate as the names go
   * by. A burst of filtered noise plus a low knock — it slows with the reel.
   */
  clack(strength = 1) {
    if (!this.ctx || !this.enabled) return
    const t0 = this.ctx.currentTime
    const len = Math.floor(this.ctx.sampleRate * 0.03)
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1400 + 600 * strength
    filter.Q.value = 1.2
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.12 * strength, t0)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04)
    src.connect(filter).connect(g).connect(this.master)
    src.start(t0)
    src.stop(t0 + 0.05)
    this._track(src)
    this._note({ type: 'square', freq: 150, dur: 0.03, gain: 0.04 * strength })
  }

  /** Notification ping — a softer tick for lighter moments. */
  ping(strength = 1) {
    if (!this.ctx || !this.enabled) return
    this._note({ type: 'sine', freq: 1320 + 380 * strength, dur: 0.07, gain: 0.05 * strength })
    this._note({ type: 'sine', freq: 1980 + 380 * strength, at: 0.01, dur: 0.05, gain: 0.025 * strength })
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

  /** Warm rising chime — a volunteer stepped up, or a guest took the floor. */
  chime() {
    if (!this.ctx || !this.enabled) return
    ;[523.25, 659.25, 783.99].forEach((f, i) =>
      this._note({ type: 'triangle', freq: f, at: i * 0.07, dur: 0.42, gain: 0.12 }),
    )
  }

  /** "Verified" — the two-note badge sound when a guest round opens. */
  verified() {
    if (!this.ctx || !this.enabled) return
    this._note({ type: 'sine', freq: 880, dur: 0.16, gain: 0.1 })
    this._note({ type: 'sine', freq: 1318.5, at: 0.14, dur: 0.34, gain: 0.12 })
    this._note({ type: 'triangle', freq: 1760, at: 0.14, dur: 0.3, gain: 0.03 })
  }

  /** Logout / signal lost — descending three-tone, the opposite of a boot-up. */
  logout() {
    if (!this.ctx || !this.enabled) return
    ;[880, 659.25, 440].forEach((f, i) =>
      this._note({ type: 'square', freq: f, at: i * 0.16, dur: 0.22, gain: 0.06 }),
    )
    this._note({ type: 'sawtooth', freq: 220, at: 0.5, dur: 0.6, gain: 0.05, glideTo: 60 })
  }
}

export const audio = new AudioEngine()
