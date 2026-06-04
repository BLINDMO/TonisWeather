import { useMemo, useState } from 'react'
import { addMonths, format, isSameMonth } from 'date-fns'
import { useStore } from '../store'
import { useModel } from '../lib/useModel'
import { forecastFor } from '../lib/cycle'
import { monthGrid, toISO, todayISO } from '../lib/date'
import type { ISODate } from '../types'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function moodBg(score: number): string {
  if (score >= 9) return '#4CC8A4'
  if (score >= 7) return '#7BD6A8'
  if (score >= 5) return '#FFBE30'
  if (score >= 3) return '#FF9B78'
  return '#FF8FB1'
}

export default function CalendarPage({ onOpenDay }: { onOpenDay: (d: ISODate) => void }) {
  const logs = useStore((s) => s.logs)
  const model = useModel()
  const [anchor, setAnchor] = useState(new Date())
  const today = todayISO()

  const days = useMemo(() => monthGrid(anchor), [anchor])
  const nRows = Math.ceil(days.length / 7)

  if (!model) return null

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="safe-top shrink-0 flex items-center justify-between px-5 pb-2 pt-2">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {format(anchor, 'MMMM yyyy')}
        </h1>
        <div className="flex items-center gap-2">
          <NavBtn onClick={() => setAnchor((a) => addMonths(a, -1))}>‹</NavBtn>
          <NavBtn onClick={() => setAnchor((a) => addMonths(a, 1))}>›</NavBtn>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="shrink-0 grid grid-cols-7 px-3 pb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-[11px] font-bold tracking-wider text-ink/35">
            {d}
          </div>
        ))}
      </div>

      {/* Full-height calendar grid — fills all remaining viewport space */}
      <div
        className="flex-1 min-h-0 grid grid-cols-7 gap-1.5 px-3"
        style={{
          gridTemplateRows: `repeat(${nRows}, 1fr)`,
          paddingBottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {days.map((d) => {
          const iso = toISO(d)
          const fc = forecastFor(model, iso)
          const log = logs[iso]
          const inMonth = isSameMonth(d, anchor)
          const isToday = iso === today
          const actualPeriod = !!log?.period
          const isPast = iso <= today
          const predictedPeriod = fc.isPredictedPeriod && !isPast && !actualPeriod
          const tornado = fc.tornadoLevel === 'tornado'
          const watch = fc.tornadoLevel === 'watch'
          const hasMood = typeof log?.mood === 'number'

          let bg: string
          let stripe = false
          let ring = ''

          if (!inMonth) {
            bg = 'rgba(255,255,255,0.2)'
          } else if (tornado) {
            bg = 'linear-gradient(155deg,#EDE5FC,#D9CEFA)'
          } else if (actualPeriod) {
            bg = 'linear-gradient(155deg,#FFE0EC,#FFC4D6)'
          } else if (predictedPeriod) {
            stripe = true
            bg = 'transparent'
          } else if (fc.isPredictedOvulation) {
            bg = 'linear-gradient(155deg,#FFF3C2,#FFE48A)'
            ring = 'ring-2 ring-[#FFCF55]'
          } else if (watch) {
            bg = 'linear-gradient(155deg,#F5F0FD,#ECE4F8)'
          } else {
            bg = 'rgba(255,255,255,0.75)'
          }

          return (
            <button
              key={iso}
              onClick={() => inMonth && onOpenDay(iso)}
              className={`relative flex flex-col items-center rounded-[14px] shadow-sm transition active:scale-90 ${
                inMonth ? '' : 'pointer-events-none opacity-25'
              } ${ring} ${stripe ? 'period-stripe' : ''}`}
              style={{ background: stripe ? undefined : bg, padding: '7px 4px 6px' }}
            >
              {/* Date number */}
              <span
                className={`text-[13px] font-bold leading-none ${
                  tornado ? 'text-[#5b4f86]' : 'text-ink/70'
                } ${
                  isToday
                    ? 'flex h-[22px] w-[22px] items-center justify-center rounded-full bg-dusk text-[11px] font-bold text-white shadow-sm'
                    : ''
                }`}
              >
                {format(d, 'd')}
              </span>

              {/* Flex spacer so mood badge sits in the vertical middle */}
              <div className="flex-1" />

              {/* Mood score badge — the headline element */}
              {hasMood && (
                <div
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-[12px] font-bold text-white shadow-md"
                  style={{ background: moodBg(log!.mood!) }}
                >
                  {log!.mood}
                </div>
              )}

              {/* Bottom indicators */}
              {(actualPeriod || tornado || watch) && (
                <div className="mt-[5px] flex items-center gap-0.5">
                  {actualPeriod && <Drop />}
                  {(tornado || watch) && <MiniTornado strong={tornado} />}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function NavBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-ink/55 shadow-card active:scale-90"
    >
      {children}
    </button>
  )
}

function Drop() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3c3.5 4.4 6.5 8 6.5 11.5A6.5 6.5 0 1 1 5.5 14.5C5.5 11 8.5 7.4 12 3z"
        fill="#FF5D8F"
      />
    </svg>
  )
}

function MiniTornado({ strong = false }: { strong?: boolean }) {
  const c = strong ? '#7E72B0' : '#A99BCF'
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5h16M6 9h12M8 13h8M10 17h4M11 21h2"
        stroke={c}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
