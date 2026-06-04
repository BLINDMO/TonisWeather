import { useId } from 'react'
import { motion } from 'framer-motion'
import type { WeatherKind } from '../types'

/**
 * Premium weather glyphs — rich gradients, layered depth, gentle motion.
 * Renders crisp at any size. Large sizes (≥100px) get canvas-composite glow.
 */
export default function WeatherGlyph({
  kind,
  size = 120,
  animate = true,
  className = '',
}: {
  kind: WeatherKind
  size?: number
  animate?: boolean
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const id = (s: string) => `${uid}-${s}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Sun gradients */}
        <radialGradient id={id('sunCore')} cx="38%" cy="36%" r="56%">
          <stop offset="0%" stopColor="#FFFCE0" />
          <stop offset="35%" stopColor="#FFE840" />
          <stop offset="70%" stopColor="#FFBC18" />
          <stop offset="100%" stopColor="#FF8C00" />
        </radialGradient>
        <radialGradient id={id('sunGlow')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE060" stopOpacity="0.90" />
          <stop offset="50%" stopColor="#FFAD00" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#FF7A00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('sunHalo')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF0A0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFD060" stopOpacity="0" />
        </radialGradient>
        {/* Cloud gradients */}
        <linearGradient id={id('cloudLit')} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#F0F4FF" />
          <stop offset="100%" stopColor="#DDE4F8" />
        </linearGradient>
        <linearGradient id={id('cloudDark')} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#CBD5EE" />
          <stop offset="50%" stopColor="#B0BCDA" />
          <stop offset="100%" stopColor="#99A8C8" />
        </linearGradient>
        <linearGradient id={id('cloudStorm')} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#9C96C4" />
          <stop offset="100%" stopColor="#6B6395" />
        </linearGradient>
        {/* Rain drop gradient */}
        <linearGradient id={id('rain')} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A8C8FF" />
          <stop offset="100%" stopColor="#5A8CE8" />
        </linearGradient>
        {/* Lightning bolt */}
        <linearGradient id={id('bolt')} x1="0%" y1="0%" x2="30%" y2="100%">
          <stop offset="0%" stopColor="#FFF080" />
          <stop offset="40%" stopColor="#FFD820" />
          <stop offset="100%" stopColor="#FFA010" />
        </linearGradient>
        {/* Tornado funnel */}
        <linearGradient id={id('funnel')} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#C8BAEA" />
          <stop offset="50%" stopColor="#9A8ED4" />
          <stop offset="100%" stopColor="#6E60B0" />
        </linearGradient>
        {/* Drop shadow filter */}
        <filter id={id('shadow')} x="-40%" y="-30%" width="180%" height="180%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#3E4E8A" floodOpacity="0.28" />
        </filter>
        <filter id={id('glow')} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FFD060" floodOpacity="0.70" />
        </filter>
        <filter id={id('boltGlow')} x="-60%" y="-40%" width="220%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#FFE060" floodOpacity="0.90" />
        </filter>
        <filter id={id('rainGlow')} x="-40%" y="-20%" width="180%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#80AAFF" floodOpacity="0.60" />
        </filter>
      </defs>

      {(kind === 'bright' || kind === 'sunny') && <Sun id={id} animate={animate} big={kind === 'bright'} />}
      {kind === 'partly' && <PartlySun id={id} animate={animate} />}
      {kind === 'cloudy' && <Clouds id={id} animate={animate} />}
      {(kind === 'drizzle' || kind === 'rain') && (
        <RainCloud id={id} animate={animate} heavy={kind === 'rain'} />
      )}
      {kind === 'storm' && <Storm id={id} animate={animate} />}
      {kind === 'tornado' && <Tornado id={id} animate={animate} />}
    </svg>
  )
}

type IdFn = (s: string) => string

function SunRays({ cx, cy, r1, r2, count = 12, animate }: {
  cx: number; cy: number; r1: number; r2: number; count?: number; animate: boolean
}) {
  return (
    <motion.g
      animate={animate ? { rotate: 360 } : {}}
      transition={{ duration: 72, repeat: Infinity, ease: 'linear' }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2
        const isLong = i % 3 === 0
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * r1}
            y1={cy + Math.sin(a) * r1}
            x2={cx + Math.cos(a) * (isLong ? r2 * 1.18 : r2)}
            y2={cy + Math.sin(a) * (isLong ? r2 * 1.18 : r2)}
            stroke={isLong ? '#FFD040' : '#FFBE20'}
            strokeWidth={isLong ? 3.2 : 2.4}
            strokeLinecap="round"
            opacity={isLong ? 0.95 : 0.70}
          />
        )
      })}
    </motion.g>
  )
}

function Sun({ id, animate, big }: { id: IdFn; animate: boolean; big?: boolean }) {
  return (
    <g>
      {/* outer halo — wide glow ring */}
      <circle cx="50" cy="50" r="48" fill={`url(#${id('sunHalo')})`} />
      {/* mid glow */}
      <circle cx="50" cy="50" r="38" fill={`url(#${id('sunGlow')})`} />
      {/* rays */}
      <SunRays cx={50} cy={50} r1={big ? 26 : 27} r2={big ? 38 : 36} count={12} animate={animate} />
      {/* disc */}
      <motion.circle
        cx="50" cy="50" r="21"
        fill={`url(#${id('sunCore')})`}
        filter={`url(#${id('glow')})`}
        animate={animate ? { r: [21, 21.7, 21] } : {}}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* lens glare */}
      <ellipse cx="43" cy="42" rx="7.5" ry="4.5" fill="rgba(255,255,255,0.62)" transform="rotate(-30 43 42)" />
      <circle cx="46.5" cy="40.5" r="2.5" fill="rgba(255,255,255,0.50)" />
    </g>
  )
}

