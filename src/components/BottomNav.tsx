import { motion } from 'framer-motion'

export type Tab = 'home' | 'calendar' | 'workshop' | 'me'

function IconToday({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="9" r="4" fill={active ? '#FFC93C' : 'currentColor'} />
      {active &&
        Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <line
              key={i}
              x1={9 + Math.cos(a) * 6}
              y1={9 + Math.sin(a) * 6}
              x2={9 + Math.cos(a) * 7.6}
              y2={9 + Math.sin(a) * 7.6}
              stroke="#FFCF55"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )
        })}
      <path
        d="M8 16.5h9a3.2 3.2 0 0 0 0-6.4 4 4 0 0 0-7.7-1.2A3 3 0 0 0 8 16.5z"
        fill={active ? '#fff' : 'currentColor'}
        stroke={active ? '#C9CFE6' : 'none'}
        strokeWidth="0.8"
      />
    </svg>
  )
}

function IconCalendar({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5" width="17" height="15.5" rx="4" fill={active ? '#6d5dfc' : 'currentColor'} />
      <rect x="3.5" y="5" width="17" height="5" rx="4" fill={active ? '#8a5fe0' : '#00000022'} />
      <circle cx="8" cy="14" r="1.5" fill="#fff" />
      <circle cx="12" cy="14" r="1.5" fill="#fff" opacity="0.8" />
      <circle cx="16" cy="14" r="1.5" fill="#fff" opacity="0.5" />
      <rect x="7" y="2.8" width="2" height="4" rx="1" fill={active ? '#6d5dfc' : 'currentColor'} />
      <rect x="15" y="2.8" width="2" height="4" rx="1" fill={active ? '#6d5dfc' : 'currentColor'} />
    </svg>
  )
}

function IconWorkshop({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3.5" width="12" height="17" rx="3" fill={active ? '#FF8FB1' : 'currentColor'} />
      <line x1="8" y1="8" x2="13" y2="8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="11.5" x2="13" y2="11.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      <path
        d="M16 14.5l3.2-3.2a1.6 1.6 0 0 1 2.3 2.3L18.3 17l-3 .7.7-3z"
        fill={active ? '#6d5dfc' : 'currentColor'}
      />
    </svg>
  )
}

function IconMe({ active }: { active: boolean }) {
  const c = active ? '#F2B24E' : 'currentColor'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="6.5" y="2.5" width="2" height="4" rx="1" fill={c} transform="rotate(-10 7.5 4.5)" />
      <rect x="15.5" y="2.5" width="2" height="4" rx="1" fill={c} transform="rotate(10 16.5 4.5)" />
      <circle cx="6.6" cy="3" r="1.6" fill={active ? '#D98E3C' : 'currentColor'} />
      <circle cx="17.4" cy="3" r="1.6" fill={active ? '#D98E3C' : 'currentColor'} />
      <path d="M5 11c0-5 3.2-6.5 7-6.5s7 1.5 7 6.5-3.2 8-7 8-7-3-7-8z" fill={c} />
      <ellipse cx="12" cy="13.5" rx="4" ry="3" fill={active ? '#FFF3DC' : '#ffffff55'} />
      <circle cx="9.6" cy="10" r="1.5" fill="#3A2E22" />
      <circle cx="14.4" cy="10" r="1.5" fill="#3A2E22" />
    </svg>
  )
}

const TABS: { id: Tab; label: string; Icon: (p: { active: boolean }) => JSX.Element }[] = [
  { id: 'home', label: 'Today', Icon: IconToday },
  { id: 'calendar', label: 'Calendar', Icon: IconCalendar },
  { id: 'workshop', label: 'Workshop', Icon: IconWorkshop },
  { id: 'me', label: 'Me', Icon: IconMe },
]

export default function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4 pb-3 safe-bottom">
      <div className="glass flex items-center justify-around rounded-[1.6rem] px-2 py-1.5 shadow-soft">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-[1.2rem] py-2"
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-[1.2rem] bg-white shadow-card"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`relative transition ${active ? 'scale-105 text-dusk' : 'text-ink/35'}`}>
                <t.Icon active={active} />
              </span>
              <span
                className={`relative text-[10px] font-bold transition ${active ? 'text-dusk' : 'text-ink/40'}`}
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
