import type { HormoneLevels, CyclePhase } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// A simplified but physiologically-faithful model of the four-week hormone
// cycle. Every value is normalized to 0…1 so it can be charted and compared.
//
// Anchors (for a textbook 28-day cycle with a 14-day luteal phase):
//   • Day 1            → first day of bleeding (menstruation)
//   • Estrogen peak    → ~1 day before ovulation (late follicular)
//   • Ovulation        → cycleLength − lutealLength   (LH surge)
//   • Progesterone peak→ ~7 days after ovulation (mid-luteal)
//   • Late luteal      → progesterone & estrogen fall  → PMS / PMDD window
// The model scales these landmarks to *her* cycle/luteal lengths.
// ─────────────────────────────────────────────────────────────────────────────

function gaussian(x: number, center: number, width: number): number {
  const z = (x - center) / width
  return Math.exp(-0.5 * z * z)
}

/** Smooth ramp from 0→1 between a and b. */
function smoothstep(x: number, a: number, b: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export interface CycleGeometry {
  cycleLength: number
  lutealLength: number
  periodLength: number
  ovulationDay: number // 1-indexed cycle day of ovulation
}

export function cycleGeometry(
  cycleLength: number,
  lutealLength: number,
  periodLength: number,
): CycleGeometry {
  const ovulationDay = Math.max(7, cycleLength - lutealLength)
  return { cycleLength, lutealLength, periodLength, ovulationDay }
}

/**
 * Hormone levels for a given 1-indexed cycle day.
 * `day` may exceed cycleLength; it is wrapped.
 */
export function hormonesForCycleDay(day: number, geo: CycleGeometry): HormoneLevels {
  const { cycleLength, ovulationDay } = geo
  // wrap into [1, cycleLength]
  let d = ((day - 1) % cycleLength) + 1
  if (d < 1) d += cycleLength

  // ── Estrogen ────────────────────────────────────────────────────────────
  // Rising follicular ramp + sharp pre-ovulatory peak + broad luteal hump.
  const follicularRise = smoothstep(d, 2, ovulationDay - 1) * 0.55
  const ovulatoryPeak = gaussian(d, ovulationDay - 1, 1.6) * 0.95
  const lutealHump = gaussian(d, ovulationDay + 6, 4.5) * 0.55
  let estrogen = Math.max(follicularRise, ovulatoryPeak, lutealHump)
  // crash in the last ~3 days before menstruation
  estrogen *= 1 - smoothstep(d, cycleLength - 2.5, cycleLength) * 0.55

  // ── Progesterone ──────────────────────────────────────────────────────────
  // Near-zero until ovulation, then a big mid-luteal dome that collapses late.
  const rise = smoothstep(d, ovulationDay, ovulationDay + 6)
  const fall = 1 - smoothstep(d, cycleLength - 4, cycleLength)
  let progesterone = rise * fall * gaussian(d, ovulationDay + 6.5, 7) * 1.15
  progesterone = Math.min(1, progesterone)

  // ── LH ────────────────────────────────────────────────────────────────────
  // Low baseline with a dramatic surge right at ovulation.
  const lh = Math.min(1, 0.12 + gaussian(d, ovulationDay, 0.9) * 0.95)

  // ── FSH ─────────────────────────────────────────────────────────────────
  // Gentle early-follicular rise (recruits the follicle) + small ovulatory bump.
  const fsh = Math.min(
    1,
    0.22 +
      gaussian(d, 3, 3.2) * 0.45 +
      gaussian(d, ovulationDay, 1.3) * 0.4,
  )

  // ── Testosterone ──────────────────────────────────────────────────────────
  // Moderate baseline with a peri-ovulatory lift (drive / confidence).
  const testosterone = Math.min(1, 0.35 + gaussian(d, ovulationDay, 4.5) * 0.5)

  return {
    estrogen: clamp01(estrogen),
    progesterone: clamp01(progesterone),
    lh: clamp01(lh),
    fsh: clamp01(fsh),
    testosterone: clamp01(testosterone),
  }
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x))
}

