import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import { todayISO, addDaysISO, daysBetween } from '../lib/date'
import type { OnboardingProfile, PeriodSeed } from '../types'
import Giraffe from '../components/Giraffe'
import { LogoMark } from '../components/Logo'

const DEFAULTS: OnboardingProfile = {
  name: 'Toni',
  avgCycleLength: 28,
  avgPeriodLength: 5,
  lutealLength: 14,
  lastPeriodStart: addDaysISO(todayISO(), -14),
  regularity: 'somewhat',
  pmddSeverity: 'moderate',
  household: ['Jon', 'Gavin', 'Maelie', 'Knox'],
  birthYear: undefined,
  completedAt: 0,
}

const steps = [
  'welcome',
  'name',
  'period',
  'cycle',
  'regularity',
  'pmdd',
  'history',
  'household',
  'done',
] as const
type Step = (typeof steps)[number]

interface HistItem extends PeriodSeed {
  id: string
}

export default function Onboarding() {
  const complete = useStore((s) => s.completeOnboarding)
  const [i, setI] = useState(0)
  const [p, setP] = useState<OnboardingProfile>(DEFAULTS)
  const [periodEnd, setPeriodEnd] = useState<string>('')
  const [ongoing, setOngoing] = useState(false)
  const [history, setHistory] = useState<HistItem[]>([])
  const step: Step = steps[i]

  const next = () => setI((v) => Math.min(steps.length - 1, v + 1))
  const back = () => setI((v) => Math.max(0, v - 1))

  const recentLength = (() => {
    if (ongoing) return clamp(daysBetween(todayISO(), p.lastPeriodStart) + 1, 1, 12)
    if (periodEnd) return clamp(daysBetween(periodEnd, p.lastPeriodStart) + 1, 1, 12)
    return p.avgPeriodLength
  })()

  const finish = () => {
    const profile: OnboardingProfile = { ...p, avgPeriodLength: recentLength }
    const seeds: PeriodSeed[] = [
      { start: p.lastPeriodStart, length: recentLength },
      ...history.map((h) => ({ start: h.start, length: h.length })),
    ]
    complete(profile, seeds)
  }

  const progress = i / (steps.length - 1)

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-gradient-to-b from-mist via-white to-[#eef0ff]">
      <div className="pointer-events-none absolute inset-0 aurora opacity-40" />

      <div className="safe-top px-6">
        <div className="mx-auto mt-2 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-black/5">
          <motion.div
            className="h-full rounded-full bg-dusk"
            animate={{ width: `${Math.max(6, progress * 100)}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <div className="relative flex flex-1 flex-col px-6 pb-8">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
            >
              {step === 'welcome' && <Welcome />}
              {step === 'name' && <NameStep p={p} setP={setP} />}
              {step === 'period' && (
                <PeriodStep
                  p={p}
                  setP={setP}
                  periodEnd={periodEnd}
                  setPeriodEnd={setPeriodEnd}
                  ongoing={ongoing}
                  setOngoing={setOngoing}
                  recentLength={recentLength}
                />
              )}
              {step === 'cycle' && <CycleStep p={p} setP={setP} />}
              {step === 'regularity' && <RegularityStep p={p} setP={setP} />}
              {step === 'pmdd' && <PmddStep p={p} setP={setP} />}
              {step === 'history' && (
                <HistoryStep p={p} history={history} setHistory={setHistory} />
              )}
              {step === 'household' && <HouseholdStep p={p} setP={setP} />}
              {step === 'done' && <DoneStep name={p.name} historyCount={history.length} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mx-auto flex w-full max-w-md items-center gap-3 safe-bottom">
          {i > 0 && step !== 'done' && (
            <button
              onClick={back}
              className="rounded-full px-5 py-4 text-sm font-semibold text-ink/50 transition active:scale-95"
            >
              Back
            </button>
          )}
          <button
            onClick={step === 'done' ? finish : next}
            className="flex-1 rounded-full bg-dusk py-4 text-base font-bold text-white shadow-soft transition active:scale-[0.98]"
          >
            {step === 'welcome'
              ? "Let's begin"
              : step === 'done'
                ? 'Open my forecast'
                : step === 'history'
                  ? history.length
                    ? `Continue with ${history.length + 1} periods`
                    : 'Continue'
                  : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

// ── step content ────────────────────────────────────────────────────────────

function Heading({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="mb-7">
      {kicker && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-dusk">{kicker}</p>}
      <h1 className="font-display text-3xl font-semibold leading-tight text-ink">{title}</h1>
      {sub && <p className="mt-3 text-[15px] leading-relaxed text-ink/60">{sub}</p>}
    </div>
  )
}

function Welcome() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex justify-center">
        <LogoMark size={140} />
      </div>
      <h1 className="font-display text-4xl font-semibold text-ink">Toni's Weather</h1>
      <p className="mx-auto mt-4 max-w-xs text-[15px] leading-relaxed text-ink/60">
        A gentle, science-grounded forecast for your body and your mood — where the weather is a
        metaphor for how you'll feel. Built just for you, with extra care for the tornado days.
      </p>
      <p className="mt-5 text-xs text-ink/40">Hi, I'm Gigi. I'll be here on the hard days. 🦒</p>
    </div>
  )
}

function NameStep({ p, setP }: StepProps) {
  return (
    <div>
      <Heading kicker="Step 1" title="What should I call you?" />
      <input
        value={p.name}
        onChange={(e) => setP({ ...p, name: e.target.value })}
        className="w-full rounded-3xl border border-black/5 bg-white px-5 py-4 text-lg font-semibold text-ink shadow-card outline-none focus:ring-2 focus:ring-dusk/40"
        placeholder="Your name"
      />
      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold text-ink/60">Birth year (optional)</label>
        <input
          inputMode="numeric"
          value={p.birthYear ?? ''}
          onChange={(e) => setP({ ...p, birthYear: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full rounded-3xl border border-black/5 bg-white px-5 py-4 text-lg font-semibold text-ink shadow-card outline-none focus:ring-2 focus:ring-dusk/40"
          placeholder="e.g. 1992"
        />
      </div>
    </div>
  )
}

function PeriodStep({
  p,
  setP,
  periodEnd,
  setPeriodEnd,
  ongoing,
  setOngoing,
  recentLength,
}: StepProps & {
  periodEnd: string
  setPeriodEnd: (s: string) => void
  ongoing: boolean
  setOngoing: (b: boolean) => void
  recentLength: number
}) {
  return (
    <div>
      <Heading
        kicker="Step 2"
        title="Your most recent period"
        sub="The start anchors every prediction — and knowing when it ended tells me how long your bleeding lasts."
      />
      <label className="mb-2 block text-sm font-semibold text-ink/60">When did it start?</label>
      <input
        type="date"
        max={todayISO()}
        value={p.lastPeriodStart}
        onChange={(e) => setP({ ...p, lastPeriodStart: e.target.value })}
        className="mb-5 w-full rounded-3xl border border-black/5 bg-white px-5 py-4 text-lg font-semibold text-ink shadow-card outline-none focus:ring-2 focus:ring-dusk/40"
      />

      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-ink/60">When did it end?</label>
        <button
          onClick={() => {
            setOngoing(!ongoing)
            if (!ongoing) setPeriodEnd('')
          }}
          className={`pill border-2 transition ${
            ongoing ? 'border-rose bg-rose/10 text-rose' : 'border-black/10 text-ink/50'
          }`}
        >
          {ongoing ? '✓ Still on it' : 'Still on it?'}
        </button>
      </div>
      <input
        type="date"
        disabled={ongoing}
        min={p.lastPeriodStart}
        max={todayISO()}
        value={periodEnd}
        onChange={(e) => setPeriodEnd(e.target.value)}
        className="w-full rounded-3xl border border-black/5 bg-white px-5 py-4 text-lg font-semibold text-ink shadow-card outline-none focus:ring-2 focus:ring-dusk/40 disabled:opacity-40"
      />
      <p className="mt-2 text-right text-xs font-semibold text-ink/40">
        {ongoing
          ? `Day ${recentLength} and counting`
          : periodEnd
            ? `That's a ${recentLength}-day period`
            : 'Pick an end date, or tap “Still on it”'}
      </p>
    </div>
  )
}

function Stepper({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  suffix: string
  onChange: (v: number) => void
}) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink/70">{label}</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onChange(Math.max(min, value - 1))}
            className="h-9 w-9 rounded-full bg-mist text-xl font-bold text-dusk active:scale-90"
          >
            −
          </button>
          <span className="w-16 text-center text-2xl font-bold text-ink">{value}</span>
          <button
            onClick={() => onChange(Math.min(max, value + 1))}
            className="h-9 w-9 rounded-full bg-mist text-xl font-bold text-dusk active:scale-90"
          >
            +
          </button>
        </div>
      </div>
      <p className="mt-1 text-right text-xs text-ink/40">{suffix}</p>
    </div>
  )
}

