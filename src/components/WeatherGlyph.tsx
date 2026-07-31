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
        {/* off-center light source makes the sun read as a sphere */}
        <radialGradient id={id('sunCore')} cx="38%" cy="34%" r="75%">
          <stop offset="0%" stopColor="#FFF6D6" />
          <stop offset="45%" stopColor="#FFD966" />
          <stop offset="100%" stopColor="#FFAF1E" />
        </radialGradient>
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
        {/* horizontal cylinder shading for the vortex bands */}
        <linearGradient id={id('funnelBand')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D8CDF8" />
          <stop offset="48%" stopColor="#A99BDC" />
          <stop offset="100%" stopColor="#75689F" />
        </linearGradient>
        <radialGradient id={id('funnelGlow')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#B7A8EC" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#B7A8EC" stopOpacity="0" />
        </radialGradient>
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
      {/* breathing double glow */}
      <motion.circle
        cx="50"
        cy="50"
        r="44"
        fill={`url(#${id('sunGlow')})`}
        animate={animate ? { scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] } : {}}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 50px' }}
      />
      <circle cx="50" cy="50" r="30" fill={`url(#${id('sunGlow')})`} opacity="0.7" />
      {/* rotating rays, alternating long/short */}
      <motion.g
        animate={animate ? { rotate: 360 } : {}}
        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '50px 50px' }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          const long = i % 2 === 0
          const r1 = big ? 27 : 28
          const r2 = r1 + (long ? (big ? 12 : 9) : big ? 7 : 5)
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * r1}
              y1={50 + Math.sin(a) * r1}
              x2={50 + Math.cos(a) * r2}
              y2={50 + Math.sin(a) * r2}
              stroke="#FFCF55"
              strokeWidth={long ? 3.6 : 2.6}
              strokeLinecap="round"
              opacity={long ? 1 : 0.75}
            />
          )
        })}
      </motion.g>
      {/* sphere-shaded core */}
      <motion.circle
        cx="50"
        cy="50"
        r="20"
        fill={`url(#${id('sunCore')})`}
        filter={`url(#${id('soft')})`}
        animate={animate ? { scale: [1, 1.045, 1] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 50px' }}
      />
      <ellipse cx="43.5" cy="42.5" rx="6.5" ry="4.6" fill="#FFF8E2" opacity="0.8" />
      {/* sparkles on peak-sunshine days */}
      {big &&
        animate &&
        [
          { x: 20, y: 26, d: 0, s: 1 },
          { x: 82, y: 36, d: 0.9, s: 0.75 },
          { x: 74, y: 78, d: 1.6, s: 0.9 },
        ].map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
            <motion.path
              d="M0 -5 L1.3 -1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3 -1.3 Z"
              fill="#FFF3C9"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.15, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: p.d, ease: 'easeInOut' }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          </g>
        ))}
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
      {/* distant layer for parallax depth */}
      <g opacity="0.45">
        <CloudShape id={id} x={68} y={28} scale={0.5} animate={animate} delay={1.3} />
      </g>
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
  const fill = `url(#${id(dark ? 'cloudDark' : 'cloud')})`
  return (
    <motion.g
      animate={animate ? { x: [0, 3.5, 0], y: [0, -1.5, 0] } : {}}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <g transform={`translate(${x} ${y}) scale(${scale})`} filter={`url(#${id('soft')})`}>
        <ellipse cx="0" cy="6" rx="22" ry="14" fill={fill} />
        <circle cx="13" cy="0" r="13" fill={fill} />
        <circle cx="-12" cy="2" r="11" fill={fill} />
        <rect x="-22" y="6" width="44" height="14" rx="7" fill={fill} />
        {/* volumetric base shading */}
        <ellipse cx="0" cy="15" rx="19" ry="5.5" fill={dark ? '#98A0C4' : '#D9E2F5'} opacity="0.5" />
        {/* top-light sheen on the puffs */}
        <ellipse cx="9" cy="-7" rx="9" ry="5" fill="#fff" opacity={dark ? 0.32 : 0.85} />
        <ellipse cx="-11" cy="-3" rx="6.5" ry="3.8" fill="#fff" opacity={dark ? 0.2 : 0.6} />
      </g>
    </motion.g>
  )
}

