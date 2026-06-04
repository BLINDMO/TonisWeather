import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AdaptationEntry,
  AppState,
  DayLog,
  ISODate,
  ModelSnapshot,
  OnboardingProfile,
  PeriodSeed,
  WorkshopEntry,
} from './types'
import { todayISO, addDaysISO } from './lib/date'
import { DEFAULT_FONT_THEME } from './lib/fonts'

const STORAGE_KEY = 'tonis-weather-v1'
const SCHEMA_VERSION = 1

interface Store extends AppState {
  // onboarding
  completeOnboarding: (p: OnboardingProfile, seedPeriods?: PeriodSeed[]) => void
  // logging
  upsertLog: (date: ISODate, patch: Partial<DayLog>) => void
  getLog: (date: ISODate) => DayLog | undefined
  // workshop
  addWorkshopEntry: (e: Omit<WorkshopEntry, 'id' | 'createdAt'>) => void
  deleteWorkshopEntry: (id: string) => void
  // settings
  setSetting: <K extends keyof AppState['settings']>(k: K, v: AppState['settings'][K]) => void
  updateProfile: (patch: Partial<OnboardingProfile>) => void
  // period history (post-onboarding importer)
  addPeriods: (seeds: PeriodSeed[]) => number
  // adaptation log
  addAdaptation: (entry: Omit<AdaptationEntry, 'id' | 'timestamp'>) => void
  updateModelSnapshot: (snap: ModelSnapshot) => void
  // backup
  exportData: () => string
  importData: (json: string) => { ok: boolean; error?: string }
  resetAll: () => void
}

const emptyLog = (date: ISODate): DayLog => ({
  date,
  feelings: [],
  symptoms: [],
  updatedAt: Date.now(),
})

const initial: AppState = {
  version: SCHEMA_VERSION,
  onboarded: false,
  profile: null,
  logs: {},
  workshop: [],
  settings: { showScience: true, giraffeEnabled: true, fontTheme: DEFAULT_FONT_THEME },
  adaptationLog: [],
  lastModelSnapshot: null,
}

/** Expand period seeds (start + length) into per-day period logs. */
function seedToLogs(
  base: Record<ISODate, DayLog>,
  seeds: PeriodSeed[],
): Record<ISODate, DayLog> {
  const logs = { ...base }
  for (const s of seeds) {
    const len = Math.min(12, Math.max(1, Math.round(s.length)))
    for (let i = 0; i < len; i++) {
      const date = addDaysISO(s.start, i)
      const prev = logs[date]
      logs[date] = {
        date,
        feelings: prev?.feelings ?? [],
        symptoms: prev?.symptoms ?? [],
        mood: prev?.mood,
        note: prev?.note,
        period: true,
        flow: prev?.flow ?? 'medium',
        updatedAt: Date.now(),
      }
    }
  }
  return logs
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initial,

      completeOnboarding: (p, seedPeriods = []) =>
        set((s) => ({
          onboarded: true,
          profile: { ...p, completedAt: Date.now() },
          logs: seedPeriods.length ? seedToLogs(s.logs, seedPeriods) : s.logs,
        })),

      upsertLog: (date, patch) =>
        set((s) => {
          const prev = s.logs[date] ?? emptyLog(date)
          const next: DayLog = { ...prev, ...patch, date, updatedAt: Date.now() }
          return { logs: { ...s.logs, [date]: next } }
        }),

      getLog: (date) => get().logs[date],

      addWorkshopEntry: (e) =>
        set((s) => ({
          workshop: [
            { ...e, id: crypto.randomUUID(), createdAt: Date.now() },
            ...s.workshop,
          ],
        })),

      deleteWorkshopEntry: (id) =>
        set((s) => ({ workshop: s.workshop.filter((w) => w.id !== id) })),

      setSetting: (k, v) =>
        set((s) => ({ settings: { ...s.settings, [k]: v } })),

      updateProfile: (patch) =>
        set((s) => (s.profile ? { profile: { ...s.profile, ...patch } } : {})),

      addPeriods: (seeds) => {
        const valid = seeds.filter((s) => !!s.start && s.length > 0)
        if (valid.length) set((s) => ({ logs: seedToLogs(s.logs, valid) }))
        return valid.length
      },

      addAdaptation: (entry) =>
        set((s) => ({
          adaptationLog: [
            { ...entry, id: crypto.randomUUID(), timestamp: Date.now() },
            ...s.adaptationLog,
          ],
        })),

      updateModelSnapshot: (snap) => set({ lastModelSnapshot: snap }),

      exportData: () => {
        const { version, onboarded, profile, logs, workshop, settings } = get()
        return JSON.stringify(
          {
            app: "Toni's Weather",
            exportedAt: new Date().toISOString(),
            version,
            data: { onboarded, profile, logs, workshop, settings },
          },
          null,
          2,
        )
      },

      importData: (json) => {
        try {
          const parsed = JSON.parse(json)
          const data = parsed.data ?? parsed
          if (!data || typeof data !== 'object') {
            return { ok: false, error: 'That file does not look like a Toni’s Weather backup.' }
          }
          set({
            version: SCHEMA_VERSION,
            onboarded: !!data.onboarded,
            profile: data.profile ?? null,
            logs: data.logs ?? {},
            workshop: data.workshop ?? [],
            settings: { ...initial.settings, ...(data.settings ?? {}) },
            adaptationLog: data.adaptationLog ?? [],
            lastModelSnapshot: data.lastModelSnapshot ?? null,
          })
          return { ok: true }
        } catch (e) {
          return { ok: false, error: 'Could not read that backup file (invalid format).' }
        }
      },

      resetAll: () => set({ ...initial }),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
    },
  ),
)

/** Convenience: today's log or a fresh blank. */
export function useTodayLog() {
  return useStore((s) => s.logs[todayISO()])
}
