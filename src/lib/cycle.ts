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
import { feelingsValenceScore, isCrashFeelings } from './feelings'

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
  /** avg effective mood per 1-indexed cycle day (index 0 unused), or null if too few samples. */
  historicalMood: (number | null)[]
  /** sample count per cycle day. */
  historySamples: number[]
  /** cycle days flagged as historically low for Toni. */
  historicalLowDays: Set<number>
  /** cycle days where at least one logged day was a genuine crash. */
  crashDays: Set<number>
  cyclesDetected: number
  confidence: number
}

/** The slider's untouched default. Legacy logs saved it on every save. */
const LEGACY_DEFAULT_MOOD = 7

/**
 * The mood signal the model should learn from for one log, or null if the day
 * carries no usable signal.
 *
 * A slider value counts only when Toni actually set it (`moodSet`, or a legacy
 * value that differs from the untouched default). Tapped feelings always carry
 * signal; when both exist they are blended. This is what lets days like
 * "irritable + overwhelmed + foggy, slider untouched" register as the hard
 * days they were.
 */
export function effectiveMoodFor(log: DayLog): number | null {
  const feelScore = feelingsValenceScore(log.feelings ?? [])
  const sliderTrusted =
    typeof log.mood === 'number' &&
    (log.moodSet === true || log.mood !== LEGACY_DEFAULT_MOOD)
  if (sliderTrusted && feelScore != null) return log.mood! * 0.6 + feelScore * 0.4
  if (sliderTrusted) return log.mood!
  return feelScore
}

