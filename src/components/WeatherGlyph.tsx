import { useId } from 'react'
import { motion } from 'framer-motion'
import type { WeatherKind } from '../types'

/**
 * Premium, hand-built weather glyphs — used everywhere in place of system emoji.
 * Soft gradients, layered depth, gentle motion. Renders crisp at any size.
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
        <linearGradient id={id('sun')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE39A" />
          <stop offset="55%" stopColor="#FFC93C" />
          <stop offset="100%" stopColor="#FFB020" />
        </linearGradient>
        <radialGradient id={id('sunGlow')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE7A8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFE7A8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('cloud')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EAF0FB" />
        </linearGradient>
        <linearGradient id={id('cloudDark')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9CFE6" />
          <stop offset="100%" stopColor="#AEB6D6" />
        </linearGradient>
        <linearGradient id={id('storm')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8E86B4" />
          <stop offset="100%" stopColor="#6B6395" />
        </linearGradient>
        <linearGradient id={id('rain')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9CC4FF" />
          <stop offset="100%" stopColor="#6FA0F0" />
        </linearGradient>
        <linearGradient id={id('bolt')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE07A" />
          <stop offset="100%" stopColor="#FFB020" />
        </linearGradient>
        <linearGradient id={id('funnel')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B6A9E6" />
          <stop offset="100%" stopColor="#7E72B0" />
        </linearGradient>
        <filter id={id('soft')} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#5B6CA8" floodOpacity="0.22" />
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

function Sun({ id, animate, big }: { id: IdFn; animate: boolean; big?: boolean }) {
  return (
    <g>
      <circle cx="50" cy="50" r="42" fill={`url(#${id('sunGlow')})`} />
      <motion.g
        animate={animate ? { rotate: 360 } : {}}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '50px 50px' }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          const r1 = big ? 27 : 28
          const r2 = big ? 38 : 36
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * r1}
              y1={50 + Math.sin(a) * r1}
              x2={50 + Math.cos(a) * r2}
              y2={50 + Math.sin(a) * r2}
              stroke="#FFCF55"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          )
        })}
      </motion.g>
      <motion.circle
        cx="50"
        cy="50"
        r="20"
        fill={`url(#${id('sun')})`}
        filter={`url(#${id('soft')})`}
        animate={animate ? { scale: [1, 1.04, 1] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 50px' }}
      />
      <ellipse cx="44" cy="43" rx="7" ry="5" fill="#FFF3C9" opacity="0.7" />
    </g>
  )
}

function PartlySun({ id, animate }: { id: IdFn; animate: boolean }) {
  return (
    <g>
      <g transform="translate(8 -6)">
        <circle cx="40" cy="34" r="30" fill={`url(#${id('sunGlow')})`} />
        <motion.g
          animate={animate ? { rotate: 360 } : {}}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '40px 34px' }}
        >
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2
            return (
              <line
                key={i}
                x1={40 + Math.cos(a) * 17}
                y1={34 + Math.sin(a) * 17}
                x2={40 + Math.cos(a) * 24}
                y2={34 + Math.sin(a) * 24}
                stroke="#FFCF55"
                strokeWidth="3"
                strokeLinecap="round"
              />
            )
          })}
        </motion.g>
        <circle cx="40" cy="34" r="13" fill={`url(#${id('sun')})`} />
      </g>
      <CloudShape id={id} x={32} y={52} scale={1} animate={animate} />
    </g>
  )
}

function Clouds({ id, animate }: { id: IdFn; animate: boolean }) {
  return (
    <g>
      <CloudShape id={id} x={30} y={36} scale={0.78} dark animate={animate} delay={0.6} />
      <CloudShape id={id} x={50} y={56} scale={1.02} animate={animate} />
    </g>
  )
}

function CloudShape({
  id,
  x,
  y,
  scale = 1,
  dark = false,
  animate = true,
  delay = 0,
}: {
  id: IdFn
  x: number
  y: number
  scale?: number
  dark?: boolean
  animate?: boolean
  delay?: number
}) {
  return (
    <motion.g
      animate={animate ? { x: [0, 3, 0] } : {}}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <g transform={`translate(${x} ${y}) scale(${scale})`} filter={`url(#${id('soft')})`}>
        <ellipse cx="0" cy="6" rx="22" ry="14" fill={`url(#${id(dark ? 'cloudDark' : 'cloud')})`} />
        <circle cx="13" cy="0" r="13" fill={`url(#${id(dark ? 'cloudDark' : 'cloud')})`} />
        <circle cx="-12" cy="2" r="11" fill={`url(#${id(dark ? 'cloudDark' : 'cloud')})`} />
        <rect x="-22" y="6" width="44" height="14" rx="7" fill={`url(#${id(dark ? 'cloudDark' : 'cloud')})`} />
      </g>
    </motion.g>
  )
}

function Drops({ heavy, color }: { heavy?: boolean; color: string }) {
  const xs = heavy ? [30, 42, 54, 66, 38, 58] : [38, 50, 62]
  return (
    <g>
      {xs.map((x, i) => (
        <motion.line
          key={i}
          x1={x}
          y1={72}
          x2={x - 2}
          y2={80}
          stroke={color}
          strokeWidth="3.2"
          strokeLinecap="round"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: [0, 1, 0], y: [0, 14] }}
          transition={{ duration: heavy ? 0.8 : 1, repeat: Infinity, delay: (i % 3) * 0.22, ease: 'easeIn' }}
        />
      ))}
    </g>
  )
}

function RainCloud({ id, animate, heavy }: { id: IdFn; animate: boolean; heavy?: boolean }) {
  return (
    <g>
      <CloudShape id={id} x={50} y={44} scale={1.05} dark animate={animate} />
      <Drops heavy={heavy} color={`url(#${id('rain')})`} />
    </g>
  )
}

function Storm({ id, animate }: { id: IdFn; animate: boolean }) {
  return (
    <g>
      <CloudShape id={id} x={50} y={40} scale={1.08} dark animate={animate} />
      <motion.path
        d="M52 56 L44 70 L51 70 L43 84 L60 66 L52 66 Z"
        fill={`url(#${id('bolt')})`}
        animate={animate ? { opacity: [1, 1, 0.3, 1, 0.5, 1], filter: ['drop-shadow(0 0 0px #FFD166)', 'drop-shadow(0 0 6px #FFD166)', 'drop-shadow(0 0 0px #FFD166)'] } : {}}
        transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.1, 0.16, 0.2, 0.28, 0.5] }}
      />
      <Drops color="#B9A9F0" />
    </g>
  )
}

function Tornado({ id, animate }: { id: IdFn; animate: boolean }) {
  return (
    <g>
      <CloudShape id={id} x={50} y={30} scale={1.05} dark animate={animate} />
      <motion.g
        animate={animate ? { rotate: [-3, 3, -3] } : {}}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 60px' }}
      >
        <path
          d="M30 40 Q50 34 70 40 Q58 48 64 56 Q50 52 56 62 Q46 60 50 70 Q44 72 46 79 Q43 84 41 88 Q39 82 43 76 Q35 74 44 66 Q33 64 42 54 Q31 52 40 46 Q30 44 30 40 Z"
          fill={`url(#${id('funnel')})`}
          filter={`url(#${id('soft')})`}
        />
        <path d="M34 42 Q50 37 66 42" stroke="#E4DBFB" strokeWidth="2.4" fill="none" opacity="0.7" />
        <path d="M40 52 Q50 49 60 52" stroke="#E4DBFB" strokeWidth="2.1" fill="none" opacity="0.6" />
        <path d="M44 62 Q50 60 56 62" stroke="#E4DBFB" strokeWidth="1.8" fill="none" opacity="0.6" />
      </motion.g>
      {animate &&
        Array.from({ length: 5 }).map((_, i) => (
          <motion.circle
            key={i}
            cx={32 + i * 9}
            cy={36}
            r={1.6}
            fill="#CDBFF6"
            animate={{ x: [-6, 6, -6], y: [0, -4, 0], opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
    </g>
  )
}
