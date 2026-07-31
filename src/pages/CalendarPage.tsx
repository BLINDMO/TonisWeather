import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { addMonths, format, isSameMonth } from 'date-fns'
import { useStore } from '../store'
import { useModel } from '../lib/useModel'
import { forecastFor, nextPeriodStart, type CycleModel } from '../lib/cycle'
import { monthGrid, toISO, todayISO, shortDate, addDaysISO } from '../lib/date'
import { moodFace } from '../components/MoodSlider'
import { SKY } from '../components/WeatherScene'
import type { ISODate } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// The calendar as a weather map of her cycle. Every day tile carries a soft
// wash of its forecast sky, so the month reads as one continuous gradient —
// rose (period) → clear blues (follicular) → gold (ovulation) → deepening
// purples (the late-luteal storm window). Meaningful days get full-saturation
// treatments. Designed for one device: iPhone 14 Pro, 390×844 @3x.
// ─────────────────────────────────────────────────────────────────────────────

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function tint(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

export default function CalendarPage({ onOpenDay }: { onOpenDay: (d: ISODate) => void }) {
  const logs = useStore((s) => s.logs)
  const model = useModel()
  const [anchor, setAnchor] = useState(new Date())
  const [dir, setDir] = useState(0) // -1 back, +1 forward, for slide direction
  const today = todayISO()

  const days = useMemo(() => monthGrid(anchor), [anchor])

  const insights = useMemo(() => {
    if (!model) return null
    const firstISO = toISO(days.find((d) => isSameMonth(d, anchor)) ?? anchor)
    const from = isSameMonth(new Date(today), anchor) ? today : firstISO
    const ps = nextPeriodStart(model, from)
    const ov = addDaysISO(ps, model.geo.ovulationDay - 1 - model.geo.cycleLength)
    let watch = 0
    let tornado = 0
    for (const d of days) {
      if (!isSameMonth(d, anchor)) continue
      const lvl = forecastFor(model, toISO(d)).tornadoLevel
      if (lvl === 'watch') watch++
      if (lvl === 'tornado') tornado++
    }
    return { ps, ov, watch, tornado }
  }, [model, anchor, days, today])

  if (!model || !insights) return null

  const move = (delta: number) => {
    setDir(delta)
    setAnchor((a) => addMonths(a, delta))
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-36">
      {/* header */}
      <div className="safe-top flex items-end justify-between px-1 pb-4 pt-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/35">
            {format(anchor, 'yyyy')}
          </p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={format(anchor, 'MMMM')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="font-display text-[2rem] font-bold leading-none text-ink"
            >
              {format(anchor, 'MMMM')}
            </motion.h1>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          {!isSameMonth(new Date(today), anchor) && (
            <button
              onClick={() => {
                setDir(0)
                setAnchor(new Date())
              }}
              className="rounded-full bg-dusk/10 px-3.5 py-2 text-xs font-bold text-dusk transition active:scale-90"
            >
              Today
            </button>
          )}
          <NavBtn onClick={() => move(-1)}>‹</NavBtn>
          <NavBtn onClick={() => move(1)}>›</NavBtn>
        </div>
      </div>

      {/* month grid — glass panel */}
      <div className="relative">
        {/* ambient aurora behind the glass */}
        <div
          className="pointer-events-none absolute -left-10 -top-8 h-44 w-44 rounded-full opacity-60 blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(255,143,177,0.35), transparent 65%)' }}
        />
        <div
          className="pointer-events-none absolute -right-8 bottom-0 h-40 w-40 rounded-full opacity-60 blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(124,198,255,0.35), transparent 65%)' }}
        />

        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/70 bg-white/70 p-3 shadow-soft backdrop-blur-xl">
          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="py-1.5 text-center text-[10px] font-bold tracking-widest text-ink/30">
                {d}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={format(anchor, 'yyyy-MM')}
              custom={dir}
              initial={{ opacity: 0, x: dir * 46 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -46 }}
              transition={{ duration: 0.24, ease: [0.3, 0.7, 0.3, 1] }}
              className="grid grid-cols-7 gap-[5px]"
            >
              {days.map((d, idx) => {
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
                const ovDay = fc.isPredictedOvulation
                const trustedMood =
                  typeof log?.mood === 'number' && (log.moodSet || log.mood !== 7)

                // ── tile treatment (priority order) ──
                let bg: string
                let darkTile = false
                let ring = ''
                if (actualPeriod) {
                  bg = 'linear-gradient(160deg,#FF9DBC 0%,#FF5D8F 100%)'
                  darkTile = true
                } else if (tornado) {
                  bg = 'linear-gradient(160deg,#565377 0%,#6E5F96 100%)'
                  darkTile = true
                } else if (ovDay) {
                  bg = 'linear-gradient(160deg,#FFE9A8 0%,#FFCF55 100%)'
                  ring = 'ring-2 ring-[#F5B818]/70'
                } else if (predictedPeriod) {
                  bg = `linear-gradient(160deg,${tint('#FF8FB1', 0.28)},${tint('#FF5D8F', 0.34)})`
                } else {
                  // soft wash of the day's forecast sky — the "weather map"
                  const sky = SKY[fc.weather]
                  const a = watch ? 0.5 : 0.34
                  bg = `linear-gradient(165deg,${tint(sky.from, a)} 0%,${tint(sky.to, a * 0.8)} 100%)`
                }

                return (
                  <motion.button
                    key={iso}
                    onClick={() => onOpenDay(iso)}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(idx * 0.007, 0.3), duration: 0.2 }}
                    whileTap={{ scale: 0.88 }}
                    className={`relative flex aspect-[1/1.16] flex-col items-center justify-center overflow-hidden rounded-[1rem] border transition ${
                      inMonth ? 'border-white/50' : 'border-transparent opacity-[0.28]'
                    } ${ring} ${predictedPeriod ? 'border-dashed !border-rose/50' : ''} ${
                      isToday ? 'shadow-[0_0_0_2px_#6d5dfc,0_6px_18px_rgba(109,93,252,0.35)]' : ''
                    }`}
                    style={{ background: bg }}
                  >
                    {/* glass sheen */}
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0))',
                      }}
                    />
                    <span
                      className={`relative text-[15px] font-bold leading-none ${
                        darkTile ? 'text-white' : 'text-ink/85'
                      } ${isToday ? 'text-dusk' : ''} ${isToday && darkTile ? '!text-white' : ''}`}
                    >
                      {format(d, 'd')}
                    </span>

                    {/* bottom indicators */}
                    <div className="relative mt-0.5 flex h-3 items-center gap-0.5">
                      {actualPeriod && <Drop />}
                      {trustedMood && (
                        <span className="text-[10px] leading-none">{moodFace(log!.mood!)}</span>
                      )}
                      {tornado && <MiniTornado strong light />}
                      {watch && !tornado && !actualPeriod && <MiniTornado />}
                      {predictedPeriod && !trustedMood && <HollowDrop />}
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* cycle ribbon — where she is right now */}
      <CycleRibbon model={model} today={today} />

      {/* this-month insights */}
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <Insight
          glyph={<Drop big />}
          tint="linear-gradient(150deg,#FFE7EE,#FFD3E1)"
          label="Period"
          value={shortDate(insights.ps)}
          sub={`± ${model.predictionWindow} day${model.predictionWindow === 1 ? '' : 's'}`}
        />
        <Insight
          glyph={<SunDot />}
          tint="linear-gradient(150deg,#FFF4D8,#FFE9B5)"
          label="Ovulation"
          value={shortDate(insights.ov)}
          sub="± a day"
        />
        <Insight
          glyph={<MiniTornado strong big />}
          tint="linear-gradient(150deg,#F1ECFB,#E4DCF5)"
          label="Storm risk"
          value={`${insights.tornado + insights.watch}`}
          sub={insights.tornado > 0 ? `${insights.tornado} tornado` : 'watch days'}
        />
      </div>

      {/* legend chips */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5 px-1">
        <Chip swatch="linear-gradient(150deg,#FF9DBC,#FF5D8F)" label="Period" />
        <Chip swatch={`linear-gradient(150deg,${tint('#FF8FB1', 0.35)},${tint('#FF5D8F', 0.4)})`} dashed label="Expected" />
        <Chip swatch="linear-gradient(150deg,#FFE9A8,#FFCF55)" label="Ovulation" />
        <Chip swatch={`linear-gradient(150deg,${tint('#7b6f9e', 0.45)},${tint('#a99bcf', 0.4)})`} label="Watch" />
        <Chip swatch="linear-gradient(150deg,#565377,#6E5F96)" label="Tornado" />
      </div>

      <p className="mt-4 px-4 text-center text-[11px] leading-relaxed text-ink/35">
        Each day is washed with its forecast sky, so the month flows with your hormones. A day only
        becomes a full <strong>tornado</strong> once your own logs confirm it tends to be severe —
        the more you track, the sharper the map gets.
      </p>
    </div>
  )
}

