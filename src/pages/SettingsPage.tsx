import { useRef, useState } from 'react'
import { useStore } from '../store'
import { useModel } from '../lib/useModel'
import { format } from 'date-fns'
import Giraffe from '../components/Giraffe'
import { FONT_THEMES } from '../lib/fonts'

export default function SettingsPage() {
  const profile = useStore((s) => s.profile)
  const logs = useStore((s) => s.logs)
  const settings = useStore((s) => s.settings)
  const setSetting = useStore((s) => s.setSetting)
  const updateProfile = useStore((s) => s.updateProfile)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const resetAll = useStore((s) => s.resetAll)
  const model = useModel()
  const fileRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState('')

  const showToast = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(''), 2600)
  }

  const doExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tonis-weather-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Backup downloaded 💾')
  }

  const doImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const res = importData(String(reader.result))
      showToast(res.ok ? 'Backup restored 💛' : res.error ?? 'Could not import')
    }
    reader.readAsText(file)
  }

  const moodLogs = Object.values(logs).filter((l) => typeof l.mood === 'number').length

  return (
    <div className="mx-auto max-w-md px-4 pb-36">
      <div className="safe-top flex items-end justify-between px-1 pb-4 pt-3">
        <div>
          <p className="eyebrow">Settings & data</p>
          <h1 className="page-title mt-1">Me</h1>
        </div>
        <Giraffe size={56} wave={false} />
      </div>

      {/* Stats */}
      <div className="mb-3 grid grid-cols-3 gap-3">
        <Stat label="Days logged" value={Object.keys(logs).length} />
        <Stat label="Mood logs" value={moodLogs} />
        <Stat label="Cycles learned" value={model?.cyclesDetected ?? 0} />
      </div>

      {/* Profile */}
      {profile && (
        <Card title="Your cycle">
          <Row label="Name">
            <input
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-32 rounded-xl bg-mist px-3 py-1.5 text-right font-semibold text-ink outline-none"
            />
          </Row>
          <NumRow
            label="Cycle length"
            value={profile.avgCycleLength}
            suffix="days"
            onChange={(v) => updateProfile({ avgCycleLength: clamp(v, 21, 40) })}
          />
          <NumRow
            label="Period length"
            value={profile.avgPeriodLength}
            suffix="days"
            onChange={(v) => updateProfile({ avgPeriodLength: clamp(v, 2, 9) })}
          />
          <NumRow
            label="Luteal length"
            value={profile.lutealLength}
            suffix="days"
            onChange={(v) => updateProfile({ lutealLength: clamp(v, 10, 16) })}
          />
          <Row label="Last period start">
            <input
              type="date"
              value={profile.lastPeriodStart}
              onChange={(e) => updateProfile({ lastPeriodStart: e.target.value })}
              className="rounded-xl bg-mist px-3 py-1.5 text-sm font-semibold text-ink outline-none"
            />
          </Row>
          <Row label="PMDD severity">
            <select
              value={profile.pmddSeverity}
              onChange={(e) => updateProfile({ pmddSeverity: e.target.value as never })}
              className="rounded-xl bg-mist px-3 py-1.5 font-semibold text-ink outline-none"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </Row>
        </Card>
      )}

      {/* Household */}
      {profile && (
        <Card title="My people">
          <div className="flex flex-wrap gap-2">
            {profile.household.map((h) => (
              <span key={h} className="pill bg-rose/15 text-rose">
                {h}
                <button
                  onClick={() => updateProfile({ household: profile.household.filter((x) => x !== h) })}
                  className="ml-1 text-rose/60"
                >
                  ✕
                </button>
              </span>
            ))}
            <AddPerson
              onAdd={(name) =>
                !profile.household.includes(name) &&
                updateProfile({ household: [...profile.household, name] })
              }
            />
          </div>
        </Card>
      )}

      {/* Appearance / fonts */}
      <Card title="Font">
        <div className="grid grid-cols-2 gap-2.5">
          {FONT_THEMES.map((f) => {
            const active = settings.fontTheme === f.id
            return (
              <button
                key={f.id}
                onClick={() => setSetting('fontTheme', f.id)}
                className={`rounded-3xl border-2 p-3 text-left backdrop-blur transition active:scale-[0.97] ${
                  active ? 'border-dusk bg-dusk/5 shadow-card' : 'border-white/70 bg-white/60'
                }`}
              >
                <div className="text-2xl leading-tight text-ink" style={{ fontFamily: f.display }}>
                  Aa
                </div>
                <div className="mt-0.5 text-sm font-bold text-ink" style={{ fontFamily: f.sans }}>
                  {f.name}
                </div>
                <div className="text-[11px] text-ink/45" style={{ fontFamily: f.sans }}>
                  {f.blurb}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Preferences */}
      <Card title="Preferences">
        <Toggle
          label="Show hormone science"
          desc="Detailed levels & explanations on the home screen"
          on={settings.showScience}
          onToggle={() => setSetting('showScience', !settings.showScience)}
        />
        <Toggle
          label="Gigi's check-ins"
          desc="The giraffe pops in with help on hard days"
          on={settings.giraffeEnabled}
          onToggle={() => setSetting('giraffeEnabled', !settings.giraffeEnabled)}
        />
      </Card>

      {/* Backup */}
      <Card title="Backup & restore">
        <p className="mb-3 text-sm leading-relaxed text-ink/55">
          Your data lives privately on this device and stays even if you don't open the app for days.
          Export a backup file now and then so it's always safe — and to move it to a new phone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={doExport}
            className="flex-1 rounded-2xl py-3 text-sm font-bold text-white active:scale-95"
            style={{ background: 'linear-gradient(150deg, #7B6CF6, #6d5dfc 60%, #8a5fe0)' }}
          >
            ⬇️ Export backup
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 rounded-2xl border-2 border-dusk/20 bg-white py-3 text-sm font-bold text-dusk active:scale-95"
          >
            ⬆️ Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) doImport(f)
              e.target.value = ''
            }}
          />
        </div>
      </Card>

      <Card title="Danger zone">
        <DangerReset onReset={() => { resetAll(); showToast('Everything reset'); }} />
      </Card>

      <p className="mt-6 px-3 text-center text-xs leading-relaxed text-ink/35">
        Toni's Weather · made with 💛 for Toni. Supportive, not medical advice.
      </p>

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4">
          <div className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft">
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card flex flex-col items-center justify-center p-3">
      <span className="font-display text-2xl font-semibold text-ink">{value}</span>
      <span className="text-center text-[11px] font-semibold text-ink/45">{label}</span>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card mb-3 p-5">
      <h3 className="eyebrow mb-3">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[15px] font-semibold text-ink/70">{label}</span>
      {children}
    </div>
  )
}

