import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from './Logo'

/** Branded splash shown briefly on every launch. */
export default function Splash({ minDuration = 1900 }: { minDuration?: number }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShow(false), minDuration)
    return () => clearTimeout(t)
  }, [minDuration])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-mist via-white to-[#eadcff]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div className="pointer-events-none absolute inset-0 aurora opacity-50" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 140, damping: 16 }}
            className="relative"
          >
            <Logo size={150} />
          </motion.div>

          <motion.div
            className="relative mt-10 h-1.5 w-40 overflow-hidden rounded-full bg-black/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="h-full rounded-full bg-dusk"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: minDuration / 1000 - 0.3, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
