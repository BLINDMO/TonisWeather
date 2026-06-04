import { useMemo, useState } from 'react'
import type { CycleGeometry } from '../lib/hormones'
import { hormonesForCycleDay, HORMONES } from '../lib/hormones'
import type { HormoneLevels } from '../types'

interface Props {
  geo: CycleGeometry
  currentDay: number
}

const W = 360
const H = 170
const PAD_X = 14
const PAD_TOP = 14
const PAD_BOTTOM = 26

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

export default function HormoneChart({ geo, currentDay }: Props) {
  const [hidden, setHidden] = useState<Set<string>>(new Set(['fsh']))

  const { series, todayX } = useMemo(() => {
    const n = geo.cycleLength
    const x = (day: number) => PAD_X + ((day - 1) / (n - 1)) * (W - PAD_X * 2)
    const y = (v: number) => PAD_TOP + (1 - v) * (H - PAD_TOP - PAD_BOTTOM)
    const series = HORMONES.map((h) => {
      const pts = []
      for (let d = 1; d <= n; d++) {
        const levels: HormoneLevels = hormonesForCycleDay(d, geo)
        pts.push({ x: x(d), y: y(levels[h.key]) })
      }
      return { ...h, path: smoothPath(pts), area: smoothPath(pts) }
    })
    const cd = ((currentDay - 1) % n) + 1
    return { series, todayX: x(cd) }
  }, [geo, currentDay])

  const baseY = PAD_TOP + (H - PAD_TOP - PAD_BOTTOM)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`hg-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* ovulation marker */}
        <line
          x1={PAD_X + ((geo.ovulationDay - 1) / (geo.cycleLength - 1)) * (W - PAD_X * 2)}
          x2={PAD_X + ((geo.ovulationDay - 1) / (geo.cycleLength - 1)) * (W - PAD_X * 2)}
          y1={PAD_TOP}
          y2={baseY}
          stroke="#ffd166"
          strokeWidth="2"
          strokeDasharray="3 4"
          opacity="0.7"
        />

        {/* today marker */}
        <line x1={todayX} x2={todayX} y1={PAD_TOP - 4} y2={baseY} stroke="#2a2540" strokeWidth="2" opacity="0.85" />
        <circle cx={todayX} cy={PAD_TOP - 6} r="4" fill="#2a2540" />

        {/* areas + lines */}
        {series.map((s) =>
          hidden.has(s.key) ? null : (
            <g key={s.key}>
              {(s.key === 'estrogen' || s.key === 'progesterone') && (
                <path d={`${s.area} L ${W - PAD_X} ${baseY} L ${PAD_X} ${baseY} Z`} fill={`url(#hg-${s.key})`} />
              )}
              <path
                d={s.path}
                fill="none"
                stroke={s.color}
                strokeWidth={s.key === 'estrogen' || s.key === 'progesterone' ? 3 : 2}
                strokeLinecap="round"
                opacity={s.key === 'estrogen' || s.key === 'progesterone' ? 1 : 0.8}
              />
            </g>
          ),
        )}

        {/* x axis labels */}
        <text x={PAD_X} y={H - 6} fontSize="9" fill="#8a85a0">Day 1</text>
        <text
          x={PAD_X + ((geo.ovulationDay - 1) / (geo.cycleLength - 1)) * (W - PAD_X * 2)}
          y={H - 6}
          fontSize="9"
          fill="#b89a3a"
          textAnchor="middle"
        >
          Ovulation
        </text>
        <text x={W - PAD_X} y={H - 6} fontSize="9" fill="#8a85a0" textAnchor="end">
          Day {geo.cycleLength}
        </text>
      </svg>

      {/* legend / toggles */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {HORMONES.map((h) => {
          const off = hidden.has(h.key)
          return (
            <button
              key={h.key}
              onClick={() =>
                setHidden((prev) => {
                  const n = new Set(prev)
                  n.has(h.key) ? n.delete(h.key) : n.add(h.key)
                  return n
                })
              }
              className={`pill border transition ${
                off ? 'border-black/5 bg-black/5 text-ink/40' : 'border-black/5 bg-white text-ink/80'
              }`}
              style={off ? {} : { boxShadow: `inset 0 0 0 1.5px ${h.color}33` }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: off ? '#ccc' : h.color }} />
              {h.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
