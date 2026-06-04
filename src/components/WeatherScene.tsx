import { motion } from 'framer-motion'
import type { WeatherKind } from '../types'

interface SkyTheme {
  from: string
  to: string
  accent: string
}

export const SKY: Record<WeatherKind, SkyTheme> = {
  bright: { from: '#4E9BE8', to: '#FCE6B8', accent: '#ffd166' },
  sunny: { from: '#3E93E8', to: '#E4F2FD', accent: '#ffd166' },
  partly: { from: '#4F97E2', to: '#ECF5FD', accent: '#ffe2a0' },
  cloudy: { from: '#8492BC', to: '#E6EAF5', accent: '#c7cfe2' },
  drizzle: { from: '#6B7DAB', to: '#D6DEEE', accent: '#9fb3d4' },
  rain: { from: '#3A4B74', to: '#8290B6', accent: '#8fa3c7' },
  storm: { from: '#26243F', to: '#62588C', accent: '#c9b8ff' },
  tornado: { from: '#1F1C30', to: '#585080', accent: '#ffb3c8' },
}

const Cloud = ({
  x,
  y,
  scale = 1,
  fill = '#ffffff',
  opacity = 0.95,
  delay = 0,
  drift = 8,
}: {
  x: number
  y: number
  scale?: number
  fill?: string
  opacity?: number
  delay?: number
  drift?: number
}) => (
  <motion.g
    initial={{ x }}
    animate={{ x: [x, x + drift, x] }}
    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay }}
    style={{ transformBox: 'fill-box' }}
  >
    <g transform={`translate(0 ${y}) scale(${scale})`} opacity={opacity}>
      <ellipse cx="0" cy="20" rx="34" ry="20" fill={fill} />
      <ellipse cx="26" cy="14" rx="26" ry="22" fill={fill} />
      <ellipse cx="-26" cy="16" rx="24" ry="18" fill={fill} />
      <rect x="-58" y="22" width="118" height="20" rx="10" fill={fill} />
    </g>
  </motion.g>
)

const Raindrops = ({ color = '#dbe6ff', count = 14, heavy = false }) => (
  <g>
    {Array.from({ length: count }).map((_, i) => {
      const x = 70 + ((i * 263) % 280)
      const delay = (i % 7) * 0.18
      return (
        <motion.line
          key={i}
          x1={x}
          x2={x - 6}
          y1={150}
          y2={150 + (heavy ? 22 : 16)}
          stroke={color}
          strokeWidth={heavy ? 3 : 2}
          strokeLinecap="round"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: [0, 1, 0], y: [0, 70] }}
          transition={{ duration: heavy ? 0.7 : 0.95, repeat: Infinity, delay, ease: 'easeIn' }}
        />
      )
    })}
  </g>
)

