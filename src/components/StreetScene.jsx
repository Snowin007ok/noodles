/**
 * The street where the class stands — one town, two halves.
 *
 * Left is the world the older generation grew up in: a post office with a red
 * letterbox, a radio & TV shop, a telephone booth, a newspaper stand, a big
 * tree with a swing and a bench. Right is the world the younger one lives in:
 * a café full of laptops, a phone store billboard, glass offices, a delivery
 * scooter, a signal tower. The sky itself grades from a warm nostalgic sunset
 * on the left into a cool clear morning on the right — the evolution, drawn.
 *
 * The class are NOT drawn here; Lobby positions them on the pavement so they
 * can be animated, focused and tapped independently.
 */

const INK = '#3a2a26'

export default function StreetScene({ alarm, lost }) {
  return (
    <svg
      className={`street${alarm ? ' street--alarm' : ''}${lost ? ' street--lost' : ''}`}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Sunset warmth on the old side, clear cool morning on the new. */}
        <linearGradient id="sky" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f6a65b" />
          <stop offset="32%" stopColor="#f2c489" />
          <stop offset="60%" stopColor="#b7d3d6" />
          <stop offset="100%" stopColor="#6fb0c9" />
        </linearGradient>
        <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff2d6" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="pavement" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c9a27a" />
          <stop offset="50%" stopColor="#b9a48f" />
          <stop offset="100%" stopColor="#9fb2b8" />
        </linearGradient>
        <linearGradient id="pavementShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.18" />
          <stop offset="18%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7a5c48" />
          <stop offset="100%" stopColor="#4f5b66" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d8f1f7" />
          <stop offset="100%" stopColor="#7fb8cf" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff1b8" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#ffd07a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffd07a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vignette" cx="0.5" cy="0.55" r="0.75">
          <stop offset="60%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#2a1a12" stopOpacity="0.45" />
        </radialGradient>
        <radialGradient id="alarmWash" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0%" stopColor="#d9563a" stopOpacity="0" />
          <stop offset="100%" stopColor="#d9563a" stopOpacity="0.55" />
        </radialGradient>
        <pattern id="tiles" width="60" height="30" patternUnits="userSpaceOnUse">
          <rect width="60" height="30" fill="none" />
          <path d="M0 29.5h60M29.5 0v30" stroke="#000" strokeWidth="1.2" opacity="0.13" />
        </pattern>
        <pattern id="bricks" width="28" height="14" patternUnits="userSpaceOnUse">
          <rect width="28" height="14" fill="none" />
          <path d="M0 13.5h28M13.5 0v7M27.5 7v7" stroke="#000" strokeWidth="1" opacity="0.12" />
        </pattern>
        <clipPath id="sceneClip">
          <rect x="0" y="0" width="1200" height="800" rx="26" />
        </clipPath>
      </defs>

      <g clipPath="url(#sceneClip)">
        {/* ================= SKY ================= */}
        <rect x="0" y="0" width="1200" height="800" fill="url(#sky)" />
        <circle cx="190" cy="230" r="230" fill="url(#sunGlow)" />
        <circle cx="190" cy="230" r="58" fill="#fff0bf" stroke="#f4c473" strokeWidth="6" />
        {/* soft clouds */}
        <g fill="#fff" opacity="0.7">
          <ellipse cx="420" cy="120" rx="70" ry="22" />
          <ellipse cx="470" cy="108" rx="48" ry="26" />
          <ellipse cx="830" cy="150" rx="82" ry="22" />
          <ellipse cx="880" cy="136" rx="50" ry="26" />
        </g>
        {/* birds on the old side, a drone on the new */}
        <g fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.7">
          <path d="M300 170q10-10 20 0q10-10 20 0" />
          <path d="M350 145q8-8 16 0q8-8 16 0" />
        </g>
        <g className="drone" transform="translate(1030 130)">
          <rect x="-16" y="-4" width="32" height="10" rx="4" fill="#4b5563" stroke={INK} strokeWidth="3" />
          <path d="M-26-8h20M6-8h20" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="8" r="3" fill="#ff5c5c" />
        </g>

        {/* signal arcs from the tower on the new side */}
        <g fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.55" className="signal-arcs">
          <path d="M1112 236a28 28 0 0 1 0-40" />
          <path d="M1124 248a44 44 0 0 1 0-64" />
          <path d="M1136 260a60 60 0 0 1 0-88" />
        </g>

        {/* ================= DISTANT SKYLINE ================= */}
        <g fill="#c98d63" opacity="0.55">
          {/* old town: clock tower, tiled roofs, water tank */}
          <path d="M40 330h60v-60l30-30 30 30v60h50v-40h40v40h60v-70h40v70h40v-50h40v50h30v90H40z" />
          <rect x="88" y="200" width="24" height="60" />
          <polygon points="80,205 100,170 120,205" />
        </g>
        <g fill="#5f8ea6" opacity="0.5">
          {/* new town: glass towers, antenna */}
          <rect x="820" y="230" width="70" height="190" />
          <rect x="905" y="180" width="60" height="240" />
          <rect x="980" y="260" width="90" height="160" />
          <rect x="1085" y="215" width="50" height="205" />
          <rect x="1108" y="150" width="6" height="70" />
        </g>
        <rect x="0" y="300" width="1200" height="140" fill="url(#skyFade)" />

        {/* ================= HILLS / PARK BAND ================= */}
        <path d="M0 460q150-70 320-40t340 30t280-40t260 20v100H0z" fill="#8fb37a" />
        <path d="M0 470q160-50 330-25t330 20t270-30t270 25v90H0z" fill="#79a066" />

        {/* ================= BUILDINGS — OLD SIDE ================= */}
        {/* Post office */}
        <g>
          <rect x="30" y="330" width="220" height="170" fill="#f1d9b6" stroke={INK} strokeWidth="5" />
          <rect x="30" y="330" width="220" height="170" fill="url(#bricks)" />
          <rect x="22" y="310" width="236" height="30" rx="4" fill="#c85b3b" stroke={INK} strokeWidth="5" />
          <text x="140" y="333" textAnchor="middle" fontFamily="Fredoka Variable, sans-serif" fontWeight="700" fontSize="19" fill="#fff3e6" letterSpacing="3">POST OFFICE</text>
          <rect x="60" y="370" width="52" height="60" fill="#8ec5d6" stroke={INK} strokeWidth="4" />
          <path d="M86 370v60M60 400h52" stroke={INK} strokeWidth="3" />
          <rect x="170" y="370" width="52" height="60" fill="#8ec5d6" stroke={INK} strokeWidth="4" />
          <path d="M196 370v60M170 400h52" stroke={INK} strokeWidth="3" />
          <rect x="118" y="410" width="44" height="90" fill="#6b4a3c" stroke={INK} strokeWidth="4" />
          <circle cx="152" cy="458" r="3.5" fill="#f2b134" />
          {/* letterbox */}
          <rect x="262" y="420" width="30" height="70" rx="6" fill="#d9563a" stroke={INK} strokeWidth="4" />
          <rect x="266" y="432" width="22" height="6" rx="2" fill={INK} />
          <rect x="258" y="486" width="38" height="14" rx="3" fill="#8a3520" stroke={INK} strokeWidth="3" />
        </g>

        {/* Radio & TV shop */}
        <g>
          <rect x="300" y="360" width="170" height="140" fill="#e9c27f" stroke={INK} strokeWidth="5" />
          <rect x="292" y="342" width="186" height="26" rx="4" fill="#3c6e8f" stroke={INK} strokeWidth="5" />
          <text x="385" y="362" textAnchor="middle" fontFamily="Fredoka Variable, sans-serif" fontWeight="700" fontSize="15" fill="#fff3e6" letterSpacing="2">RADIO &amp; TV</text>
          {/* shop window with a TV and a radio */}
          <rect x="316" y="384" width="138" height="78" fill="#cfe8ef" stroke={INK} strokeWidth="4" />
          <rect x="330" y="398" width="56" height="44" rx="6" fill="#5a4038" stroke={INK} strokeWidth="3" />
          <rect x="336" y="404" width="40" height="30" rx="3" fill="#a9d7dd" />
          <path d="M340 410l32 18M340 428l32-18" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
          <path d="M352 398l-8-16M364 398l8-16" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <rect x="398" y="412" width="44" height="30" rx="6" fill="#c9885a" stroke={INK} strokeWidth="3" />
          <circle cx="410" cy="427" r="7" fill="#f6e3c2" stroke={INK} strokeWidth="2" />
          <rect x="422" y="418" width="14" height="18" rx="2" fill="#7a5040" />
          <rect x="358" y="470" width="54" height="30" fill="#6b4a3c" stroke={INK} strokeWidth="4" />
        </g>

        {/* Telephone booth */}
        <g>
          <rect x="492" y="392" width="48" height="108" rx="6" fill="#d9563a" stroke={INK} strokeWidth="5" />
          <rect x="500" y="404" width="32" height="60" rx="3" fill="#a9d7dd" stroke={INK} strokeWidth="3" />
          <path d="M516 404v60M500 424h32M500 444h32" stroke={INK} strokeWidth="2" opacity="0.6" />
          <rect x="488" y="382" width="56" height="14" rx="3" fill="#f2b134" stroke={INK} strokeWidth="4" />
          <rect x="512" y="440" width="10" height="14" rx="3" fill={INK} />
        </g>

        {/* Newspaper stand */}
        <g>
          <rect x="556" y="440" width="70" height="60" fill="#7a9b6a" stroke={INK} strokeWidth="4" />
          <path d="M550 444h82l-8-22H558z" fill="#f2b134" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <rect x="566" y="452" width="22" height="30" fill="#fff7ea" stroke={INK} strokeWidth="2" />
          <path d="M570 458h14M570 464h14M570 470h10" stroke={INK} strokeWidth="1.5" />
          <rect x="594" y="452" width="22" height="30" fill="#fff7ea" stroke={INK} strokeWidth="2" />
          <path d="M598 458h14M598 464h14M598 470h10" stroke={INK} strokeWidth="1.5" />
        </g>

        {/* ================= CENTRE — the park ================= */}
        {/* big tree */}
        <g>
          <rect x="688" y="400" width="26" height="100" fill="#7a5040" stroke={INK} strokeWidth="4" />
          <ellipse cx="700" cy="360" rx="96" ry="70" fill="#6f9e58" stroke={INK} strokeWidth="5" />
          <ellipse cx="660" cy="380" rx="56" ry="42" fill="#7fb066" stroke={INK} strokeWidth="4" />
          <ellipse cx="748" cy="384" rx="56" ry="40" fill="#8bbb70" stroke={INK} strokeWidth="4" />
          {/* swing */}
          <path d="M744 366v90M772 362v94" stroke={INK} strokeWidth="3" />
          <rect x="736" y="452" width="44" height="10" rx="3" fill="#e9c27f" stroke={INK} strokeWidth="3" />
        </g>
        {/* bench */}
        <g>
          <rect x="596" y="470" width="80" height="12" rx="3" fill="#c98d63" stroke={INK} strokeWidth="3" />
          <rect x="596" y="452" width="80" height="12" rx="3" fill="#c98d63" stroke={INK} strokeWidth="3" />
          <path d="M604 482v18M668 482v18" stroke={INK} strokeWidth="4" />
        </g>
        {/* lamp post with bunting anchor */}
        <g>
          <rect x="806" y="380" width="8" height="120" fill="#4b4a52" stroke={INK} strokeWidth="3" />
          <rect x="794" y="366" width="32" height="18" rx="4" fill="#f2b134" stroke={INK} strokeWidth="3" />
        </g>

        {/* ================= BUILDINGS — NEW SIDE ================= */}
        {/* Café */}
        <g>
          <rect x="840" y="350" width="190" height="150" fill="#fff4e3" stroke={INK} strokeWidth="5" />
          <rect x="832" y="332" width="206" height="26" rx="4" fill="#2ab3a6" stroke={INK} strokeWidth="5" />
          <text x="935" y="352" textAnchor="middle" fontFamily="Fredoka Variable, sans-serif" fontWeight="700" fontSize="16" fill="#fff3e6" letterSpacing="2">CAFÉ · FREE WIFI</text>
          <rect x="856" y="374" width="158" height="86" fill="url(#glass)" stroke={INK} strokeWidth="4" />
          {/* laptops on the counter */}
          <g fill="#3c3f4b" stroke={INK} strokeWidth="2.5">
            <path d="M872 428h30v-20h-30z" />
            <path d="M910 428h30v-20h-30z" />
            <path d="M948 428h30v-20h-30z" />
          </g>
          <path d="M866 430h120" stroke={INK} strokeWidth="4" />
          {/* wifi sign */}
          <g fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
            <path d="M994 398a14 14 0 0 1 22 0" />
            <path d="M999 405a8 8 0 0 1 12 0" />
          </g>
          <circle cx="1005" cy="411" r="2.5" fill="#fff" />
          <rect x="920" y="466" width="40" height="34" fill="#4d6a75" stroke={INK} strokeWidth="4" />
        </g>

        {/* Phone store billboard on a glass office */}
        <g>
          <rect x="1050" y="300" width="130" height="200" fill="url(#glass)" stroke={INK} strokeWidth="5" />
          <path d="M1050 340h130M1050 380h130M1050 420h130M1050 460h130M1093 300v200M1137 300v200" stroke={INK} strokeWidth="2" opacity="0.35" />
          {/* Billboard sits on the glass face, well below the then→now ribbon
              even when a wide display crops the top of the scene. */}
          <rect x="1058" y="318" width="114" height="60" rx="8" fill="#2f2a3a" stroke={INK} strokeWidth="5" />
          <rect x="1070" y="328" width="20" height="40" rx="5" fill="#8ec5d6" stroke="#fff" strokeWidth="2" />
          <text x="1128" y="344" textAnchor="middle" fontFamily="Fredoka Variable, sans-serif" fontWeight="700" fontSize="13" fill="#fff3e6" letterSpacing="1">NEW PHONE</text>
          <text x="1128" y="362" textAnchor="middle" fontFamily="Fredoka Variable, sans-serif" fontWeight="700" fontSize="13" fill="#f2b134" letterSpacing="1">PRE-ORDER</text>
        </g>

        {/* Signal tower */}
        <g>
          <path d="M1104 236l-14 264h28z" fill="#5c6670" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M1093 330h22M1090 400h28" stroke={INK} strokeWidth="3" />
          <circle cx="1104" cy="234" r="6" fill="#ff5c5c" stroke={INK} strokeWidth="3" />
        </g>

        {/* ================= PAVEMENT / ROAD ================= */}
        <rect x="0" y="500" width="1200" height="300" fill="url(#pavement)" />
        <rect x="0" y="500" width="1200" height="300" fill="url(#tiles)" />
        <rect x="0" y="500" width="1200" height="300" fill="url(#pavementShade)" />
        <path d="M0 500h1200" stroke={INK} strokeWidth="5" />
        {/* the join between old stone and new concrete */}
        <path d="M600 500v300" stroke="#fff" strokeWidth="3" opacity="0.25" strokeDasharray="14 12" />
        {/* hopscotch chalk on the old side — life, not tech */}
        <g fill="none" stroke="#fff" strokeWidth="3" opacity="0.55" className="chalk">
          <rect x="70" y="700" width="40" height="40" />
          <rect x="70" y="660" width="40" height="40" />
          <rect x="50" y="620" width="40" height="40" />
          <rect x="90" y="620" width="40" height="40" />
          <rect x="70" y="580" width="40" height="40" />
        </g>
        {/* charging bollard + scooter on the new side */}
        <g>
          <rect x="1120" y="600" width="18" height="60" rx="4" fill="#2ab3a6" stroke={INK} strokeWidth="3" />
          <rect x="1124" y="608" width="10" height="14" rx="2" fill="#dff8f5" />
          <g transform="translate(1040 640)">
            <circle cx="0" cy="34" r="14" fill="#333" stroke={INK} strokeWidth="3" />
            <circle cx="70" cy="34" r="14" fill="#333" stroke={INK} strokeWidth="3" />
            <path d="M0 34l22-30h34l14 30" fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
            <rect x="18" y="-6" width="40" height="20" rx="6" fill="#ef8b3b" stroke={INK} strokeWidth="3" />
            <rect x="34" y="-18" width="26" height="22" rx="5" fill="#f2b134" stroke={INK} strokeWidth="3" />
          </g>
        </g>

        {/* ================= LIGHT ================= */}
        <rect x="0" y="0" width="1200" height="800" fill="url(#vignette)" />
        <rect className="street-alarm" x="0" y="0" width="1200" height="800" fill="url(#alarmWash)" />
      </g>
    </svg>
  )
}
