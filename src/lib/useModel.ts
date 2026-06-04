import { useMemo } from 'react'
import { useStore } from '../store'
import { buildModel, type CycleModel } from './cycle'

/** Rebuilds the adaptive cycle model whenever the profile or logs change. */
export function useModel(): CycleModel | null {
  const profile = useStore((s) => s.profile)
  const logs = useStore((s) => s.logs)
  return useMemo(() => (profile ? buildModel(profile, logs) : null), [profile, logs])
}
