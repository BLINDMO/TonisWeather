import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { addMonths, format, isSameMonth, startOfMonth } from 'date-fns'
import { useStore } from '../store'
import { useModel } from '../lib/useModel'
import { forecastFor, nextPeriodStart } from '../lib/cycle'
import { monthGrid, toISO, todayISO, shortDate, addDaysISO } from '../lib/date'
import { moodFace } from '../components/MoodSlider'
import type { ISODate } from '../types'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function CalendarPage({ onOpenDay }: { onOpenDay: (d: ISODate) => void }) {
  const logs = useStore((s) => s.logs)
  const model = useModel()
  const [anchor, setAnchor] = useState(new Date())
  const today = todayISO()

  const days = useMemo(() => monthGrid(anchor), [anchor])

  const insights = useMemo(() => {
    if (!model) return null
    const firstISO = toISO(startOfMonth(anchor))
    const from = isSameMonth(new Date(today), anchor) ? today : firstISO
    const ps = nextPeriodStart(model, from)
    const end = addDaysISO(ps, Math.max(0, model.geo.periodLength - 1))
    // Ovulation date for the cycle ending at `ps` — matches the calendar's
    // cycle-day == ovulationDay gold marker exactly (keeps the panel consistent).
    const ov = addDaysISO(ps, model.geo.ovulationDay - 1 - model.geo.cycleLength)
    let watch = 0
    for (const d of days) {
      if (!isSameMonth(d, anchor)) continue
      if (forecastFor(model, toISO(d)).tornadoLevel !== 'none') watch++
    }
    return { ps, end, ov, watch }
  }, [model, anchor, days, today])

  if (!model || !insights) return null

  return (
    <div className="mx-auto max-w-md px-4 pb-28">
      <div className="safe-top flex items-center justify-between px-1 pb-3 pt-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Calendar</h1>
        <div className="flex items-center gap-1">
          <NavBtn onClick={() => setAnchor((a) => addMonths(a, -1))}>‹</NavBtn>
          <span className="w-32 text-center text-sm font-bold text-ink">{format(anchor, 'MMMM yyyy')}</span>
          <NavBtn onClick={() => setAnchor((a) => addMonths(a, 1))}>›</NavBtn>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-3.5 shadow-card backdrop-blur">
        <div className="mb-1.5 grid grid-cols-7">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="py-1 text-center text-[11px] font-bold text-ink/30">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const iso = toISO(d)
            const fc = forecastFor(model, iso)
            const log = logs[iso]
            const inMonth = isSameMonth(d, anchor)
            const isToday = iso === today
            const actualPeriod = !!log?.period
            const isPast = iso <= today
            const predictedPeriod = fc.isPredictedPeriod && !isPast && !actualPeriod

            // premium, light fills
            let bg: string | undefined
            let stripe = false
            let ring = ''
            const tornado = fc.tornadoLevel === 'tornado'
            const watch = fc.tornadoLevel === 'watch'
            if (tornado) bg = 'linear-gradient(160deg,#E7DEFB,#D7C9F4)'
            else if (actualPeriod) bg = 'linear-gradient(160deg,#FFDCE6,#FFC4D5)'
            else if (predictedPeriod) stripe = true
            else if (fc.isPredictedOvulation) {
              bg = 'linear-gradient(160deg,#FFF0C4,#FFE08A)'
              ring = 'ring-2 ring-[#FFCF55]'
            } else if (watch) bg = 'linear-gradient(160deg,#F4EFFC,#ECE4F8)'

            return (
              <button
                key={iso}
                onClick={() => onOpenDay(iso)}
                className={`relative flex aspect-[1/1.12] flex-col items-center justify-center rounded-[1.05rem] transition active:scale-90 ${
                  inMonth ? '' : 'opacity-30'
                } ${ring} ${stripe ? 'period-stripe' : ''}`}
                style={{ background: stripe ? undefined : bg }}
              >
                <span
                  className={`text-[15px] font-semibold ${tornado ? 'text-[#5b4f86]' : 'text-ink/80'} ${
                    isToday
                      ? 'flex h-7 w-7 items-center justify-center rounded-full bg-dusk text-white shadow-soft'
                      : ''
                  }`}
                >
                  {format(d, 'd')}
                </span>

                {/* bottom indicators */}
                <div className="absolute bottom-1 flex items-center gap-0.5">
                  {actualPeriod && <Drop />}
                  {typeof log?.mood === 'number' && (log.moodSet || log.mood !== 7) && (
                    <span className="text-[10px] leading-none">{moodFace(log.mood)}</span>
                  )}
                </div>

                {/* top-right risk marker */}
                {(tornado || watch) && (
                  <span className="absolute right-1 top-1">
                    <MiniTornado strong={tornado} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* This-month insights — fills the space with something useful */}
      <h2 className="mb-2.5 mt-5 px-1 text-sm font-bold uppercase tracking-[0.14em] text-ink/40">
        This month
      </h2>
      <div className="grid grid-cols-3 gap-3">
        <Insight
          glyph={<Drop big />}
          tint="#FFE7EE"
          label="Period"
          value={`${shortDate(insights.ps)}`}
          sub={`± ${model.predictionWindow} day${model.predictionWindow === 1 ? '' : 's'}`}
        />
        <Insight
          glyph={<SunDot />}
          tint="#FFF4D8"
          label="Ovulation"
          value={shortDate(insights.ov)}
          sub="± a day"
        />
        <Insight
          glyph={<MiniTornado strong />}
          tint="#F1ECFB"
          label="Watch days"
          value={`${insights.watch}`}
          sub="this month"
        />
      </div>

      {/* Legend */}
      <div className="card mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 p-4">
        <Legend stripe label="Expected period" />
        <Legend glyph={<Drop />} label="Logged period" />
        <Legend swatch="linear-gradient(160deg,#FFF0C4,#FFE08A)" label="Ovulation" ring />
        <Legend swatch="linear-gradient(160deg,#F4EFFC,#ECE4F8)" label="Tornado watch" glyph={<MiniTornado />} />
        <Legend swatch="linear-gradient(160deg,#E7DEFB,#D7C9F4)" label="Tornado day" glyph={<MiniTornado strong />} />
        <Legend glyph={<span className="text-base">🙂</span>} label="Your logged mood" />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 px-3 text-center text-xs leading-relaxed text-ink/40"
      >
        A <strong>Tornado watch</strong> covers your vulnerable windows — around ovulation and the
        late-luteal run-up to your period. A day only becomes a full <strong>Tornado</strong> once
        your own logs confirm it tends to be severe, so the more you track, the sharper it gets.
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

function Insight({
  glyph,
  tint,
  label,
  value,
  sub,
}: {
  glyph: React.ReactNode
  tint: string
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="card flex flex-col items-center p-3 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: tint }}>
        {glyph}
      </div>
      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-ink/40">{label}</p>
      <p className="font-display text-[15px] font-semibold leading-tight text-ink">{value}</p>
      <p className="text-[10px] text-ink/40">{sub}</p>
    </div>
  )
}

function Legend({
  swatch,
  stripe,
  glyph,
  label,
  ring,
}: {
  swatch?: string
  stripe?: boolean
  glyph?: React.ReactNode
  label: string
  ring?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      {(swatch || stripe) && (
        <span
          className={`h-5 w-5 shrink-0 rounded-lg ${ring ? 'ring-2 ring-[#FFCF55]' : ''} ${
            stripe ? 'period-stripe' : ''
          }`}
          style={stripe ? undefined : { background: swatch }}
        />
      )}
      {glyph && <span className="flex w-5 shrink-0 justify-center">{glyph}</span>}
      <span className="text-xs font-semibold text-ink/60">{label}</span>
    </div>
  )
}

function Drop({ big = false }: { big?: boolean }) {
  const s = big ? 18 : 11
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3c3.5 4.4 6.5 8 6.5 11.5A6.5 6.5 0 1 1 5.5 14.5C5.5 11 8.5 7.4 12 3z"
        fill="#FF5D8F"
      />
      <ellipse cx="9.5" cy="14" rx="1.6" ry="2.4" fill="#fff" opacity="0.55" />
    </svg>
  )
}

function SunDot() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" fill="#FFB020" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <line
            key={i}
            x1={12 + Math.cos(a) * 7.5}
            y1={12 + Math.sin(a) * 7.5}
            x2={12 + Math.cos(a) * 10}
            y2={12 + Math.sin(a) * 10}
            stroke="#FFCF55"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}

function MiniTornado({ strong = false }: { strong?: boolean }) {
  const c = strong ? '#7E72B0' : '#A99BCF'
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5h16M6 9h12M8 13h8M10 17h4M11 21h2"
        stroke={c}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
