/**
 * The spacecraft common room, drawn top-down as a single SVG.
 *
 * Composition, per the brief: an enclosed hull with benches along the walls,
 * cargo stacks in the corners, a console bank across the top wall, a pulsing
 * holo-table at centre, and a hazard-striped airlock set into the right wall
 * whose two door halves retract on their own transform groups.
 *
 * Crew are NOT drawn here — they are positioned as DOM nodes over this SVG so
 * they can be animated and focused independently.
 */

export default function LobbyRoom({ alarm, airlockOpen }) {
  return (
    <svg
      className={`room${alarm ? ' room--alarm' : ''}${airlockOpen ? ' room--airlock-open' : ''}`}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="hull" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#2a3150" />
          <stop offset="100%" stopColor="#161b30" />
        </linearGradient>
        <linearGradient id="floor" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#242b46" />
          <stop offset="50%" stopColor="#1b2138" />
          <stop offset="100%" stopColor="#141829" />
        </linearGradient>
        <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5474" />
          <stop offset="100%" stopColor="#2b3251" />
        </linearGradient>
        <linearGradient id="benchTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3d4568" />
          <stop offset="100%" stopColor="#262c47" />
        </linearGradient>
        <radialGradient id="holo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#6ff0ff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#2ba9d4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2ba9d4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="alarmGlow" cx="0.5" cy="0.5" r="0.62">
          <stop offset="0%" stopColor="#ff2b3d" stopOpacity="0" />
          <stop offset="70%" stopColor="#ff2b3d" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ff0f24" stopOpacity="0.62" />
        </radialGradient>

        {/* floor plating */}
        <pattern id="plating" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="none" />
          <path d="M0 0h80M0 0v80" stroke="#39415f" strokeWidth="1.6" opacity="0.55" />
          <circle cx="6" cy="6" r="1.8" fill="#454d70" opacity="0.7" />
        </pattern>

        {/* hazard chevrons around the airlock */}
        <pattern
          id="hazard"
          width="22"
          height="22"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="22" height="22" fill="#f2c033" />
          <rect width="11" height="22" fill="#191d2e" />
        </pattern>

        {/* deep space seen through the open airlock */}
        <linearGradient id="void" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#070912" />
          <stop offset="100%" stopColor="#131a38" />
        </linearGradient>

        <clipPath id="airlockClip">
          <rect x="1122" y="296" width="68" height="208" rx="8" />
        </clipPath>
        <clipPath id="floorClip">
          <rect x="48" y="48" width="1104" height="704" rx="54" />
        </clipPath>
      </defs>

      {/* ================= HULL ================= */}
      <rect x="14" y="14" width="1172" height="772" rx="76" fill="url(#hull)" stroke="#080a14" strokeWidth="14" />
      <rect x="40" y="40" width="1120" height="720" rx="60" fill="none" stroke="#0d1120" strokeWidth="8" opacity="0.8" />

      {/* hull rivets */}
      <g fill="#5a6486" opacity="0.55">
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={`rt${i}`} cx={90 + i * 47} cy={30} r="3.4" />
        ))}
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={`rb${i}`} cx={90 + i * 47} cy={770} r="3.4" />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <circle key={`rl${i}`} cx={30} cy={110 + i * 47} r="3.4" />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <circle key={`rr${i}`} cx={1170} cy={110 + i * 47} r="3.4" />
        ))}
      </g>

      {/* ================= FLOOR ================= */}
      <g clipPath="url(#floorClip)">
        <rect x="48" y="48" width="1104" height="704" fill="url(#floor)" />
        <rect x="48" y="48" width="1104" height="704" fill="url(#plating)" />

        {/* painted deck markings */}
        <circle cx="600" cy="400" r="252" fill="none" stroke="#39527a" strokeWidth="3" strokeDasharray="18 26" opacity="0.5" />
        <path d="M250 690h700" stroke="#f2c033" strokeWidth="5" strokeDasharray="34 22" opacity="0.28" />

        {/* glowing floor strip lights */}
        <g className="floor-strips">
          <rect x="150" y="120" width="360" height="7" rx="3.5" fill="#4fe3ff" opacity="0.5" />
          <rect x="690" y="120" width="360" height="7" rx="3.5" fill="#4fe3ff" opacity="0.5" />
          <rect x="150" y="676" width="900" height="7" rx="3.5" fill="#4fe3ff" opacity="0.35" />
          <rect x="120" y="200" width="7" height="400" rx="3.5" fill="#4fe3ff" opacity="0.35" />
        </g>

        {/* directional deck arrows pointing at the airlock */}
        <g fill="#f2c033" opacity="0.22">
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${920 + i * 46} 385l26 15-26 15z`} />
          ))}
        </g>
      </g>

      {/* ================= CONSOLE BANK (top wall) ================= */}
      <g className="consoles">
        {[300, 470, 640, 810].map((x, i) => (
          <g key={x}>
            <rect x={x} y="62" width="130" height="66" rx="10" fill="url(#metal)" stroke="#0d1120" strokeWidth="6" />
            <rect x={x + 12} y="72" width="106" height="36" rx="5" fill="#0c2233" stroke="#0d1120" strokeWidth="3" />
            <g className={`screen screen--${i}`}>
              <rect x={x + 17} y="77" width="96" height="26" rx="3" fill={i % 2 ? '#2ce39a' : '#4fd0ff'} opacity="0.35" />
              <path
                d={`M${x + 20} 96 l14-11 12 8 14-15 13 12 12-7 16 9`}
                fill="none"
                stroke={i % 2 ? '#7dffcb' : '#a7e9ff'}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
            {/* keys */}
            <g fill="#151a2c">
              {Array.from({ length: 7 }, (_, k) => (
                <rect key={k} x={x + 14 + k * 15} y="114" width="11" height="7" rx="2" />
              ))}
            </g>
          </g>
        ))}
        {/* overhead pipe run */}
        <g stroke="#39415f" strokeWidth="9" strokeLinecap="round" opacity="0.75">
          <path d="M150 92h120" />
          <path d="M960 92h100" />
        </g>
      </g>

      {/* ================= BENCH RUN =================
          A continuous bench follows all four walls — this is what the crew are
          sitting on. It breaks either side of the airlock hatch. The seating
          plan in game/layout.js is laid out along these same runs. */}
      <g className="bench">
        <HBench x={150} y={150} w={900} />
        <HBench x={190} y={678} w={820} />
        <VBench x={70} y={200} h={420} />
        <VBench x={1084} y={196} h={70} />
        <VBench x={1084} y={534} h={70} />
      </g>

      {/* ================= CARGO =================
          Stowed in the four hull corners, clear of the bench run so nobody is
          sitting on a crate. */}
      <g className="cargo">
        <Crate x={62} y={62} s={78} tone="#3f5a8a" cap="#5f88c4" />
        <Crate x={1054} y={62} s={78} tone="#8a6a3a" cap="#c49a55" />
        <Crate x={62} y={630} s={78} tone="#6a3f5a" cap="#a25f8a" />
        <Crate x={1050} y={626} s={82} tone="#3f6b6a" cap="#59a29f" />
        {/* a pair out on the open deck for depth, in the gap between seat rows */}
        <Crate x={176} y={272} s={52} tone="#8a3f3f" cap="#c46060" />
        <Crate x={975} y={272} s={50} tone="#3f5a8a" cap="#5f88c4" />
        {/* fuel drum */}
        <g>
          <circle cx="205" cy={604} r="28" fill="#39415f" stroke="#0d1120" strokeWidth="6" />
          <circle cx="205" cy={604} r="17" fill="#4a5474" stroke="#0d1120" strokeWidth="4" />
          <path d="M194 604h22" stroke="#f2c033" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        </g>
      </g>

      {/* ================= CENTRE HOLO-TABLE ================= */}
      <g className="holotable">
        <circle cx="600" cy="400" r="78" fill="#1b2238" stroke="#0d1120" strokeWidth="8" />
        <circle cx="600" cy="400" r="63" fill="#141a2e" stroke="#39415f" strokeWidth="5" />
        <circle className="holo-glow" cx="600" cy="400" r="68" fill="url(#holo)" />
        <circle className="holo-ring holo-ring--a" cx="600" cy="400" r="44" fill="none" stroke="#6ff0ff" strokeWidth="3.5" strokeDasharray="12 16" opacity="0.85" />
        <circle className="holo-ring holo-ring--b" cx="600" cy="400" r="27" fill="none" stroke="#9df7ff" strokeWidth="3" strokeDasharray="8 12" opacity="0.7" />
        <circle cx="600" cy="400" r="12" fill="#7ff0ff" opacity="0.9" />
        <circle cx="600" cy="400" r="12" fill="none" stroke="#0d1120" strokeWidth="4" />
      </g>

      {/* ================= AIRLOCK (recessed into the right wall) ================= */}
      <g className="airlock">
        {/* hazard apron painted on the deck in front of the door */}
        <g clipPath="url(#floorClip)">
          <rect x="1046" y="300" width="106" height="200" fill="url(#hazard)" opacity="0.32" />
          <rect x="1046" y="300" width="106" height="200" fill="none" stroke="#f2c033" strokeWidth="4" opacity="0.5" />
        </g>

        {/* the recess: cut through the wall to open space */}
        <g clipPath="url(#airlockClip)">
          <rect x="1122" y="296" width="68" height="208" fill="url(#void)" />
          <g fill="#ffffff">
            {[
              [1134, 318, 2.2], [1166, 336, 1.6], [1180, 306, 2.4], [1142, 372, 1.8],
              [1172, 392, 2.2], [1130, 420, 1.5], [1158, 446, 2.4], [1184, 462, 1.7],
              [1138, 486, 2.1], [1170, 498, 1.5],
            ].map(([cx, cy, r], i) => (
              <circle key={i} className={`star star--${i % 3}`} cx={cx} cy={cy} r={r} />
            ))}
          </g>
          {/* door halves — these retract when .room--airlock-open is set */}
          <g className="airlock-door airlock-door--top">
            <rect x="1118" y="292" width="76" height="106" fill="url(#metal)" stroke="#0d1120" strokeWidth="6" />
            <path d="M1124 340h64M1124 358h64" stroke="#1a2038" strokeWidth="5" />
            <rect x="1146" y="300" width="18" height="26" rx="4" fill="#f2c033" opacity="0.7" />
          </g>
          <g className="airlock-door airlock-door--bottom">
            <rect x="1118" y="402" width="76" height="106" fill="url(#metal)" stroke="#0d1120" strokeWidth="6" />
            <path d="M1124 442h64M1124 460h64" stroke="#1a2038" strokeWidth="5" />
            <rect x="1146" y="474" width="18" height="26" rx="4" fill="#f2c033" opacity="0.7" />
          </g>
        </g>

        {/* heavy door frame + warning strips top and bottom of the opening */}
        <rect x="1122" y="296" width="68" height="208" rx="8" fill="none" stroke="#0d1120" strokeWidth="9" />
        <rect x="1112" y="278" width="86" height="16" rx="6" fill="url(#hazard)" stroke="#0d1120" strokeWidth="5" />
        <rect x="1112" y="506" width="86" height="16" rx="6" fill="url(#hazard)" stroke="#0d1120" strokeWidth="5" />

        {/* status beacons flanking the door, mounted on the wall */}
        <circle className="beacon" cx="1140" cy="268" r="9" fill="#ff3b52" stroke="#0d1120" strokeWidth="4" />
        <circle className="beacon beacon--delay" cx="1140" cy="532" r="9" fill="#ff3b52" stroke="#0d1120" strokeWidth="4" />
      </g>

      {/* ================= ALARM WASH ================= */}
      <g clipPath="url(#floorClip)" className="alarm-layer">
        <rect x="48" y="48" width="1104" height="704" fill="url(#alarmGlow)" />
      </g>

      {/* corner strobes */}
      <g className="strobes">
        <circle cx="96" cy="96" r="14" fill="#ff2b3d" />
        <circle cx="1104" cy="96" r="14" fill="#ff2b3d" />
        <circle cx="96" cy="704" r="14" fill="#ff2b3d" />
        <circle cx="1104" cy="704" r="14" fill="#ff2b3d" />
      </g>
    </svg>
  )
}

/** Horizontal bench run with seat divisions. */
function HBench({ x, y, w }) {
  const seats = Math.max(1, Math.round(w / 60))
  return (
    <g>
      <rect x={x} y={y} width={w} height={46} rx="18" fill="url(#benchTop)" stroke="#0d1120" strokeWidth="6" />
      <g stroke="#1a2038" strokeWidth="4" opacity="0.75">
        {Array.from({ length: seats - 1 }, (_, i) => (
          <path key={i} d={`M${x + ((i + 1) * w) / seats} ${y + 8}v30`} />
        ))}
      </g>
      <rect x={x + 8} y={y + 6} width={w - 16} height="8" rx="4" fill="#fff" opacity="0.07" />
    </g>
  )
}

/** Vertical bench run with seat divisions. */
function VBench({ x, y, h }) {
  const seats = Math.max(1, Math.round(h / 60))
  return (
    <g>
      <rect x={x} y={y} width={46} height={h} rx="18" fill="url(#benchTop)" stroke="#0d1120" strokeWidth="6" />
      <g stroke="#1a2038" strokeWidth="4" opacity="0.75">
        {Array.from({ length: seats - 1 }, (_, i) => (
          <path key={i} d={`M${x + 8} ${y + ((i + 1) * h) / seats}h30`} />
        ))}
      </g>
      <rect x={x + 6} y={y + 8} width="8" height={h - 16} rx="4" fill="#fff" opacity="0.07" />
    </g>
  )
}

/** A single top-down cargo crate with corner brackets. */
function Crate({ x, y, s, tone, cap }) {
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} rx="9" fill={tone} stroke="#0d1120" strokeWidth="6" />
      <rect x={x + 9} y={y + 9} width={s - 18} height={s - 18} rx="5" fill={cap} opacity="0.5" />
      <path d={`M${x + 9} ${y + s / 2}h${s - 18}`} stroke="#0d1120" strokeWidth="5" opacity="0.55" />
      <g fill="#0d1120" opacity="0.7">
        <rect x={x + 6} y={y + 6} width="12" height="5" rx="2" />
        <rect x={x + s - 18} y={y + 6} width="12" height="5" rx="2" />
        <rect x={x + 6} y={y + s - 11} width="12" height="5" rx="2" />
        <rect x={x + s - 18} y={y + s - 11} width="12" height="5" rx="2" />
      </g>
    </g>
  )
}