function CycleStep({ p, setP }: StepProps) {
  return (
    <div>
      <Heading
        kicker="Step 3"
        title="Your typical cycle length"
        sub="A best guess is perfect — the app learns your real number over time, especially if you add history next."
      />
      <Stepper
        label="Cycle length"
        value={p.avgCycleLength}
        min={21}
        max={40}
        suffix="days from one period to the next"
        onChange={(v) => setP({ ...p, avgCycleLength: v })}
      />
    </div>
  )
}

const REGULARITY: { id: OnboardingProfile['regularity']; label: string; sub: string }[] = [
  { id: 'very', label: 'Very regular', sub: 'Like clockwork, within a day or two' },
  { id: 'somewhat', label: 'Somewhat regular', sub: 'Usually predictable, sometimes off' },
  { id: 'irregular', label: 'Irregular', sub: 'Varies a lot month to month' },
  { id: 'unknown', label: 'Not sure yet', sub: 'Still figuring it out' },
]

function RegularityStep({ p, setP }: StepProps) {
  return (
    <div>
      <Heading kicker="Step 4" title="How regular are your cycles?" sub="This sets how confident my forecasts start out." />
      <div className="space-y-3">
        {REGULARITY.map((r) => (
          <ChoiceCard
            key={r.id}
            active={p.regularity === r.id}
            label={r.label}
            sub={r.sub}
            onClick={() => setP({ ...p, regularity: r.id })}
          />
        ))}
      </div>
    </div>
  )
}

