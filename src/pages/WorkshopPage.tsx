import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import { WORKSHOP_PROMPTS, WORKSHOP_BY_ID, type WorkshopPrompt } from '../lib/workshop'
import { format } from 'date-fns'

export default function WorkshopPage({ openPromptId }: { openPromptId?: string | null }) {
  const profile = useStore((s) => s.profile)
  const entries = useStore((s) => s.workshop)
  const [active, setActive] = useState<WorkshopPrompt | null>(
    openPromptId ? WORKSHOP_BY_ID[openPromptId] ?? null : null,
  )

  return (
    <div className="mx-auto max-w-md px-4 pb-36">
      <div className="safe-top px-1 pb-4 pt-3">
        <p className="eyebrow">A softer place to land</p>
        <h1 className="page-title mt-1">Workshop</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/55">
          Gentle writing to shift your brain toward what's good and lasting. Perfect for a tornado day.
        </p>
      </div>

      <div className="relative space-y-3">
        <div
          className="glow -left-10 top-6 h-40 w-40"
          style={{ background: 'radial-gradient(circle, rgba(255,209,102,0.35), transparent 65%)' }}
        />
        <div
          className="glow -right-8 bottom-4 h-44 w-44"
          style={{ background: 'radial-gradient(circle, rgba(255,143,177,0.3), transparent 65%)' }}
        />
        {WORKSHOP_PROMPTS.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActive(p)}
            className="card relative flex w-full items-center gap-4 p-4 text-left"
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl text-3xl shadow-card"
              style={{
                background: `linear-gradient(150deg, ${p.accent}30, ${p.accent}55)`,
              }}
            >
              {p.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold leading-tight text-ink">{p.title}</h3>
              <p className="mt-0.5 line-clamp-2 text-xs text-ink/50">{p.intro}</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-ink/35 shadow-card">
              ›
            </span>
          </motion.button>
        ))}
      </div>

      {entries.length > 0 && (
        <>
          <h2 className="eyebrow mb-3 mt-8 px-1">Your reflections</h2>
          <div className="space-y-3">
            {entries.map((e) => (
              <SavedEntry key={e.id} id={e.id} title={e.promptTitle} when={e.createdAt} answers={e.answers} />
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {active && (
          <PromptEditor
            prompt={active}
            household={profile?.household ?? []}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function SavedEntry({
  id,
  title,
  when,
  answers,
}: {
  id: string
  title: string
  when: number
  answers: Record<string, string[]>
}) {
  const del = useStore((s) => s.deleteWorkshopEntry)
  const [open, setOpen] = useState(false)
  return (
    <div className="card p-4">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <div>
          <h4 className="font-display text-base font-semibold text-ink">{title}</h4>
          <p className="text-xs text-ink/40">{format(when, 'MMM d, yyyy · h:mm a')}</p>
        </div>
        <span className="text-ink/30">{open ? '▴' : '▾'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3 border-t border-black/5 pt-3">
              {Object.entries(answers).map(([key, vals]) => {
                const filled = vals.filter((v) => v.trim())
                if (!filled.length) return null
                return (
                  <div key={key}>
                    <p className="mb-1 text-xs font-bold text-dusk">{key}</p>
                    <ul className="space-y-1">
                      {filled.map((v, i) => (
                        <li key={i} className="text-sm leading-relaxed text-ink/70">
                          • {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
              <button
                onClick={() => del(id)}
                className="mt-1 text-xs font-semibold text-rose/70"
              >
                Delete this reflection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PromptEditor({
  prompt,
  household,
  onClose,
}: {
  prompt: WorkshopPrompt
  household: string[]
  onClose: () => void
}) {
  const add = useStore((s) => s.addWorkshopEntry)
  const [answers, setAnswers] = useState<Record<string, string[]>>(() => initAnswers(prompt, household))
  const [saved, setSaved] = useState(false)

  const setAnswer = (key: string, idx: number, val: string) =>
    setAnswers((a) => {
      const next = { ...a, [key]: [...(a[key] ?? [])] }
      next[key][idx] = val
      return next
    })

  const save = () => {
    add({ promptId: prompt.id, promptTitle: prompt.title, answers })
    setSaved(true)
    setTimeout(onClose, 850)
  }

  const groups = buildGroups(prompt, household)

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-x-0 bottom-0 top-6 z-[70] mx-auto max-w-md overflow-y-auto rounded-t-5xl bg-white no-scrollbar"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      >
        <div className="sticky top-0 z-10 bg-white/90 px-6 pb-3 pt-4 backdrop-blur">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-black/10" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{prompt.icon}</span>
              <h2 className="font-display text-xl font-semibold leading-tight text-ink">{prompt.title}</h2>
            </div>
            <button onClick={onClose} className="rounded-full bg-black/5 px-3 py-1.5 text-sm font-semibold text-ink/50">
              Close
            </button>
          </div>
        </div>

        <div className="px-6 pb-36 pt-1">
          <p className="mb-5 text-[15px] leading-relaxed text-ink/60">{prompt.intro}</p>

          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.key}>
                {g.label && (
                  <h3 className="mb-2 font-display text-lg font-semibold" style={{ color: prompt.accent === '#ffd166' ? '#b8902a' : prompt.accent }}>
                    {g.label}
                  </h3>
                )}
                <div className="space-y-2">
                  {Array.from({ length: g.slots }).map((_, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="mt-3 w-5 shrink-0 text-right text-xs font-bold text-ink/30">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={g.long ? 3 : 1}
                        value={answers[g.key]?.[idx] ?? ''}
                        onChange={(e) => setAnswer(g.key, idx, e.target.value)}
                        placeholder={g.placeholder}
                        className="min-h-[44px] w-full resize-none rounded-2xl border border-black/5 bg-mist px-4 py-2.5 text-[15px] leading-relaxed text-ink outline-none focus:border-dusk/30 focus:bg-white focus:ring-2 focus:ring-dusk/20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-black/5 bg-white/95 px-6 pb-6 pt-3 backdrop-blur safe-bottom">
          <button
            onClick={save}
            disabled={saved}
            className="w-full rounded-full py-4 text-base font-bold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'linear-gradient(150deg, #7B6CF6, #6d5dfc 60%, #8a5fe0)' }}
          >
            {saved ? 'Saved 💛' : 'Save reflection'}
          </button>
        </div>
      </motion.div>
    </>
  )
}

interface Group {
  key: string
  label?: string
  slots: number
  placeholder?: string
  long?: boolean
}

function buildGroups(prompt: WorkshopPrompt, household: string[]): Group[] {
  if (prompt.type === 'per-person') {
    const people = household.length ? household : ['Someone you love']
    return people.map((p) => ({ key: p, label: p, slots: prompt.slots ?? 5, placeholder: prompt.placeholder }))
  }
  if (prompt.type === 'reflect') {
    return (prompt.fields ?? []).map((f) => ({ key: f, label: f, slots: 1, long: true }))
  }
  return [{ key: 'answer', slots: prompt.slots ?? 5, placeholder: prompt.placeholder }]
}

function initAnswers(prompt: WorkshopPrompt, household: string[]): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const g of buildGroups(prompt, household)) out[g.key] = new Array(g.slots).fill('')
  return out
}