// ── cycle ribbon ─────────────────────────────────────────────────────────────

function CycleRibbon({ model, today }: { model: CycleModel; today: ISODate }) {
  const { geo } = model
  const fc = forecastFor(model, today)
  const len = geo.cycleLength
  const fertileStart = geo.ovulationDay - 5
  const lateStart = len - 5
  // contiguous segments across the cycle, in days
  const segs = [
    { days: geo.periodLength, color: '#FF8FB1', label: 'Period' },
    { days: Math.max(0, fertileStart - geo.periodLength - 1), color: '#8ecbff', label: 'Follicular' },
    { days: Math.max(0, geo.ovulationDay - fertileStart), color: '#FFD98E', label: 'Fertile' },
    { days: 1, color: '#FFB020', label: 'Ovulation' },
    { days: Math.max(0, lateStart - geo.ovulationDay - 1), color: '#BFB3EA', label: 'Luteal' },
    { days: len - lateStart + 1, color: '#7E72B0', label: 'Storm window' },
  ]
  const pos = ((fc.cycleDay - 0.5) / len) * 100
  const phaseLabel: Record<string, string> = {
    menstrual: 'Period',
    follicular: 'Follicular — clouds clearing',
    fertile: 'Fertile window',
    ovulation: 'Ovulation — peak sunshine',
    'early-luteal': 'Early luteal — warm & hazy',
    'late-luteal': 'Late luteal — storm window',
  }

  return (
    <div className="mt-3 rounded-[1.8rem] border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur-xl">
      <div className="mb-2.5 flex items-baseline justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">Your cycle</p>
        <p className="text-xs font-bold text-ink/70">
          Day {fc.cycleDay} <span className="text-ink/35">· {phaseLabel[fc.phase]}</span>
        </p>
      </div>
      <div className="relative">
        <div className="flex h-3.5 w-full gap-[2px] overflow-hidden rounded-full">
          {segs.map(
            (s, i) =>
              s.days > 0 && (
                <div
                  key={i}
                  className="h-full"
                  style={{ width: `${(s.days / len) * 100}%`, background: s.color }}
                />
              ),
          )}
        </div>
        {/* you-are-here marker */}
        <motion.div
          className="absolute -top-[3px] h-5 w-5 -translate-x-1/2 rounded-full border-[3px] border-white bg-dusk shadow-[0_2px_8px_rgba(109,93,252,0.5)]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.25 }}
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[9px] font-bold text-ink/30">
        <span>Day 1</span>
        <span>Ovulation · day {geo.ovulationDay}</span>
        <span>Day {len}</span>
      </div>
    </div>
  )
}

