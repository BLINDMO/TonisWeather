import { motion } from 'framer-motion'
import { useStore } from '../store'
import { useModel } from '../lib/useModel'
import { forecastFor, forecastWindow, daysUntilNextPeriod } from '../lib/cycle'
import { explainHormones, HORMONES } from '../lib/hormones'
import { todayISO, weekdayShort, shortDate } from '../lib/date'
import { SKY, WEATHER_LABEL } from '../components/WeatherScene'
import WeatherSky from '../components/WeatherSky'
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
        className="relative overflow-hidden rounded-[2.5rem] shadow-[0_8px_40px_rgba(40,30,100,0.22)]"
      >
        {/* cinematic atmosphere */}
        <WeatherSky kind={fc.weather} className="absolute inset-0" />
        {/* subtle top-edge sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 rounded-t-[2.5rem]"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%)' }}
        />

        <div className="relative flex flex-col items-center px-6 pb-8 pt-5 text-center">
          {/* top chips */}
          <div className="flex w-full items-center justify-between">
            <span
              className={`pill backdrop-blur-md ${
                dark
                  ? 'bg-white/18 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]'
                  : 'bg-white/75 text-ink/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.90)]'
              }`}
            >
              Day {fc.cycleDay} · {PHASE_LABEL[fc.phase]}
            </span>
            {fc.tornadoLevel === 'tornado' ? (
              <span className="pill animate-pulse bg-[#5b5184] text-white shadow-lg">
                <TornadoDot /> Tornado warning
              </span>
            ) : fc.tornadoLevel === 'watch' ? (
              <span className={`pill ${dark ? 'bg-white/22 text-white' : 'bg-[#7b6f9e]/15 text-[#5b5184]'}`}>
                <TornadoDot /> Tornado watch
              </span>
            ) : null}
          </div>

          {/* focal glyph */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-4 drop-shadow-[0_16px_32px_rgba(18,14,46,0.32)]"
          >
            <WeatherGlyph kind={fc.weather} size={148} />
          </motion.div>

          <h2
            className={`mt-3 font-display text-[2.1rem] font-semibold leading-tight ${dark ? 'text-white' : 'text-ink'}`}
            style={{ textShadow: dark ? '0 2px 24px rgba(10,8,30,0.45)' : '0 1px 2px rgba(255,255,255,0.60)' }}
          >
            {fc.headline}
          </h2>
          <div className={`mt-1.5 flex items-center gap-2 text-sm font-semibold ${dark ? 'text-white/75' : 'text-ink/50'}`}>
            <span>{WEATHER_LABEL[fc.weather]}</span>
            <span className="opacity-35">·</span>
            <span>Outlook {fc.outlook.toFixed(1)}</span>
          </div>
          <p className={`mt-3 max-w-[19rem] text-[15px] leading-relaxed ${dark ? 'text-white/82' : 'text-ink/68'}`}>
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
              className="group relative flex flex-col items-center overflow-hidden rounded-[1.75rem] border border-white/40 shadow-[0_4px_20px_rgba(60,50,140,0.15)] transition active:scale-[0.96]"
              style={{ background: `linear-gradient(168deg, ${SKY[d.weather].from} 0%, ${SKY[d.weather].to} 100%)` }}
            >
              {/* grain overlay for premium texture */}
              <div className="grain-layer pointer-events-none absolute inset-0 opacity-[0.07]" />
              {/* glass highlight at top */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 rounded-t-[1.75rem]"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 100%)' }}
              />
              <div className="relative flex w-full flex-col items-center px-2 pt-3 pb-3">
                <p className={`text-[11px] font-bold tracking-wide ${ddark ? 'text-white/90' : 'text-ink/65'}`}>
                  {idx === 0 ? 'Today' : weekdayShort(d.date)}
                </p>
                <div className="my-2 drop-shadow-[0_4px_10px_rgba(20,16,50,0.28)]">
                  <WeatherGlyph kind={d.weather} size={52} />
                </div>
                <p className={`text-[11px] font-bold leading-tight text-center ${ddark ? 'text-white' : 'text-ink/75'}`}>
                  {WEATHER_LABEL[d.weather]}
                </p>
                <div
                  className={`mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    ddark ? 'bg-white/20 text-white/85' : 'bg-black/8 text-ink/55'
                  }`}
                >
                  {d.outlook.toFixed(1)}
                </div>
              </div>
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
      <div className="overflow-hidden rounded-3xl p-4 shadow-[0_4px_24px_rgba(60,50,140,0.12)]"
        style={{ background: 'linear-gradient(160deg, rgba(248,246,255,0.95) 0%, rgba(238,234,255,0.95) 100%)', border: '1px solid rgba(255,255,255,0.75)' }}
      >
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
