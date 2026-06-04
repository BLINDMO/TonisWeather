import { useId } from 'react'
import { motion } from 'framer-motion'

/** Murph — Toni's gentle giraffe companion. Refined, soft, premium. */
export default function Giraffe({
  size = 120,
  wave = true,
  className = '',
}: {
  size?: number
  wave?: boolean
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const id = (s: string) => `${uid}-${s}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 170 184"
      className={className}
      aria-label="Murph the giraffe"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={id('body')} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#FFE0A0" />
          <stop offset="60%" stopColor="#FCC76A" />
          <stop offset="100%" stopColor="#F2B24E" />
        </linearGradient>
        <linearGradient id={id('belly')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF3DC" />
          <stop offset="100%" stopColor="#FFE6BE" />
        </linearGradient>
        <radialGradient id={id('cheek')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF9FB6" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FF9FB6" stopOpacity="0" />
        </radialGradient>
        <filter id={id('soft')} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#C98B3F" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="86" cy="170" rx="44" ry="9" fill="#C98B3F" opacity="0.14" />

      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* legs */}
        <g fill={`url(#${id('body')})`}>
          <rect x="64" y="138" width="17" height="30" rx="8.5" />
          <rect x="92" y="138" width="17" height="30" rx="8.5" />
          <ellipse cx="72.5" cy="167" rx="10" ry="6" fill="#E79A3F" />
          <ellipse cx="100.5" cy="167" rx="10" ry="6" fill="#E79A3F" />
        </g>

        {/* body */}
        <ellipse cx="86" cy="124" rx="40" ry="33" fill={`url(#${id('body')})`} filter={`url(#${id('soft')})`} />
        <ellipse cx="86" cy="132" rx="24" ry="20" fill={`url(#${id('belly')})`} />
        {/* body spots */}
        <g fill="#E79A3F" opacity="0.55">
          <ellipse cx="58" cy="116" rx="6" ry="7" transform="rotate(-18 58 116)" />
          <ellipse cx="112" cy="118" rx="6.5" ry="7.5" transform="rotate(14 112 118)" />
          <ellipse cx="106" cy="142" rx="5.5" ry="6" />
        </g>

        {/* waving arm */}
        <motion.g
          style={{ transformOrigin: '118px 116px' }}
          animate={wave ? { rotate: [0, -24, 4, -24, 0] } : {}}
          transition={{ duration: 1.9, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
        >
          <rect x="112" y="104" width="15" height="30" rx="7.5" fill={`url(#${id('body')})`} />
          <circle cx="119.5" cy="134" r="8.5" fill="#FCC76A" />
        </motion.g>
        <rect x="46" y="106" width="15" height="28" rx="7.5" fill={`url(#${id('body')})`} />
        <circle cx="53.5" cy="133" r="8.5" fill="#FCC76A" />

        {/* neck */}
        <path d="M74 96 Q72 70 80 52 L98 56 Q94 78 96 100 Z" fill={`url(#${id('body')})`} />
        <g fill="#E79A3F" opacity="0.5">
          <circle cx="82" cy="74" r="4" />
          <circle cx="90" cy="88" r="3.6" />
        </g>

        {/* head group */}
        <motion.g
          animate={{ rotate: [-2.5, 2.5, -2.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '84px 44px' }}
        >
          {/* ossicones */}
          <g>
            <rect x="70" y="8" width="6" height="18" rx="3" fill="#F2B24E" transform="rotate(-10 73 17)" />
            <circle cx="71" cy="8" r="6" fill="#D98E3C" />
            <rect x="92" y="8" width="6" height="18" rx="3" fill="#F2B24E" transform="rotate(10 95 17)" />
            <circle cx="97" cy="8" r="6" fill="#D98E3C" />
          </g>
          {/* ears */}
          <ellipse cx="56" cy="36" rx="12" ry="7.5" fill="#F2B24E" transform="rotate(-26 56 36)" />
          <ellipse cx="58" cy="36" rx="6" ry="3.6" fill="#FFE6BE" transform="rotate(-26 58 36)" />
          <ellipse cx="112" cy="36" rx="12" ry="7.5" fill="#F2B24E" transform="rotate(26 112 36)" />
          <ellipse cx="110" cy="36" rx="6" ry="3.6" fill="#FFE6BE" transform="rotate(26 110 36)" />

          {/* face */}
          <path
            d="M50 44 Q50 22 84 22 Q118 22 118 44 Q118 66 96 70 Q84 72 72 70 Q50 66 50 44 Z"
            fill={`url(#${id('body')})`}
            filter={`url(#${id('soft')})`}
          />
          {/* snout */}
          <ellipse cx="84" cy="58" rx="22" ry="15" fill={`url(#${id('belly')})`} />
          <ellipse cx="75" cy="57" rx="2.6" ry="3.8" fill="#A06A30" />
          <ellipse cx="93" cy="57" rx="2.6" ry="3.8" fill="#A06A30" />
          <path d="M78 64 Q84 69 90 64" stroke="#C98B3F" strokeWidth="2.4" fill="none" strokeLinecap="round" />

          {/* eyes */}
          <g>
            <ellipse cx="70" cy="42" rx="7" ry="8" fill="#fff" />
            <ellipse cx="98" cy="42" rx="7" ry="8" fill="#fff" />
            <circle cx="71" cy="43" r="4.6" fill="#3A2E22" />
            <circle cx="99" cy="43" r="4.6" fill="#3A2E22" />
            <circle cx="69.3" cy="41" r="1.7" fill="#fff" />
            <circle cx="97.3" cy="41" r="1.7" fill="#fff" />
            {/* soft eyelids for a gentle look */}
            <path d="M63 37 Q70 33 77 37" stroke="#E79A3F" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M91 37 Q98 33 105 37" stroke="#E79A3F" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>

          {/* cheeks */}
          <circle cx="58" cy="52" r="9" fill={`url(#${id('cheek')})`} />
          <circle cx="110" cy="52" r="9" fill={`url(#${id('cheek')})`} />
        </motion.g>
      </motion.g>
    </svg>
  )
}
