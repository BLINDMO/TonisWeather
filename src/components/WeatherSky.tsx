import { useId } from 'react'
import { motion } from 'framer-motion'
import type { WeatherKind } from '../types'

/**
 * WeatherSky — a cinematic, layered atmosphere rendered behind the home hero.
 * Studio-grade depth: multi-stop sky, volumetric god-rays, parallax cloud banks,
 * weather particles (motes / rain / funnel debris), lightning, vignette + film grain.
 * Purely ambient — the focal WeatherGlyph sits on top of it.
 */

interface Atmo {
  /** Base vertical sky gradient. */
  gradient: string
  /** Soft radial colour pools layered over the base for depth. */
  washes: string
  /** God-ray strength, 0 disables. */
  rays: number
  /** Cloud bank styling. */
  cloud: { tint: string; edge: string; opacity: number }
  particles: 'mote' | 'rain' | 'rainHeavy' | 'swirl' | 'none'
  lightning: boolean
  /** Vignette darkness at the corners. */
  vignette: number
}

const ATMO: Record<WeatherKind, Atmo> = {
  bright: {
    gradient: 'linear-gradient(168deg, #4E9BE8 0%, #74B7EE 24%, #F4C679 70%, #FCE6B8 100%)',
    washes:
      'radial-gradient(95% 70% at 50% 4%, rgba(255,236,182,0.65), transparent 60%), radial-gradient(80% 60% at 14% 96%, rgba(120,170,255,0.22), transparent 60%)',
    rays: 0.5,
    cloud: { tint: '#FFFFFF', edge: '#F3F6FF', opacity: 0.5 },
    particles: 'mote',
    lightning: false,
    vignette: 0.1,
  },
  sunny: {
    gradient: 'linear-gradient(168deg, #3E93E8 0%, #74B4EE 40%, #B9DFF8 78%, #E4F2FD 100%)',
    washes:
      'radial-gradient(85% 60% at 72% 8%, rgba(255,239,196,0.5), transparent 58%), radial-gradient(90% 70% at 30% 100%, rgba(255,255,255,0.35), transparent 60%)',
    rays: 0.34,
    cloud: { tint: '#FFFFFF', edge: '#EEF4FF', opacity: 0.7 },
    particles: 'mote',
    lightning: false,
    vignette: 0.08,
  },
  partly: {
    gradient: 'linear-gradient(168deg, #4F97E2 0%, #8FBDEE 42%, #CFE4F8 80%, #ECF5FD 100%)',
    washes:
      'radial-gradient(80% 55% at 74% 6%, rgba(255,235,190,0.42), transparent 58%), radial-gradient(90% 70% at 25% 100%, rgba(255,255,255,0.4), transparent 60%)',
    rays: 0.28,
    cloud: { tint: '#FFFFFF', edge: '#E9F1FE', opacity: 0.88 },
    particles: 'mote',
    lightning: false,
    vignette: 0.08,
  },
  cloudy: {
    gradient: 'linear-gradient(168deg, #8492BC 0%, #A6B1D2 42%, #CDD5EA 80%, #E6EAF5 100%)',
    washes:
      'radial-gradient(100% 70% at 50% 2%, rgba(255,255,255,0.35), transparent 62%), radial-gradient(90% 70% at 80% 100%, rgba(120,134,176,0.28), transparent 60%)',
    rays: 0,
    cloud: { tint: '#EEF2FB', edge: '#D6DDEE', opacity: 0.95 },
    particles: 'none',
    lightning: false,
    vignette: 0.12,
  },
  drizzle: {
    gradient: 'linear-gradient(168deg, #6B7DAB 0%, #8C9EC4 42%, #B6C3DD 80%, #D6DEEE 100%)',
    washes:
      'radial-gradient(100% 70% at 50% 0%, rgba(255,255,255,0.28), transparent 62%), radial-gradient(90% 70% at 20% 100%, rgba(90,108,152,0.3), transparent 60%)',
    rays: 0,
    cloud: { tint: '#DDE4F1', edge: '#C2CBE0', opacity: 0.96 },
    particles: 'rain',
    lightning: false,
    vignette: 0.16,
  },
  rain: {
    gradient: 'linear-gradient(168deg, #36456C 0%, #4C5C88 42%, #6E7DA8 85%, #8290B6 100%)',
    washes:
      'radial-gradient(100% 70% at 50% 0%, rgba(180,196,232,0.28), transparent 62%), radial-gradient(90% 80% at 80% 100%, rgba(20,28,54,0.4), transparent 60%)',
    rays: 0,
    cloud: { tint: '#9AA6C8', edge: '#7C8AB2', opacity: 0.98 },
    particles: 'rain',
    lightning: false,
    vignette: 0.24,
  },
  storm: {
    gradient: 'linear-gradient(168deg, #25243F 0%, #3A375C 45%, #534B7C 85%, #62588C 100%)',
    washes:
      'radial-gradient(100% 70% at 50% 0%, rgba(190,176,255,0.22), transparent 62%), radial-gradient(90% 80% at 78% 100%, rgba(10,8,24,0.5), transparent 60%)',
    rays: 0,
    cloud: { tint: '#5C5685', edge: '#46406B', opacity: 1 },
    particles: 'rainHeavy',
    lightning: true,
    vignette: 0.34,
  },
  tornado: {
    gradient: 'linear-gradient(168deg, #1F1C30 0%, #322D4D 48%, #4B4470 85%, #585080 100%)',
    washes:
      'radial-gradient(100% 70% at 50% 0%, rgba(200,186,255,0.2), transparent 62%), radial-gradient(90% 80% at 70% 100%, rgba(6,5,16,0.55), transparent 58%)',
    rays: 0,
    cloud: { tint: '#4A4470', edge: '#352F55', opacity: 1 },
    particles: 'swirl',
    lightning: false,
    vignette: 0.4,
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
      {/* base sky */}
      <div className="absolute inset-0" style={{ background: a.gradient }} />
      {/* colour pools */}
      <div className="absolute inset-0" style={{ background: a.washes }} />

      {/* volumetric god-rays */}
      {a.rays > 0 && <Rays opacity={a.rays} />}

      {/* parallax cloud banks */}
      <CloudBank tint={a.cloud.tint} edge={a.cloud.edge} opacity={a.cloud.opacity} />

      {/* weather particles */}
      <Particles kind={a.particles} />

      {/* lightning */}
      {a.lightning && <Lightning />}

      {/* top sheen + vignette */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)' }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 50% 30%, transparent 55%, rgba(8,6,24,${a.vignette}) 100%)`,
        }}
      />

      {/* film grain */}
      <div className="grain-layer pointer-events-none absolute inset-0" />
    </div>
  )
}

