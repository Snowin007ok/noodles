/**
 * The people of the street — original, friendly, all ages.
 *
 * One parametric figure, eight variants that cycle by roster index so any
 * class reads as a real town: grandparents, parents, teens, kids, workers.
 * Half the variants carry something from the old world (a newspaper, a
 * letter, a landline handset, a cricket bat) and half from the new (phone,
 * earbuds, laptop, tablet) — the same 50/50 the talk gives to then and now.
 *
 * The student's colour drives the outfit, so a class of 45 still has 16
 * distinct looks × 8 silhouettes. Soft heavy outline, flat cel shading.
 */

const INK = '#3a2a26'

const SKIN = ['#f1c9a5', '#d9a06e', '#b97a4f', '#8d5a3b', '#f4d5b8', '#a86a45']
const HAIR = ['#2b1d16', '#4a3222', '#8a5a2b', '#b8b0a6', '#e8e2d9', '#1d1d24', '#c76b3a', '#5a3d5c']

export default function Townsfolk({ color, variant = 0, size = 96, state = 'idle' }) {
  const { base, dark } = color
  const v = variant % 8
  const skin = SKIN[(v * 5 + 1) % SKIN.length]
  const hair = HAIR[(v * 3 + (v > 3 ? 1 : 0)) % HAIR.length]
  const elder = v === 0 || v === 1

  return (
    <svg
      className={`folk-svg folk-svg--${state} folk-svg--v${v}`}
      width={size}
      height={size * 1.5}
      viewBox="0 0 100 150"
      aria-hidden="true"
      focusable="false"
    >
      {/* ground shadow */}
      <ellipse cx="50" cy="143" rx="26" ry="5.5" fill="#000" opacity="0.28" />

      {/* legs */}
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <rect x="36" y="100" width="12" height="34" rx="4" fill={v === 3 || v === 7 ? dark : '#3f4a63'} />
        <rect x="52" y="100" width="12" height="34" rx="4" fill={v === 3 || v === 7 ? dark : '#3f4a63'} />
        <rect x="32" y="130" width="18" height="10" rx="4" fill="#3a2a26" />
        <rect x="50" y="130" width="18" height="10" rx="4" fill="#3a2a26" />
      </g>

      {/* body: dress for v1 & v3 & v7, shirt for the rest */}
      {v === 1 || v === 3 || v === 7 ? (
        <path d="M32 60h36l10 48H22z" fill={base} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
      ) : (
        <rect x="30" y="58" width="40" height="48" rx="10" fill={base} stroke={INK} strokeWidth="4.5" />
      )}
      {/* shirt shading */}
      <path d="M62 62q6 22 0 42" fill="none" stroke={dark} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      {/* collar / shawl / tie details */}
      {v === 1 && <path d="M30 62q20 14 40 0v12q-20 10-40 0z" fill="#e8b4a0" stroke={INK} strokeWidth="3" />}
      {v === 6 && <path d="M50 60l5 22-5 8-5-8z" fill="#d9563a" stroke={INK} strokeWidth="2.5" />}
      {v === 2 && <rect x="42" y="58" width="16" height="10" rx="3" fill="#fff7ea" stroke={INK} strokeWidth="2.5" />}

      {/* arms */}
      <g stroke={INK} strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M30 66q-12 14-8 34" fill="none" stroke={INK} strokeWidth="11" />
        <path d="M30 66q-12 14-8 34" fill="none" stroke={base} strokeWidth="6" />
        <path d="M70 66q12 14 8 34" fill="none" stroke={INK} strokeWidth="11" />
        <path d="M70 66q12 14 8 34" fill="none" stroke={base} strokeWidth="6" />
        <circle cx="22" cy="100" r="6" fill={skin} />
        <circle cx="78" cy="100" r="6" fill={skin} />
      </g>

      {/* head */}
      <circle cx="50" cy="36" r="22" fill={skin} stroke={INK} strokeWidth="4.5" />
      {/* hair by variant */}
      <Hair v={v} hair={hair} />
      {/* face */}
      <g fill={INK}>
        <circle cx="42" cy="36" r="2.4" />
        <circle cx="58" cy="36" r="2.4" />
      </g>
      <path d="M43 46q7 6 14 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      {/* elder glasses */}
      {elder && (
        <g fill="none" stroke={INK} strokeWidth="2.5">
          <circle cx="42" cy="37" r="6.5" />
          <circle cx="58" cy="37" r="6.5" />
          <path d="M48.5 37h3" />
        </g>
      )}
      {/* cheeks */}
      <g fill="#e98b7a" opacity="0.45">
        <circle cx="38" cy="43" r="3" />
        <circle cx="62" cy="43" r="3" />
      </g>

      {/* what they are holding — old world on even variants, new on odd */}
      <Prop v={v} base={base} dark={dark} skin={skin} />
    </svg>
  )
}