export function phaseForCycleDay(day: number, geo: CycleGeometry): CyclePhase {
  const { cycleLength, ovulationDay, periodLength } = geo
  let d = ((day - 1) % cycleLength) + 1
  if (d < 1) d += cycleLength
  if (d <= periodLength) return 'menstrual'
  if (d >= ovulationDay - 1 && d <= ovulationDay + 1) return 'ovulation'
  if (d >= ovulationDay - 5 && d < ovulationDay - 1) return 'fertile'
  if (d < ovulationDay - 5) return 'follicular'
  // post-ovulation
  if (d >= cycleLength - 5) return 'late-luteal'
  return 'early-luteal'
}

// ── Human-readable hormone knowledge base ────────────────────────────────────

export interface HormoneInfo {
  key: keyof HormoneLevels
  name: string
  color: string
  /** Short tagline shown next to the level. */
  role: string
}

export const HORMONES: HormoneInfo[] = [
  { key: 'estrogen', name: 'Estrogen', color: '#ff8fb1', role: 'mood lift, clarity, energy' },
  { key: 'progesterone', name: 'Progesterone', color: '#a99bff', role: 'calm, sleep — but the PMDD trigger when it falls' },
  { key: 'lh', name: 'LH', color: '#ffd166', role: 'triggers ovulation' },
  { key: 'fsh', name: 'FSH', color: '#7cc6ff', role: 'grows the follicle' },
  { key: 'testosterone', name: 'Testosterone', color: '#7bd6a8', role: 'drive, confidence, libido' },
]

/**
 * Explains, in plain language, what the current hormone mix is likely *doing*
 * to Toni — the heart of the "understand your weather" experience.
 */
export function explainHormones(
  h: HormoneLevels,
  phase: CyclePhase,
): { title: string; tone: 'good' | 'mixed' | 'tough'; lines: string[] } {
  const lines: string[] = []
  let tone: 'good' | 'mixed' | 'tough' = 'mixed'
  let title = ''

  const eHigh = h.estrogen > 0.6
  const pHigh = h.progesterone > 0.55
  const pFalling = phase === 'late-luteal'

  switch (phase) {
    case 'menstrual':
      title = 'A reset is underway'
      tone = 'mixed'
      lines.push(
        'Estrogen and progesterone are both at their lowest. The storm of the last few days has broken — many people feel a quiet relief once bleeding begins.',
      )
      lines.push(
        'Energy may be low and you might want rest. That is biology, not weakness. Iron-rich food and warmth help here.',
      )
      break
    case 'follicular':
      title = 'The clouds are clearing'
      tone = 'good'
      lines.push(
        'Estrogen is climbing as a new follicle grows. This is the brain-fog-lifting, optimistic part of the month.',
      )
      lines.push(
        'Serotonin tends to rise with estrogen, so motivation, focus and social energy usually return now. A good window for harder tasks.',
      )
      break
    case 'fertile':
      title = 'Skies opening up'
      tone = 'good'
      lines.push(
        'Estrogen is near its peak and testosterone is lifting. Confidence, libido and verbal sharpness are often at their best.',
      )
      break
    case 'ovulation':
      title = 'Peak sunshine'
      tone = 'good'
      lines.push(
        'The LH surge has released an egg. Estrogen and testosterone peak together — this is typically the brightest, most magnetic day of the cycle.',
      )
      break
    case 'early-luteal':
      title = 'Warm but hazy'
      tone = 'mixed'
      lines.push(
        'Progesterone is rising after ovulation. It is calming and sleep-promoting, but can also bring sluggishness, bloating or a softer focus.',
      )
      lines.push(
        'Estrogen dips then has a small second rise. Mood is usually steady here — a gentle, nesting kind of energy.',
      )
      break
    case 'late-luteal':
      title = 'Storm watch'
      tone = 'tough'
      lines.push(
        'Both estrogen and progesterone are falling steeply now. For a PMDD brain this withdrawal is the core trigger — it disrupts serotonin and GABA, the calm-and-steady chemicals.',
      )
      lines.push(
        'Irritability, tearfulness, anxiety or feeling "out of control" here are a hormone-withdrawal reaction, not your true baseline. It will lift when bleeding starts.',
      )
      break
  }

  if (eHigh && !pHigh) tone = 'good'
  if (pFalling) tone = 'tough'

  return { title, tone, lines }
}