/**
 * Real teardrop rain with a wind slant, varied sizes/speeds, and soft
 * landing ripples — replaces the old dashed-line drops.
 */
function Drops({ heavy, id }: { heavy?: boolean; id: IdFn }) {
  const cfg = heavy
    ? [
        { x: 30, delay: 0, s: 1 },
        { x: 41, delay: 0.38, s: 0.78 },
        { x: 52, delay: 0.14, s: 1.08 },
        { x: 63, delay: 0.52, s: 0.84 },
        { x: 71, delay: 0.26, s: 0.66 },
        { x: 36, delay: 0.64, s: 0.6 },
      ]
    : [
        { x: 38, delay: 0, s: 0.85 },
        { x: 50, delay: 0.36, s: 1 },
        { x: 62, delay: 0.62, s: 0.75 },
      ]
  const dur = heavy ? 0.8 : 1.15
  const wind = heavy ? -3 : -1.5
  return (
    <g>
      {cfg.map((d, i) => (
        <motion.g
          key={i}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, 16], x: [0, wind], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: dur,
            repeat: Infinity,
            delay: d.delay,
            ease: 'easeIn',
            times: [0, 0.2, 0.75, 1],
          }}
        >
          <path
            d={`M${d.x} 66 c${2.6 * d.s} ${3.4 * d.s} ${3.2 * d.s} ${5.4 * d.s} 0 ${7.6 * d.s} c${-3.2 * d.s} ${-2.2 * d.s} ${-2.6 * d.s} ${-4.2 * d.s} 0 ${-7.6 * d.s} Z`}
            fill={`url(#${id('rain')})`}
          />
          <ellipse
            cx={d.x - 1.1 * d.s}
            cy={68.8}
            rx={0.9 * d.s}
            ry={1.3 * d.s}
            fill="#fff"
            opacity="0.5"
          />
        </motion.g>
      ))}
      {/* landing ripples */}
      {(heavy ? [34, 52, 66] : [50]).map((x, i) => (
        <motion.g
          key={`r${i}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0.2, 1], opacity: [0.6, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.3 + dur * 0.7, ease: 'easeOut' }}
          style={{ transformOrigin: `${x}px 88px` }}
        >
          <ellipse cx={x} cy={88} rx={7} ry={2.3} fill="none" stroke={`url(#${id('rain')})`} strokeWidth="1.5" />
        </motion.g>
      ))}
    </g>
  )
}

function RainCloud({ id, animate, heavy }: { id: IdFn; animate: boolean; heavy?: boolean }) {
  return (
    <g>
      <CloudShape id={id} x={50} y={44} scale={1.05} dark animate={animate} />
      {/* drizzle carries a soft drifting mist under the cloud */}
      {!heavy &&
        [
          { y: 78, w: 30, d: 0 },
          { y: 84, w: 22, d: 1.1 },
        ].map((m, i) => (
          <motion.rect
            key={i}
            x={50 - m.w / 2}
            y={m.y}
            width={m.w}
            height="3"
            rx="1.5"
            fill="#C3CFE8"
            initial={{ opacity: 0 }}
            animate={animate ? { opacity: [0, 0.5, 0], x: [-4, 4, -4] } : { opacity: 0.35 }}
            transition={{ duration: 4.2, repeat: Infinity, delay: m.d, ease: 'easeInOut' }}
          />
        ))}
      <Drops heavy={heavy} id={id} />
    </g>
  )
}

function Storm({ id, animate }: { id: IdFn; animate: boolean }) {
  return (
    <g>
      <CloudShape id={id} x={50} y={38} scale={1.1} dark animate={animate} />
      {/* double-layer bolt: blurred glow behind a crisp gradient core */}
      <motion.g
        animate={animate ? { opacity: [1, 1, 0.25, 1, 0.45, 1] } : {}}
        transition={{ duration: 2.6, repeat: Infinity, times: [0, 0.08, 0.14, 0.2, 0.3, 0.5] }}
      >
        <path
          d="M53 54 L42 71 L50 71 L41 87 L62 65 L53 65 Z"
          fill="#FFD166"
          opacity="0.4"
          style={{ filter: 'blur(3px)' }}
        />
        <path d="M52 55 L44 70 L51 70 L44 84 L59 66 L52 66 Z" fill={`url(#${id('bolt')})`} />
        <path d="M51.4 57 L46.5 65.5" stroke="#FFF3C9" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
      </motion.g>
      <Drops heavy id={id} />
    </g>
  )
}

