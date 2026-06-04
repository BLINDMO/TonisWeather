// The Emotion Workshop: gentle, structured writing that pulls the mind toward
// gratitude, nostalgia and connection — especially useful on a tornado day.
// Per-person prompts adapt to whoever is in Toni's household profile.

export interface WorkshopPrompt {
  id: string
  title: string
  intro: string
  icon: string
  /**
   * 'list'        → one list of `slots` open answers.
   * 'per-person'  → `slots` answers for EACH household member.
   * 'reflect'     → a few longer free-write fields (use `fields`).
   */
  type: 'list' | 'per-person' | 'reflect'
  slots?: number
  placeholder?: string
  fields?: string[]
  accent: string
}

export const WORKSHOP_PROMPTS: WorkshopPrompt[] = [
  {
    id: 'gratitude-10',
    title: 'Ten things I am thankful for',
    intro:
      'List ten things you are grateful for right now — and a few words on *why* each one matters. They can be tiny (a warm cup) or huge (a person).',
    icon: '🙏',
    type: 'list',
    slots: 10,
    placeholder: 'I’m thankful for… because…',
    accent: '#ffd166',
  },
  {
    id: 'miss-household',
    title: 'What I’d miss about each of them',
    intro:
      'Imagine waking up tomorrow completely on your own — no kids, no partner. For each person in your home, write five things you would miss about them. Let yourself feel how much they fill your life.',
    icon: '💛',
    type: 'per-person',
    slots: 5,
    placeholder: 'I would miss…',
    accent: '#ff8fb1',
  },
  {
    id: 'love-language',
    title: 'A moment I love with each of them',
    intro:
      'For each person, describe one small, specific moment that makes your chest feel warm — a laugh, a habit, a thing they say. Anchor yourself in it.',
    icon: '🫶',
    type: 'per-person',
    slots: 3,
    placeholder: 'A moment I treasure…',
    accent: '#a99bff',
  },
  {
    id: 'proud-self',
    title: 'Things I’m proud of myself for',
    intro:
      'PMDD lies and says you are failing. Counter it with evidence. List things — big or small — that you have handled, survived, or done well lately.',
    icon: '🌟',
    type: 'list',
    slots: 7,
    placeholder: 'I’m proud that I…',
    accent: '#7bd6a8',
  },
  {
    id: 'nostalgia',
    title: 'A happy memory in full color',
    intro:
      'Pick one genuinely happy memory and write it out in detail — where you were, who was there, what it smelled and sounded like, how your body felt. Re-living it shifts your brain chemistry.',
    icon: '🌈',
    type: 'reflect',
    fields: [
      'Where were you, and when?',
      'Who was there, and what were you doing?',
      'What did it feel like in your body — and why does it still matter to you?',
    ],
    accent: '#7cc6ff',
  },
  {
    id: 'letter-future',
    title: 'A letter to tomorrow-me',
    intro:
      'Write a short, kind note to yourself for the day after the storm passes. What do you want her to remember about how strong she was today?',
    icon: '✉️',
    type: 'reflect',
    fields: [
      'What got hard today, honestly?',
      'What did you do to take care of yourself anyway?',
      'What do you want to remind future-you of?',
    ],
    accent: '#a99bff',
  },
  {
    id: 'looking-forward',
    title: 'Small things to look forward to',
    intro:
      'List things — soon and far — that you are looking forward to. The brain calms when it can see good things ahead.',
    icon: '🔮',
    type: 'list',
    slots: 6,
    placeholder: 'I’m looking forward to…',
    accent: '#ffd166',
  },
]

export const WORKSHOP_BY_ID: Record<string, WorkshopPrompt> = Object.fromEntries(
  WORKSHOP_PROMPTS.map((p) => [p.id, p]),
)