const PMDD: { id: OnboardingProfile['pmddSeverity']; label: string; sub: string; emoji: string }[] = [
  { id: 'mild', label: 'Mild', sub: 'Some PMS, manageable mood shifts', emoji: '🌦️' },
  { id: 'moderate', label: 'Moderate', sub: 'Clear, disruptive premenstrual lows', emoji: '⛈️' },
  { id: 'severe', label: 'Severe', sub: 'Intense, out-of-control tornado days', emoji: '🌪️' },
]

function PmddStep({ p, setP }: StepProps) {
  return (
    <div>
      <Heading
        kicker="Step 5"
        title="How strong are the storms?"
        sub="PMDD lives in the days before your period, when estrogen and progesterone fall. This tunes how I flag your Tornado Watch days."
      />
      <div className="space-y-3">
        {PMDD.map((r) => (
          <ChoiceCard
            key={r.id}
            active={p.pmddSeverity === r.id}
            label={`${r.emoji}  ${r.label}`}
            sub={r.sub}
            onClick={() => setP({ ...p, pmddSeverity: r.id })}
          />
        ))}
      </div>
    </div>
  )
}

function HistoryStep({
  p,
  history,
  setHistory,
}: {
  p: OnboardingProfile
  history: HistItem[]
  setHistory: (h: HistItem[]) => void
}) {
  const quickFill = () => {
    const list: HistItem[] = []
    for (let k = 1; k <= 11; k++) {
      list.push({
        id: crypto.randomUUID(),
        start: addDaysISO(p.lastPeriodStart, -k * p.avgCycleLength),
        length: p.avgPeriodLength,
      })
    }
    setHistory(list)
  }
  const addManual = () =>
    setHistory([
      ...history,
      {
        id: crypto.randomUUID(),
        start: addDaysISO(
          history.length ? history[history.length - 1].start : p.lastPeriodStart,
          -p.avgCycleLength,
        ),
        length: p.avgPeriodLength,
      },
    ])
  const update = (id: string, patch: Partial<HistItem>) =>
    setHistory(history.map((h) => (h.id === id ? { ...h, ...patch } : h)))
  const remove = (id: string) => setHistory(history.filter((h) => h.id !== id))

  return (
    <div>
      <Heading
        kicker="Step 6 · optional"
        title="Add your period history"
        sub="Totally optional — but if you add the last several months, I can immediately predict your cycles, ovulation and tornado days far more accurately."
      />

      {history.length === 0 ? (
        <div className="space-y-3">
          <button
            onClick={quickFill}
            className="w-full rounded-3xl bg-dusk py-4 text-base font-bold text-white shadow-soft active:scale-[0.98]"
          >
            ✨ Quick-fill my last 12 months
          </button>
          <button
            onClick={addManual}
            className="w-full rounded-3xl border-2 border-dusk/20 bg-white py-4 text-base font-bold text-dusk active:scale-[0.98]"
          >
            + Add periods one by one
          </button>
          <p className="px-2 pt-1 text-center text-xs text-ink/40">
            Quick-fill estimates past periods from your cycle length. You can fix any date — just tap it.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-ink/60">
              {history.length} earlier period{history.length === 1 ? '' : 's'}
            </span>
            <button onClick={() => setHistory([])} className="text-xs font-semibold text-rose/70">
              Clear all
            </button>
          </div>
          <div className="max-h-[42dvh] space-y-2 overflow-y-auto no-scrollbar pr-0.5">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-2 rounded-2xl border border-black/5 bg-white p-2.5 shadow-card">
                <span className="text-base">🩸</span>
                <input
                  type="date"
                  max={todayISO()}
                  value={h.start}
                  onChange={(e) => update(h.id, { start: e.target.value })}
                  className="min-w-0 flex-1 rounded-xl bg-mist px-2 py-1.5 text-sm font-semibold text-ink outline-none"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => update(h.id, { length: clamp(h.length - 1, 1, 12) })}
                    className="h-7 w-7 rounded-full bg-mist text-sm font-bold text-dusk active:scale-90"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-ink">{h.length}d</span>
                  <button
                    onClick={() => update(h.id, { length: clamp(h.length + 1, 1, 12) })}
                    className="h-7 w-7 rounded-full bg-mist text-sm font-bold text-dusk active:scale-90"
                  >
                    +
                  </button>
                </div>
                <button onClick={() => remove(h.id)} className="px-1 text-ink/30">✕</button>
              </div>
            ))}
          </div>
          <button onClick={addManual} className="mt-3 w-full rounded-2xl border-2 border-dashed border-dusk/25 py-3 text-sm font-bold text-dusk active:scale-[0.98]">
            + Add another
          </button>
        </div>
      )}
    </div>
  )
}

