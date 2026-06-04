import { AnimatePresence, motion } from 'framer-motion'
import Giraffe from './Giraffe'
import { pickSuggestions, suggestionCategoryLabel } from '../lib/suggestions'

interface Props {
  open: boolean
  name: string
  onClose: () => void
  onOpenWorkshop: () => void
}

export default function GiraffeModal({ open, name, onClose, onOpenWorkshop }: Props) {
  const suggestions = pickSuggestions(new Date().getDate(), 5)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-h-[90dvh] max-w-md overflow-y-auto rounded-t-5xl bg-gradient-to-b from-[#fff7ec] to-white no-scrollbar"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
            <div className="px-6 pb-32 pt-4">
              <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-black/10" />

              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0.6, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                >
                  <Giraffe size={130} />
                </motion.div>
                <div className="relative mt-1 rounded-4xl bg-white px-5 py-4 shadow-card">
                  <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white" />
                  <p className="text-[15px] font-semibold leading-relaxed text-ink">
                    Hey {name || 'friend'}, looks like you're having a hard time today. 💛
                    <br />
                    Here are a few things that really can help.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {suggestions.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className={`flex gap-3 rounded-4xl border border-black/5 bg-white p-4 shadow-card ${
                      s.id === 'workshop' ? 'ring-2 ring-dusk/30' : ''
                    }`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mist text-2xl">
                      {s.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[15px] font-bold text-ink">{s.title}</h4>
                        <span className="pill bg-black/5 text-[10px] text-ink/50">
                          {suggestionCategoryLabel(s.category)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-ink/60">{s.body}</p>
                      {s.id === 'workshop' && (
                        <button
                          onClick={onOpenWorkshop}
                          className="mt-3 rounded-full bg-dusk px-4 py-2 text-sm font-bold text-white active:scale-95"
                        >
                          Open the Emotion Workshop →
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-black/5 bg-white/95 px-6 pb-6 pt-3 backdrop-blur safe-bottom">
              <button
                onClick={onClose}
                className="w-full rounded-full bg-ink/90 py-4 text-base font-bold text-white transition active:scale-[0.98]"
              >
                Thanks, Gigi 🦒
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
