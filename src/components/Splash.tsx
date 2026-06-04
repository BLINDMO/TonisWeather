import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LogoMark } from './Logo'

/**
 * A cinematic launch sequence: night breaks into dawn, god-rays bloom, soft
 * cloud banks drift up, Murph's logo springs through a glow, and the wordmark
 * rises letter-by-letter. Choreographed, layered — a proper title card.
 */
export default function Splash({ minDuration = 2800 }: { minDuration?: number }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShow(false), minDuration)
    return () => clearTimeout(t)
  }, [minDuration])

  const word = "Toni's Weather"

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* daybreak: bright morning sky revealed as night fades out */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(130% 110% at 50% 6%, #8E7CF7 0%, #6D5DFC 30%, #5847C8 58%, #E59AC0 100%)',
            }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(140% 120% at 50% -10%, #2A2350 0%, #1B1640 45%, #120E2E 100%)',
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />

          {/* rotating god-rays blooming in */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[18%] h-[150%] w-[150%] -translate-x-1/2"
            style={{
              background:
                'repeating-conic-gradient(from 0deg at 50% 0%, rgba(255,233,176,0) 0deg, rgba(255,233,176,0.55) 2.4deg, rgba(255,233,176,0) 7deg, rgba(255,233,176,0) 15deg)',
              WebkitMaskImage: 'radial-gradient(60% 70% at 50% 0%, #000 0%, transparent 70%)',
              maskImage: 'radial-gradient(60% 70% at 50% 0%, #000 0%, transparent 70%)',
              filter: 'blur(3px)',
            }}
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 0.6, rotate: 40 }}
            transition={{ opacity: { duration: 2, delay: 0.4 }, rotate: { duration: minDuration / 1000, ease: 'linear' } }}
          />

          {/* warm glow bloom behind the mark */}
          <motion.div
            className="pointer-events-none absolute top-[34%] h-[420px] w-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,213,102,0.42) 0%, transparent 62%)' }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.12, 1], opacity: [0, 0.9, 0.7] }}
            transition={{ duration: 2.4, ease: 'easeOut' }}
          />
          <div
            className="pointer-events-none absolute bottom-[-120px] left-[-80px] h-80 w-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,143,177,0.3) 0%, transparent 65%)' }}
          />

          {/* fading stars */}
          {[
            { x: '20%', y: '22%', d: 0 },
            { x: '80%', y: '26%', d: 0.4 },
            { x: '30%', y: '14%', d: 0.9 },
            { x: '70%', y: '16%', d: 0.2 },
            { x: '12%', y: '40%', d: 0.6 },
            { x: '88%', y: '44%', d: 1.0 },
          ].map((s, i) => (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-white"
              style={{ left: s.x, top: s.y }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.6] }}
              transition={{ duration: 2.2, delay: s.d, ease: 'easeInOut' }}
            />
          ))}

          {/* drifting cloud banks rising from below */}
          <CloudBanks />

          {/* rising motes */}
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.span
              key={`m${i}`}
              className="absolute rounded-full bg-white/70"
              style={{ left: `${12 + i * 12}%`, bottom: '20%', width: 4, height: 4, filter: 'blur(0.5px)' }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 0.8, 0], y: [-10, -120] }}
              transition={{ duration: 3.4, delay: 0.6 + i * 0.18, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}

          {/* the mark — springs through the glow with a gentle sway */}
          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.7, rotate: -6 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 13, delay: 0.25 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="drop-shadow-[0_22px_60px_rgba(0,0,0,0.45)]"
            >
              <LogoMark size={172} />
            </motion.div>
          </motion.div>

          {/* wordmark — letters rise in sequence */}
          <div className="relative mt-8 flex">
            {word.split('').map((ch, i) => (
              <motion.span
                key={i}
                className="font-display text-3xl font-semibold text-white"
                style={{ textShadow: '0 4px 22px rgba(0,0,0,0.35)', whiteSpace: 'pre' }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.045, type: 'spring', stiffness: 200, damping: 16 }}
              >
                {ch}
              </motion.span>
            ))}
          </div>

          <motion.p
            className="relative mt-2.5 text-[11px] font-semibold tracking-[0.22em] text-white/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            YOUR FORECAST FOR BODY &amp; MOOD
          </motion.p>

          {/* progress shimmer */}
          <motion.div
            className="relative mt-9 h-1 w-40 overflow-hidden rounded-full bg-white/12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FFD166, #FF8FB1, #9A7CF0)' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: minDuration / 1000 - 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CloudBanks() {
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 w-full"
    >
      <defs>
        <filter id="splash-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id="splash-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#E7ECFB" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <motion.g
        filter="url(#splash-soft)"
        fill="url(#splash-cloud)"
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
      >
        <ellipse cx="60" cy="210" rx="90" ry="46" />
        <ellipse cx="180" cy="226" rx="120" ry="54" />
        <ellipse cx="330" cy="214" rx="100" ry="48" />
        <rect x="0" y="220" width="400" height="40" />
      </motion.g>
      <motion.g
        filter="url(#splash-soft)"
        fill="#FFFFFF"
        opacity="0.5"
        initial={{ x: -40 }}
        animate={{ x: [-40, 0, -40] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ellipse cx="120" cy="178" rx="50" ry="26" />
        <ellipse cx="300" cy="190" rx="58" ry="28" />
      </motion.g>
    </svg>
  )
}
