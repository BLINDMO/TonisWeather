import { useEffect, useRef, useMemo, useState } from 'react'
import type { CycleGeometry } from '../lib/hormones'
import { hormonesForCycleDay, HORMONES } from '../lib/hormones'
import type { HormoneLevels } from '../types'

interface Props {
  geo: CycleGeometry
  currentDay: number
}

// Phase zone definitions
interface Zone {
  startDay: number
  endDay: number
  color: string
  label: string
  textColor: string
}

function getZones(geo: CycleGeometry): Zone[] {
  const { cycleLength, periodLength, ovulationDay } = geo
  return [
    {
      startDay: 1,
      endDay: periodLength,
      color: 'rgba(255,182,183,0.22)',
      label: 'Period',
      textColor: '#e05070',
    },
    {
      startDay: periodLength + 1,
      endDay: Math.max(periodLength + 1, ovulationDay - 2),
      color: 'rgba(160,230,200,0.20)',
      label: 'Follicular',
      textColor: '#2a9870',
    },
    {
      startDay: Math.max(periodLength + 1, ovulationDay - 1),
      endDay: ovulationDay + 1,
      color: 'rgba(255,218,100,0.30)',
      label: 'Fertile',
      textColor: '#b08000',
    },
    {
      startDay: ovulationDay + 2,
      endDay: cycleLength,
      color: 'rgba(188,172,255,0.20)',
      label: 'Luteal',
      textColor: '#6a50b8',
    },
  ].filter((z) => z.endDay >= z.startDay)
}