function PartlySun({ id, animate }: { id: IdFn; animate: boolean }) {
  return (
    <g>
      <g transform="translate(8 -6)">
        <circle cx="40" cy="34" r="28" fill={`url(#${id('sunHalo')})`} />
        <circle cx="40" cy="34" r="22" fill={`url(#${id('sunGlow')})`} />
        <SunRays cx={40} cy={34} r1={17} r2={25} count={10} animate={animate} />
        <circle cx="40" cy="34" r="13.5" fill={`url(#${id('sunCore')})`} filter={`url(#${id('glow')})`} />
        <ellipse cx="35" cy="29" rx="5" ry="3" fill="rgba(255,255,255,0.58)" transform="rotate(-28 35 29)" />
      </g>
      <CloudShape id={id} x={32} y={52} scale={1} animate={animate} />
    </g>
  )
}

function Clouds({ id, animate }: { id: IdFn; animate: boolean }) {
  return (
    <g>
      <CloudShape id={id} x={28} y={34} scale={0.80} dark animate={animate} delay={0.7} />
      <CloudShape id={id} x={52} y={56} scale={1.04} animate={animate} />
    </g>
  )
}

function CloudShape({
  id, x, y, scale = 1, dark = false, storm = false, animate = true, delay = 0,
}: {
  id: IdFn; x: number; y: number; scale?: number; dark?: boolean; storm?: boolean
  animate?: boolean; delay?: number
}) {
  const fill = storm
    ? `url(#${id('cloudStorm')})`
    : dark
    ? `url(#${id('cloudDark')})`
    : `url(#${id('cloudLit')})`

  return (
    <motion.g
      animate={animate ? { x: [0, 3.5, 0] } : {}}
      transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <g transform={`translate(${x} ${y}) scale(${scale})`} filter={`url(#${id('shadow')})`}>
        {/* base puff row */}
        <ellipse cx="0" cy="8" rx="23" ry="15" fill={fill} />
        {/* top puffs — bigger & more defined */}
        <circle cx="14" cy="-1" r="14.5" fill={fill} />
        <circle cx="-13" cy="2" r="12" fill={fill} />
        <circle cx="1"  cy="-5" r="10" fill={fill} />
        {/* bottom bar */}
        <rect x="-22" y="8" width="44" height="14" rx="7" fill={fill} />
        {/* highlight streak on lit clouds */}
        {!dark && !storm && (
          <ellipse cx="-4" cy="-3" rx="10" ry="5" fill="rgba(255,255,255,0.52)" transform="rotate(-20 -4 -3)" />
        )}
      </g>
    </motion.g>
  )
}

