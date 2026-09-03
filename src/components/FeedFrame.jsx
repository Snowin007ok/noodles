/**
 * The device around the feed: a status bar, the feed tabs, a faint scroll
 * track, and the era dock along the bottom — the generational arc from
 * newspapers and letters to always-on and AI that both talks trace.
 *
 * Cards are NOT drawn here — Lobby positions them over this frame so they can
 * be animated, focused and tapped independently.
 */

import { ERAS, SESSION, MODE_LABEL } from '../game/constants'

const TABS = [
  { mode: 'students', label: SESSION.feedName },
  { mode: 'guest', label: 'Verified Guest' },
  { mode: 'volunteer', label: 'Raise Hand' },
]

export default function FeedFrame({ mode, alarm, scrolling, lost, online }) {
  return (
    <div
      className={[
        'feed',
        alarm && 'feed--alarm',
        scrolling && 'feed--scrolling',
        lost && 'feed--lost',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      {/* ---- status bar ---- */}
      <div className="feed-status">
        <span className="feed-status-brand">
          <NoodleGlyph /> NOODLES
        </span>
        <span className="feed-status-title">
          {SESSION.title} <i>· {SESSION.subtitle}</i>
        </span>
        <span className="feed-status-sys">
          <span className="feed-online">
            <i className="feed-online-dot" /> {online} online
          </span>
          <Signal lost={lost} />
          <Battery />
        </span>
      </div>

      {/* ---- feed tabs: the active tab follows the round's audience ---- */}
      <div className="feed-tabs">
        {TABS.map((t) => (
          <span
            key={t.mode}
            className={`feed-tab${t.mode === mode ? ' feed-tab--on' : ''}`}
          >
            {t.mode === 'guest' && <Check />}
            {t.mode === 'volunteer' && <Hand />}
            {t.label}
          </span>
        ))}
        <span className="feed-tabs-mode">{MODE_LABEL[mode]} question</span>
      </div>

      {/* ---- the feed surface (cards float over this) ---- */}
      <div className="feed-body">
        <div className="feed-scrollbar">
          <i className="feed-scrollbar-thumb" />
        </div>
      </div>

      {/* ---- era dock ---- */}
      <div className="feed-dock">
        <span className="feed-dock-label">Scroll → Soul</span>
        <ol className="eras">
          {ERAS.map((era, i) => (
            <li key={era.year} className="era" style={{ '--i': i }}>
              <span className="era-icon">
                <EraIcon kind={era.icon} />
              </span>
              <span className="era-year">{era.year}</span>
              <span className="era-label">{era.label}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* ---- signal lost wash (ejection) ---- */}
      <div className="feed-lost-wash">
        <span>SIGNAL LOST</span>
      </div>
    </div>
  )
}

/* ---------------- glyphs (original, inline) ---------------- */

function NoodleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M7 15c0-5 4.5-7 7-4.5s-.5 6-2.5 3.5 2-5 5-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Signal({ lost }) {
  return (
    <svg className="feed-signal" viewBox="0 0 24 16" width="20" height="14" aria-hidden="true">
      {[3, 7, 11, 15].map((h, i) => (
        <rect
          key={h}
          x={i * 6}
          y={16 - h}
          width="4"
          height={h}
          rx="1"
          fill="currentColor"
          opacity={lost ? (i === 0 ? 0.9 : 0.18) : 0.95}
        />
      ))}
    </svg>
  )
}

function Battery() {
  return (
    <svg viewBox="0 0 28 14" width="26" height="13" aria-hidden="true">
      <rect x="1" y="1" width="23" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="25" y="4.5" width="2.5" height="5" rx="1" fill="currentColor" />
      <rect x="3.5" y="3.5" width="18" height="7" rx="1.5" fill="currentColor" />
    </svg>
  )
}

function Check() {
  return (
    <svg className="feed-tab-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke="#0b0d12" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Hand() {
  return (
    <svg className="feed-tab-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        d="M7 12V6.5a1.5 1.5 0 0 1 3 0V11m0-6a1.5 1.5 0 0 1 3 0v6m0-5a1.5 1.5 0 0 1 3 0v6m0-3a1.5 1.5 0 0 1 3 0v4c0 4-3 7-7 7h-1c-2.5 0-4-1-5.5-3L4 13.5a1.6 1.6 0 0 1 2.6-1.8L8 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EraIcon({ kind }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (kind) {
    case 'paper':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" {...common} />
          <path d="M7 9h6M7 13h10M7 17h10M16 9h1" {...common} />
        </svg>
      )
    case 'phone':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" {...common} />
        </svg>
      )
    case 'mobile':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="7" y="2" width="10" height="20" rx="2.5" {...common} />
          <path d="M11 18.5h2" {...common} />
        </svg>
      )
    case 'reel':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4" {...common} />
          <path d="M3 8h18M8 3l2 5M14 3l2 5" {...common} />
          <path d="M10.5 11.5v6l5-3z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'ai':
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z" {...common} />
          <path d="M18.5 15l.9 2.2 2.1.8-2.1.8-.9 2.2-.9-2.2-2.1-.8 2.1-.8z" {...common} />
        </svg>
      )
  }
}
