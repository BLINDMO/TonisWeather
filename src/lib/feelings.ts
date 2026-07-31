import type { FeelingTag } from '../types'

// Flo-style tappable feeling tags. Valence drives the mood model + giraffe.
export const FEELINGS: FeelingTag[] = [
  // Mood
  { id: 'calm', label: 'Calm', emoji: '😌', valence: 2, category: 'mood' },
  { id: 'happy', label: 'Happy', emoji: '😊', valence: 2, category: 'mood' },
  { id: 'loved', label: 'Loved', emoji: '🥰', valence: 2, category: 'mood' },
  { id: 'playful', label: 'Playful', emoji: '😋', valence: 1, category: 'mood' },
  { id: 'okay', label: 'Okay', emoji: '🙂', valence: 0, category: 'mood' },
  { id: 'meh', label: 'Meh', emoji: '😐', valence: 0, category: 'mood' },
  { id: 'sad', label: 'Sad', emoji: '😔', valence: -1, category: 'mood' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', valence: -2, category: 'mood' },
  { id: 'irritable', label: 'Irritable', emoji: '😠', valence: -2, category: 'mood' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😩', valence: -2, category: 'mood' },
  { id: 'tearful', label: 'Tearful', emoji: '😢', valence: -2, category: 'mood' },
  { id: 'numb', label: 'Numb', emoji: '😶‍🌫️', valence: -1, category: 'mood' },

  // Energy
  { id: 'energized', label: 'Energized', emoji: '⚡️', valence: 1, category: 'energy' },
  { id: 'motivated', label: 'Motivated', emoji: '🔥', valence: 1, category: 'energy' },
  { id: 'tired', label: 'Tired', emoji: '🥱', valence: -1, category: 'energy' },
  { id: 'exhausted', label: 'Exhausted', emoji: '🫠', valence: -2, category: 'energy' },

  // Mind
  { id: 'focused', label: 'Focused', emoji: '🎯', valence: 1, category: 'mind' },
  { id: 'foggy', label: 'Foggy', emoji: '🌫️', valence: -1, category: 'mind' },
  { id: 'restless', label: 'Restless', emoji: '🌀', valence: -1, category: 'mind' },

  // Body
  { id: 'cramps', label: 'Cramps', emoji: '🩸', valence: -1, category: 'body' },
  { id: 'bloated', label: 'Bloated', emoji: '🎈', valence: -1, category: 'body' },
  { id: 'headache', label: 'Headache', emoji: '🤕', valence: -1, category: 'body' },
  { id: 'sore', label: 'Sore', emoji: '💢', valence: -1, category: 'body' },
  { id: 'rested', label: 'Rested', emoji: '✨', valence: 1, category: 'body' },
]

export const FEELING_BY_ID: Record<string, FeelingTag> = Object.fromEntries(
  FEELINGS.map((f) => [f.id, f]),
)

export const FEELING_CATEGORIES: { id: FeelingTag['category']; label: string }[] = [
  { id: 'mood', label: 'Mood' },
  { id: 'energy', label: 'Energy' },
  { id: 'mind', label: 'Mind' },
  { id: 'body', label: 'Body' },
]

/**
 * Convert tapped feelings into a 1–10 mood-scale score, or null if none tapped.
 * Average valence spans -2…+2 → mapped onto the same scale as the mood slider,
 * so the model can learn from days where Toni tapped feelings but never
 * touched the slider (which is most days).
 */
export function feelingsValenceScore(feelingIds: string[]): number | null {
  const vals: number[] = feelingIds
    .map((id) => FEELING_BY_ID[id]?.valence)
    .filter((v): v is FeelingTag['valence'] => typeof v === 'number')
  if (!vals.length) return null
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  return Math.min(10, Math.max(1, 5.5 + avg * 2.25))
}

/** A day whose tapped feelings alone signal a genuine crash (e.g. irritable + overwhelmed). */
export function isCrashFeelings(feelingIds: string[]): boolean {
  const veryNegative = feelingIds.filter((id) => (FEELING_BY_ID[id]?.valence ?? 0) <= -2).length
  return veryNegative >= 2
}

/** True when a selection of feelings warrants the giraffe's gentle check-in. */
export function isHardDay(feelingIds: string[], mood?: number): boolean {
  const hasNegative = feelingIds.some((id) => (FEELING_BY_ID[id]?.valence ?? 0) <= -1)
  const veryNegative = feelingIds.some((id) => (FEELING_BY_ID[id]?.valence ?? 0) <= -2)
  const lowMood = typeof mood === 'number' && mood <= 4
  return veryNegative || lowMood || (hasNegative && (mood ?? 10) <= 6)
}
