import { motion } from 'framer-motion'

export type Tab = 'home' | 'calendar' | 'workshop' | 'me'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Today', icon: '🌤️' },
  { id: 'calendar', label: 'Calendar', icon: '🗓️' },
  { id: 'workshop', label: 'Workshop', icon: '📝' },
  { id: 'me', label: 'Me', icon: '🦒' },
]

export default function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4 pb-3 safe-bottom">
      <div className="glass flex items-center justify-around rounded-full px-2 py-1.5 shadow-soft">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2"
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white shadow-card"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`relative text-xl transition ${active ? 'scale-110' : 'opacity-60'}`}>
                {t.icon}
              </span>
              <span
                className={`relative text-[10px] font-bold transition ${
                  active ? 'text-dusk' : 'text-ink/40'
                }`}
              >
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