function Drops({ heavy, color }: { heavy?: boolean; color: string }) {
  const xs = heavy ? [28, 40, 52, 64, 35, 55] : [36, 50, 64]
  return (
    <g>
      {xs.map((x, i) => (
        <motion.line
          key={i}
          x1={x} y1={72} x2={x - 2.5} y2={81}
          stroke={color}
          strokeWidth="3.4"
          strokeLinecap="round"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: [0, 0.9, 0], y: [0, 16] }}
          transition={{
            duration: heavy ? 0.75 : 1.0,
            repeat: Infinity,
            delay: (i % 3) * 0.24,
            ease: 'easeIn',
          }}
        />
      ))}
    </g>
  )
}

function RainCloud({ id, animate, heavy }: { id: IdFn; animate: boolean; heavy?: boolean }) {
  return (
    <g filter={`url(#${id('rainGlow')})`}>
      <CloudShape id={id} x={50} y={44} scale={1.06} dark animate={animate} />
      <Drops heavy={heavy} color={`url(#${id('rain')})`} />
    </g>
  )
}

function Storm({ id, animate }: { id: IdFn; animate: boolean }) {
  return (
    <g>
      <CloudShape id={id} x={50} y={40} scale={1.10} storm animate={animate} />
      <motion.path
        d="M52 56 L43 71 L51 71 L42 86 L62 66 L52 66 Z"
        fill={`url(#${id('bolt')})`}
        filter={`url(#${id('boltGlow')})`}
        animate={animate
          ? {
              opacity: [1, 1, 0.2, 1, 0.55, 1],
              filter: [
                `drop-shadow(0 0 0px #FFE060)`,
                `drop-shadow(0 0 10px #FFE060)`,
                `drop-shadow(0 0 0px #FFE060)`,
              ],
            }
          : {}}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          times: [0, 0.08, 0.14, 0.20, 0.30, 0.55],
        }}
      />
      <Drops color={`url(#${id('rain')})`} />
    </g>
  )
}

function Tornado({ id, animate }: { id: IdFn; animate: boolean }) {
  return (
    <g>
      <CloudShape id={id} x={50} y={30} scale={1.06} storm animate={animate} />
      <motion.g
        animate={animate ? { rotate: [-4, 4, -4] } : {}}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 62px' }}
      >
        <path
          d="M28 40 Q50 33 72 40 Q58 49 66 58 Q50 53 58 64 Q46 61 50 72 Q43 74 46 82 Q42 87 40 91 Q38 84 43 77 Q34 75 44 67 Q32 65 43 55 Q30 53 41 47 Q29 45 28 40 Z"
          fill={`url(#${id('funnel')})`}
          filter={`url(#${id('shadow')})`}
        />
        <path d="M32 42 Q50 36 68 42" stroke="#E8DCFF" strokeWidth="2.6" fill="none" opacity="0.75" />
        <path d="M39 53 Q50 50 61 53" stroke="#E0D4FF" strokeWidth="2.2" fill="none" opacity="0.65" />
        <path d="M44 64 Q50 62 56 64" stroke="#D8CCFF" strokeWidth="2.0" fill="none" opacity="0.60" />
      </motion.g>
      {animate &&
        Array.from({ length: 6 }).map((_, i) => (
          <motion.circle
            key={i}
            cx={30 + i * 8}
            cy={36}
            r={1.8}
            fill="#CDBFF6"
            animate={{ x: [-7, 7, -7], y: [0, -5, 0], opacity: [0.25, 0.95, 0.25] }}
            transition={{ duration: 1.9, repeat: Infinity, delay: i * 0.17 }}
          />
        ))}
    </g>
  )
}
