import { useId } from 'react'
import { motion } from 'framer-motion'
import type { WeatherKind } from '../types'

/**
 * WeatherSky — cinematic, per-weather atmospheric background.
 * Each sky is intentionally distinct: bright is deep azure + warm gold,
 * partly shows sun peeking through visible clouds, storm is near-black drama.
 */

interface Atmo {
  gradient: string
  wash: string
  /** God-ray strength, 0 = disabled. */
  rays: number
  /** Sun glow position (0–1 of viewBox), undefined = no sun */
  sun?: { x: number; y: number; r: number; color: string }
  cloud: { tint: string; shadow: string; opacity: number; coverage: 'none' | 'wispy' | 'partial' | 'full' }
  particles: 'mote' | 'rain' | 'rainHeavy' | 'swirl' | 'none'
  lightning: boolean
  vignette: number
}

const ATMO: Record<WeatherKind, Atmo> = {
  bright: {
    gradient: 'linear-gradient(172deg, #0869C0 0%, #1480D8 22%, #2E97EA 52%, #F0BE52 82%, #FCEAB0 100%)',
    wash: 'radial-gradient(85% 65% at 50% 5%, rgba(255,238,180,0.6), transparent 58%), radial-gradient(70% 55% at 12% 92%, rgba(110,175,255,0.25), transparent 55%)',
    rays: 0.62,
    sun: { x: 200, y: 72, r: 52, color: '#FFD84A' },
    cloud: { tint: '#FFFFFF', shadow: '#F0F5FF', opacity: 0.22, coverage: 'wispy' },
    particles: 'mote',
    lightning: false,
    vignette: 0.07,
  },
  sunny: {
    gradient: 'linear-gradient(172deg, #0860B4 0%, #1272CC 32%, #3090E0 62%, #BAD9F0 88%, #DEF0FC 100%)',
    wash: 'radial-gradient(80% 62% at 70% 7%, rgba(255,230,165,0.48), transparent 56%), radial-gradient(85% 70% at 28% 100%, rgba(255,255,255,0.38), transparent 58%)',
    rays: 0.38,
    sun: { x: 284, y: 80, r: 44, color: '#FFD050' },
    cloud: { tint: '#FFFFFF', shadow: '#EEF4FF', opacity: 0.65, coverage: 'wispy' },
    particles: 'mote',
    lightning: false,
    vignette: 0.08,
  },
  partly: {
    gradient: 'linear-gradient(172deg, #2070C8 0%, #4290D8 44%, #82B8E6 72%, #C4DCF0 90%, #E2EFF8 100%)',
    wash: 'radial-gradient(72% 52% at 74% 10%, rgba(255,218,140,0.42), transparent 55%), radial-gradient(90% 70% at 22% 100%, rgba(255,255,255,0.42), transparent 60%)',
    rays: 0.24,
    sun: { x: 296, y: 90, r: 38, color: '#FFCE44' },
    cloud: { tint: '#FFFFFF', shadow: '#E8F0FE', opacity: 0.94, coverage: 'partial' },
    particles: 'mote',
    lightning: false,
    vignette: 0.1,
  },
  cloudy: {
    gradient: 'linear-gradient(172deg, #7E8EBA 0%, #9AAAD0 42%, #C0CCDF 75%, #D8E2EE 100%)',
    wash: 'radial-gradient(100% 70% at 50% 2%, rgba(255,255,255,0.32), transparent 62%), radial-gradient(88% 70% at 78% 100%, rgba(100,116,168,0.28), transparent 58%)',
    rays: 0,
    cloud: { tint: '#EEF2FB', shadow: '#D4DDED', opacity: 0.98, coverage: 'full' },
    particles: 'none',
    lightning: false,
    vignette: 0.14,
  },
  drizzle: {
    gradient: 'linear-gradient(172deg, #5C6E9E 0%, #7888B8 42%, #A8B6CE 78%, #CACEDE 100%)',
    wash: 'radial-gradient(100% 70% at 50% 0%, rgba(255,255,255,0.26), transparent 60%), radial-gradient(88% 70% at 20% 100%, rgba(72,92,148,0.32), transparent 58%)',

    rays: 0,
    cloud: { tint: '#D8E0EE', shadow: '#BCC8DE', opacity: 0.97, coverage: 'full' },
    particles: 'rain',
    lightning: false,
    vignette: 0.18,
  },
  rain: {
    gradient: 'linear-gradient(172deg, #2C3A62 0%, #3E4E7A 44%, #5C6A94 82%, #7882A8 100%)',
    wash: 'radial-gradient(100% 70% at 50% 0%, rgba(160,182,228,0.26), transparent 60%), radial-gradient(90% 80% at 82% 100%, rgba(14,20,44,0.42), transparent 58%)',
    rays: 0,
    cloud: { tint: '#8C98BE', shadow: '#6E7CA8', opacity: 1, coverage: 'full' },
    particles: 'rain',
    lightning: false,
    vignette: 0.28,
  },
  storm: {
    gradient: 'linear-gradient(172deg, #1E1C36 0%, #302C4C 46%, #4C4472 84%, #5C5282 100%)',
    wash: 'radial-gradient(100% 70% at 50% 0%, rgba(184,168,255,0.2), transparent 60%), radial-gradient(88% 80% at 76% 100%, rgba(8,6,22,0.52), transparent 58%)',
    rays: 0,
    cloud: { tint: '#4E487A', shadow: '#3A3460', opacity: 1, coverage: 'full' },
    particles: 'rainHeavy',
    lightning: true,
    vignette: 0.36,
  },
  tornado: {
    gradient: 'linear-gradient(172deg, #181428 0%, #28224A 48%, #40386C 84%, #50477A 100%)',
    wash: 'radial-gradient(100% 70% at 50% 0%, rgba(196,180,255,0.18), transparent 60%), radial-gradient(88% 80% at 68% 100%, rgba(4,3,14,0.58), transparent 56%)',
    rays: 0,
    cloud: { tint: '#3E3862', shadow: '#2C2850', opacity: 1, coverage: 'full' },
    particles: 'swirl',
    lightning: false,
    vignette: 0.44,
  },
}

