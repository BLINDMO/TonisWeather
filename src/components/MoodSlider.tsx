interface Props {
  value: number
  onChange: (v: number) => void
}

const FACES = ['😭', '😢', '😞', '😕', '😐', '🙂', '😊', '😄', '🤩', '🥳']

export function moodFace(v: number): string {
  return FACES[Math.min(9, Math.max(1, Math.round(v))) - 1]
}

export function moodLabel(v: number): string {
  if (v <= 2) return 'Out of control'
  if (v <= 4) return 'Struggling'
  if (v <= 5) return 'Low'
  if (v <= 6) return 'Okay'
  if (v <= 8) return 'Good'
  return 'Content & happy'
}

const trackColor = (v: number) => {
  // red → amber → green across 1..10
  if (v <= 3) return '#ff8fb1'
  if (v <= 5) return '#ffb877'
  if (v <= 7) return '#ffd166'
  return '#7bd6a8'
}

export default function MoodSlider({ value, onChange }: Props) {
  const pct = ((value - 1) / 9) * 100
  const c = trackColor(value)
  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-5xl leading-none">{moodFace(value)}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-ink">{value}<span className="text-lg text-ink/40">/10</span></div>
          <div className="text-sm font-semibold" style={{ color: c }}>{moodLabel(value)}</div>
        </div>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mood-slider"
        style={{
          background: `linear-gradient(90deg, ${c} ${pct}%, #ece9f7 ${pct}%)`,
        }}
      />
      <div className="mt-1.5 flex justify-between px-0.5 text-[10px] font-semibold text-ink/35">
        <span>1 · hardest</span>
        <span>10 · best</span>
      </div>
    </div>
  )
}
