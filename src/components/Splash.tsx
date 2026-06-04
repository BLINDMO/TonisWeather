import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from './Logo'

/** Branded, premium splash shown briefly on launch — deep contrast + glow. */
export default function Splash({ minDuration = 2000 }: { minDuration?: number }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShow(false), minDuration)
    return () => clearTimeout(t)
  }, [minDuration])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              'radial-gradient(140% 120% at 50% -10%, #4A3D8F 0%, #3A2F73 38%, #271F52 72%, #1B1640 100%)',
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
        >
          {/* luminous orbs for depth */}
          <motion.div
            className="pointer-events-none absolute -top-24 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,209,102,0.35) 0%, transparent 60%)' }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            className="pointer-events-none absolute bottom-[-120px] left-[-80px] h-80 w-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,143,177,0.30) 0%, transparent 65%)' }}
          />
          <div
            className="pointer-events-none absolute right-[-90px] top-1/3 h-72 w-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,198,255,0.22) 0%, transparent 65%)' }}
          />

          {/* twinkles */}
          {[
            { x: '22%', y: '26%', d: 0 },
            { x: '78%', y: '30%', d: 0.6 },
            { x: '30%', y: '70%', d: 1.1 },
            { x: '72%', y: '66%', d: 0.3 },
          ].map((s, i) => (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-white"
              style={{ left: s.x, top: s.y }}
              animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: s.d }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 130, damping: 15 }}
            className="relative drop-shadow-[0_18px_50px_rgba(0,0,0,0.4)]"
          >
            <Logo size={156} dark />
          </motion.div>

          <motion.div
            className="relative mt-12 h-1 w-36 overflow-hidden rounded-full bg-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FFD166, #FF8FB1)' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: minDuration / 1000 - 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