/**
 * The tornado, rebuilt as a layered vortex: a lavender glow, a blurred
 * funnel column, and a stack of cylinder-shaded bands that sway as one and
 * ripple out of phase — with debris kicked up where the tip meets the ground.
 */
function Tornado({ id, animate }: { id: IdFn; animate: boolean }) {
  const bands = [
    { cy: 45, rx: 20, ry: 6.6, amp: 3.2 },
    { cy: 54, rx: 15.5, ry: 5.6, amp: 2.7 },
    { cy: 62, rx: 11.6, ry: 4.7, amp: 2.3 },
    { cy: 69.5, rx: 8.2, ry: 3.9, amp: 1.9 },
    { cy: 76, rx: 5.6, ry: 3.1, amp: 1.5 },
    { cy: 81.5, rx: 3.6, ry: 2.4, amp: 1.1 },
  ]
  return (
    <g>
      <ellipse cx="50" cy="58" rx="32" ry="30" fill={`url(#${id('funnelGlow')})`} />
      <CloudShape id={id} x={50} y={30} scale={1.08} dark animate={animate} />
      <motion.g
        animate={animate ? { rotate: [-2.4, 2.4, -2.4] } : {}}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 44px' }}
      >
        {/* blurred column ties the bands into one funnel */}
        <path
          d="M32 45 C40 40 60 40 68 45 C62 58 56 68 51 80 C49.5 85 48.5 87 47.5 88.5 C46.5 87 46 84 46 80 C42 68 36 56 32 45 Z"
          fill={`url(#${id('funnel')})`}
          opacity="0.5"
          style={{ filter: 'blur(2.5px)' }}
        />
        {bands.map((b, i) => (
          <motion.g
            key={i}
            animate={animate ? { x: [-b.amp, b.amp, -b.amp] } : {}}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.17 }}
          >
            <ellipse
              cx="50"
              cy={b.cy}
              rx={b.rx}
              ry={b.ry}
              fill={`url(#${id('funnelBand')})`}
              filter={`url(#${id('soft')})`}
            />
            {/* top-edge sheen sells the cylinder */}
            <ellipse
              cx={50 - b.rx * 0.22}
              cy={b.cy - b.ry * 0.32}
              rx={b.rx * 0.6}
              ry={b.ry * 0.48}
              fill="#fff"
              opacity="0.18"
            />
          </motion.g>
        ))}
        <motion.circle
          cx="47.5"
          cy="86.5"
          r="2"
          fill={`url(#${id('funnelBand')})`}
          animate={animate ? { x: [-1.2, 1.2, -1.2] } : {}}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.g>
      {/* debris at the base */}
      {animate &&
        [
          { x: 40, y: 86, d: 0, dir: -1 },
          { x: 56, y: 87, d: 0.5, dir: 1 },
          { x: 47, y: 89, d: 0.9, dir: -1 },
          { x: 52, y: 88, d: 1.2, dir: 1 },
        ].map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={1.4}
            fill="#B9ABE4"
            animate={{ x: [0, p.dir * 9], y: [0, -3.5, 1], opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: p.d, ease: 'easeOut' }}
          />
        ))}
      {/* dust orbiting the upper funnel */}
      {animate &&
        Array.from({ length: 6 }).map((_, i) => (
          <motion.circle
            key={`d${i}`}
            cx={30 + i * 8}
            cy={40 + (i % 3) * 4}
            r={1.3}
            fill="#CDBFF6"
            animate={{ x: [-7, 7, -7], y: [0, -5, 0], opacity: [0.25, 0.95, 0.25] }}
            transition={{ duration: 1.9, repeat: Infinity, delay: i * 0.16 }}
          />
        ))}
    </g>
  )
}