export default function WeatherSky({
  kind,
  className = '',
}: {
  kind: WeatherKind
  className?: string
}) {
  const a = ATMO[kind]
  return (
    <div className={`overflow-hidden ${className}`}>
      {/* base sky gradient */}
      <div className="absolute inset-0" style={{ background: a.gradient }} />
      {/* colour pools */}
      <div className="absolute inset-0" style={{ background: a.wash }} />

      {/* volumetric god-rays */}
      {a.rays > 0 && <Rays opacity={a.rays} />}

      {/* sun disc + corona */}
      {a.sun && <SunDisc x={a.sun.x} y={a.sun.y} r={a.sun.r} color={a.sun.color} />}

      {/* cloud banks (coverage-aware) */}
      {a.cloud.coverage !== 'none' && (
        <CloudBank
          tint={a.cloud.tint}
          shadow={a.cloud.shadow}
          opacity={a.cloud.opacity}
          coverage={a.cloud.coverage}
        />
      )}

      {/* weather particles */}
      <Particles kind={a.particles} />

      {/* lightning */}
      {a.lightning && <Lightning />}

      {/* top sheen */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)' }}
      />

      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(115% 90% at 50% 28%, transparent 52%, rgba(8,5,24,${a.vignette}) 100%)`,
        }}
      />

      {/* film grain */}
      <div className="grain-layer pointer-events-none absolute inset-0" />
    </div>
  )
}

// ── Rays ─────────────────────────────────────────────────────────────────────

function Rays({ opacity }: { opacity: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[-60%] h-[180%] w-[180%] -translate-x-1/2"
      style={{
        background:
          'repeating-conic-gradient(from 0deg at 50% 0%, rgba(255,244,208,0) 0deg, rgba(255,244,208,0.65) 2deg, rgba(255,244,208,0) 6deg, rgba(255,244,208,0) 14deg)',
        WebkitMaskImage: 'radial-gradient(58% 72% at 50% 0%, #000 2%, transparent 70%)',
        maskImage: 'radial-gradient(58% 72% at 50% 0%, #000 2%, transparent 70%)',
        filter: 'blur(2.5px)',
        opacity,
      }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
    />
  )
}

// ── Sun disc ─────────────────────────────────────────────────────────────────

function SunDisc({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <radialGradient id="sun-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* outer corona */}
      <circle cx={x} cy={y} r={r * 2.2} fill="url(#sun-halo)" />
      {/* disc */}
      <motion.circle
        cx={x}
        cy={y}
        r={r}
        fill={color}
        animate={{ r: [r, r * 1.03, r] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* lens glare */}
      <ellipse cx={x - r * 0.28} cy={y - r * 0.28} rx={r * 0.28} ry={r * 0.18} fill="#fff" opacity="0.35" />
    </svg>
  )
}

// ── Cloud banks ───────────────────────────────────────────────────────────────

function Puff({
  cx,
  cy,
  s,
  tint,
  shadow,
}: {
  cx: number
  cy: number
  s: number
  tint: string
  shadow: string
}) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <ellipse cx="0" cy="16" rx="48" ry="22" fill={shadow} />
      <ellipse cx="-28" cy="8" rx="27" ry="21" fill={tint} />
      <ellipse cx="24" cy="4" rx="34" ry="28" fill={tint} />
      <ellipse cx="0" cy="-8" rx="31" ry="26" fill={tint} />
      <rect x="-52" y="14" width="104" height="24" rx="12" fill={shadow} />
    </g>
  )
}

function CloudBank({
  tint,
  shadow,
  opacity,
  coverage,
}: {
  tint: string
  shadow: string
  opacity: number
  coverage: 'wispy' | 'partial' | 'full'
}) {
  const uid = useId().replace(/:/g, '')

  if (coverage === 'wispy') {
    // A couple of small, high, transparent puffs — sun still clear
    return (
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <motion.g
          filter={`url(#${uid}-soft)`}
          opacity={opacity * 0.55}
          animate={{ x: [0, 22, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Puff cx={60} cy={130} s={0.6} tint={tint} shadow={shadow} />
          <Puff cx={320} cy={118} s={0.52} tint={tint} shadow={shadow} />
        </motion.g>
        <motion.g
          filter={`url(#${uid}-soft)`}
          opacity={opacity * 0.38}
          animate={{ x: [0, -18, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Puff cx={190} cy={148} s={0.7} tint={tint} shadow={shadow} />
        </motion.g>
      </svg>
    )
  }

  if (coverage === 'partial') {
    // Large cloud mass — sun peeks from upper-right
    return (
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.8" />
          </filter>
        </defs>
        {/* far layer */}
        <motion.g
          filter={`url(#${uid}-soft)`}
          opacity={opacity * 0.5}
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Puff cx={320} cy={56} s={0.78} tint={tint} shadow={shadow} />
        </motion.g>
        {/* main cloud — left-centre, partially covering sky */}
        <motion.g
          filter={`url(#${uid}-soft)`}
          opacity={opacity}
          animate={{ x: [0, -26, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Puff cx={110} cy={82} s={1.1} tint={tint} shadow={shadow} />
          <Puff cx={240} cy={142} s={0.9} tint={tint} shadow={shadow} />
        </motion.g>
        {/* near bottom fringe */}
        <motion.g
          filter={`url(#${uid}-soft)`}
          opacity={opacity * 0.75}
          animate={{ x: [0, 14, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Puff cx={60} cy={178} s={0.82} tint={tint} shadow={shadow} />
          <Puff cx={348} cy={168} s={0.76} tint={tint} shadow={shadow} />
        </motion.g>
      </svg>
    )
  }

  // full — layered overcast
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>
      <motion.g
        filter={`url(#${uid}-soft)`}
        opacity={opacity * 0.55}
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Puff cx={80} cy={38} s={0.82} tint={tint} shadow={shadow} />
        <Puff cx={310} cy={28} s={0.9} tint={tint} shadow={shadow} />
      </motion.g>
      <motion.g
        filter={`url(#${uid}-soft)`}
        opacity={opacity}
        animate={{ x: [0, -32, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Puff cx={160} cy={68} s={1.12} tint={tint} shadow={shadow} />
        <Puff cx={340} cy={100} s={0.88} tint={tint} shadow={shadow} />
      </motion.g>
      <motion.g
        filter={`url(#${uid}-soft)`}
        opacity={opacity * 0.82}
        animate={{ x: [0, 18, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Puff cx={50} cy={148} s={1.0} tint={tint} shadow={shadow} />
        <Puff cx={280} cy={158} s={0.95} tint={tint} shadow={shadow} />
      </motion.g>
    </svg>
  )
}

// ── Particles ─────────────────────────────────────────────────────────────────

function Particles({ kind }: { kind: Atmo['particles'] }) {
  if (kind === 'none') return null

  if (kind === 'mote') {
    const motes = [
      { x: '16%', y: '32%', d: 0, s: 1 },
      { x: '72%', y: '26%', d: 1.6, s: 0.8 },
      { x: '42%', y: '58%', d: 0.8, s: 1.2 },
      { x: '86%', y: '56%', d: 2.2, s: 0.9 },
      { x: '26%', y: '76%', d: 1.2, s: 0.7 },
      { x: '62%', y: '44%', d: 2.8, s: 1.0 },
    ]
    return (
      <div className="pointer-events-none absolute inset-0">
        {motes.map((m, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: m.x, top: m.y, width: 5 * m.s, height: 5 * m.s, filter: 'blur(0.4px)' }}
            animate={{ y: [0, -16, 0], opacity: [0, 0.85, 0], scale: [0.6, 1, 0.6] }}
            transition={{ duration: 6.5, repeat: Infinity, delay: m.d, ease: 'easeInOut' }}
          />
        ))}
      </div>
    )
  }

  if (kind === 'swirl') {
    return (
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#d9ccff]"
            style={{ left: `${18 + (i * 67) % 66}%`, top: `${28 + (i * 41) % 52}%`, width: 4, height: 4 }}
            animate={{ x: [-14, 14, -14], y: [0, -12, 0], opacity: [0.2, 0.85, 0.2] }}
            transition={{ duration: 2.8 + (i % 3) * 0.6, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </div>
    )
  }

  const heavy = kind === 'rainHeavy'
  const count = heavy ? 28 : 18
  const color = heavy ? 'rgba(230,222,255,0.72)' : 'rgba(215,228,255,0.68)'
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {Array.from({ length: count }).map((_, i) => {
        const x = 10 + ((i * 139) % 384)
        const delay = (i % 9) * 0.12
        const len = heavy ? 28 : 18
        return (
          <motion.line
            key={i}
            x1={x}
            x2={x - 7}
            y1={-22}
            y2={-22 + len}
            stroke={color}
            strokeWidth={heavy ? 2.2 : 1.7}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ y: [0, 286], opacity: [0, 1, 1, 0] }}
            transition={{ duration: heavy ? 0.68 : 0.92, repeat: Infinity, delay, ease: 'easeIn' }}
          />
        )
      })}
    </svg>
  )
}

// ── Lightning ─────────────────────────────────────────────────────────────────

function Lightning() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0, 0.52, 0, 0.28, 0] }}
      transition={{ duration: 4.4, repeat: Infinity, times: [0, 0.64, 0.68, 0.72, 0.76, 0.82] }}
    />
  )
}
