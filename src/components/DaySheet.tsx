import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import { FEELINGS, FEELING_CATEGORIES, isHardDay } from '../lib/feelings'
import { prettyDate, todayISO } from '../lib/date'
import MoodSlider from './MoodSlider'
import type { FlowLevel, ISODate } from '../types'
import { useModel } from '../lib/useModel'
import { forecastFor } from '../lib/cycle'
import { WEATHER_EMOJI, WEATHER_LABEL } from './WeatherScene'

interface Props {
  date: ISODate | null
  onClose: () => void
  onHardDay: (date: ISODate) => void
}

const FLOWS: { id: FlowLevel; label: string }[] = [
  { id: 'spotting', label: 'Spotting' },
  { id: 'light', label: 'Light' },
  { id: 'medium', label: 'Medium' },
  { id: 'heavy', label: 'Heavy' },
]

export default function DaySheet({ date, onClose, onHardDay }: Props) {
  const log = useStore((s) => (date ? s.logs[date] : undefined))
  const upsert = useStore((s) => s.upsertLog)
  const model = useModel()

  const [mood, setMood] = useState(7)
  // Only a slider Toni actually touched (now or on a previous save) is real
  // data. Untouched defaults used to be saved as mood=7 on every save, which
  // taught the model that even her worst days were a 7.
  const [moodTouched, setMoodTouched] = useState(false)
  const [feelings, setFeelings] = useState<string[]>([])
  const [period, setPeriod] = useState(false)
  const [flow, setFlow] = useState<FlowLevel | undefined>()
  const [note, setNote] = useState('')

  useEffect(() => {
    if (date) {
      setMood(log?.mood ?? 7)
      setMoodTouched(log?.moodSet === true || (log?.mood != null && log.mood !== 7))
      setFeelings(log?.feelings ?? [])
      setPeriod(log?.period ?? false)
      setFlow(log?.flow)
      setNote(log?.note ?? '')
    }
  }, [date]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!date) return null

  const fc = model ? forecastFor(model, date) : null
  const toggleFeeling = (id: string) =>
    setFeelings((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  const save = () => {
    const patch: Parameters<typeof upsert>[1] = {
      feelings,
      period,
      flow: period ? flow : undefined,
      note,
    }
    if (moodTouched) {
      patch.mood = mood
      patch.moodSet = true
    }
    upsert(date, patch)
    const hard = isHardDay(feelings, moodTouched ? mood : undefined)
    onClose()
    if (hard && useStore.getState().settings.giraffeEnabled) {
      setTimeout(() => onHardDay(date), 220)
    }
  }

  return (
    <AnimatePresence>
      {date && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92dvh] max-w-md overflow-y-auto rounded-t-5xl bg-white no-scrollbar"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="sticky top-0 z-10 bg-white/90 px-6 pb-3 pt-3 backdrop-blur">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-black/10" />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">{prettyDate(date)}</h2>
                  {fc && (
                    <p className="text-xs font-semibold text-ink/45">
                      Cycle day {fc.cycleDay} · {WEATHER_EMOJI[fc.weather]} {WEATHER_LABEL[fc.weather]} forecast
                    </p>
                  )}
                </div>
                <button onClick={onClose} className="rounded-full bg-black/5 px-3 py-1.5 text-sm font-semibold text-ink/50">
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-6 px-6 pb-32 pt-2">
              {/* Mood slider */}
              <section className="rounded-4xl bg-mist p-5">
                <SectionTitle>How are you feeling today?</SectionTitle>
                <MoodSlider
                  value={mood}
                  onChange={(v) => {
                    setMood(v)
                    setMoodTouched(true)
                  }}
                />
                {!moodTouched && (
                  <p className="mt-2 text-center text-[11px] font-semibold text-ink/35">
                    Slide to set — it only counts once you move it
                  </p>
                )}
              </section>

              {/* Feelings */}
              <section>
                <SectionTitle>Tap what fits</SectionTitle>
                <div className="space-y-4">
                  {FEELING_CATEGORIES.map((cat) => (
                    <div key={cat.id}>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink/35">{cat.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {FEELINGS.filter((f) => f.category === cat.id).map((f) => {
                          const on = feelings.includes(f.id)
                          return (
                            <button
                              key={f.id}
                              onClick={() => toggleFeeling(f.id)}
                              className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-2 text-sm font-semibold transition active:scale-95 ${
                                on
                                  ? f.valence < 0
                                    ? 'border-rose bg-rose/10 text-rose'
                                    : 'border-leaf bg-leaf/10 text-[#2f9e6b]'
                                  : 'border-black/5 bg-white text-ink/70'
                              }`}
                            >
                              <span className="text-lg leading-none">{f.emoji}</span>
                              {f.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Period */}
              <section className="rounded-4xl bg-mist p-5">
                <div className="flex items-center justify-between">
                  <SectionTitle className="mb-0">Period today?</SectionTitle>
                  <button
                    onClick={() => setPeriod((v) => !v)}
                    className={`relative h-8 w-14 rounded-full transition ${period ? 'bg-rose' : 'bg-black/10'}`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
                        period ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
                <AnimatePresence>
                  {period && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 flex gap-2">
                        {FLOWS.map((fl) => (
                          <button
                            key={fl.id}
                            onClick={() => setFlow(fl.id)}
                            className={`flex-1 rounded-2xl border-2 py-2.5 text-xs font-bold transition ${
                              flow === fl.id ? 'border-rose bg-rose/10 text-rose' : 'border-black/5 bg-white text-ink/60'
                            }`}
                          >
                            {fl.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Note */}
              <section>
                <SectionTitle>A note for today</SectionTitle>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Anything you want to remember about today…"
                  className="w-full resize-none rounded-3xl border border-black/5 bg-white px-4 py-3 text-[15px] text-ink shadow-card outline-none focus:ring-2 focus:ring-dusk/30"
                />
              </section>
            </div>

            {/* Save bar */}
            <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-black/5 bg-white/95 px-6 pb-6 pt-3 backdrop-blur safe-bottom">
              <button
                onClick={save}
                className="w-full rounded-full bg-dusk py-4 text-base font-bold text-white shadow-soft transition active:scale-[0.98]"
              >
                {date === todayISO() ? 'Save today' : 'Save'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`mb-3 text-sm font-bold text-ink ${className}`}>{children}</h3>
}
