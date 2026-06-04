// Selectable font themes. Each maps to CSS variables consumed by Tailwind's
// font-display / font-sans (see tailwind.config.js + index.css). All families
// are loaded in index.html.

export interface FontTheme {
  id: string
  name: string
  blurb: string
  /** CSS font-family value for headings. */
  display: string
  /** CSS font-family value for body text. */
  sans: string
}

const FALLBACK_SANS = `system-ui, -apple-system, 'Segoe UI', sans-serif`
const FALLBACK_DISPLAY = `Georgia, 'Times New Roman', serif`

export const FONT_THEMES: FontTheme[] = [
  {
    id: 'sunshine',
    name: 'Sunshine',
    blurb: 'Rounded & friendly',
    display: `'Baloo 2', ${FALLBACK_DISPLAY}`,
    sans: `'Nunito', ${FALLBACK_SANS}`,
  },
  {
    id: 'cloud',
    name: 'Cloud',
    blurb: 'Soft & airy',
    display: `'Quicksand', ${FALLBACK_SANS}`,
    sans: `'Quicksand', ${FALLBACK_SANS}`,
  },
  {
    id: 'meadow',
    name: 'Meadow',
    blurb: 'Modern & clean',
    display: `'Poppins', ${FALLBACK_SANS}`,
    sans: `'Inter', ${FALLBACK_SANS}`,
  },
  {
    id: 'editorial',
    name: 'Editorial',
    blurb: 'Elegant & classic',
    display: `'DM Serif Display', ${FALLBACK_DISPLAY}`,
    sans: `'DM Sans', ${FALLBACK_SANS}`,
  },
  {
    id: 'classic',
    name: 'Classic',
    blurb: 'The original look',
    display: `'Fraunces', ${FALLBACK_DISPLAY}`,
    sans: `'Plus Jakarta Sans', ${FALLBACK_SANS}`,
  },
]

export const DEFAULT_FONT_THEME = 'sunshine'

export const FONT_BY_ID: Record<string, FontTheme> = Object.fromEntries(
  FONT_THEMES.map((f) => [f.id, f]),
)

export function applyFontTheme(id: string) {
  const t = FONT_BY_ID[id] ?? FONT_BY_ID[DEFAULT_FONT_THEME]
  const root = document.documentElement
  root.style.setProperty('--font-display', t.display)
  root.style.setProperty('--font-sans', t.sans)
}