/** A logged day that was a genuine crash — from the slider or the feelings alone. */
export function isCrashLog(log: DayLog): boolean {
  const eff = effectiveMoodFor(log)
  return (eff != null && eff <= 3.5) || isCrashFeelings(log.feelings ?? [])
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

/** Chronological gaps between consecutive period starts, implausible ones dropped. */
function plausibleGaps(starts: ISODate[]): number[] {
  const gaps: number[] = []
  for (let i = 1; i < starts.length; i++) {
    const g = daysBetween(starts[i], starts[i - 1])
    if (g >= 18 && g <= 45) gaps.push(g)
  }
  return gaps
}

/** Weighted-average gap between consecutive period starts (recent cycles count more). */
function estimateCycleLength(starts: ISODate[], fallback: number): number {
  if (starts.length < 2) return fallback
  const gaps = plausibleGaps(starts)
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
  // Each log is indexed inside ITS OWN cycle (days since the real period
  // start that preceded it), not by retro-projecting the current cycle
  // length backwards — real cycles vary, and the modulo projection was
  // filing day-26 crashes under the wrong cycle day. Days that overrun the
  // estimated length (a long cycle) accumulate on the final bucket, which is
  // physiologically the pre-period window anyway. Only logs older than every
  // known start fall back to the modulo projection.
  const cycleDayOf = (date: ISODate): number | null => {
    let lastStart: ISODate | null = null
    for (const s of starts) {
      if (s <= date) lastStart = s
      else break
    }
    if (lastStart) {
      const gap = daysBetween(date, lastStart)
      if (gap >= 45) return null // stale trailing log; no cycle context
      return Math.min(cycleLength, gap + 1)
    }
    return cycleDayFor(date, anchorStart, cycleLength)
  }

  const sums = new Array(cycleLength + 1).fill(0)
  const counts = new Array(cycleLength + 1).fill(0)
  const crashDays = new Set<number>()
  let moodSignals = 0
  for (const log of Object.values(logs)) {
    const eff = effectiveMoodFor(log)
    if (eff == null) continue
    const cd = cycleDayOf(log.date)
    if (cd == null) continue
    moodSignals++
    sums[cd] += eff
    counts[cd] += 1
    if (isCrashLog(log)) crashDays.add(cd)
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
  const regularityBonus =
    profile.regularity === 'very'
      ? 0.15
      : profile.regularity === 'somewhat'
        ? 0.1
        : 0.05
  // Confidence must answer for what the data actually shows: cycles that
  // swing (e.g. 28–34 days) cap it well below 100% no matter how much is
  // logged, because the period prediction is genuinely ±a few days.
  const gaps = plausibleGaps(starts)
  const gapMean = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0
  const gapSd = gaps.length >= 2
    ? Math.sqrt(gaps.reduce((a, g) => a + (g - gapMean) ** 2, 0) / gaps.length)
    : null
  const irregularityPenalty =
    gapSd == null ? 0 : Math.min(0.35, Math.max(0, (gapSd - 0.75) * 0.12))
  const confidence = Math.min(
    0.95,
    Math.max(
      0.15,
      0.3 +
        Math.min(0.4, cyclesDetected * 0.1) +
        Math.min(0.15, moodSignals * 0.012) +
        regularityBonus -
        irregularityPenalty,
    ),
  )

  return {
    anchorStart,
    geo,
    severity: profile.pmddSeverity,
    historicalMood,
    historySamples: counts,
    historicalLowDays,
    crashDays,
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

/** How many days past the expected start we treat a cycle as "running late" rather than restarted. */
const OVERDUE_GRACE = 10

export function forecastFor(model: CycleModel, date: ISODate): DayForecast {
  const { geo, anchorStart } = model
  // If the expected period simply hasn't arrived yet (no bleeding logged and
  // the date is not in the future), the cycle is OVERDUE — hold it in the
  // late-luteal window instead of wrapping to "day 1, period, reset underway".
  // Wrapping is only a prediction, valid for future dates.
  const rawDiff = daysBetween(date, anchorStart)
  const overdue =
    rawDiff >= geo.cycleLength &&
    rawDiff < geo.cycleLength + OVERDUE_GRACE &&
    date <= todayISO()
  const cycleDay = overdue
    ? geo.cycleLength
    : cycleDayFor(date, anchorStart, geo.cycleLength)
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

  // ── Tornado calibration (2.1) ─────────────────────────────────────────────
  // WATCH days are Toni's two known-vulnerable windows, regardless of severity:
  //   • around ovulation (the day before, of, and after) — estrogen swings
  //   • the whole late-luteal run-up to her period — the PMDD hormone
  //     withdrawal (her logged crashes land 3–6 days out, not just the last 3)
  // A day escalates to a full TORNADO when HER OWN tracked history shows a
  // genuine crash there: either the average is truly low, or a crash was
  // logged on this cycle day inside a vulnerable window. Tornadoes stay rare
  // across the month — they cluster where her real hard days cluster.
  const hist2 = model.historicalMood[cycleDay]
  const ovWatch = cycleDay >= geo.ovulationDay - 1 && cycleDay <= geo.ovulationDay + 1
  const premenWatch = cycleDay >= geo.cycleLength - 5 // the late-luteal window
  let tornadoLevel: DayForecast['tornadoLevel'] = 'none'
  if (ovWatch || premenWatch) tornadoLevel = 'watch'
  if (historicalLow && hist2 != null && hist2 <= 3.2) tornadoLevel = 'tornado'
  if ((ovWatch || premenWatch) && model.crashDays.has(cycleDay)) tornadoLevel = 'tornado'
  const tornado = tornadoLevel === 'tornado'

  const isPredictedPeriod = cycleDay <= geo.periodLength
  const isPredictedOvulation = cycleDay === geo.ovulationDay
  const isFertile = cycleDay >= geo.ovulationDay - 5 && cycleDay <= geo.ovulationDay

  // Weather reflects her hormones naturally; a WATCH is an overlay advisory and
  // does NOT turn a sunny ovulation day into a storm. Only a true tornado does.
  const weather = weatherFor(outlook, phase, tornadoLevel)
  let { headline, blurb } = describeWeather(weather, phase)
  if (tornadoLevel === 'tornado') {
    headline = 'Tornado warning'
  } else if (tornadoLevel === 'watch') {
    if (overdue) {
      headline = 'Tornado watch'
      blurb =
        'Your period is running a little later than predicted — cycles vary, and that is normal. Hormone withdrawal can stretch through these extra days, so keep leaning on your tools until bleeding starts.'
    } else if (premenWatch) {
      headline = 'Tornado watch'
      blurb =
        'You are in the run-up to your period, when estrogen and progesterone fall hardest — your PMDD-prone window. A storm is possible but not certain; plan softness in advance, just in case.'
    } else {
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
  // Overdue: the expected start has passed with no bleeding logged. The
  // honest prediction is "any day now" — not one full cycle away (the old
  // projection jumped from "now" to "31 days" overnight).
  if (diff >= geo.cycleLength && diff < geo.cycleLength + OVERDUE_GRACE) return from
  const cyclesAhead = Math.ceil(diff / geo.cycleLength)
  let candidate = addDaysISO(anchorStart, cyclesAhead * geo.cycleLength)
  if (daysBetween(candidate, from) < 0) candidate = addDaysISO(candidate, geo.cycleLength)
  return candidate
}

export function daysUntilNextPeriod(model: CycleModel, from = todayISO()): number {
  return daysBetween(nextPeriodStart(model, from), from)
}
