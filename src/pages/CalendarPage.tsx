import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { addMonths, format, isSameMonth } from 'date-fns'
import { useStore } from '../store'
import { useModel } from '../lib/useModel'
import { forecastFor } from '../lib/cycle'
import { monthGrid, toISO, todayISO } from '../lib/date'
import { moodFace } from '../components/MoodSlider'
import type { ISODate } from '../types'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function CalendarPage({ onOpenDay }: { onOpenDay: (d: ISODate) => void }) {
  const logs = useStore((s) => s.logs)
  const model = useModel()
  const [anchor, setAnchor] = useState(new Date())
  const today = todayISO()

  const days = useMemo(() => monthGrid(anchor), [anchor])
  if (!model) return null

  return (
    <div className="mx-auto max-w-md px-4 pb-28">
      <div className="safe-top flex items-center justify-between px-1 pb-2 pt-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Calendar</h1>
        <div className="flex items-center gap-1">
          <NavBtn onClick={() => setAnchor((a) => addMonths(a, -1))}>‹</NavBtn>
          <span className="w-32 text-center text-sm font-bold text-ink">
            {format(anchor, 'MMMM yyyy')}
          </span>
          <NavBtn onClick={() => setAnchor((a) => addMonths(a, 1))}>›</NavBtn>
        </div>
      </div>

      <div className="card p-3">
        <div className="mb-1 grid grid-cols-7">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="py-1 text-center text-[11px] font-bold text-ink/35">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const iso = toISO(d)
            const fc = forecastFor(model, iso)
            const log = logs[iso]
            const inMonth = isSameMonth(d, anchor)
            const isToday = iso === today
            const actualPeriod = !!log?.period
            const isPast = iso <= today
            const predictedPeriod = fc.isPredictedPeriod && !isPast && !actualPeriod

            // background, by priority
            let bg = 'transparent'
            let stripe = false
            let ring = ''
            const darkText = fc.tornado
            if (fc.tornado) bg = '#6f6391'
            else if (fc.tornadoLevel === 'watch') bg = '#ece8f7'
            else if (actualPeriod) bg = '#ffd0dd'
            else if (predictedPeriod) stripe = true
            else if (fc.isPredictedOvulation) bg = '#ffe7a8'
            if (fc.isPredictedOvulation) ring = 'ring-2 ring-sun'

            return (
              <button
                key={iso}
                onClick={() => onOpenDay(iso)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm transition active:scale-90 ${
                  inMonth ? '' : 'opacity-30'
                } ${ring} ${stripe ? 'period-stripe' : ''}`}
                style={{ background: stripe ? undefined : bg }}
              >
                <span
                  className={`font-semibold ${darkText ? 'text-white' : 'text-ink/80'} ${
                    isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-dusk text-white' : ''
                  }`}
                >
                  {format(d, 'd')}
                </span>

                {/* bottom indicators */}
                <div className="absolute bottom-1 flex items-center gap-0.5">
                  {actualPeriod && <span className="text-[10px] leading-none">🩸</span>}
                  {typeof log?.mood === 'number' && (
                    <span className="text-[10px] leading-none">{moodFace(log.mood)}</span>
                  )}
                </div>

                {/* top-right risk marker */}
                {fc.tornado && <span className="absolute right-1 top-1 text-[9px]">🌪️</span>}
                {fc.tornadoLevel === 'watch' && (
                  <span className="absolute right-1 top-1 text-[8px] opacity-70">🌀</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="card mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 p-4">
        <Legend stripe label="Expected period" />
        <Legend emojiOnly="🩸" label="Logged period" />
        <Legend swatch="#ffe7a8" label="Ovulation" ring />
        <Legend swatch="#ece8f7" label="Tornado watch" emoji="🌀" />
        <Legend swatch="#6f6391" label="Tornado day" emoji="🌪️" />
        <Legend emojiOnly="🙂" label="Your logged mood" />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 px-3 text-center text-xs leading-relaxed text-ink/40"
      >
        A <strong>Tornado watch</strong> marks the PMDD-prone days before your period. A day only
        becomes a full <strong>Tornado</strong> once your own history confirms it tends to be
        severe — so the more you log, the more accurate the warnings get.
      </motion.p>
    </div>
  )
}

function NavBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl font-bold text-ink/60 shadow-card active:scale-90"
    >
      {children}
    </button>
  )
}

function Legend({
  swatch,
  stripe,
  emojiOnly,
  label,
  emoji,
  ring,
}: {
  swatch?: string
  stripe?: boolean
  emojiOnly?: string
  label: string
  emoji?: string
  ring?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      {(swatch || stripe) && (
        <span
          className={`h-5 w-5 shrink-0 rounded-lg ${ring ? 'ring-2 ring-sun' : ''} ${
            stripe ? 'period-stripe' : ''
          }`}
          style={stripe ? undefined : { background: swatch }}
        />
      )}
      {emojiOnly && <span className="w-5 shrink-0 text-center text-base leading-none">{emojiOnly}</span>}
      <span className="text-xs font-semibold text-ink/60">
        {emoji && `${emoji} `}
        {label}
      </span>
    </div>
  )
}
