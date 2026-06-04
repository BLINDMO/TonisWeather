import { useEffect, useRef } from 'react'
import type { WeatherKind } from '../types'

// ─── Config per weather type ────────────────────────────────────────────────

interface Stop { p: number; c: string }
interface Wash { xf: number; yf: number; rf: number; color: string }
interface SunCfg { xf: number; yf: number; rf: number }
interface CloudCfg { xf: number; yf: number; wf: number; a: number; drift: number; seed: number; lit: boolean }

interface Cfg {
  sky: Stop[]
  washes: Wash[]
  sun: SunCfg | null
  rays: number          // god-ray intensity, 0 = none
  clouds: CloudCfg[]
  particles: 'none' | 'mote' | 'rain' | 'heavy' | 'swirl'
  lightning: boolean
  vignette: number
}

const CFGS: Record<WeatherKind, Cfg> = {
  bright: {
    sky: [
      { p: 0,    c: '#0869C0' },
      { p: 0.20, c: '#1480D8' },
      { p: 0.50, c: '#2E97EA' },
      { p: 0.80, c: '#F0BE52' },
      { p: 1,    c: '#FCEAB0' },
    ],
    washes: [
      { xf: 0.5,  yf: 0.04, rf: 0.70, color: 'rgba(255,238,175,0.48)' },
      { xf: 0.12, yf: 0.96, rf: 0.40, color: 'rgba(110,175,255,0.20)' },
    ],
    sun: { xf: 0.50, yf: 0.26, rf: 0.090 },
    rays: 0.65,
    clouds: [
      { xf: 0.16, yf: 0.62, wf: 0.24, a: 0.38, drift: 18, seed: 1, lit: true },
      { xf: 0.82, yf: 0.54, wf: 0.18, a: 0.30, drift: -22, seed: 3, lit: true },
    ],
    particles: 'mote',
    lightning: false,
    vignette: 0.14,
  },
  sunny: {
    sky: [
      { p: 0,    c: '#0860B4' },
      { p: 0.28, c: '#1272CC' },
      { p: 0.60, c: '#3090E0' },
      { p: 0.88, c: '#BAD9F0' },
      { p: 1,    c: '#DEF0FC' },
    ],
    washes: [
      { xf: 0.70, yf: 0.05, rf: 0.62, color: 'rgba(255,228,158,0.42)' },
      { xf: 0.28, yf: 0.98, rf: 0.55, color: 'rgba(255,255,255,0.30)' },
    ],
    sun: { xf: 0.72, yf: 0.30, rf: 0.080 },
    rays: 0.40,
    clouds: [
      { xf: 0.22, yf: 0.56, wf: 0.28, a: 0.62, drift: 14, seed: 2, lit: true },
      { xf: 0.68, yf: 0.66, wf: 0.20, a: 0.52, drift: -16, seed: 5, lit: true },
    ],
    particles: 'mote',
    lightning: false,
    vignette: 0.10,
  },
  partly: {
    sky: [
      { p: 0,    c: '#2070C8' },
      { p: 0.44, c: '#4290D8' },
      { p: 0.72, c: '#82B8E6' },
      { p: 0.90, c: '#C4DCF0' },
      { p: 1,    c: '#E2EFF8' },
    ],
    washes: [
      { xf: 0.74, yf: 0.08, rf: 0.58, color: 'rgba(255,215,135,0.36)' },
      { xf: 0.22, yf: 0.98, rf: 0.58, color: 'rgba(255,255,255,0.34)' },
    ],
    sun: { xf: 0.74, yf: 0.32, rf: 0.070 },
    rays: 0.24,
    clouds: [
      { xf: 0.30, yf: 0.40, wf: 0.40, a: 0.92, drift: -18, seed: 7, lit: true },
      { xf: 0.68, yf: 0.62, wf: 0.30, a: 0.82, drift:  14, seed: 4, lit: true },
      { xf: 0.10, yf: 0.72, wf: 0.22, a: 0.70, drift:  10, seed: 9, lit: true },
    ],
    particles: 'mote',
    lightning: false,
    vignette: 0.12,
  },
  cloudy: {
    sky: [
      { p: 0,    c: '#7E8EBA' },
      { p: 0.42, c: '#9AAAD0' },
      { p: 0.75, c: '#C0CCDF' },
      { p: 1,    c: '#D8E2EE' },
    ],
    washes: [
      { xf: 0.5, yf: 0.02, rf: 0.80, color: 'rgba(255,255,255,0.26)' },
    ],
    sun: null,
    rays: 0,
    clouds: [
      { xf: 0.20, yf: 0.20, wf: 0.46, a: 0.52, drift:  22, seed: 6, lit: false },
      { xf: 0.66, yf: 0.28, wf: 0.44, a: 0.60, drift: -28, seed: 2, lit: false },
      { xf: 0.42, yf: 0.58, wf: 0.52, a: 0.78, drift:  16, seed: 8, lit: false },
      { xf: 0.14, yf: 0.72, wf: 0.38, a: 0.68, drift: -14, seed: 3, lit: false },
      { xf: 0.80, yf: 0.68, wf: 0.40, a: 0.72, drift:  20, seed: 5, lit: false },
    ],
    particles: 'none',
    lightning: false,
    vignette: 0.18,
  },
  drizzle: {
    sky: [
      { p: 0,    c: '#5C6E9E' },
      { p: 0.42, c: '#7888B8' },
      { p: 0.78, c: '#A8B6CE' },
      { p: 1,    c: '#CACEDE' },
    ],
    washes: [
      { xf: 0.5, yf: 0.0, rf: 0.78, color: 'rgba(255,255,255,0.20)' },
    ],
    sun: null,
    rays: 0,
    clouds: [
      { xf: 0.18, yf: 0.18, wf: 0.48, a: 0.56, drift:  18, seed: 1, lit: false },
      { xf: 0.65, yf: 0.26, wf: 0.44, a: 0.64, drift: -20, seed: 4, lit: false },
      { xf: 0.40, yf: 0.52, wf: 0.52, a: 0.74, drift:  14, seed: 7, lit: false },
      { xf: 0.78, yf: 0.64, wf: 0.42, a: 0.68, drift: -16, seed: 9, lit: false },
    ],
    particles: 'rain',
    lightning: false,
    vignette: 0.22,
  },
  rain: {
    sky: [
      { p: 0,    c: '#2C3A62' },
      { p: 0.44, c: '#3E4E7A' },
      { p: 0.82, c: '#5C6A94' },
      { p: 1,    c: '#7882A8' },
    ],
    washes: [
      { xf: 0.5,  yf: 0.0,  rf: 0.70, color: 'rgba(160,182,228,0.20)' },
      { xf: 0.82, yf: 1.0,  rf: 0.55, color: 'rgba(14,20,44,0.32)'   },
    ],
    sun: null,
    rays: 0,
    clouds: [
      { xf: 0.18, yf: 0.14, wf: 0.56, a: 0.72, drift:  14, seed: 2, lit: false },
      { xf: 0.68, yf: 0.22, wf: 0.50, a: 0.78, drift: -18, seed: 6, lit: false },
      { xf: 0.40, yf: 0.48, wf: 0.56, a: 0.86, drift:  12, seed: 4, lit: false },
      { xf: 0.12, yf: 0.62, wf: 0.44, a: 0.80, drift: -12, seed: 8, lit: false },
      { xf: 0.78, yf: 0.70, wf: 0.48, a: 0.82, drift:  16, seed: 3, lit: false },
    ],
    particles: 'heavy',
    lightning: false,
    vignette: 0.28,
  },
  storm: {
    sky: [
      { p: 0,    c: '#1E1C36' },
      { p: 0.46, c: '#302C4C' },
      { p: 0.84, c: '#4C4472' },
      { p: 1,    c: '#5C5282' },
    ],
    washes: [
      { xf: 0.5,  yf: 0.0,  rf: 0.75, color: 'rgba(184,168,255,0.18)' },
      { xf: 0.76, yf: 1.0,  rf: 0.55, color: 'rgba(8,6,22,0.45)'     },
    ],
    sun: null,
    rays: 0,
    clouds: [
      { xf: 0.14, yf: 0.10, wf: 0.60, a: 0.80, drift:  10, seed: 5, lit: false },
      { xf: 0.66, yf: 0.18, wf: 0.56, a: 0.84, drift: -14, seed: 1, lit: false },
      { xf: 0.38, yf: 0.44, wf: 0.62, a: 0.92, drift:   8, seed: 7, lit: false },
      { xf: 0.10, yf: 0.60, wf: 0.50, a: 0.86, drift: -10, seed: 3, lit: false },
      { xf: 0.76, yf: 0.62, wf: 0.52, a: 0.88, drift:  12, seed: 9, lit: false },
    ],
    particles: 'heavy',
    lightning: true,
    vignette: 0.38,
  },
  tornado: {
    sky: [
      { p: 0,    c: '#181428' },
      { p: 0.48, c: '#28224A' },
      { p: 0.84, c: '#40386C' },
      { p: 1,    c: '#50477A' },
    ],
    washes: [
      { xf: 0.5,  yf: 0.0,  rf: 0.72, color: 'rgba(196,180,255,0.15)' },
      { xf: 0.68, yf: 1.0,  rf: 0.52, color: 'rgba(4,3,14,0.50)'     },
    ],
    sun: null,
    rays: 0,
    clouds: [
      { xf: 0.12, yf: 0.08, wf: 0.62, a: 0.84, drift:   6, seed: 4, lit: false },
      { xf: 0.65, yf: 0.16, wf: 0.58, a: 0.88, drift: -10, seed: 8, lit: false },
      { xf: 0.36, yf: 0.42, wf: 0.64, a: 0.94, drift:   7, seed: 2, lit: false },
      { xf: 0.14, yf: 0.56, wf: 0.52, a: 0.90, drift:  -8, seed: 6, lit: false },
      { xf: 0.74, yf: 0.60, wf: 0.54, a: 0.92, drift:   9, seed: 1, lit: false },
    ],
    particles: 'swirl',
    lightning: false,
    vignette: 0.46,
  },
}