function Rays({ opacity }: { opacity: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[-55%] h-[170%] w-[170%] -translate-x-1/2"
      style={{
        background:
          'repeating-conic-gradient(from 0deg at 50% 0%, rgba(255,243,205,0) 0deg, rgba(255,243,205,0.6) 2.2deg, rgba(255,243,205,0) 6deg, rgba(255,243,205,0) 13deg)',
        WebkitMaskImage: 'radial-gradient(62% 75% at 50% 0%, #000 4%, transparent 72%)',
        maskImage: 'radial-gradient(62% 75% at 50% 0%, #000 4%, transparent 72%)',
        filter: 'blur(3px)',
        opacity,
      }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
    />
  )
}

function Puff({
  cx,
  cy,
  s,
  tint,
  edge,
}: {
  cx: number
  cy: number
  s: number
  tint: string
  edge: string
}) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <ellipse cx="0" cy="14" rx="46" ry="20" fill={edge} />
      <ellipse cx="-26" cy="8" rx="26" ry="20" fill={tint} />
      <ellipse cx="22" cy="4" rx="32" ry="26" fill={tint} />
      <ellipse cx="0" cy="-6" rx="30" ry="24" fill={tint} />
      <rect x="-50" y="12" width="100" height="22" rx="11" fill={edge} />
    </g>
  )
}

function CloudBank({ tint, edge, opacity }: { tint: string; edge: string; opacity: number }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      {/* far layer — slow, soft, faint */}
      <motion.g
        opacity={opacity * 0.45}
        filter={`url(#${uid}-soft)`}
        animate={{ x: [0, 26, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Puff cx={70} cy={48} s={0.7} tint={tint} edge={edge} />
        <Puff cx={300} cy={36} s={0.85} tint={tint} edge={edge} />
      </motion.g>
      {/* near layer — larger, faster drift */}
      <motion.g
        opacity={opacity}
        filter={`url(#${uid}-soft)`}
        animate={{ x: [0, -34, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Puff cx={120} cy={150} s={1.05} tint={tint} edge={edge} />
        <Puff cx={330} cy={170} s={0.95} tint={tint} edge={edge} />
      </motion.g>
    </svg>
  )
}

function Particles({ kind }: { kind: Atmo['particles'] }) {
  if (kind === 'none') return null

  if (kind === 'mote') {
    const motes = [
      { x: '18%', y: '30%', d: 0, s: 1 },
      { x: '74%', y: '24%', d: 1.4, s: 0.8 },
      { x: '40%', y: '60%', d: 0.7, s: 1.2 },
      { x: '84%', y: '58%', d: 2.1, s: 0.9 },
      { x: '28%', y: '78%', d: 1.1, s: 0.7 },
      { x: '60%', y: '40%', d: 2.6, s: 1 },
    ]
    return (
      <div className="pointer-events-none absolute inset-0">
        {motes.map((m, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: m.x, top: m.y, width: 5 * m.s, height: 5 * m.s, filter: 'blur(0.5px)' }}
            animate={{ y: [0, -14, 0], opacity: [0, 0.9, 0], scale: [0.6, 1, 0.6] }}
            transition={{ duration: 6, repeat: Infinity, delay: m.d, ease: 'easeInOut' }}
          />
        ))}
      </div>
    )
  }

  if (kind === 'swirl') {
    return (
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#d9ccff]"
            style={{ left: `${20 + (i * 61) % 64}%`, top: `${30 + (i * 37) % 50}%`, width: 4, height: 4 }}
            animate={{ x: [-12, 12, -12], y: [0, -10, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </div>
    )
  }

  // rain / rainHeavy
  const heavy = kind === 'rainHeavy'
  const count = heavy ? 26 : 16
  const color = heavy ? 'rgba(228,221,255,0.75)' : 'rgba(219,230,255,0.7)'
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {Array.from({ length: count }).map((_, i) => {
        const x = 14 + ((i * 137) % 380)
        const delay = (i % 8) * 0.13
        const len = heavy ? 26 : 18
        return (
          <motion.line
            key={i}
            x1={x}
            x2={x - 7}
            y1={-20}
            y2={-20 + len}
            stroke={color}
            strokeWidth={heavy ? 2.4 : 1.8}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ y: [0, 280], opacity: [0, 1, 1, 0] }}
            transition={{ duration: heavy ? 0.7 : 0.95, repeat: Infinity, delay, ease: 'easeIn' }}
          />
        )
      })}
    </svg>
  )
}

function Lightning() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0, 0.55, 0, 0.3, 0] }}
      transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.62, 0.66, 0.7, 0.74, 0.8] }}
    />
  )
}
