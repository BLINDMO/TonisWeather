import type {
  DayLog,
  ISODate,
  OnboardingProfile,
  DayForecast,
  WeatherKind,
  CyclePhase,
} from '../types'
import {
  cycleGeometry,
  hormonesForCycleDay,
  phaseForCycleDay,
  type CycleGeometry,
} from './hormones'
import { daysBetween, addDaysISO, todayISO } from './date'

// ─────────────────────────────────────────────────────────────────────────────
// The adaptive engine.
//
// It starts from what Toni told us during onboarding, then continuously
// *re-learns* from what actually happened:
//   • Real period start dates refine her true cycle length + anchor.
//   • Her 1–10 mood logs, indexed by cycle day, reveal which days are
//     historically hard for HER specifically (not just the textbook).
// Predictions = textbook hormone science  ⊕  her personal history.
// ─────────────────────────────────────────────────────────────────────────────

export interface CycleModel {
  anchorStart: ISODate
  geo: CycleGeometry
  severity: OnboardingProfile['pmddSeverity']
  /** avg mood per 1-indexed cycle day (index 0 unused), or null if too few samples. */
  historicalMood: (number | null)[]
  /** sample count per cycle day. */
  historySamples: number[]
  /** cycle days flagged as historically low for Toni. */
  historicalLowDays: Set<number>
  cyclesDetected: number
  confidence: number
}

/** Find the first day of each distinct period from the logs. */
export function detectPeriodStarts(logs: Record<ISODate, DayLog>): ISODate[] {
  const periodDays = Object.values(logs)
    .filter((l) => l.period)
    .map((l) => l.date)
    .sort()
  const starts: ISODate[] = []
  for (const d of periodDays) {
    const prev = addDaysISO(d, -1)
    if (!logs[prev]?.period) starts.push(d)
  }
  return starts
}

/** Weighted-average gap between consecutive period starts (recent cycles count more). */
function estimateCycleLength(starts: ISODate[], fallback: number): number {
  if (starts.length < 2) return fallback
  const gaps: number[] = []
  for (let i = 1; i < starts.length; i++) {
    const g = daysBetween(starts[i], starts[i - 1])
    if (g >= 18 && g <= 45) gaps.push(g) // ignore implausible gaps
  }
  if (!gaps.length) return fallback
  // recency weighting: newest gap weight = n, oldest = 1
  let wsum = 0
  let weighted = 0
  gaps.forEach((g, i) => {
    const w = i + 1
    weighted += g * w
    wsum += w
  })
  const est = weighted / wsum
  return Math.round(Math.min(40, Math.max(21, est)))
}

function estimatePeriodLength(
  logs: Record<ISODate, DayLog>,
  starts: ISODate[],
  fallback: number,
): number {
  if (!starts.length) return fallback
  const lengths: number[] = []
  for (const start of starts) {
    let len = 0
    let cur = start
    while (logs[cur]?.period && len < 12) {
      len++
      cur = addDaysISO(cur, 1)
    }
    if (len > 0) lengths.push(len)
  }
  if (!lengths.length) return fallback
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
  return Math.round(Math.min(9, Math.max(2, avg)))
}

/** 1-indexed cycle day for a date given a known period-start anchor + length. */
export function cycleDayFor(date: ISODate, anchorStart: ISODate, cycleLength: number): number {
  const diff = daysBetween(date, anchorStart)
  const m = ((diff % cycleLength) + cycleLength) % cycleLength
  return m + 1
}

export function buildModel(
  profile: OnboardingProfile,
  logs: Record<ISODate, DayLog>,
): CycleModel {
  const starts = detectPeriodStarts(logs)
  const cycleLength = estimateCycleLength(starts, profile.avgCycleLength)
  const periodLength = estimatePeriodLength(logs, starts, profile.avgPeriodLength)
  const lutealLength = Math.min(16, Math.max(10, profile.lutealLength))

  // Anchor on the most recent real period start if we have one, else onboarding.
  const anchorStart =
    starts.length > 0 ? starts[starts.length - 1] : profile.lastPeriodStart

  const geo = cycleGeometry(cycleLength, lutealLength, periodLength)

  // ── Learn historical mood by cycle day ──────────────────────────────────
  const sums = new Array(cycleLength + 1).fill(0)
  const counts = new Array(cycleLength + 1).fill(0)
  for (const log of Object.values(logs)) {
    if (typeof log.mood !== 'number') continue
    const cd = cycleDayFor(log.date, anchorStart, cycleLength)
    sums[cd] += log.mood
    counts[cd] += 1
  }
  const historicalMood: (number | null)[] = new Array(cycleLength + 1).fill(null)
  const historicalLowDays = new Set<number>()
  for (let cd = 1; cd <= cycleLength; cd++) {
    if (counts[cd] >= 1) {
      const avg = sums[cd] / counts[cd]
      historicalMood[cd] = avg
      // "historically low" = at least 2 samples averaging a rough day.
      if (counts[cd] >= 2 && avg <= 4.2) historicalLowDays.add(cd)
    }
  }

  const cyclesDetected = Math.max(0, starts.length - 1)
  const moodLogs = Object.values(logs).filter((l) => typeof l.mood === 'number').length
  const regularityBonus =
    profile.regularity === 'very'
      ? 0.25
      : profile.regularity === 'somewhat'
        ? 0.15
        : 0.05
  const confidence = Math.min(
    1,
    0.25 + cyclesDetected * 0.18 + Math.min(0.3, moodLogs * 0.015) + regularityBonus,
  )

  return {
    anchorStart,
    geo,
    severity: profile.pmddSeverity,
    historicalMood,
    historySamples: counts,
    historicalLowDays,
    cyclesDetected,
    confidence,
  }
}