// ─── Particle ────────────────────────────────────────────────────────────────

interface Particle {
  x: number; y: number
  vx: number; vy: number
  alpha: number; life: number; maxLife: number; size: number
}

function spawnParticle(kind: Cfg['particles'], w: number, h: number, idx: number): Particle {
  const r = ((idx * 1.6180339887) % 1)
  const r2 = ((idx * 2.2360679774) % 1)
  if (kind === 'mote') {
    return { x: r * w, y: h * 0.2 + r2 * h * 0.65, vx: Math.sin(idx * 2.4) * 0.3, vy: -(0.35 + r * 0.4), alpha: 0, life: r * 120, maxLife: 160 + r * 80, size: 1.5 + r2 * 2 }
  }
  if (kind === 'swirl') {
    return { x: w * 0.1 + r * w * 0.8, y: h * 0.1 + r2 * h * 0.8, vx: Math.sin(idx * 1.8) * 0.9, vy: Math.cos(idx * 1.4) * 0.55, alpha: 0.3 + r * 0.45, life: r * 80, maxLife: 100 + r * 60, size: 1.5 + r2 * 3 }
  }
  // rain / heavy
  const spd = kind === 'heavy' ? 7 + r * 4 : 4.5 + r * 3
  return { x: r * w, y: (r2 - 0.1) * h, vx: -spd * 0.24, vy: spd, alpha: 0.5 + r * 0.3, life: 0, maxLife: (h / spd) * 1.1, size: kind === 'heavy' ? 14 + r * 8 : 10 + r * 6 }
}

