// ─────────────────────────────────────────────────────────────────────────────
// Core domain types for Toni's Weather
// ─────────────────────────────────────────────────────────────────────────────

/** ISO date string, always normalized to 'yyyy-MM-dd' (local day). */
export type ISODate = string

export type FlowLevel = 'spotting' | 'light' | 'medium' | 'heavy'

/** The feeling tags Toni can tap on a day (Flo-style emoji picker). */
export interface FeelingTag {
  id: string
  label: string
  emoji: string
  /** -2 (very negative) … +2 (very positive). Used to bias mood + trigger giraffe. */
  valence: -2 | -1 | 0 | 1 | 2
  category: 'mood' | 'body' | 'energy' | 'mind'
}

/** Everything Toni can log for a single day. */
export interface DayLog {
  date: ISODate
  /** 1 (out of control / negative) … 10 (super happy / content). undefined = not logged. */
  mood?: number
  /** Selected feeling tag ids. */
  feelings: string[]
  /** Did her period flow happen today? */
  period?: boolean
  flow?: FlowLevel
  /** Free-text journal note. */
  note?: string
  /** Symptoms specific to PMDD tracking. */
  symptoms: string[]
  updatedAt: number
}

/** A completed emotion-workshop entry. */
export interface WorkshopEntry {
  id: string
  promptId: string
  promptTitle: string
  /** For per-person prompts, answers keyed by person name; else a single 'answer' key. */
  answers: Record<string, string[]>
  createdAt: number
}

export interface OnboardingProfile {
  name: string
  /** Average cycle length in days (period start → next period start). */
  avgCycleLength: number
  /** Average period (bleeding) duration in days. */
  avgPeriodLength: number
  /** Luteal phase length in days (ovulation → next period). Usually ~14. */
  lutealLength: number
  /** Date of the FIRST day of her most recent period. Anchors all predictions. */
  lastPeriodStart: ISODate
  /** How regular her cycles are — affects prediction confidence. */
  regularity: 'very' | 'somewhat' | 'irregular' | 'unknown'
  /** Self-reported PMDD severity, used to weight the "tornado" model. */
  pmddSeverity: 'mild' | 'moderate' | 'severe'
  birthYear?: number
  /** The household she draws strength from — powers the workshop prompts. */
  household: string[]
  completedAt: number
}

export interface AppState {
  version: number
  onboarded: boolean
  profile: OnboardingProfile | null
  logs: Record<ISODate, DayLog>
  workshop: WorkshopEntry[]
  settings: {
    showScience: boolean
    giraffeEnabled: boolean
    fontTheme: string
  }
}

/** A past period to seed during onboarding (start date + how many days it lasted). */
export interface PeriodSeed {
  start: ISODate
  length: number
}

// ── Derived / computed types (not persisted) ────────────────────────────────

export type CyclePhase =
  | 'menstrual'
  | 'follicular'
  | 'fertile'
  | 'ovulation'
  | 'early-luteal'
  | 'late-luteal'

export interface HormoneLevels {
  /** All normalized 0…1 for charting. */
  estrogen: number
  progesterone: number
  lh: number
  fsh: number
  testosterone: number
}

export type WeatherKind =
  | 'sunny'
  | 'bright'
  | 'partly'
  | 'cloudy'
  | 'drizzle'
  | 'rain'
  | 'storm'
  | 'tornado'

export interface DayForecast {
  date: ISODate
  cycleDay: number
  phase: CyclePhase
  hormones: HormoneLevels
  weather: WeatherKind
  /** 1…10 predicted "outlook". Blends cycle science + her tracked history. */
  outlook: number
  /**
   * 'watch'   → the PMDD-prone late-luteal window; a hard day is *possible*.
   * 'tornado' → her history (or a logged crash) confirms this day tends to be severe.
   */
  tornadoLevel: 'none' | 'watch' | 'tornado'
  /** True only for confirmed tornado days (tornadoLevel === 'tornado'). */
  tornado: boolean
  /** True when her own history shows this cycle-day tends to be rough. */
  historicalLow: boolean
  isPredictedPeriod: boolean
  isPredictedOvulation: boolean
  isFertile: boolean
  /** 0…1 — how confident the model is, based on amount + regularity of data. */
  confidence: number
  headline: string
  blurb: string
}