function NumRow({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string
  value: number
  suffix: string
  onChange: (v: number) => void
}) {
  return (
    <Row label={label}>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(value - 1)} className="h-8 w-8 rounded-full bg-mist text-lg font-bold text-dusk active:scale-90">−</button>
        <span className="w-14 text-center font-bold text-ink">
          {value} <span className="text-xs font-normal text-ink/40">{suffix}</span>
        </span>
        <button onClick={() => onChange(value + 1)} className="h-8 w-8 rounded-full bg-mist text-lg font-bold text-dusk active:scale-90">+</button>
      </div>
    </Row>
  )
}

function Toggle({
  label,
  desc,
  on,
  onToggle,
}: {
  label: string
  desc: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1 pr-4">
        <p className="text-[15px] font-semibold text-ink/80">{label}</p>
        <p className="text-xs text-ink/45">{desc}</p>
      </div>
      <button onClick={onToggle} className={`relative h-8 w-14 shrink-0 rounded-full transition ${on ? 'bg-dusk' : 'bg-black/10'}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  )
}

function AddPerson({ onAdd }: { onAdd: (name: string) => void }) {
  const [val, setVal] = useState('')
  const [editing, setEditing] = useState(false)
  if (!editing)
    return (
      <button onClick={() => setEditing(true)} className="pill border-2 border-dashed border-rose/30 text-rose/70">
        + Add
      </button>
    )
  return (
    <input
      autoFocus
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => {
        if (val.trim()) onAdd(val.trim())
        setVal('')
        setEditing(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (val.trim()) onAdd(val.trim())
          setVal('')
          setEditing(false)
        }
      }}
      placeholder="Name"
      className="w-24 rounded-full bg-mist px-3 py-1 text-sm font-semibold text-ink outline-none"
    />
  )
}

function DangerReset({ onReset }: { onReset: () => void }) {
  const [confirm, setConfirm] = useState(false)
  if (!confirm)
    return (
      <button onClick={() => setConfirm(true)} className="text-sm font-semibold text-rose/70">
        Reset all data…
      </button>
    )
  return (
    <div className="flex items-center gap-3">
      <button onClick={onReset} className="rounded-2xl bg-rose px-4 py-2 text-sm font-bold text-white active:scale-95">
        Yes, erase everything
      </button>
      <button onClick={() => setConfirm(false)} className="text-sm font-semibold text-ink/50">
        Cancel
      </button>
    </div>
  )
}