function stepParticle(p: Particle, kind: Cfg['particles'], w: number, h: number, idx: number): Particle {
  p.life += 1
  if (p.life > p.maxLife) return spawnParticle(kind, w, h, idx)
  if (kind === 'mote') {
    p.x += p.vx; p.y += p.vy
    const prog = p.life / p.maxLife
    p.alpha = (prog < 0.2 ? prog / 0.2 : prog > 0.8 ? (1 - prog) / 0.2 : 1) * 0.85
  } else if (kind === 'swirl') {
    p.vx += Math.sin(p.life * 0.1) * 0.045; p.vy += Math.cos(p.life * 0.08) * 0.035
    p.x += p.vx; p.y += p.vy
    p.alpha = 0.25 + Math.sin(p.life * 0.12) * 0.42
  } else {
    p.x += p.vx; p.y += p.vy
  }
  return p
}

// ─── Drawing primitives ───────────────────────────────────────────────────────

function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number, stops: Stop[]) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  for (const s of stops) g.addColorStop(s.p, s.c)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function drawWashes(ctx: CanvasRenderingContext2D, w: number, h: number, washes: Wash[]) {
  const maxD = Math.max(w, h)
  for (const wash of washes) {
    const gx = wash.xf * w, gy = wash.yf * h, gr = wash.rf * maxD
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr)
    g.addColorStop(0, wash.color)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
}

