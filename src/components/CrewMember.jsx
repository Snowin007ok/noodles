/**
 * An original NOODLES crew character.
 *
 * Design brief: read cleanly at ~40px (a class of 45 on a projector) while
 * still looking good scaled up to 200px for the spotlight. That means few
 * shapes, one uniform outline weight, and contrast carried by silhouette
 * rather than interior detail.
 *
 * Silhouette: a soft egg-shaped pod, widest at the hips, topped by a full
 * spherical dome helmet. Two round mitts held at the sides, two stubby boots,
 * and a curled "noodle" antenna — the house motif, and the thing that reads
 * first at any size.
 */

const OUTLINE = '#0d1020'

export default function CrewMember({ color, size = 96, state = 'idle' }) {
  const { base, dark } = color
  const gid = color.id

  return (
    <svg
      className={`crew-svg crew-svg--${state}`}
      width={size}
      height={size * 1.15}
      viewBox="0 0 100 115"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Body: lit from upper-left, shading into the hull colour's dark tone. */}
        <linearGradient id={`pod-${gid}`} x1="0.15" y1="0.05" x2="0.9" y2="1">
          <stop offset="0%" stopColor={base} />
          <stop offset="52%" stopColor={base} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`glass-${gid}`} x1="0.2" y1="0.05" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#dff6ff" />
          <stop offset="42%" stopColor="#8fd8f0" />
          <stop offset="100%" stopColor="#2f6f8f" />
        </linearGradient>
      </defs>

      {/* contact shadow */}
      <ellipse cx="50" cy="107" rx="25" ry="6" fill="#000" opacity="0.32" />

      {/* ---- boots ---- */}
      <g stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round">
        <path d="M35 90h13v11a4.5 4.5 0 0 1-4.5 4.5h-4A4.5 4.5 0 0 1 35 101z" fill={dark} />
        <path d="M52 90h13v11a4.5 4.5 0 0 1-4.5 4.5h-4A4.5 4.5 0 0 1 52 101z" fill={dark} />
      </g>

      {/* ---- pod body ---- */}
      <path
        d="M50 22
           c-14.5 0 -24 9 -25.5 23
           l-2.5 24
           c-1.2 12 8 21 28 21
           s29.2 -9 28 -21
           l-2.5 -24
           C74.5 31 64.5 22 50 22z"
        fill={`url(#pod-${gid})`}
        stroke={OUTLINE}
        strokeWidth="5.5"
        strokeLinejoin="round"
      />

      {/* soft rim light down the left flank — one stroke, no clutter */}
      <path
        d="M32 40c-3 9 -4.5 21 -4.5 30"
        fill="none"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.26"
      />

      {/* ---- mitts ---- */}
      <g stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round">
        <circle className="crew-mitt crew-mitt--l" cx="19" cy="63" r="9" fill={dark} />
        <circle className="crew-mitt crew-mitt--r" cx="81" cy="63" r="9" fill={dark} />
      </g>

      {/* ---- helmet dome ---- */}
      <circle cx="50" cy="27" r="25" fill={dark} stroke={OUTLINE} strokeWidth="5.5" />
      <circle
        cx="50"
        cy="27"
        r="18.5"
        fill={`url(#glass-${gid})`}
        stroke={OUTLINE}
        strokeWidth="4"
      />
      {/* one crisp crescent highlight — the whole "glossy" read comes from this */}
      <path
        d="M39 20a13.5 13.5 0 0 1 11-5.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4.5"
        strokeLinecap="round"
        opacity="0.92"
      />

      {/* ---- noodle antenna: the house motif ---- */}
      <path
        d="M62 8c6-6 14.5-3.5 15 3.5s-8 8.5-10 3.5 4-8.5 9-5.5"
        fill="none"
        stroke={OUTLINE}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M62 8c6-6 14.5-3.5 15 3.5s-8 8.5-10 3.5 4-8.5 9-5.5"
        fill="none"
        stroke={base}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle
        className="crew-bead"
        cx="77.5"
        cy="9.5"
        r="4.5"
        fill="#ffe27a"
        stroke={OUTLINE}
        strokeWidth="3"
      />
    </svg>
  )
}