export default function WeatherScene({ kind, className = '' }: { kind: WeatherKind; className?: string }) {
  const t = SKY[kind]
  const id = `sky-${kind}`
  return (
    <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.from} />
          <stop offset="100%" stopColor={t.to} />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7df" />
          <stop offset="55%" stopColor={t.accent} />
          <stop offset="100%" stopColor={t.accent} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <rect width="400" height="240" fill={`url(#${id})`} />

      {/* Sun / glow for bright phases */}
      {(kind === 'bright' || kind === 'sunny' || kind === 'partly') && (
        <>
          <circle cx={kind === 'partly' ? 300 : 200} cy="90" r="120" fill={`url(#${id}-sun)`} />
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${kind === 'partly' ? 300 : 200}px 90px` }}
          >
            {kind !== 'partly' &&
              Array.from({ length: 12 }).map((_, i) => {
                const a = (i / 12) * Math.PI * 2
                const cx = 200 + Math.cos(a) * 70
                const cy = 90 + Math.sin(a) * 70
                const ex = 200 + Math.cos(a) * 86
                const ey = 90 + Math.sin(a) * 86
                return (
                  <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="#ffe9a8" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
                )
              })}
            <circle cx={kind === 'partly' ? 300 : 200} cy="90" r="42" fill="#ffe27a" />
            <circle cx={kind === 'partly' ? 300 : 200} cy="90" r="42" fill="#fff3c4" opacity="0.4" />
          </motion.g>
        </>
      )}

      {/* Soft ambient blobs */}
      <circle cx="60" cy="40" r="50" fill="#ffffff" opacity="0.12" filter={`url(#${id}-blur)`} />
      <circle cx="350" cy="180" r="60" fill="#ffffff" opacity="0.1" filter={`url(#${id}-blur)`} />

      {/* Clouds by kind */}
      {kind === 'partly' && <Cloud x={70} y={120} scale={0.9} delay={0} />}
      {(kind === 'cloudy' || kind === 'drizzle') && (
        <>
          <Cloud x={110} y={70} scale={1.1} fill="#f1f4fb" />
          <Cloud x={250} y={110} scale={0.85} fill="#e6ebf6" delay={1.2} />
        </>
      )}
      {(kind === 'rain' || kind === 'storm' || kind === 'tornado') && (
        <>
          <Cloud x={110} y={80} scale={1.2} fill={kind === 'tornado' ? '#5a5478' : '#cfd6e8'} opacity={0.98} />
          <Cloud x={260} y={110} scale={0.95} fill={kind === 'tornado' ? '#6a6390' : '#dbe1f0'} delay={1} />
        </>
      )}

      {kind === 'drizzle' && <Raindrops count={9} color="#cdd9f0" />}
      {kind === 'rain' && <Raindrops count={16} color="#dbe6ff" />}
      {kind === 'storm' && (
        <>
          <Raindrops count={18} color="#e7ddff" heavy />
          <Lightning />
        </>
      )}
      {kind === 'tornado' && <Tornado />}
    </svg>
  )
}

const Lightning = () => (
  <motion.path
    d="M205 120 L188 165 L205 165 L182 210 L222 156 L204 156 Z"
    fill="#fff2a8"
    stroke="#ffe27a"
    strokeWidth="1.5"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 0, 1, 0, 1, 0] }}
    transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.5, 0.55, 0.62, 0.68, 0.8] }}
  />
)

const Tornado = () => (
  <g>
    <motion.g
      animate={{ rotate: [-2, 2, -2] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: '210px 150px' }}
    >
      <path d="M150 130 Q210 120 270 130 Q235 150 250 165 Q215 158 230 178 Q205 175 215 195 Q200 200 208 215 Q200 224 196 230 Q188 220 196 210 Q176 205 192 188 Q166 184 188 168 Q156 160 178 146 Q150 140 150 130 Z" fill="#8a7fb0" opacity="0.95" />
      <path d="M160 132 Q210 126 262 132" stroke="#cdbff2" strokeWidth="4" fill="none" opacity="0.7" />
      <path d="M178 150 Q210 146 244 150" stroke="#cdbff2" strokeWidth="3.5" fill="none" opacity="0.6" />
      <path d="M192 170 Q210 168 230 170" stroke="#cdbff2" strokeWidth="3" fill="none" opacity="0.6" />
    </motion.g>
    {Array.from({ length: 6 }).map((_, i) => (
      <motion.circle
        key={i}
        cx={150 + i * 22}
        cy={120}
        r={2.5}
        fill="#d9ccff"
        animate={{ x: [-10, 10, -10], y: [0, -6, 0], opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </g>
)

export const WEATHER_LABEL: Record<WeatherKind, string> = {
  bright: 'Brilliant',
  sunny: 'Sunny',
  partly: 'Partly sunny',
  cloudy: 'Overcast',
  drizzle: 'Light rain',
  rain: 'Rainy',
  storm: 'Stormy',
  tornado: 'Tornado',
}

export const WEATHER_EMOJI: Record<WeatherKind, string> = {
  bright: '🌞',
  sunny: '☀️',
  partly: '🌤️',
  cloudy: '☁️',
  drizzle: '🌦️',
  rain: '🌧️',
  storm: '⛈️',
  tornado: '🌪️',
}