function HouseholdStep({ p, setP }: StepProps) {
  const [val, setVal] = useState('')
  const add = () => {
    const name = val.trim()
    if (name && !p.household.includes(name)) setP({ ...p, household: [...p.household, name] })
    setVal('')
  }
  return (
    <div>
      <Heading
        kicker="Step 7"
        title="Who's in your corner?"
        sub="On hard days, the Emotion Workshop will gently bring these people to mind. Add everyone in your household."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {p.household.map((h) => (
          <span key={h} className="pill bg-rose/15 text-rose">
            {h}
            <button
              onClick={() => setP({ ...p, household: p.household.filter((x) => x !== h) })}
              className="ml-1 text-rose/70"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add a name"
          className="flex-1 rounded-3xl border border-black/5 bg-white px-5 py-3.5 font-semibold text-ink shadow-card outline-none focus:ring-2 focus:ring-dusk/40"
        />
        <button onClick={add} className="rounded-3xl bg-dusk px-6 font-bold text-white active:scale-95">
          Add
        </button>
      </div>
    </div>
  )
}

function DoneStep({ name, historyCount }: { name: string; historyCount: number }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex justify-center">
        <Giraffe size={140} />
      </div>
      <h1 className="font-display text-3xl font-semibold text-ink">You're all set, {name || 'friend'} 💛</h1>
      <p className="mx-auto mt-4 max-w-xs text-[15px] leading-relaxed text-ink/60">
        {historyCount > 0
          ? `I've learned from ${historyCount + 1} of your periods, so your forecast is already personalized. `
          : 'Your forecast is ready. '}
        The more you log how you feel, the smarter it gets — learning exactly which days tend to be
        sunny and which bring the storms.
      </p>
    </div>
  )
}

function ChoiceCard({
  active,
  label,
  sub,
  onClick,
}: {
  active: boolean
  label: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-3xl border-2 p-4 text-left transition active:scale-[0.98] ${
        active ? 'border-dusk bg-dusk/5 shadow-soft' : 'border-black/5 bg-white shadow-card'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-ink">{label}</span>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs ${
            active ? 'border-dusk bg-dusk text-white' : 'border-black/15 text-transparent'
          }`}
        >
          ✓
        </span>
      </div>
      <p className="mt-1 text-sm text-ink/55">{sub}</p>
    </button>
  )
}

interface StepProps {
  p: OnboardingProfile
  setP: (p: OnboardingProfile) => void
}