export default function HormoneChart({ geo, currentDay }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState<Set<string>>(new Set(['fsh']))

  // Pre-compute point series
  const series = useMemo(() => {
    return HORMONES.map((h) => {
      const pts: number[] = []
      for (let d = 1; d <= geo.cycleLength; d++) {
        const lv: HormoneLevels = hormonesForCycleDay(d, geo)
        pts.push(lv[h.key])
      }
      return { ...h, pts }
    })
  }, [geo])

  const zones = useMemo(() => getZones(geo), [geo])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
      const rect = wrap.getBoundingClientRect()
      const cw = rect.width
      const ch = Math.round(cw * 0.50) // ~2:1 aspect

      canvas.style.width  = `${cw}px`
      canvas.style.height = `${ch}px`
      canvas.width  = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const pl = 12, pr = 12, pt = 16, pb = 28
      const gw = cw - pl - pr
      const gh = ch - pt - pb
      const n  = geo.cycleLength

      const xOf = (day: number) => pl + ((day - 1) / (n - 1)) * gw
      const yOf = (v: number)   => pt + (1 - v) * gh

      // ── Clear
      ctx.clearRect(0, 0, cw, ch)

      // ── Background
      const bg = ctx.createLinearGradient(0, 0, 0, ch)
      bg.addColorStop(0, 'rgba(248,246,255,1)')
      bg.addColorStop(1, 'rgba(240,238,255,1)')
      ctx.fillStyle = bg
      ctx.roundRect(0, 0, cw, ch, 20)
      ctx.fill()

      // ── Phase zone bands
      for (const z of zones) {
        const x1 = xOf(z.startDay)
        const x2 = xOf(Math.min(z.endDay, n))
        ctx.fillStyle = z.color
        ctx.fillRect(x1, pt, x2 - x1, gh)
        // label at top
        ctx.fillStyle = z.textColor
        ctx.font = `bold 8px system-ui`
        ctx.textAlign = 'center'
        ctx.globalAlpha = 0.72
        ctx.fillText(z.label.toUpperCase(), (x1 + x2) / 2, pt + 9)
        ctx.globalAlpha = 1
      }

      // ── Subtle grid lines (horizontal)
      ctx.strokeStyle = 'rgba(42,37,64,0.05)'
      ctx.lineWidth = 1
      for (let i = 1; i <= 4; i++) {
        const y = yOf(i / 4)
        ctx.beginPath()
        ctx.moveTo(pl, y)
        ctx.lineTo(pl + gw, y)
        ctx.stroke()
      }

      // ── Ovulation dashed line
      const ovX = xOf(geo.ovulationDay)
      ctx.save()
      ctx.setLineDash([3, 5])
      ctx.strokeStyle = 'rgba(198,158,28,0.55)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(ovX, pt)
      ctx.lineTo(ovX, pt + gh)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()

      // Helper: build cardinal spline path
      const buildPath = (pts: number[]) => {
        const path = new Path2D()
        const n2 = pts.length
        if (n2 < 2) return path
        path.moveTo(xOf(1), yOf(pts[0]))
        for (let i = 0; i < n2 - 1; i++) {
          const p0 = pts[Math.max(i - 1, 0)]
          const p1 = pts[i]
          const p2 = pts[i + 1]
          const p3 = pts[Math.min(i + 2, n2 - 1)]
          const x1 = xOf(i + 1)
          const x2 = xOf(i + 2)
          const cp1x = x1 + (xOf(i + 2) - xOf(i)) / 6
          const cp1y = yOf(p1) + (yOf(p2) - yOf(p0)) / 6
          const cp2x = x2 - (xOf(i + 3) - xOf(i + 1)) / 6
          const cp2y = yOf(p2) - (yOf(p3) - yOf(p1)) / 6
          path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, yOf(p2))
        }
        return path
      }

      // ── Draw filled areas for E2 and P4 first
      for (const s of series) {
        if (hidden.has(s.key)) continue
        if (s.key !== 'estrogen' && s.key !== 'progesterone') continue
        const path = buildPath(s.pts)
        // Close area path
        const area = new Path2D(path)
        area.lineTo(xOf(n), pt + gh)
        area.lineTo(xOf(1), pt + gh)
        area.closePath()

        const grad = ctx.createLinearGradient(0, pt, 0, pt + gh)
        grad.addColorStop(0,   s.color + '50')
        grad.addColorStop(0.6, s.color + '18')
        grad.addColorStop(1,   s.color + '00')
        ctx.fillStyle = grad
        ctx.fill(area)
      }

      // ── Draw all lines
      for (const s of series) {
        if (hidden.has(s.key)) continue
        const path = buildPath(s.pts)
        const isMain = s.key === 'estrogen' || s.key === 'progesterone'
        ctx.save()
        if (isMain) {
          ctx.shadowColor = s.color + '70'
          ctx.shadowBlur = 6
        }
        ctx.strokeStyle = s.color
        ctx.lineWidth = isMain ? 2.5 : 1.6
        ctx.lineJoin = 'round'
        ctx.lineCap  = 'round'
        ctx.globalAlpha = isMain ? 1 : 0.75
        ctx.stroke(path)
        ctx.restore()
      }

      // ── Today marker
      const cd = ((currentDay - 1) % n) + 1
      const todayX = xOf(cd)
      ctx.save()
      // stem
      ctx.strokeStyle = 'rgba(42,37,64,0.18)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(todayX, pt - 2)
      ctx.lineTo(todayX, pt + gh)
      ctx.stroke()
      // glow ring
      ctx.shadowColor = '#6d5dfc'
      ctx.shadowBlur  = 14
      ctx.fillStyle   = '#6d5dfc'
      ctx.beginPath()
      ctx.arc(todayX, pt - 4, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      // inner white dot
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(todayX, pt - 4, 2.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // ── X-axis labels
      ctx.textAlign = 'start'
      ctx.font = '9px system-ui'
      ctx.fillStyle = 'rgba(138,133,160,0.85)'
      ctx.fillText('Day 1', pl, ch - 8)

      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(184,154,58,0.85)'
      ctx.fillText('Ovulation', ovX, ch - 8)

      ctx.textAlign = 'end'
      ctx.fillStyle = 'rgba(138,133,160,0.85)'
      ctx.fillText(`Day ${n}`, pl + gw, ch - 8)
    }

    render()

    const ro = new ResizeObserver(render)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [series, zones, hidden, geo, currentDay])

  return (
    <div>
      <div ref={wrapRef} className="w-full">
        <canvas ref={canvasRef} className="block w-full rounded-2xl" />
      </div>

      {/* Legend toggles */}
      <div className="mt-3 flex flex-wrap gap-1.5">
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
                off
                  ? 'border-black/5 bg-black/5 text-ink/40'
                  : 'border-black/5 bg-white text-ink/80 shadow-sm'
              }`}
              style={off ? {} : { boxShadow: `inset 0 0 0 1.5px ${h.color}40, 0 1px 4px rgba(0,0,0,0.06)` }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: off ? '#ccc' : h.color, boxShadow: off ? 'none' : `0 0 5px ${h.color}80` }}
              />
              {h.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
