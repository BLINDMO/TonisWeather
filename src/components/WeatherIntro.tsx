import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { SKY, WEATHER_LABEL } from './WeatherScene'
import WeatherGlyph from './WeatherGlyph'
import type { WeatherKind } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// The cinematic opening. After the branded splash lifts, today's weather takes
// the WHOLE screen for a couple of seconds — a thunderstorm crackles with
// lightning on stormy days, the sun blooms on bright ones — then the sky
// physically shrinks and settles into the hero card at the top of the mood
// board. It never blocks input (pointer-events-none) and runs once per launch.
// ─────────────────────────────────────────────────────────────────────────────

const SPLASH_S = 2.0 // matches <Splash minDuration={2000}>
const PLAY_MS = 2150 // full-screen drama after the splash lifts
const SETTLE_MS = 780

export default function WeatherIntro({
  kind,
  headline,
  onDone,
}: {
  kind: WeatherKind
  headline: string
  onDone: () => void
}) {
  const [phase, setPhase] = useState<'full' | 'settle'>('full')
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('settle'), SPLASH_S * 1000 + PLAY_MS)
    const t2 = setTimeout(onDone, SPLASH_S * 1000 + PLAY_MS + SETTLE_MS)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  const sky = SKY[kind]
  const stormy = kind === 'storm' || kind === 'tornado'
  const rainy = stormy || kind === 'rain' || kind === 'drizzle'
  const sunny = kind === 'sunny' || kind === 'bright'
  const dark = stormy || kind === 'rain'

  // Deterministic "random" rain field so the render is stable.
  const drops = useMemo(
    () =>
      Array.from({ length: stormy ? 38 : rainy ? 22 : 0 }, (_, i) => ({
        left: (i * 37 + 11) % 100,
        delay: (i % 9) * 0.11,
        dur: stormy ? 0.55 + (i % 5) * 0.07 : 0.8 + (i % 5) * 0.08,
        len: 16 + (i % 4) * 7,
        tilt: stormy ? -14 : -7,
      })),
    [stormy, rainy],
  )

  return (
    <motion.div
      className="pointer-events-none fixed z-[90] overflow-hidden"
      initial={{ top: '0vh', left: '0px', right: '0px', height: '100vh', borderRadius: 0, opacity: 1 }}
      animate={
        phase === 'full'
          ? { top: '0vh', left: '0px', right: '0px', height: '100vh', borderRadius: 0, opacity: 1 }
          : {
              // shrink into (approximately) the hero card's spot on Home
              top: '9vh',
              left: '16px',
              right: '16px',
              height: '52vh',
              borderRadius: 36,
              opacity: 0,
            }
      }
      transition={{
        default: { duration: SETTLE_MS / 1000, ease: [0.32, 0.72, 0.25, 1] },
        opacity: { delay: SETTLE_MS / 1000 - 0.32, duration: 0.32 },
      }}
      style={{ background: `linear-gradient(170deg, ${sky.from} 0%, ${sky.to} 100%)` }}
    >
      {/* subtle camera shake when the storm hits */}
      <motion.div
        className="absolute inset-0"
        animate={stormy ? { x: [0, 0, -6, 5, -3, 0] } : undefined}
        transition={{ duration: 0.7, delay: SPLASH_S + 0.45, ease: 'easeOut' }}
      >
        {/* ambient glow depth */}
        <div
          className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full"
          style={{
            background: `radial-gradient(circle, ${sunny ? 'rgba(255,209,102,0.5)' : 'rgba(255,255,255,0.18)'} 0%, transparent 62%)`,
          }}
        />

        {/* full-screen rain */}
        {drops.map((d, i) => (
          <motion.span
            key={i}
            className="absolute top-0 block rounded-full"
            style={{
              left: `${d.left}%`,
              width: stormy ? 3 : 2,
              height: d.len,
              background: dark ? 'rgba(224,232,255,0.75)' : 'rgba(255,255,255,0.8)',
              transform: `rotate(${d.tilt}deg)`,
            }}
            initial={{ y: '-12vh', opacity: 0 }}
            animate={{ y: '112vh', opacity: [0, 1, 1, 0.6] }}
            transition={{
              duration: d.dur,
              delay: SPLASH_S * 0.7 + d.delay,
              repeat: Infinity,
              ease: 'easeIn',
            }}
          />
        ))}

        {/* lightning: two full-screen flashes + a bolt */}
        {stormy && (
          <>
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.9, 0, 0.45, 0, 0] }}
              transition={{
                duration: 0.85,
                delay: SPLASH_S + 0.4,
                times: [0, 0.3, 0.38, 0.52, 0.62, 0.78, 1],
              }}
            />
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0, 0.3, 0] }}
              transition={{ duration: 0.55, delay: SPLASH_S + 1.35 }}
            />
            <motion.svg
              viewBox="0 0 100 220"
              className="absolute left-[58%] top-[6%] h-[46vh] w-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.2, 0.9, 0] }}
              transition={{ duration: 0.8, delay: SPLASH_S + 0.42 }}
            >
              <path
                d="M52 0 L30 88 L48 92 L22 178 L58 104 L40 100 L68 6 Z"
                fill="#fff"
                style={{ filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.9))' }}
              />
            </motion.svg>
          </>
        )}

        {/* sun bloom on bright days */}
        {sunny && (
          <motion.div
            className="absolute left-1/2 top-[30%] h-[70vw] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,214,110,0.85) 0%, rgba(255,214,110,0.25) 45%, transparent 70%)' }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.15, 1], opacity: [0, 1, 0.9] }}
            transition={{ duration: 1.4, delay: SPLASH_S + 0.15, ease: 'easeOut' }}
          />
        )}

        {/* the weather itself, front and center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1.15, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 90, damping: 14, delay: SPLASH_S + 0.1 }}
          >
            <WeatherGlyph kind={kind} size={190} />
          </motion.div>
          <motion.h2
            className={`mt-5 font-display text-4xl font-semibold ${dark ? 'text-white' : 'text-ink'}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: SPLASH_S + 0.55 }}
          >
            {headline}
          </motion.h2>
          <motion.p
            className={`mt-1.5 text-sm font-bold uppercase tracking-[0.22em] ${dark ? 'text-white/70' : 'text-ink/50'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: SPLASH_S + 0.8 }}
          >
            Today · {WEATHER_LABEL[kind]}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  )
}
