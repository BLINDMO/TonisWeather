import { motion } from 'framer-motion'
import { useStore } from '../store'
import { useModel } from '../lib/useModel'
import { forecastFor, forecastWindow, daysUntilNextPeriod } from '../lib/cycle'
import { explainHormones, HORMONES } from '../lib/hormones'
import { todayISO, weekdayShort, shortDate } from '../lib/date'
import { SKY, WEATHER_LABEL } from '../components/WeatherScene'
import WeatherGlyph from '../components/WeatherGlyph'
import HormoneChart from '../components/HormoneChart'
import type { ISODate, WeatherKind } from '../types'

const PHASE_LABEL: Record<string, string> = {
  menstrual: 'Menstrual',
  follicular: 'Follicular',
  fertile: 'Fertile window',
  ovulation: 'Ovulation',
  'early-luteal': 'Early luteal',
  'late-luteal': 'Late luteal',
}

const isDarkSky = (w: WeatherKind) => w === 'storm' || w === 'tornado' || w === 'rain'

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
  const dark = isDarkSky(fc.weather)

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
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink/40">{greeting}</p>
          <h1 className="font-display text-2xl font-semibold text-ink">{profile.name}'s Weather</h1>
        </div>
        <div className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-ink/50 shadow-card">
          {shortDate(today)}
        </div>
      </div>

      {/* ── Hero weather card (centered, premium) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        className="relative overflow-hidden rounded-[2.25rem] shadow-soft"
        style={{ background: `linear-gradient(165deg, ${sky.from} 0%, ${sky.to} 100%)` }}
      >
        {/* ambient depth */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)' }}
        />

        <div className="relative flex flex-col items-center px-6 pb-7 pt-5 text-center">
          {/* top chips */}
          <div className="flex w-full items-center justify-between">
            <span
              className={`pill backdrop-blur ${
                dark ? 'bg-white/20 text-white' : 'bg-white/70 text-ink/70'
              }`}
            >
              Day {fc.cycleDay} · {PHASE_LABEL[fc.phase]}
            </span>
            {fc.tornadoLevel === 'tornado' ? (
              <span className="pill animate-pulse bg-[#5b5184] text-white shadow">
                <TornadoDot /> Tornado warning
              </span>
            ) : fc.tornadoLevel === 'watch' ? (
              <span className={`pill ${dark ? 'bg-white/25 text-white' : 'bg-[#7b6f9e]/15 text-[#5b5184]'}`}>
                <TornadoDot /> Tornado watch
              </span>
            ) : null}
          </div>

          {/* focal glyph */}
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-3"
          >
            <WeatherGlyph kind={fc.weather} size={140} />
          </motion.div>

          <h2 className={`mt-2 font-display text-[2rem] font-semibold leading-tight ${dark ? 'text-white' : 'text-ink'}`}>
            {fc.headline}
          </h2>
          <div className={`mt-1 flex items-center gap-2 text-sm font-bold ${dark ? 'text-white/80' : 'text-ink/55'}`}>
            <span>{WEATHER_LABEL[fc.weather]}</span>
            <span className="opacity-40">·</span>
            <span>Outlook {fc.outlook.toFixed(1)}</span>
          </div>
          <p className={`mt-3 max-w-[19rem] text-[15px] leading-relaxed ${dark ? 'text-white/85' : 'text-ink/70'}`}>
            {fc.blurb}
          </p>
        </div>
      </motion.div>

      {/* period countdown + log today */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="card flex flex-col justify-center p-4">
          <p className="text-xs font-bold text-ink/45">Next period</p>
          <p className="font-display text-2xl font-semibold text-ink">
            {untilPeriod <= 0 ? 'Now' : `${untilPeriod} day${untilPeriod === 1 ? '' : 's'}`}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
              <div className="h-full rounded-full bg-leaf" style={{ width: `${Math.round(model.confidence * 100)}%` }} />
            </div>
            <span className="text-[10px] font-bold text-ink/40">{Math.round(model.confidence * 100)}%</span>
          </div>
        </div>
        <button
          onClick={() => onOpenDay(today)}
          className="relative flex flex-col items-start justify-center overflow-hidden rounded-4xl p-4 text-left shadow-soft transition active:scale-[0.98]"
          style={{ background: 'linear-gradient(150deg, #7B6CF6, #6d5dfc 60%, #8a5fe0)' }}
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-lg" />
          <HeartIcon />
          <p className="mt-1.5 font-display text-lg font-semibold leading-tight text-white">Log how you feel</p>
          <p className="text-xs text-white/70">Makes tomorrow smarter</p>
        </button>
      </div>

      {/* 3-day forecast */}
      <SectionLabel>Your next 3 days</SectionLabel>
      <div className="grid grid-cols-3 gap-3">
        {window.map((d, idx) => {
          const ddark = isDarkSky(d.weather)
          return (
            <button
              key={d.date}
              onClick={() => onOpenDay(d.date)}
              className="relative flex flex-col items-center overflow-hidden rounded-[1.6rem] border border-white/50 p-3 shadow-card transition active:scale-[0.97]"
              style={{ background: `linear-gradient(160deg, ${SKY[d.weather].from}, ${SKY[d.weather].to})` }}
            >
              <p className={`text-xs font-bold ${ddark ? 'text-white/90' : 'text-ink/65'}`}>
                {idx === 0 ? 'Today' : weekdayShort(d.date)}
              </p>
              <div className="my-1.5">
                <WeatherGlyph kind={d.weather} size={48} />
              </div>
              <p className={`text-[11px] font-bold leading-tight ${ddark ? 'text-white' : 'text-ink/70'}`}>
                {WEATHER_LABEL[d.weather]}
              </p>
              <p className={`text-[10px] ${ddark ? 'text-white/70' : 'text-ink/45'}`}>Outlook {d.outlook.toFixed(0)}</p>
              {d.tornadoLevel !== 'none' && (
                <span className="absolute right-2 top-2">
                  <TornadoDot solid={d.tornadoLevel === 'tornado'} />
                </span>
              )}
            </button>
          )
        })}
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
          explain.tone === 'tough' ? 'border-rose/30' : explain.tone === 'good' ? 'border-leaf/30' : ''
        }`}
      >
        <div className="mb-3 flex items-center gap-3">
          <WeatherGlyph
            kind={explain.tone === 'good' ? 'partly' : explain.tone === 'tough' ? 'storm' : 'cloudy'}
            size={40}
            animate={false}
          />
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
        Toni's Weather is a supportive tool, not medical advice. If the storms feel unsafe, please
        reach out to your doctor or a crisis line.
      </p>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-7 px-1 text-sm font-bold uppercase tracking-[0.14em] text-ink/40">{children}</h2>
  )
}

function HeartIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20.5S3.8 15.4 3.8 9.6C3.8 6.9 5.9 5 8.3 5c1.6 0 2.9.9 3.7 2 .8-1.1 2.1-2 3.7-2 2.4 0 4.5 1.9 4.5 4.6 0 5.8-8.2 10.9-8.2 10.9z"
        fill="#fff"
      />
    </svg>
  )
}

function TornadoDot({ solid = false }: { solid?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline-block">
      <path
        d="M4 5h16M6 9h12M8 13h8M10 17h4M11 21h2"
        stroke={solid ? '#fff' : 'currentColor'}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity={solid ? 1 : 0.85}
      />
    </svg>
  )
}
