// The giraffe's toolkit: practical, real-world things that genuinely help with
// PMDD / luteal-phase mood crashes. Grounded in evidence (movement, light,
// blood-sugar stability, magnesium/B6/omega-3, CBT/grounding) but kept warm.

export interface Suggestion {
  id: string
  icon: string
  title: string
  body: string
  category: 'move' | 'food' | 'mind' | 'rest' | 'connect'
}

export const SUGGESTIONS: Suggestion[] = [
  {
    id: 'walk',
    icon: '🚶‍♀️',
    title: 'Walk outside for 10 minutes',
    body: 'Daylight + gentle movement raises serotonin and lowers cortisol fast. You do not have to go far — just get your eyes on the sky and your feet moving.',
    category: 'move',
  },
  {
    id: 'sunlight',
    icon: '☀️',
    title: 'Get morning light on your face',
    body: 'Ten minutes of natural light early in the day steadies your body clock and mood chemistry. Coffee on the porch counts.',
    category: 'move',
  },
  {
    id: 'move-gentle',
    icon: '🧘‍♀️',
    title: 'Move your body kindly',
    body: 'Yoga, stretching, or a slow dance to one song. In the luteal phase, gentle beats intense — the goal is to discharge tension, not to push.',
    category: 'move',
  },
  {
    id: 'protein',
    icon: '🥚',
    title: 'Eat protein + steady your blood sugar',
    body: 'PMDD irritability is worse when blood sugar swings. Pair protein (eggs, yogurt, nuts) with a slow carb. Avoid going long without eating today.',
    category: 'food',
  },
  {
    id: 'magnesium',
    icon: '🌰',
    title: 'Magnesium-rich foods',
    body: 'Dark chocolate, pumpkin seeds, spinach, black beans. Magnesium calms the nervous system and eases cramps and irritability in the luteal phase.',
    category: 'food',
  },
  {
    id: 'omega',
    icon: '🐟',
    title: 'Omega-3s & complex carbs',
    body: 'Salmon, walnuts, flax, plus oats or sweet potato. Omega-3s and slow carbs both nudge serotonin upward and soften the crash.',
    category: 'food',
  },
  {
    id: 'hydrate',
    icon: '💧',
    title: 'Water + ease off caffeine',
    body: 'Dehydration mimics anxiety, and caffeine amplifies it premenstrually. A big glass of water and a swap to herbal tea can take the edge off.',
    category: 'food',
  },
  {
    id: 'vitamins',
    icon: '💊',
    title: 'Supplements that help PMDD',
    body: 'Evidence supports vitamin B6, magnesium, calcium, and omega-3 for premenstrual mood. Check with your doctor, but these are the well-studied ones.',
    category: 'food',
  },
  {
    id: 'breath',
    icon: '🌬️',
    title: '4-7-8 breathing',
    body: 'Breathe in for 4, hold for 7, out for 8, four times. The long exhale flips on your calm-down nervous system within a minute.',
    category: 'mind',
  },
  {
    id: 'grounding',
    icon: '🖐️',
    title: '5-4-3-2-1 grounding',
    body: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. It pulls a spiraling mind back into the room.',
    category: 'mind',
  },
  {
    id: 'name-it',
    icon: '🏷️',
    title: 'Name it: "this is the hormone talking"',
    body: 'Say out loud: "My estrogen and progesterone are dropping. These feelings are real but they are not the truth about my life." Naming it shrinks it.',
    category: 'mind',
  },
  {
    id: 'workshop',
    icon: '📝',
    title: 'Open the Emotion Workshop',
    body: 'A few minutes of guided, warm writing — gratitude and the people you love — to gently shift your brain toward what is good and lasting.',
    category: 'mind',
  },
  {
    id: 'warmth',
    icon: '🛁',
    title: 'Warmth & comfort',
    body: 'A warm bath, heating pad, or a soft blanket. Physical warmth genuinely calms the threat response. Permission to cocoon.',
    category: 'rest',
  },
  {
    id: 'shrink-day',
    icon: '🗓️',
    title: 'Shrink the day',
    body: 'Cancel one non-essential thing. Pick the single most important task and let the rest wait until the storm passes. Survival mode is allowed.',
    category: 'rest',
  },
  {
    id: 'reach-out',
    icon: '💬',
    title: 'Tell one safe person',
    body: 'A quick "today is a hard hormone day for me" to Jon or a friend lowers the pressure to mask. You do not have to carry it silently.',
    category: 'connect',
  },
]

const CATEGORY_LABELS: Record<Suggestion['category'], string> = {
  move: 'Move',
  food: 'Nourish',
  mind: 'Mind',
  rest: 'Rest',
  connect: 'Connect',
}

export function suggestionCategoryLabel(c: Suggestion['category']): string {
  return CATEGORY_LABELS[c]
}

/** Pick a varied, helpful handful — one or two from several categories. */
export function pickSuggestions(seed: number, count = 5): Suggestion[] {
  const byCat = new Map<string, Suggestion[]>()
  for (const s of SUGGESTIONS) {
    if (!byCat.has(s.category)) byCat.set(s.category, [])
    byCat.get(s.category)!.push(s)
  }
  const cats = [...byCat.keys()]
  const out: Suggestion[] = []
  let i = seed
  // Always lead with the workshop invite if present.
  const workshop = SUGGESTIONS.find((s) => s.id === 'workshop')
  while (out.length < count && out.length < SUGGESTIONS.length) {
    const cat = cats[i % cats.length]
    const pool = byCat.get(cat)!
    const pick = pool[Math.floor(i / cats.length) % pool.length]
    if (!out.includes(pick)) out.push(pick)
    i++
    if (i > seed + 60) break
  }
  if (workshop && !out.includes(workshop)) out[out.length - 1] = workshop
  return out
}
