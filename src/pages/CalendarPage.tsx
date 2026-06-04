import { useMemo, useState } from 'react'
import { addMonths, format, isSameMonth } from 'date-fns'
import { useStore } from '../store'
import { useModel } from '../lib/useModel'
import { forecastFor } from '../lib/cycle'
import { monthGrid, toISO, todayISO } from '../lib/date'
import type { ISODate } from '../types'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/**
 * 1–10 mood → vivid colour for the large centred number.
 * No circle badge — the number itself is the visual.
 */
function moodColor(score: number): string {
  if (score >= 9) return '#1EA87A'
  if (score >= 7) return '#3AB08E'
  if (score >= 5) return '#C98800'
  if (score >= 3) return '#E26040'
  return '#D84070'
}

export default function CalendarPage({ onOpenDay }: { onOpenDay: (d: ISODate) => void }) {
  const logs  = useStore((s) => s.logs)
  const model = useModel()
  const [anchor, setAnchor] = useState(new Date())
  const today = todayISO()

  const days  = useMemo(() => monthGrid(anchor), [anchor])
  const nRows = Math.ceil(days.length / 7)

  if (!model) return null

  /*
   * Row height is computed from the real viewport so the grid is always
   * as tall as possible without cells becoming extreme rectangles.
   *
   * Formula: (dvh - top_chrome - nav) / nRows, clamped 62–92 px.
   *   top_chrome ≈ safe-top(~52px) + header(~52px) + weekday-row(24px) = 128px
   *   nav       ≈ 80px
   *   total chrome ≈ 208px
   */
  const rowH = `clamp(62px, calc((100dvh - 208px) / ${nRows}), 92px)`

  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="safe-top flex items-center justify-between px-5 pb-2 pt-2">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {format(anchor, 'MMMM yyyy')}
        </h1>
        <div className="flex items-center gap-2">
          <NavBtn onClick={() => setAnchor((a) => addMonths(a, -1))}>‹</NavBtn>
          <NavBtn onClick={() => setAnchor((a) => addMonths(a, 1))}>›</NavBtn>
        </div>
      </div>

      {/* ── Weekday labels ─────────────────────────────────────────── */}
      <div className="grid grid-cols-7 px-2.5 pb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-[11px] font-bold tracking-widest text-ink/30">
            {d}
          </div>
        ))}
      </div>

      {/* ── Day grid ───────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-7 gap-1.5 px-2.5"
        style={{
          gridTemplateRows: `repeat(${nRows}, ${rowH})`,
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {days.map((d) => {
          const iso = toISO(d)
          const fc  = forecastFor(model, iso)
          const log = logs[iso]

          const inMonth       = isSameMonth(d, anchor)
          const isToday       = iso === today
          const actualPeriod  = !!log?.period
          const isPast        = iso <= today
          const predicted     = fc.isPredictedPeriod && !isPast && !actualPeriod
          const tornado       = fc.tornadoLevel === 'tornado'
          const watch         = fc.tornadoLevel === 'watch'
          const hasMood       = typeof log?.mood === 'number'
          const isOvulation   = fc.isPredictedOvulation

          /* ── cell background ── */
          let bg     = ''
          let stripe = false
          let ring   = ''

          if (!inMonth) {
            bg = 'transparent'
          } else if (tornado) {
            bg = 'linear-gradient(145deg,#EAE0FB 0%,#CFC0F8 100%)'
          } else if (actualPeriod) {
            bg = 'linear-gradient(145deg,#FFE2ED 0%,#FFB6CE 100%)'
          } else if (predicted) {
            stripe = true
          } else if (isOvulation) {
            bg   = 'linear-gradient(145deg,#FFF5C4 0%,#FFE07A 100%)'
            ring = 'ring-2 ring-[#FFCF55] ring-inset'
          } else if (watch) {
            bg = 'linear-gradient(145deg,#F2EEFE 0%,#E4D9FC 100%)'
          } else {
            bg = 'rgba(255,255,255,0.80)'
          }

          return (
            <button
              key={iso}
              onClick={() => inMonth && onOpenDay(iso)}
              className={`
                relative overflow-hidden rounded-2xl transition
                active:scale-[0.88]
                ${inMonth
                  ? 'shadow-[0_1px_6px_rgba(80,60,180,0.10)]'
                  : 'pointer-events-none opacity-15'}
                ${ring}
                ${stripe ? 'period-stripe' : ''}
              `}
              style={{ background: stripe ? undefined : bg }}
            >
              {/* Date — top-left corner, never mistaken for the score */}
              <span
                className={`absolute left-2 top-1.5 z-10 leading-none ${
                  isToday
                    ? 'flex h-[20px] w-[20px] items-center justify-center rounded-full bg-dusk text-[9px] font-bold text-white'
                    : `text-[11px] font-bold ${tornado ? 'text-[#5b4f86]' : 'text-ink/45'}`
                }`}
              >
                {format(d, 'd')}
              </span>

              {/*
                Mood score — the main visual.
                A bare coloured number centred in the cell.  No bubble, no ring.
                The colour gradient green→amber→rose maps high→mid→low.
              */}
              {hasMood && (
                <span
                  className="absolute inset-0 flex items-center justify-center font-bold leading-none"
                  style={{ fontSize: 28, color: moodColor(log!.mood!) }}
                >
                  {log!.mood}
                </span>
              )}

              {/* Indicator dots — bottom-right, 4–5 px circles */}
              <div className="absolute bottom-1.5 right-1.5 flex items-center gap-[3px]">
                {actualPeriod && (
                  <span className="block h-[5px] w-[5px] rounded-full bg-[#F04880]" />
                )}
                {tornado && (
                  <span className="block h-[5px] w-[5px] rounded-full bg-[#7460B8]" />
                )}
                {watch && !tornado && (
                  <span className="block h-[4px] w-[4px] rounded-full bg-[#A890D0]" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Compact legend ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 pt-3 pb-2">
        <Chip gradient="linear-gradient(90deg,#FFE2ED,#FFB6CE)" label="Period" dot="#F04880" />
        <Chip stripe label="Predicted" />
        <Chip gradient="linear-gradient(90deg,#FFF5C4,#FFE07A)" ring label="Ovulation" />
        <Chip gradient="linear-gradient(90deg,#EAE0FB,#CFC0F8)" label="Tornado" dot="#7460B8" />
        <Chip gradient="linear-gradient(90deg,#F2EEFE,#E4D9FC)" label="Watch" dot="#A890D0" />
      </div>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function NavBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-ink/50 shadow-card active:scale-90"
    >
      {children}
    </button>
  )
}

function Chip({
  gradient,
  stripe,
  ring,
  label,
  dot,
}: {
  gradient?: string
  stripe?: boolean
  ring?: boolean
  label: string
  dot?: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`relative h-4 w-4 shrink-0 rounded-[5px] ${ring ? 'ring-2 ring-[#FFCF55]' : ''} ${stripe ? 'period-stripe' : ''}`}
        style={stripe ? undefined : { background: gradient }}
      >
        {dot && (
          <span
            className="absolute bottom-[2px] right-[2px] h-[4px] w-[4px] rounded-full"
            style={{ background: dot }}
          />
        )}
      </span>
      <span className="text-[10px] font-semibold text-ink/45">{label}</span>
    </div>
  )
}