function drawRays(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, sx: number, sy: number, intensity: number) {
  const len = Math.hypot(w, h) * 1.7
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2 + Math.sin(t * 0.1 + i) * 0.025
    const halfSpread = len * (0.020 + Math.sin(t * 0.18 + i * 1.2) * 0.003)
    const ex = sx + Math.cos(angle) * len
    const ey = sy + Math.sin(angle) * len
    const px = Math.cos(angle + Math.PI / 2) * halfSpread
    const py = Math.sin(angle + Math.PI / 2) * halfSpread
    const alpha = intensity * (0.058 + Math.sin(t * 0.22 + i * 0.75) * 0.018)
    const g = ctx.createLinearGradient(sx, sy, ex, ey)
    g.addColorStop(0,   `rgba(255,248,200,${(alpha * 1.4).toFixed(3)})`)
    g.addColorStop(0.5, `rgba(255,235,160,${alpha.toFixed(3)})`)
    g.addColorStop(1,   'rgba(255,210,100,0)')
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(ex - px, ey - py)
    ctx.lineTo(ex + px, ey + py)
    ctx.closePath()
    ctx.fillStyle = g
    ctx.fill()
  }
  ctx.restore()
}

function drawSun(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, s: SunCfg) {
  const x = s.xf * w, y = s.yf * h, r = s.rf * Math.min(w, h)
  // Multi-pass corona (screen blend = real luminosity)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  for (let pass = 0; pass < 4; pass++) {
    const spread = r * (3.0 + pass * 2.5)
    const a = 0.28 - pass * 0.055
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, spread)
    g.addColorStop(0,   `rgba(255,228,80,${a.toFixed(3)})`)
    g.addColorStop(0.4, `rgba(255,180,30,${(a * 0.5).toFixed(3)})`)
    g.addColorStop(1,   'rgba(255,120,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(Math.max(0, x - spread), Math.max(0, y - spread), spread * 2, spread * 2)
  }
  ctx.restore()
  // Sun disc
  const disc = ctx.createRadialGradient(x, y, 0, x, y, r)
  disc.addColorStop(0,    '#FFFFF0')
  disc.addColorStop(0.25, '#FFE860')
  disc.addColorStop(0.65, '#FFCC30')
  disc.addColorStop(1,    '#FF9A00')
  ctx.fillStyle = disc
  ctx.beginPath()
  ctx.arc(x, y, r * (1 + Math.sin(t * 0.4) * 0.014), 0, Math.PI * 2)
  ctx.fill()
  // Lens glare
  ctx.save()
  ctx.globalAlpha = 0.40 + Math.sin(t * 0.7) * 0.06
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath()
  ctx.ellipse(x - r * 0.28, y - r * 0.30, r * 0.23, r * 0.13, -Math.PI / 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, cw: number, alpha: number, lit: boolean, t: number, seed: number) {
  const ch = cw * 0.44
  // Puffs: [dx, dy, radius] all relative to cloud dims
  const puffs: [number, number, number][] = [
    [0,         0,          ch * 0.95],
    [cw * 0.28, -ch * 0.24, ch * 0.86],
    [-cw * 0.28,-ch * 0.14, ch * 0.76],
    [cw * 0.52,  ch * 0.06, ch * 0.64],
    [-cw * 0.52, ch * 0.08, ch * 0.60],
    [cw * 0.14, -ch * 0.42, ch * 0.68],
  ]
  const tint = lit ? '255,255,255' : '155,165,195'
  ctx.save()
  ctx.shadowBlur = 22
  ctx.shadowColor = lit ? 'rgba(140,165,220,0.18)' : 'rgba(20,20,50,0.25)'
  ctx.shadowOffsetY = ch * 0.12
  for (const [dx, dy, r] of puffs) {
    const wobble = Math.sin(t * 0.06 + seed + dx * 0.01) * 0.04
    ctx.globalAlpha = alpha * (0.90 + wobble)
    const g = ctx.createRadialGradient(cx + dx, cy + dy, 0, cx + dx, cy + dy, r)
    g.addColorStop(0,   `rgba(${tint},1)`)
    g.addColorStop(0.62,`rgba(${tint},0.92)`)
    g.addColorStop(1,   `rgba(${tint},0)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawParticles(ctx: CanvasRenderingContext2D, ps: Particle[], kind: Cfg['particles']) {
  if (!ps.length || kind === 'none') return
  ctx.save()
  if (kind === 'mote') {
    ctx.shadowBlur = 8
    ctx.shadowColor = 'rgba(255,255,220,0.7)'
    for (const p of ps) {
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (kind === 'swirl') {
    for (const p of ps) {
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = 'rgba(210,200,255,0.85)'
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    ctx.strokeStyle = kind === 'heavy' ? 'rgba(228,220,255,0.68)' : 'rgba(210,225,255,0.62)'
    ctx.lineWidth = kind === 'heavy' ? 1.8 : 1.4
    ctx.lineCap = 'round'
    for (const p of ps) {
      ctx.globalAlpha = p.alpha
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x + p.vx * 1.2, p.y + p.size)
      ctx.stroke()
    }
  }
  ctx.shadowBlur = 0
  ctx.restore()
}

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number) {
  const g = ctx.createRadialGradient(w / 2, h * 0.4, h * 0.12, w / 2, h * 0.4, Math.max(w, h) * 0.75)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, `rgba(8,5,24,${strength})`)
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

// ─── Main scene ───────────────────────────────────────────────────────────────

function renderScene(
  ctx: CanvasRenderingContext2D,
  w: number, h: number, t: number,
  cfg: Cfg,
  particles: Particle[],
  lt: { v: number },
) {
  ctx.clearRect(0, 0, w, h)

  drawSky(ctx, w, h, cfg.sky)
  drawWashes(ctx, w, h, cfg.washes)

  if (cfg.rays > 0 && cfg.sun) {
    drawRays(ctx, w, h, t, cfg.sun.xf * w, cfg.sun.yf * h, cfg.rays)
  }
  if (cfg.sun) {
    drawSun(ctx, w, h, t, cfg.sun)
  }

  for (const c of cfg.clouds) {
    const x = c.xf * w + Math.sin(t * 0.055 + c.seed) * c.drift
    const y = c.yf * h + Math.cos(t * 0.038 + c.seed) * c.drift * 0.18
    drawCloud(ctx, x, y, c.wf * w, c.a, c.lit, t, c.seed)
  }

  if (cfg.particles !== 'none') {
    drawParticles(ctx, particles, cfg.particles)
  }

  if (cfg.lightning) {
    lt.v = (lt.v + 1 / 30) % 5.5
    const lv = lt.v
    const fa = lv > 3.2 && lv < 3.5 ? Math.sin(((lv - 3.2) / 0.3) * Math.PI) * 0.55
             : lv > 4.0 && lv < 4.15 ? Math.sin(((lv - 4.0) / 0.15) * Math.PI) * 0.28
             : 0
    if (fa > 0) {
      ctx.save()
      ctx.globalAlpha = fa
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.restore()
    }
  }

  // Top-edge sheen
  const sheen = ctx.createLinearGradient(0, 0, w, 0)
  sheen.addColorStop(0,   'rgba(255,255,255,0)')
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.55)')
  sheen.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, w, 1)

  drawVignette(ctx, w, h, cfg.vignette)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WeatherSky({ kind, className = '' }: { kind: WeatherKind; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cfg = CFGS[kind]
    const lt = { v: 0 }
    let dpr = 1
    let w = 0, h = 0

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width  = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    // Init particles
    const count = cfg.particles === 'none' ? 0 : cfg.particles === 'mote' ? 12 : cfg.particles === 'swirl' ? 16 : cfg.particles === 'rain' ? 22 : 32
    const particles: Particle[] = Array.from({ length: count }, (_, i) => spawnParticle(cfg.particles as Cfg['particles'], w, h, i))

    let t = 0
    let last = 0
    const INTERVAL = 1000 / 30
    let frame: number

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (now - last < INTERVAL) return
      last = now
      t += 1 / 30
      if (cfg.particles !== 'none') {
        for (let i = 0; i < particles.length; i++) {
          particles[i] = stepParticle(particles[i], cfg.particles, w, h, i)
        }
      }
      renderScene(ctx, w, h, t, cfg, particles, lt)
    }

    frame = requestAnimationFrame(tick)

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
    }
  }, [kind])

  return (
    <div className={`overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="grain-layer pointer-events-none absolute inset-0" />
    </div>
  )
}

// Re-export SKY and labels for mini-card gradients (unchanged consumers)
export { SKY, WEATHER_LABEL, WEATHER_EMOJI } from './WeatherScene'
