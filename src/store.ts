import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppState,
  DayLog,
  ISODate,
  OnboardingProfile,
  WorkshopEntry,
} from './types'
import { todayISO } from './lib/date'

const STORAGE_KEY = 'tonis-weather-v1'
const SCHEMA_VERSION = 1

interface Store extends AppState {
  // onboarding
  completeOnboarding: (p: OnboardingProfile) => void
  // logging
  upsertLog: (date: ISODate, patch: Partial<DayLog>) => void
  getLog: (date: ISODate) => DayLog | undefined
  // workshop
  addWorkshopEntry: (e: Omit<WorkshopEntry, 'id' | 'createdAt'>) => void
  deleteWorkshopEntry: (id: string) => void
  // settings
  setSetting: <K extends keyof AppState['settings']>(k: K, v: AppState['settings'][K]) => void
  updateProfile: (patch: Partial<OnboardingProfile>) => void
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
  settings: { showScience: true, giraffeEnabled: true },
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initial,

      completeOnboarding: (p) =>
        set({ onboarded: true, profile: { ...p, completedAt: Date.now() } }),

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
