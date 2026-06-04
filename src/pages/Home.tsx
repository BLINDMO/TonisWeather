import { motion } from 'framer-motion'
import { useStore } from '../store'
import { useModel } from '../lib/useModel'
import {
  forecastFor,
  forecastWindow,
  daysUntilNextPeriod,
} from '../lib/cycle'
import { explainHormones, HORMONES } from '../lib/hormones'
import { todayISO, weekdayShort, shortDate } from '../lib/date'
import WeatherScene, { SKY, WEATHER_EMOJI, WEATHER_LABEL } from '../components/WeatherScene'
import HormoneChart from '../components/HormoneChart'
import type { ISODate } from '../types'

const PHASE_LABEL: Record<string, string> = {
  menstrual: 'Menstrual',
  follicular: 'Follicular',
  fertile: 'Fertile window',
  ovulation: 'Ovulation',
  'early-luteal': 'Early luteal',
  'late-luteal': 'Late luteal (PMDD window)',
}

export default function Home({ onOpenDay }: { onOpenDay: (d: ISODate) => void }) {
  const profile = useStore((s) => s.profile)
  const showScience = useStore((s) => s.settings.showScience)
  const model = useModel()
  if (!model || !profile) return null

  const today = todayISO()
  const fc = forecastFor(model, today)
  const window = forecastWindow(model, 3, today)
  const untilPeriod = daysUntilNextPeriod(model, today)
  const sky = SKY[fc.weather]
  const explain = explainHormones(fc.hormones, fc.phase)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="mx-auto max-w-md px-4 pb-28">
      {/* header */}
      <div className="safe-top mb-3 flex items-center justify-between px-1 pt-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">{greeting}</p>
          <h1 className="font-display text-2xl font-semibold text-ink">{profile.name}'s Weather</h1>
        </div>
        <div className="text-right text-xs font-semibold text-ink/50">
          {shortDate(today)}
        </div>
      </div>

      {/* Hero weather card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-5xl shadow-soft"
      >
        <div className="absolute inset-0">
          <WeatherScene kind={fc.weather} className="h-full w-full" />
        </div>
        <div
          className="relative px-6 pb-6 pt-7"
          style={{ background: `linear-gradient(180deg, transparent 40%, ${sky.to}ee 100%)` }}
        >
          <div className="flex items-start justify-between">
            <span className="pill bg-white/70 text-ink/70 backdrop-blur">
              Cycle day {fc.cycleDay} · {PHASE_LABEL[fc.phase]}
            </span>
            {fc.tornadoLevel === 'tornado' && (
              <span className="pill animate-pulse bg-storm/90 text-white">🌪️ Tornado warning</span>
            )}
            {fc.tornadoLevel === 'watch' && (
              <span className="pill bg-storm/70 text-white">🌀 Tornado watch</span>
            )}
          </div>

          <div className="mt-24">
            <div className="flex items-end gap-3">
              <span className="text-6xl drop-shadow-sm">{WEATHER_EMOJI[fc.weather]}</span>
              <div className="pb-1">
                <div className="font-display text-3xl font-semibold leading-none text-ink">
                  {fc.headline}
                </div>
                <div className="mt-1 text-sm font-semibold text-ink/60">
                  Outlook {fc.outlook.toFixed(1)}/10 · {WEATHER_LABEL[fc.weather]}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/75">{fc.blurb}</p>
          </div>
        </div>
      </motion.div>

      {/* period countdown + log today */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="card flex flex-col justify-center p-4">
          <p className="text-xs font-semibold text-ink/45">Next period</p>
          <p className="font-display text-2xl font-semibold text-ink">
            {untilPeriod <= 0 ? 'Now' : `${untilPeriod} day${untilPeriod === 1 ? '' : 's'}`}
          </p>
          <p className="text-xs text-ink/40">
            {Math.round(model.confidence * 100)}% forecast confidence
          </p>
        </div>
        <button
          onClick={() => onOpenDay(today)}
          className="flex flex-col items-start justify-center rounded-4xl bg-dusk p-4 text-left shadow-soft transition active:scale-[0.98]"
        >
          <span className="text-2xl">📝</span>
          <p className="mt-1 font-display text-lg font-semibold leading-tight text-white">
            Log how you feel
          </p>
          <p className="text-xs text-white/70">Makes tomorrow smarter</p>
        </button>
      </div>

      {/* 3-day forecast */}
      <SectionLabel>Your next 3 days</SectionLabel>
      <div className="grid grid-cols-3 gap-3">
        {window.map((d, idx) => (
          <button
            key={d.date}
            onClick={() => onOpenDay(d.date)}
            className="relative overflow-hidden rounded-4xl border border-white/60 p-3 text-left shadow-card transition active:scale-[0.97]"
            style={{ background: `linear-gradient(160deg, ${SKY[d.weather].from}, ${SKY[d.weather].to})` }}
          >
            <p className="text-xs font-bold text-ink/60">
              {idx === 0 ? 'Today' : weekdayShort(d.date)}
            </p>
            <div className="my-1 text-3xl">{WEATHER_EMOJI[d.weather]}</div>
            <p className="text-[11px] font-bold leading-tight text-ink/70">{WEATHER_LABEL[d.weather]}</p>
            <p className="text-[10px] text-ink/50">Outlook {d.outlook.toFixed(0)}</p>
            {d.tornadoLevel === 'tornado' && <span className="absolute right-2 top-2 text-sm">🌪️</span>}
            {d.tornadoLevel === 'watch' && <span className="absolute right-2 top-2 text-xs opacity-70">🌀</span>}
          </button>
        ))}
      </div>

      {/* Hormone chart */}
      <SectionLabel>Where your hormones are</SectionLabel>
      <div className="card p-5">
        <HormoneChart geo={model.geo} currentDay={fc.cycleDay} />
      </div>

      {/* Hormone summary */}
      <SectionLabel>What that means for you</SectionLabel>
      <div
        className={`card p-5 ${
          explain.tone === 'tough'
            ? 'border-rose/30'
            : explain.tone === 'good'
              ? 'border-leaf/30'
              : ''
        }`}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">
            {explain.tone === 'good' ? '🌤️' : explain.tone === 'tough' ? '⛈️' : '🌥️'}
          </span>
          <h3 className="font-display text-xl font-semibold text-ink">{explain.title}</h3>
        </div>
        {explain.lines.map((l, i) => (
          <p key={i} className="mb-2 text-[15px] leading-relaxed text-ink/70">
            {l}
          </p>
        ))}

        {showScience && (
          <div className="mt-4 space-y-2.5 border-t border-black/5 pt-4">
            {HORMONES.map((h) => {
              const v = fc.hormones[h.key]
              return (
                <div key={h.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-bold text-ink/70">{h.name}</span>
                    <span className="text-ink/40">{h.role}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-black/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: h.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(v * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="mt-6 px-2 text-center text-xs leading-relaxed text-ink/35">
        Toni's Weather is a supportive tool, not medical advice. If the storms feel
        unsafe, please reach out to your doctor or a crisis line.
      </p>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-7 px-1 text-sm font-bold uppercase tracking-wider text-ink/40">
      {children}
    </h2>
  )
}
