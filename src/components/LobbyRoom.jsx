/**
 * The spacecraft common room, drawn top-down as a single SVG.
 *
 * What makes this read as a game scene rather than a diagram is lighting:
 * overhead lamps drop soft elliptical pools onto the deck, every prop casts a
 * directional shadow away from the room centre, wall bases carry an ambient
 * occlusion gradient, and a vignette sinks the corners. Without those the
 * floor is a flat slab and the props look pasted on.
 *
 * Crew are NOT drawn here — they are positioned as DOM nodes over this SVG so
 * they can be animated and focused independently.
 */

export default function LobbyRoom({ alarm, airlockOpen }) {
  return (
    <svg
      className={`room${alarm ? ' room--alarm' : ''}${airlockOpen ? ' room--airlock-open' : ''}`}
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* ---- surfaces ---- */}
        <linearGradient id="hullOuter" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#39456e" />
          <stop offset="45%" stopColor="#232b49" />
          <stop offset="100%" stopColor="#141931" />
        </linearGradient>
        <linearGradient id="wallBand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4d5a85" />
          <stop offset="18%" stopColor="#333d63" />
          <stop offset="82%" stopColor="#28304f" />
          <stop offset="100%" stopColor="#1b2138" />
        </linearGradient>
        <linearGradient id="deck" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#2a3357" />
          <stop offset="45%" stopColor="#212949" />
          <stop offset="100%" stopColor="#171d36" />
        </linearGradient>
        <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b688f" />
          <stop offset="55%" stopColor="#3a4468" />
          <stop offset="100%" stopColor="#252c47" />
        </linearGradient>
        <linearGradient id="benchTop" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#4c5880" />
          <stop offset="60%" stopColor="#333c60" />
          <stop offset="100%" stopColor="#242b47" />
        </linearGradient>

        {/* ---- light ---- */}
        <radialGradient id="lampPool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#bcd8ff" stopOpacity="0.20" />
          <stop offset="45%" stopColor="#8fb4e8" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#7aa0d8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="holoPool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#6ff0ff" stopOpacity="0.34" />
          <stop offset="40%" stopColor="#3ec4e8" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#2ba9d4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.62">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="62%" stopColor="#000" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#03050c" stopOpacity="0.72" />
        </radialGradient>
        <radialGradient id="alarmGlow" cx="0.5" cy="0.5" r="0.62">
          <stop offset="0%" stopColor="#ff2b3d" stopOpacity="0" />
          <stop offset="66%" stopColor="#ff2b3d" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#ff0f24" stopOpacity="0.66" />
        </radialGradient>
        {/* Ambient occlusion where the walls meet the deck. */}
        <linearGradient id="aoTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#05070f" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#05070f" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="aoBottom" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#05070f" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#05070f" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="aoLeft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#05070f" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#05070f" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="aoRight" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#05070f" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#05070f" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="void" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#04060f" />
          <stop offset="100%" stopColor="#101838" />
        </linearGradient>

        {/* ---- patterns ---- */}
        <pattern id="plating" width="96" height="96" patternUnits="userSpaceOnUse">
          <rect width="96" height="96" fill="none" />
          <path d="M0 0h96M0 0v96" stroke="#465280" strokeWidth="1.5" opacity="0.34" />
          <path d="M0 1.6h96M1.6 0v96" stroke="#0b0e1c" strokeWidth="1.6" opacity="0.3" />
          <circle cx="8" cy="8" r="1.7" fill="#5b6894" opacity="0.5" />
          <circle cx="88" cy="88" r="1.7" fill="#5b6894" opacity="0.35" />
        </pattern>
        <pattern
          id="hazard"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="24" height="24" fill="#f0be2e" />
          <rect width="12" height="24" fill="#171b2b" />
        </pattern>

        <clipPath id="deckClip">
          <rect x="56" y="56" width="1088" height="688" rx="52" />
        </clipPath>
        <clipPath id="airlockClip">
          <rect x="1086" y="292" width="86" height="216" rx="8" />
        </clipPath>
      </defs>

      {/* ================= HULL ================= */}
      <rect x="8" y="8" width="1184" height="784" rx="86" fill="url(#hullOuter)" stroke="#05060d" strokeWidth="15" />
      <rect x="30" y="30" width="1140" height="740" rx="70" fill="url(#wallBand)" stroke="#0a0d1a" strokeWidth="6" />
      {/* lit top edge of the wall band */}
      <path
        d="M100 34h1000"
        stroke="#7e8db8"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* hull rivets */}
      <g fill="#69769e" opacity="0.5">
        {Array.from({ length: 20 }, (_, i) => (
          <circle key={`rt${i}`} cx={130 + i * 49} cy={20} r="3.2" />
        ))}
        {Array.from({ length: 20 }, (_, i) => (
          <circle key={`rb${i}`} cx={130 + i * 49} cy={780} r="3.2" />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={`rl${i}`} cx={20} cy={150 + i * 50} r="3.2" />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={`rr${i}`} cx={1180} cy={150 + i * 50} r="3.2" />
        ))}
      </g>

      {/* ================= DECK ================= */}
      <g clipPath="url(#deckClip)">
        <rect x="56" y="56" width="1088" height="688" fill="url(#deck)" />
        <rect x="56" y="56" width="1088" height="688" fill="url(#plating)" />

        {/* --- painted deck graphics --- */}
        {/* centre emblem ring */}
        <circle cx="600" cy="400" r="232" fill="none" stroke="#4a7ab0" strokeWidth="3" strokeDasharray="26 30" opacity="0.24" />
        <circle cx="600" cy="400" r="196" fill="none" stroke="#4a7ab0" strokeWidth="2" opacity="0.14" />
        {/* walkway edging */}
        <path d="M150 128h900" stroke="#3f6796" strokeWidth="3" strokeDasharray="40 26" opacity="0.2" />
        <path d="M150 672h900" stroke="#3f6796" strokeWidth="3" strokeDasharray="40 26" opacity="0.2" />
        {/* hazard chevrons on the approach to the airlock */}
        <g opacity="0.17">
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${876 + i * 42} 366 l30 34 -30 34 -13 0 30 -34 -30 -34z`}
              fill="#f0be2e"
            />
          ))}
        </g>
        {/* Energy conduits running from the reactor table out to the hull.
            These fill the mid-deck — which has to stay clear of props because
            rows 2 and 3 seat a large class there — and they sit flat under the
            crew, so nothing collides. */}
        <g className="conduits">
          {[
            [600, 400, 170, 96],
            [600, 400, -170, 96],
            [600, 400, 170, -96],
            [600, 400, -170, -96],
          ].map(([cx, cy, dx, dy], i) => {
            const k = 2.4
            return (
              <g key={i}>
                <path
                  d={`M${cx + dx * 0.72} ${cy + dy * 0.72} L${cx + dx * k} ${cy + dy * k}`}
                  stroke="#3f6796"
                  strokeWidth="9"
                  strokeLinecap="round"
                  opacity="0.3"
                />
                <path
                  d={`M${cx + dx * 0.72} ${cy + dy * 0.72} L${cx + dx * k} ${cy + dy * k}`}
                  stroke="#5fe6ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.28"
                />
                {[1.2, 1.7, 2.2].map((t) => (
                  <circle
                    key={t}
                    cx={cx + dx * t}
                    cy={cy + dy * t}
                    r="7"
                    fill="#26314f"
                    stroke="#5fe6ff"
                    strokeWidth="2.5"
                    opacity="0.4"
                  />
                ))}
              </g>
            )
          })}
          {/* lateral conduits to the side walls */}
          <path d="M482 400H190" stroke="#3f6796" strokeWidth="9" strokeLinecap="round" opacity="0.26" />
          <path d="M482 400H190" stroke="#5fe6ff" strokeWidth="3" strokeLinecap="round" opacity="0.24" />
          <path d="M718 400h150" stroke="#3f6796" strokeWidth="9" strokeLinecap="round" opacity="0.26" />
          <path d="M718 400h150" stroke="#5fe6ff" strokeWidth="3" strokeLinecap="round" opacity="0.24" />
        </g>

        {/* scuffs */}
        <g stroke="#8ea6cc" strokeWidth="2" fill="none" opacity="0.07">
          <path d="M226 250c60 26 140 30 210 8" />
          <path d="M840 560c-54 30-130 34-196 12" />
          <path d="M300 620c40-26 96-34 150-22" />
        </g>

        {/* --- overhead lamp pools: the main depth cue --- */}
        <g className="lamps">
          <ellipse cx="300" cy="214" rx="212" ry="150" fill="url(#lampPool)" />
          <ellipse cx="900" cy="214" rx="212" ry="150" fill="url(#lampPool)" />
          <ellipse cx="270" cy="600" rx="196" ry="142" fill="url(#lampPool)" />
          <ellipse cx="930" cy="600" rx="196" ry="142" fill="url(#lampPool)" />
          <ellipse cx="600" cy="400" rx="270" ry="200" fill="url(#holoPool)" />
        </g>

        {/* glowing deck strips */}
        <g className="floor-strips">
          <rect x="176" y="132" width="330" height="6" rx="3" fill="#5fe6ff" opacity="0.45" />
          <rect x="694" y="132" width="330" height="6" rx="3" fill="#5fe6ff" opacity="0.45" />
          <rect x="176" y="666" width="848" height="6" rx="3" fill="#5fe6ff" opacity="0.3" />
          <rect x="132" y="230" width="6" height="340" rx="3" fill="#5fe6ff" opacity="0.3" />
        </g>

        {/* ambient occlusion at the wall bases */}
        <rect x="56" y="56" width="1088" height="72" fill="url(#aoTop)" />
        <rect x="56" y="672" width="1088" height="72" fill="url(#aoBottom)" />
        <rect x="56" y="56" width="70" height="688" fill="url(#aoLeft)" />
        <rect x="1074" y="56" width="70" height="688" fill="url(#aoRight)" />

        {/* ================= PROPS (inside the clip so shadows stay on deck) ============ */}

        {/* --- console bank, top wall --- */}
        <g className="consoles">
          {[286, 456, 626, 796].map((x, i) => (
            <g key={x}>
              <ellipse cx={x + 66} cy={146} rx="78" ry="14" fill="#05070f" opacity="0.42" />
              <rect x={x} y="66" width="132" height="70" rx="11" fill="url(#metal)" stroke="#0a0d1a" strokeWidth="5" />
              <rect x={x + 6} y="70" width="120" height="7" rx="3.5" fill="#8695c0" opacity="0.4" />
              <rect x={x + 13} y="80" width="106" height="38" rx="5" fill="#08202f" stroke="#0a0d1a" strokeWidth="3" />
              <g className={`screen screen--${i}`}>
                <rect x={x + 18} y="85" width="96" height="28" rx="3" fill={i % 2 ? '#2ce39a' : '#4fd0ff'} opacity="0.28" />
                <path
                  d={`M${x + 21} 105 l14-12 12 9 14-16 13 13 12-8 16 10`}
                  fill="none"
                  stroke={i % 2 ? '#8fffd6' : '#b3ecff'}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
              <g fill="#12162a">
                {Array.from({ length: 7 }, (_, k) => (
                  <rect key={k} x={x + 15 + k * 15} y="122" width="11" height="7" rx="2" />
                ))}
              </g>
            </g>
          ))}
          <g stroke="#3d476c" strokeWidth="10" strokeLinecap="round" opacity="0.7">
            <path d="M150 96h110" />
            <path d="M948 96h100" />
          </g>
        </g>

        {/* --- benches --- */}
        <Bench x={78} y={248} w={52} h={306} slats="v" />
        <Bench x={392} y={700} w={330} h={50} slats="h" />
        <Bench x={1072} y={126} w={50} h={136} slats="v" />

        {/* --- cargo ---
            Only the top corners. The bench ring (crew row 1) runs the full
            perimeter at x 138→1068, y 192→684, so anything placed along the
            side or bottom walls ends up underneath a crew member. Above the
            ring, y < 145, is the one band that stays clear. */}
        <Crate x={80} y={62} s={74} tone="#3f5a8a" cap="#6690cc" label />
        <Crate x={168} y={76} s={56} tone="#8a6a3a" cap="#c8a05c" />
        <Crate x={966} y={62} s={74} tone="#3f6b6a" cap="#5fa8a5" label />
        <Crate x={1054} y={70} s={54} tone="#8a3f3f" cap="#c86666" />

        {/* Painted floor zones fill the bottom corners instead of props — flat
            markings read fine underneath a seated crew member. */}
        <g opacity="0.16">
          <rect x="186" y="580" width="150" height="96" rx="10" fill="none" stroke="#f0be2e" strokeWidth="4" strokeDasharray="20 14" />
          <rect x="864" y="580" width="150" height="96" rx="10" fill="none" stroke="#5fe6ff" strokeWidth="4" strokeDasharray="20 14" />
        </g>

        {/* --- centre holo-table --- */}
        <g className="holotable">
          <ellipse cx="604" cy="470" rx="132" ry="26" fill="#05070f" opacity="0.45" />
          <circle cx="600" cy="400" r="118" fill="#20284a" stroke="#0a0d1a" strokeWidth="8" />
          <circle cx="600" cy="400" r="118" fill="none" stroke="#5f6d99" strokeWidth="3" opacity="0.5" />
          <circle cx="600" cy="400" r="98" fill="#161c34" stroke="#3d476c" strokeWidth="5" />
          <circle className="holo-glow" cx="600" cy="400" r="104" fill="url(#holoPool)" />
          {/* projected rings */}
          <circle className="holo-ring" cx="600" cy="400" r="70" fill="none" stroke="#7ff2ff" strokeWidth="3.5" strokeDasharray="14 18" opacity="0.85" />
          <circle className="holo-ring holo-ring--b" cx="600" cy="400" r="46" fill="none" stroke="#a6f8ff" strokeWidth="3" strokeDasharray="9 13" opacity="0.7" />
          {/* projected planet */}
          <circle cx="600" cy="400" r="26" fill="#2ea8cc" opacity="0.5" />
          <circle cx="600" cy="400" r="26" fill="none" stroke="#9ff4ff" strokeWidth="3" opacity="0.9" />
          <path d="M576 392c16 8 32 8 48 0M578 410c14 6 30 6 44 0" stroke="#d8fbff" strokeWidth="2.5" fill="none" opacity="0.6" />
          <ellipse cx="600" cy="400" rx="40" ry="13" fill="none" stroke="#7ff2ff" strokeWidth="3" opacity="0.75" />
          {/* table console nubs */}
          {[0, 90, 180, 270].map((deg) => {
            const r = (deg * Math.PI) / 180
            return (
              <rect
                key={deg}
                x={600 + Math.cos(r) * 108 - 13}
                y={400 + Math.sin(r) * 108 - 8}
                width="26"
                height="16"
                rx="4"
                fill="#3d476c"
                stroke="#0a0d1a"
                strokeWidth="3"
              />
            )
          })}
        </g>

        {/* vignette last so it sinks everything */}
        <rect x="56" y="56" width="1088" height="688" fill="url(#vignette)" pointerEvents="none" />

        {/* alarm wash */}
        <g className="alarm-layer">
          <rect x="56" y="56" width="1088" height="688" fill="url(#alarmGlow)" />
        </g>
      </g>

      {/* ================= AIRLOCK (right wall, outside the deck clip) ============ */}
      <g className="airlock">
        {/* Recessed alcove in the wall rather than a box bolted onto it: dark
            metal surround, hazard used only as thin accent bands. */}
        <rect x="1068" y="272" width="122" height="256" rx="18" fill="#2b3350" stroke="#0a0d1a" strokeWidth="7" />
        <rect x="1068" y="272" width="122" height="256" rx="18" fill="none" stroke="#6c7aa6" strokeWidth="2.5" opacity="0.45" />
        {/* hazard accent bands, top and bottom of the frame only */}
        <rect x="1078" y="280" width="102" height="11" rx="3" fill="url(#hazard)" opacity="0.9" />
        <rect x="1078" y="509" width="102" height="11" rx="3" fill="url(#hazard)" opacity="0.9" />
        {/* inner recess shadow */}
        <rect x="1082" y="288" width="96" height="224" rx="10" fill="#0a0e18" stroke="#05070f" strokeWidth="6" />
        <g clipPath="url(#airlockClip)">
          <rect x="1086" y="292" width="86" height="216" fill="url(#void)" />
          <g fill="#ffffff">
            {[
              [1098, 312, 2.1], [1134, 336, 1.5], [1162, 306, 2.4], [1110, 372, 1.7],
              [1152, 392, 2.1], [1094, 426, 1.4], [1130, 448, 2.2], [1166, 466, 1.6],
              [1104, 490, 2.0], [1144, 500, 1.4],
            ].map(([cx, cy, r], i) => (
              <circle key={i} className={`star star--${i % 3}`} cx={cx} cy={cy} r={r} />
            ))}
          </g>
          <g className="airlock-door airlock-door--top">
            <rect x="1086" y="292" width="86" height="109" fill="url(#metal)" stroke="#0a0d1a" strokeWidth="5" />
            <path d="M1094 344h70M1094 364h70" stroke="#1a2038" strokeWidth="5" />
            <rect x="1118" y="300" width="22" height="28" rx="4" fill="#f0be2e" opacity="0.6" />
          </g>
          <g className="airlock-door airlock-door--bottom">
            <rect x="1086" y="399" width="86" height="109" fill="url(#metal)" stroke="#0a0d1a" strokeWidth="5" />
            <path d="M1094 436h70M1094 456h70" stroke="#1a2038" strokeWidth="5" />
            <rect x="1118" y="472" width="22" height="28" rx="4" fill="#f0be2e" opacity="0.6" />
          </g>
        </g>
        <rect x="1082" y="288" width="96" height="224" rx="10" fill="none" stroke="#05070f" strokeWidth="5" />
        {/* beacons recessed into the frame edge, on the deck side */}
        <circle className="beacon" cx="1058" cy="300" r="8" fill="#ff3b52" stroke="#0a0d1a" strokeWidth="3.5" />
        <circle className="beacon beacon--delay" cx="1058" cy="500" r="8" fill="#ff3b52" stroke="#0a0d1a" strokeWidth="3.5" />
      </g>

      {/* corner strobes */}
      <g className="strobes">
        <circle cx="104" cy="104" r="13" fill="#ff2b3d" />
        <circle cx="1096" cy="104" r="13" fill="#ff2b3d" />
        <circle cx="104" cy="696" r="13" fill="#ff2b3d" />
        <circle cx="1096" cy="696" r="13" fill="#ff2b3d" />
      </g>
    </svg>
  )
}

/** Wall bench with a cast shadow and slatted top. */
function Bench({ x, y, w, h, slats }) {
  const n = slats === 'v' ? Math.floor(h / 50) : Math.floor(w / 50)
  return (
    <g className="bench">
      <rect x={x - 4} y={y + 8} width={w + 12} height={h + 8} rx="20" fill="#05070f" opacity="0.38" />
      <rect x={x} y={y} width={w} height={h} rx="19" fill="url(#benchTop)" stroke="#0a0d1a" strokeWidth="6" />
      <rect x={x + 6} y={y + 5} width={w - 12} height="5" rx="2.5" fill="#8695c0" opacity="0.3" />
      <g stroke="#1b2138" strokeWidth="4" opacity="0.75">
        {Array.from({ length: n }, (_, i) =>
          slats === 'v' ? (
            <path key={i} d={`M${x + 8} ${y + 28 + i * 50}h${w - 16}`} />
          ) : (
            <path key={i} d={`M${x + 30 + i * 50} ${y + 8}v${h - 16}`} />
          ),
        )}
      </g>
    </g>
  )
}

/** Top-down cargo crate: cast shadow, lid inset, corner brackets, optional label. */
function Crate({ x, y, s, tone, cap, label }) {
  return (
    <g className="cargo">
      <rect x={x + 5} y={y + 9} width={s} height={s} rx="10" fill="#05070f" opacity="0.4" />
      <rect x={x} y={y} width={s} height={s} rx="10" fill={tone} stroke="#0a0d1a" strokeWidth="6" />
      <rect x={x + 8} y={y + 8} width={s - 16} height={s - 16} rx="6" fill={cap} opacity="0.42" />
      {/* lid highlight + seam */}
      <path d={`M${x + 9} ${y + 9}h${s - 18}`} stroke="#fff" strokeWidth="3" opacity="0.2" />
      <path d={`M${x + 8} ${y + s / 2}h${s - 16}`} stroke="#0a0d1a" strokeWidth="5" opacity="0.6" />
      <g fill="#0a0d1a" opacity="0.72">
        <rect x={x + 7} y={y + 7} width="13" height="5" rx="2" />
        <rect x={x + s - 20} y={y + 7} width="13" height="5" rx="2" />
        <rect x={x + 7} y={y + s - 12} width="13" height="5" rx="2" />
        <rect x={x + s - 20} y={y + s - 12} width="13" height="5" rx="2" />
      </g>
      {label && (
        <rect x={x + s / 2 - 13} y={y + s / 2 + 9} width="26" height="9" rx="2" fill="#f0be2e" opacity="0.55" />
      )}
    </g>
  )
}