// ── bits ─────────────────────────────────────────────────────────────────────

function NavBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/80 text-xl font-bold text-ink/60 shadow-card backdrop-blur transition active:scale-90"
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
    <div className="flex flex-col items-center rounded-[1.6rem] border border-white/70 bg-white/70 p-3 text-center shadow-card backdrop-blur-xl">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: tint }}>
        {glyph}
      </div>
      <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wider text-ink/40">{label}</p>
      <p className="font-display text-[15px] font-bold leading-tight text-ink">{value}</p>
      <p className="text-[10px] font-semibold text-ink/40">{sub}</p>
    </div>
  )
}

function Chip({ swatch, label, dashed = false }: { swatch: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/70 py-1 pl-1.5 pr-2.5 text-[10px] font-bold text-ink/55 shadow-card backdrop-blur">
      <span
        className={`h-4 w-4 rounded-md ${dashed ? 'border border-dashed border-rose/60' : ''}`}
        style={{ background: swatch }}
      />
      {label}
    </span>
  )
}

function Drop({ big = false }: { big?: boolean }) {
  const s = big ? 18 : 10
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3c3.5 4.4 6.5 8 6.5 11.5A6.5 6.5 0 1 1 5.5 14.5C5.5 11 8.5 7.4 12 3z"
        fill={big ? '#FF5D8F' : '#fff'}
      />
      {big && <ellipse cx="9.5" cy="14" rx="1.6" ry="2.4" fill="#fff" opacity="0.55" />}
    </svg>
  )
}

function HollowDrop() {
  return (
    <svg width={9} height={9} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3c3.5 4.4 6.5 8 6.5 11.5A6.5 6.5 0 1 1 5.5 14.5C5.5 11 8.5 7.4 12 3z"
        stroke="#FF5D8F"
        strokeWidth="2.5"
        opacity="0.8"
      />
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

function MiniTornado({
  strong = false,
  light = false,
  big = false,
}: {
  strong?: boolean
  light?: boolean
  big?: boolean
}) {
  const c = light ? '#fff' : strong ? '#7E72B0' : '#8f82bd'
  const s = big ? 16 : 10
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5h16M6 9h12M8 13h8M10 17h4M11 21h2"
        stroke={c}
        strokeWidth="2.8"
        strokeLinecap="round"
        opacity={light ? 0.95 : 0.85}
      />
    </svg>
  )
}
