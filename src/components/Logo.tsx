import { motion } from 'framer-motion'

/** The Toni's Weather brand mark — a sunny badge with Gigi peeking over clouds. */
export function LogoMark({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden>
      <defs>
        <linearGradient id="lm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8aa9ff" />
          <stop offset="55%" stopColor="#a99bff" />
          <stop offset="100%" stopColor="#c8b6ff" />
        </linearGradient>
        <radialGradient id="lm-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7df" />
          <stop offset="60%" stopColor="#ffd166" />
          <stop offset="100%" stopColor="#ffd166" stopOpacity="0" />
        </radialGradient>
        <clipPath id="lm-clip">
          <circle cx="100" cy="100" r="92" />
        </clipPath>
      </defs>

      <circle cx="100" cy="100" r="96" fill="#fff" opacity="0.5" />
      <g clipPath="url(#lm-clip)">
        <rect x="8" y="8" width="184" height="184" fill="url(#lm-sky)" />
        {/* sun */}
        <circle cx="132" cy="66" r="62" fill="url(#lm-sun)" />
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '132px 66px' }}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2
            return (
              <line
                key={i}
                x1={132 + Math.cos(a) * 30}
                y1={66 + Math.sin(a) * 30}
                x2={132 + Math.cos(a) * 40}
                y2={66 + Math.sin(a) * 40}
                stroke="#ffe9a8"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.85"
              />
            )
          })}
          <circle cx="132" cy="66" r="22" fill="#ffe27a" />
        </motion.g>

        {/* giraffe peeking up from behind the clouds */}
        <g transform="translate(58 70) scale(1.15)">
          <line x1="10" y1="14" x2="8" y2="2" stroke="#f6b85e" strokeWidth="5" strokeLinecap="round" />
          <circle cx="7" cy="1" r="6" fill="#c98b3f" />
          <line x1="34" y1="14" x2="36" y2="2" stroke="#f6b85e" strokeWidth="5" strokeLinecap="round" />
          <circle cx="37" cy="1" r="6" fill="#c98b3f" />
          <ellipse cx="22" cy="30" rx="28" ry="26" fill="#ffd98a" />
          <ellipse cx="22" cy="44" rx="19" ry="14" fill="#fff0d6" />
          <ellipse cx="14" cy="44" rx="2.6" ry="3.6" fill="#9c6b32" />
          <ellipse cx="30" cy="44" rx="2.6" ry="3.6" fill="#9c6b32" />
          <circle cx="11" cy="26" r="6" fill="#3a2e22" />
          <circle cx="33" cy="26" r="6" fill="#3a2e22" />
          <circle cx="9.5" cy="24" r="2" fill="#fff" />
          <circle cx="31.5" cy="24" r="2" fill="#fff" />
          <path d="M13 50 Q22 57 31 50" stroke="#c4773a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <circle cx="2" cy="36" r="8" fill="#ffb0c4" opacity="0.55" />
          <circle cx="42" cy="36" r="8" fill="#ffb0c4" opacity="0.55" />
        </g>

        {/* clouds in front */}
        <g fill="#ffffff">
          <ellipse cx="56" cy="150" rx="46" ry="26" />
          <ellipse cx="92" cy="142" rx="34" ry="26" />
          <ellipse cx="140" cy="152" rx="40" ry="24" />
          <rect x="20" y="150" width="160" height="40" />
        </g>
        <g fill="#eef0ff" opacity="0.7">
          <ellipse cx="150" cy="170" rx="30" ry="14" />
        </g>
      </g>
      <circle cx="100" cy="100" r="92" fill="none" stroke="#fff" strokeWidth="4" opacity="0.85" />
    </svg>
  )
}

/** Full lockup: mark + wordmark + tagline. */
export default function Logo({
  size = 120,
  showTagline = true,
}: {
  size?: number
  showTagline?: boolean
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <LogoMark size={size} />
      <h1
        className="mt-4 font-display font-semibold leading-none text-ink"
        style={{ fontSize: size * 0.34 }}
      >
        Toni's Weather
      </h1>
      {showTagline && (
        <p className="mt-2 text-sm font-semibold tracking-wide text-ink/45">
          your forecast for body & mood
        </p>
      )}
    </div>
  )
}