function Hair({ v, hair }) {
  switch (v) {
    case 0: // grandpa: short grey, receding
      return <path d="M30 30q4-16 20-16t20 16q-6-6-20-6t-20 6z" fill={hair} stroke={INK} strokeWidth="3.5" />
    case 1: // grandma: bun
      return (
        <>
          <path d="M28 34q2-20 22-20t22 20q-8-8-22-8t-22 8z" fill={hair} stroke={INK} strokeWidth="3.5" />
          <circle cx="50" cy="12" r="8" fill={hair} stroke={INK} strokeWidth="3.5" />
        </>
      )
    case 2: // dad: flat cap
      return (
        <>
          <path d="M26 30q6-16 24-16t24 16z" fill={hair} stroke={INK} strokeWidth="3.5" />
          <path d="M24 30h56q-6-4-28-4t-28 4z" fill="#6b4a3c" stroke={INK} strokeWidth="3.5" />
        </>
      )
    case 3: // mom: long hair
      return <path d="M26 34q0-22 24-22t24 22v30q-6-10-6-24q-18 6-36 0q0 14-6 24z" fill={hair} stroke={INK} strokeWidth="3.5" />
    case 4: // teen: messy fringe + headphones
      return (
        <>
          <path d="M27 30q5-18 23-18t23 18l-8-4-8 6-7-6-7 6-8-6z" fill={hair} stroke={INK} strokeWidth="3.5" />
          <path d="M28 40q0-24 22-24t22 24" fill="none" stroke={INK} strokeWidth="5" />
          <rect x="22" y="34" width="10" height="14" rx="4" fill="#d9563a" stroke={INK} strokeWidth="3" />
          <rect x="68" y="34" width="10" height="14" rx="4" fill="#d9563a" stroke={INK} strokeWidth="3" />
        </>
      )
    case 5: // kid: side part
      return <path d="M28 30q6-14 22-14t22 14q-10-4-22 0q-12-4-22 0z" fill={hair} stroke={INK} strokeWidth="3.5" />
    case 6: // office worker: neat side sweep
      return <path d="M28 32q4-18 22-18t22 18q-8-8-22-6t-22 6z" fill={hair} stroke={INK} strokeWidth="3.5" />
    default: // young woman: ponytail
      return (
        <>
          <path d="M27 33q3-19 23-19t23 19q-10-7-23-7t-23 7z" fill={hair} stroke={INK} strokeWidth="3.5" />
          <path d="M70 26q14 4 12 26" fill="none" stroke={hair} strokeWidth="8" strokeLinecap="round" />
          <path d="M70 26q14 4 12 26" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        </>
      )
  }
}

function Prop({ v, dark, skin }) {
  switch (v) {
    case 0: // newspaper, held open with both hands
      return (
        <g transform="translate(50 92)">
          <rect x="-26" y="-14" width="52" height="30" rx="2" fill="#fff7ea" stroke={INK} strokeWidth="3" />
          <path d="M0-14v30M-20-6h14M-20 0h14M-20 6h14M6-6h14M6 0h14M6 6h10" stroke={INK} strokeWidth="1.6" opacity="0.7" />
        </g>
      )
    case 1: // a letter
      return (
        <g transform="translate(22 96) rotate(-12)">
          <rect x="-12" y="-8" width="24" height="16" rx="2" fill="#fff7ea" stroke={INK} strokeWidth="2.5" />
          <path d="M-12-8l12 8 12-8" fill="none" stroke={INK} strokeWidth="2" />
          <circle cx="7" cy="-3" r="2.2" fill="#d9563a" />
        </g>
      )
    case 2: // landline handset with a curly cord
      return (
        <g transform="translate(78 92) rotate(20)">
          <path d="M-14-8q14-8 28 0l-4 8q-10-5-20 0z" fill="#3a2a26" stroke={INK} strokeWidth="2" />
          <rect x="-16" y="-10" width="9" height="12" rx="3" fill="#3a2a26" />
          <rect x="7" y="-10" width="9" height="12" rx="3" fill="#3a2a26" />
          <path d="M-14 4q-4 8 2 12t-2 12" fill="none" stroke="#3a2a26" strokeWidth="2.2" />
        </g>
      )
    case 3: // film camera
      return (
        <g transform="translate(50 84)">
          <rect x="-16" y="-9" width="32" height="20" rx="4" fill="#3f4a63" stroke={INK} strokeWidth="2.5" />
          <circle cx="0" cy="1" r="6.5" fill="#8ec5d6" stroke={INK} strokeWidth="2.5" />
          <rect x="6" y="-12" width="8" height="4" fill="#3a2a26" />
        </g>
      )
    case 4: // smartphone, eyes down at it
      return (
        <g transform="translate(76 92) rotate(-8)">
          <rect x="-7" y="-13" width="14" height="24" rx="3" fill="#1f2230" stroke={INK} strokeWidth="2.5" />
          <rect x="-5" y="-10" width="10" height="17" rx="1.5" fill="#8ec5d6" />
        </g>
      )
    case 5: // cricket bat
      return (
        <g transform="translate(22 96) rotate(24)">
          <rect x="-4" y="-34" width="8" height="24" rx="3" fill="#7a5040" stroke={INK} strokeWidth="2.5" />
          <rect x="-7" y="-12" width="14" height="30" rx="4" fill="#e9c27f" stroke={INK} strokeWidth="2.5" />
        </g>
      )
    case 6: // laptop under the arm
      return (
        <g transform="translate(78 94) rotate(80)">
          <rect x="-14" y="-4" width="28" height="18" rx="2" fill="#c9cfd8" stroke={INK} strokeWidth="2.5" />
          <circle cx="0" cy="5" r="2" fill="#fff" />
        </g>
      )
    default: // coffee cup + earbuds
      return (
        <g>
          <g transform="translate(22 96)">
            <path d="M-7-8h14l-2 16h-10z" fill="#fff7ea" stroke={INK} strokeWidth="2.5" />
            <rect x="-8" y="-11" width="16" height="4" rx="1" fill="#2ab3a6" stroke={INK} strokeWidth="2" />
          </g>
          <circle cx="30" cy="40" r="3" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="70" cy="40" r="3" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="50" cy="36" r="0" fill={skin} />
          <circle cx="50" cy="36" r="0" fill={dark} />
        </g>
      )
  }
}
