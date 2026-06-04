import { useId } from 'react'
import { motion } from 'framer-motion'

/** The Toni's Weather brand mark — a glowing sun rising over clouds with Gigi peeking. */
export function LogoMark({ size = 120 }: { size?: number }) {
  const uid = useId().replace(/:/g, '')
  const id = (s: string) => `${uid}-${s}`
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={id('sky')} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#7B6CF6" />
          <stop offset="48%" stopColor="#9A7CF0" />
          <stop offset="100%" stopColor="#E59AC0" />
        </linearGradient>
        <radialGradient id={id('sun')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF4D2" />
          <stop offset="55%" stopColor="#FFD15C" />
          <stop offset="100%" stopColor="#FFB020" />
        </radialGradient>
        <radialGradient id={id('halo')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE7A8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFE7A8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('body')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE0A0" />
          <stop offset="100%" stopColor="#F2B24E" />
        </linearGradient>
        <linearGradient id={id('cloud')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EEF1FB" />
        </linearGradient>
        <clipPath id={id('clip')}>
          <rect x="12" y="12" width="176" height="176" rx="46" />
        </clipPath>
        <filter id={id('ds')} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#5B4B9E" floodOpacity="0.45" />
        </filter>
      </defs>

      <g filter={`url(#${id('ds')})`}>
        <rect x="12" y="12" width="176" height="176" rx="46" fill={`url(#${id('sky')})`} />
        <g clipPath={`url(#${id('clip')})`}>
          {/* sun + halo */}
          <circle cx="126" cy="74" r="70" fill={`url(#${id('halo')})`} />
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '126px 74px' }}
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2
              return (
                <line
                  key={i}
                  x1={126 + Math.cos(a) * 30}
                  y1={74 + Math.sin(a) * 30}
                  x2={126 + Math.cos(a) * 41}
                  y2={74 + Math.sin(a) * 41}
                  stroke="#FFD970"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              )
            })}
            <circle cx="126" cy="74" r="24" fill={`url(#${id('sun')})`} />
          </motion.g>

          {/* giraffe peeking */}
          <g transform="translate(56 78)">
            <rect x="16" y="2" width="6" height="16" rx="3" fill="#F2B24E" transform="rotate(-10 19 10)" />
            <circle cx="17" cy="2" r="6" fill="#D98E3C" />
            <rect x="42" y="2" width="6" height="16" rx="3" fill="#F2B24E" transform="rotate(10 45 10)" />
            <circle cx="47" cy="2" r="6" fill="#D98E3C" />
            <path d="M6 34 Q6 14 32 14 Q58 14 58 34 Q58 52 40 55 Q32 56 24 55 Q6 52 6 34 Z" fill={`url(#${id('body')})`} />
            <ellipse cx="32" cy="44" rx="16" ry="11" fill="#FFF3DC" />
            <ellipse cx="25" cy="43" rx="2" ry="3" fill="#A06A30" />
            <ellipse cx="39" cy="43" rx="2" ry="3" fill="#A06A30" />
            <path d="M27 49 Q32 53 37 49" stroke="#C98B3F" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="22" cy="32" rx="5.4" ry="6" fill="#fff" />
            <ellipse cx="42" cy="32" rx="5.4" ry="6" fill="#fff" />
            <circle cx="23" cy="33" r="3.5" fill="#3A2E22" />
            <circle cx="43" cy="33" r="3.5" fill="#3A2E22" />
            <circle cx="21.8" cy="31.6" r="1.3" fill="#fff" />
            <circle cx="41.8" cy="31.6" r="1.3" fill="#fff" />
            <circle cx="12" cy="41" r="6.5" fill="#FF9FB6" opacity="0.6" />
            <circle cx="52" cy="41" r="6.5" fill="#FF9FB6" opacity="0.6" />
          </g>

          {/* clouds in front */}
          <g fill={`url(#${id('cloud')})`}>
            <ellipse cx="58" cy="158" rx="50" ry="30" />
            <ellipse cx="100" cy="150" rx="38" ry="30" />
            <ellipse cx="150" cy="160" rx="44" ry="27" />
            <rect x="14" y="158" width="172" height="40" />
          </g>
          <ellipse cx="150" cy="178" rx="34" ry="14" fill="#E7ECFB" opacity="0.7" />
        </g>
        {/* inner highlight ring for depth */}
        <rect x="14" y="14" width="172" height="172" rx="44" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
      </g>
    </svg>
  )
}

/** Full lockup: mark + wordmark + tagline. */
export default function Logo({
  size = 120,
  showTagline = true,
  dark = false,
}: {
  size?: number
  showTagline?: boolean
  dark?: boolean
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <LogoMark size={size} />
      <h1
        className={`mt-5 font-display font-semibold leading-none ${dark ? 'text-white' : 'text-ink'}`}
        style={{ fontSize: size * 0.32 }}
      >
        Toni's Weather
      </h1>
      {showTagline && (
        <p className={`mt-2.5 text-sm font-semibold tracking-[0.12em] ${dark ? 'text-white/60' : 'text-ink/45'}`}>
          YOUR FORECAST FOR BODY &amp; MOOD
        </p>
      )}
    </div>
  )
}