// ── Per-day forecast ────────────────────────────────────────────────────────

const BASE_OUTLOOK: Record<CyclePhase, number> = {
  menstrual: 6.0,
  follicular: 7.6,
  fertile: 8.4,
  ovulation: 9.0,
  'early-luteal': 6.6,
  'late-luteal': 3.6,
}

function severityDrop(sev: CycleModel['severity']): number {
  return sev === 'severe' ? 1.4 : sev === 'moderate' ? 0.8 : 0.3
}

export function forecastFor(model: CycleModel, date: ISODate): DayForecast {
  const { geo, anchorStart } = model
  const cycleDay = cycleDayFor(date, anchorStart, geo.cycleLength)
  const phase = phaseForCycleDay(cycleDay, geo)
  const hormones = hormonesForCycleDay(cycleDay, geo)

  // Base outlook from phase, with PMDD severity deepening the late-luteal dip.
  let base = BASE_OUTLOOK[phase]
  if (phase === 'late-luteal') base -= severityDrop(model.severity)

  // Blend in what actually happened on this cycle day historically.
  const hist = model.historicalMood[cycleDay]
  const samples = model.historySamples[cycleDay] ?? 0
  let outlook = base
  if (hist != null) {
    const w = Math.min(0.6, 0.25 + samples * 0.12) // trust history more with more samples
    outlook = base * (1 - w) + hist * w
  }
  outlook = Math.min(10, Math.max(1, Math.round(outlook * 10) / 10))

  const historicalLow = model.historicalLowDays.has(cycleDay)

  // ── Tornado calibration ───────────────────────────────────────────────────
  // Three WATCH windows — known periods of hormonal flux where the nervous
  // system is more vulnerable to rapid signal change, regardless of severity:
  //
  //  1. Around ovulation (±1 day): estrogen peak → brief crash can cause
  //     sensitivity spikes even on an otherwise bright day.
  //  2. Pre-period (last 3 days): steep progesterone + estrogen withdrawal
  //     disrupts the GABA / serotonin axis — the core PMDD trigger window.
  //  3. Post-period (first 2 days of follicular): estrogen is rising from its
  //     nadir but serotonin transporter upregulation lags ~24–48 h. The signal
  //     is still levelling; unexpected fluctuations are more likely here.
  //
  // Watches are advisory — they do NOT change the weather reading. A day only
  // escalates to a full TORNADO once her own mood history confirms a genuine
  // crash on that specific cycle day. Real tornadoes stay rare.
  const hist2 = model.historicalMood[cycleDay]
  const ovWatch        = cycleDay >= geo.ovulationDay - 1 && cycleDay <= geo.ovulationDay + 1
  const premenWatch    = cycleDay >= geo.cycleLength - 2      // last 3 days of cycle
  const postPeriodWatch = phase === 'follicular' && cycleDay <= geo.periodLength + 2

  let tornadoLevel: DayForecast['tornadoLevel'] = 'none'
  if (ovWatch || premenWatch || postPeriodWatch) tornadoLevel = 'watch'
  // Mood history escalates to tornado: ≥2 samples on this cycle day averaging ≤4.2,
  // AND the recorded average itself was a genuine crash (≤3.2).
  if (historicalLow && hist2 != null && hist2 <= 3.2) tornadoLevel = 'tornado'
  const tornado = tornadoLevel === 'tornado'

  const isPredictedPeriod  = cycleDay <= geo.periodLength
  const isPredictedOvulation = cycleDay === geo.ovulationDay
  const isFertile          = cycleDay >= geo.ovulationDay - 5 && cycleDay <= geo.ovulationDay

  // Weather reflects her hormones naturally; a WATCH is an overlay advisory and
  // does NOT turn a bright ovulation day into a storm. Only a true tornado does.
  const weather = weatherFor(outlook, phase, tornadoLevel)
  let { headline, blurb } = describeWeather(weather, phase)
  if (tornadoLevel === 'tornado') {
    headline = 'Tornado warning'
  } else if (tornadoLevel === 'watch') {
    if (premenWatch) {
      headline = 'Tornado watch'
      blurb =
        'Estrogen and progesterone are descending toward their lowest point of the cycle — the steepest part of the drop. How sharply this affects mood varies day to day; it is the rate of change in the hormonal signal, not just the level, that the nervous system responds to.'
    } else if (postPeriodWatch) {
      headline = 'Tornado watch'
      blurb =
        'Hormones are levelling out after their sharp fall — and that recalibration window can produce more fluctuation than expected. If the weather starts to build today, act on it early rather than waiting to see.'
    } else {
      // ovWatch
      blurb =
        'Estrogen peaks around ovulation, which can also bring a wave of sensitivity, anxiety or irritability for you. The skies look bright — just a gentle heads-up to be kind to yourself today.'
    }
  }

  return {
    date,
    cycleDay,
    phase,
    hormones,
    weather,
    outlook,
    tornadoLevel,
    tornado,
    historicalLow,
    isPredictedPeriod,
    isPredictedOvulation,
    isFertile,
    confidence: model.confidence,
    headline,
    blurb,
  }
}

