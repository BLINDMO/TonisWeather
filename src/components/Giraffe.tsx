import { motion } from 'framer-motion'

/** Gigi the giraffe — Toni's gentle companion. */
export default function Giraffe({
  size = 120,
  wave = true,
  className = '',
}: {
  size?: number
  wave?: boolean
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={className}
      aria-label="Gigi the giraffe"
    >
      <defs>
        <linearGradient id="gi-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd98a" />
          <stop offset="100%" stopColor="#f6b85e" />
        </linearGradient>
        <radialGradient id="gi-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb0c4" />
          <stop offset="100%" stopColor="#ffb0c4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* gentle floating */}
      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* neck */}
        <rect x="66" y="78" width="22" height="44" rx="11" fill="url(#gi-body)" />
        <circle cx="72" cy="92" r="4" fill="#e09a45" />
        <circle cx="82" cy="104" r="4" fill="#e09a45" />

        {/* body */}
        <ellipse cx="80" cy="128" rx="34" ry="24" fill="url(#gi-body)" />
        <circle cx="66" cy="124" r="4" fill="#e09a45" />
        <circle cx="92" cy="120" r="4" fill="#e09a45" />
        <circle cx="84" cy="136" r="4" fill="#e09a45" />

        {/* waving arm */}
        <motion.g
          style={{ transformOrigin: '108px 122px' }}
          animate={wave ? { rotate: [0, -22, 6, -22, 0] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
        >
          <rect x="104" y="116" width="12" height="26" rx="6" fill="url(#gi-body)" />
          <circle cx="110" cy="142" r="7" fill="#ffd98a" />
        </motion.g>

        {/* head */}
        <g>
          {/* ossicones */}
          <line x1="62" y1="44" x2="60" y2="30" stroke="#f6b85e" strokeWidth="4" strokeLinecap="round" />
          <circle cx="59" cy="28" r="5" fill="#c98b3f" />
          <line x1="78" y1="44" x2="80" y2="30" stroke="#f6b85e" strokeWidth="4" strokeLinecap="round" />
          <circle cx="81" cy="28" r="5" fill="#c98b3f" />

          {/* ears */}
          <ellipse cx="48" cy="54" rx="9" ry="6" fill="#f6b85e" transform="rotate(-20 48 54)" />
          <ellipse cx="92" cy="54" rx="9" ry="6" fill="#f6b85e" transform="rotate(20 92 54)" />

          {/* face */}
          <ellipse cx="70" cy="60" rx="26" ry="24" fill="url(#gi-body)" />
          {/* snout */}
          <ellipse cx="70" cy="74" rx="18" ry="13" fill="#fff0d6" />
          <ellipse cx="63" cy="74" rx="2.4" ry="3.4" fill="#9c6b32" />
          <ellipse cx="77" cy="74" rx="2.4" ry="3.4" fill="#9c6b32" />

          {/* eyes */}
          <circle cx="60" cy="58" r="5.4" fill="#3a2e22" />
          <circle cx="58.4" cy="56.4" r="1.8" fill="#fff" />
          <circle cx="82" cy="58" r="5.4" fill="#3a2e22" />
          <circle cx="80.4" cy="56.4" r="1.8" fill="#fff" />

          {/* smile */}
          <path d="M62 80 Q70 86 78 80" stroke="#c4773a" strokeWidth="2.4" fill="none" strokeLinecap="round" />

          {/* cheeks */}
          <circle cx="50" cy="68" r="8" fill="#ffb0c4" opacity="0.55" />
          <circle cx="90" cy="68" r="8" fill="#ffb0c4" opacity="0.55" />
        </g>
      </motion.g>
    </svg>
  )
}
