import { useEffect, useMemo, useRef } from 'react'
import { useStore } from '../store'
import { useModel } from './useModel'
import type { AdaptationChange, ModelSnapshot } from '../types'

// ─── Confidence milestone labels ────────────────────────────────────────────

const CONF_MILESTONES: [number, string][] = [
  [0.80, 'Highly personalised — predictions are now very accurate'],
  [0.65, 'Getting accurate — enough data to spot your patterns'],
  [0.50, 'Halfway there — building a solid picture of your cycle'],
  [0.35, 'Early patterns forming — keep logging!'],
]

function confMilestoneHit(prev: number, next: number): string | null {
  for (const [threshold, label] of CONF_MILESTONES) {
    if (next >= threshold && prev < threshold) return label
  }
  return null
}

// ─── Snapshot helpers ───────────────────────────────────────────────────────

function snapFromModel(
  model: ReturnType<typeof useModel> & object,
  totalMoodLogs: number,
): ModelSnapshot {
  return {
    cyclesDetected: model.cyclesDetected,
    confidence: model.confidence,
    cycleLength: model.geo.cycleLength,
    periodLength: model.geo.periodLength,
    ovulationDay: model.geo.ovulationDay,
    lowDaysCount: model.historicalLowDays.size,
    totalMoodLogs,
  }
}

function snapshotsEqual(a: ModelSnapshot, b: ModelSnapshot): boolean {
  return (
    a.cyclesDetected === b.cyclesDetected &&
    a.confidence === b.confidence &&
    a.cycleLength === b.cycleLength &&
    a.periodLength === b.periodLength &&
    a.ovulationDay === b.ovulationDay &&
    a.lowDaysCount === b.lowDaysCount &&
    a.totalMoodLogs === b.totalMoodLogs
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Runs inside the main App tree. Compares each new CycleModel against the
 * previously persisted snapshot and, when something meaningful changed, writes
 * an AdaptationEntry to the store so Settings can display a live change-log.
 *
 * Uses the persisted `lastModelSnapshot` as the baseline so cross-session diffs
 * work correctly — reloading the page never creates spurious entries.
 */
export function useAdaptationTracker() {
  const model = useModel()
  const logs = useStore((s) => s.logs)

  const totalMoodLogs = useMemo(
    () => Object.values(logs).filter((l) => typeof l.mood === 'number').length,
    [logs],
  )

  // prevRef holds the in-memory comparison baseline.
  // On first effect run it's seeded from the persisted store snapshot.
  const prevRef = useRef<ModelSnapshot | null>(null)
  const seeded = useRef(false)

  useEffect(() => {
    if (!model) {
      // Profile was cleared (reset). Reset the tracker so it re-initialises
      // properly when a new profile is created.
      prevRef.current = null
      seeded.current = false
      return
    }

    // Seed prevRef from the persisted snapshot exactly once per session
    if (!seeded.current) {
      seeded.current = true
      const stored = useStore.getState().lastModelSnapshot
      if (stored) prevRef.current = stored
    }

    const current = snapFromModel(model, totalMoodLogs)

    // ── First-ever model build (no persisted snapshot) ──
    if (!prevRef.current) {
      prevRef.current = current
      const { addAdaptation, updateModelSnapshot, adaptationLog } = useStore.getState()
      updateModelSnapshot(current)

      // Only log "initialized" once (guard against hot-reloads)
      if (adaptationLog.length === 0) {
        addAdaptation({
          headline: 'Forecast initialized from your profile',
          changes: [
            { field: 'Cycle length', from: '—', to: `${current.cycleLength} days` },
            { field: 'Period length', from: '—', to: `${current.periodLength} days` },
            { field: 'Ovulation estimate', from: '—', to: `Cycle day ${current.ovulationDay}` },
            {
              field: 'Forecast confidence',
              from: '—',
              to: `${Math.round(current.confidence * 100)}%`,
              detail: 'Will improve as you log data',
            },
          ],
        })
      }
      return
    }

    // ── Incremental diff ──
    if (snapshotsEqual(current, prevRef.current)) return // nothing changed

    const prev = prevRef.current
    const changes: AdaptationChange[] = []

    if (current.cyclesDetected > prev.cyclesDetected) {
      const n = current.cyclesDetected
      changes.push({
        field: 'Cycles detected',
        from: `${prev.cyclesDetected}`,
        to: `${n}`,
        detail: `Period #${n} identified — better predictions ahead`,
      })
    }

    if (current.cycleLength !== prev.cycleLength) {
      changes.push({
        field: 'Cycle length',
        from: `${prev.cycleLength} days`,
        to: `${current.cycleLength} days`,
        detail:
          current.cyclesDetected >= 2
            ? 'Refined from real period data'
            : 'Adjusted from profile',
      })
    }

    if (current.periodLength !== prev.periodLength) {
      changes.push({
        field: 'Period length',
        from: `${prev.periodLength} days`,
        to: `${current.periodLength} days`,
        detail: 'Refined from logged period days',
      })
    }

    if (current.ovulationDay !== prev.ovulationDay) {
      changes.push({
        field: 'Ovulation estimate',
        from: `Cycle day ${prev.ovulationDay}`,
        to: `Cycle day ${current.ovulationDay}`,
      })
    }

    if (current.lowDaysCount > prev.lowDaysCount) {
      const added = current.lowDaysCount - prev.lowDaysCount
      changes.push({
        field: 'Hard-day patterns',
        from: `${prev.lowDaysCount} confirmed`,
        to: `${current.lowDaysCount} confirmed`,
        detail: `${added} new difficult-day pattern${added > 1 ? 's' : ''} locked in from your mood logs`,
      })
    }

    const milestoneLabel = confMilestoneHit(prev.confidence, current.confidence)
    if (milestoneLabel) {
      changes.push({
        field: 'Forecast confidence',
        from: `${Math.round(prev.confidence * 100)}%`,
        to: `${Math.round(current.confidence * 100)}%`,
        detail: milestoneLabel,
      })
    } else if (Math.abs(current.confidence - prev.confidence) >= 0.04) {
      // Smaller confidence nudge — still worth noting, no milestone label
      changes.push({
        field: 'Forecast confidence',
        from: `${Math.round(prev.confidence * 100)}%`,
        to: `${Math.round(current.confidence * 100)}%`,
      })
    }

    if (changes.length === 0) {
      // Something in the snapshot changed but we have no categorised change —
      // just update the stored snapshot silently (keeps cross-session diff clean).
      prevRef.current = current
      useStore.getState().updateModelSnapshot(current)
      return
    }

    prevRef.current = current
    const { addAdaptation, updateModelSnapshot } = useStore.getState()
    updateModelSnapshot(current)

    const headline =
      changes.length === 1
        ? `${changes[0].field} updated`
        : `${changes.length} forecast areas updated`

    addAdaptation({ headline, changes })
  }, [model, totalMoodLogs])
}