export function weatherFor(
  outlook: number,
  phase: CyclePhase,
  tornadoLevel: DayForecast['tornadoLevel'],
): WeatherKind {
  if (tornadoLevel === 'tornado') return 'tornado'
  if (outlook <= 3) return 'storm'
  if (outlook <= 4.5) return 'rain'
  if (phase === 'menstrual' && outlook <= 6.2) return 'drizzle'
  if (outlook <= 6) return 'cloudy'
  if (outlook <= 7.4) return 'partly'
  if ((phase === 'ovulation' || phase === 'fertile') && outlook >= 8.4) return 'bright'
  if (outlook <= 8.6) return 'sunny'
  return 'bright'
}

export function describeWeather(
  w: WeatherKind,
  phase: CyclePhase,
): { headline: string; blurb: string } {
  switch (w) {
    case 'bright':
      return {
        headline: 'Brilliant & clear',
        blurb: 'Peak sunshine. Estrogen is high — ride this energy and do the things that matter to you.',
      }
    case 'sunny':
      return {
        headline: 'Sunny',
        blurb: 'Bright, capable energy. A great day to connect, create, or tackle something big.',
      }
    case 'partly':
      return {
        headline: 'Partly sunny',
        blurb: 'Mostly steady with a few passing clouds. Keep it gentle and you will feel good.',
      }
    case 'cloudy':
      return {
        headline: 'Overcast',
        blurb: 'A softer, slower day. Lower expectations a little and add comfort where you can.',
      }
    case 'drizzle':
      return {
        headline: 'Light rain, clearing',
        blurb: 'Your period is doing its reset. Rest is productive right now — be tender with yourself.',
      }
    case 'rain':
      return {
        headline: 'Rainy',
        blurb: 'Heaviness is likely. None of this is a character flaw — it is chemistry. Small kindnesses help.',
      }
    case 'storm':
      return {
        headline: 'Stormy',
        blurb: 'Hormones are pulling hard today. Try to protect your energy and lean on your tools.',
      }
    case 'tornado':
      return {
        headline: 'Tornado watch',
        blurb:
          phase === 'late-luteal'
            ? 'Estrogen and progesterone are withdrawing — the classic PMDD trigger. Feelings may feel huge and not-yours. This is temporary and it WILL lift.'
            : 'Your history flags today as a hard one. Plan softness in advance — you have done this before and gotten through.',
      }
  }
}

/** The next-N-day forecast strip (Toni asked specifically for 3). */
export function forecastWindow(model: CycleModel, days = 3, from = todayISO()): DayForecast[] {
  const out: DayForecast[] = []
  for (let i = 0; i < days; i++) out.push(forecastFor(model, addDaysISO(from, i)))
  return out
}

/** Next predicted period start date, projected forward from the anchor. */
export function nextPeriodStart(model: CycleModel, from = todayISO()): ISODate {
  const { anchorStart, geo } = model
  const diff = daysBetween(from, anchorStart)
  const cyclesAhead = Math.ceil(diff / geo.cycleLength)
  let candidate = addDaysISO(anchorStart, cyclesAhead * geo.cycleLength)
  if (daysBetween(candidate, from) < 0) candidate = addDaysISO(candidate, geo.cycleLength)
  return candidate
}

export function daysUntilNextPeriod(model: CycleModel, from = todayISO()): number {
  return daysBetween(nextPeriodStart(model, from), from)
}
