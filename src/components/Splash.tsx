import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LogoMark } from './Logo'

export default function Splash({ minDuration = 2800 }: { minDuration?: number }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShow(false), minDuration)
    return () => clearTimeout(t)
  }, [minDuration])

  const word = "Toni's Weather"

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
        >
          {/* Canvas: aurora night sky that breaks into dawn */}
          <SplashCanvas duration={minDuration} />

          {/* Soft warm bloom behind the logo */}
          <motion.div
            className="pointer-events-none absolute top-[30%] h-[520px] w-[520px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,210,100,0.32) 0%, transparent 60%)',
            }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.2, 1], opacity: [0, 0.9, 0.55] }}
            transition={{ duration: 2.8, ease: 'easeOut' }}
          />

          {/* Glowing motes in brand colours */}
          {Array.from({ length: 14 }).map((_, i) => {
            const palette = ['#FFD166', '#FF8FB1', '#B09CF0', '#7EC8E3']
            const color = palette[i % palette.length]
            const sz = 3 + (i % 4)
            return (
              <motion.span
                key={`m${i}`}
                className="pointer-events-none absolute rounded-full"
                style={{
                  left: `${4 + i * 6.8}%`,
                  bottom: `${6 + (i % 5) * 4}%`,
                  width: sz,
                  height: sz,
                  background: color,
                  filter: `blur(${sz > 4 ? 1.5 : 0.5}px)`,
                  boxShadow: `0 0 ${sz * 4}px ${color}`,
                }}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: [0, -(110 + i * 14)] }}
                transition={{
                  duration: 2.6 + (i % 5) * 0.45,
                  delay: 0.25 + i * 0.1,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            )
          })}

          {/* Logo: light-burst on entry, then gentle float */}
          <motion.div
            initial={{ opacity: 0, y: 52, scale: 0.58, rotate: -11 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 130, damping: 14, delay: 0.04 }}
            className="relative"
          >
            {/* Burst of light at the moment the logo arrives */}
            <motion.div
              className="pointer-events-none absolute inset-[-40px] rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,235,145,0.95) 0%, rgba(255,200,80,0.45) 40%, transparent 70%)',
              }}
              initial={{ scale: 0.15, opacity: 0 }}
              animate={{ scale: [0.15, 2.8, 0.2], opacity: [0, 1, 0] }}
              transition={{ duration: 0.85, delay: 0.52, ease: 'easeOut' }}
            />
            <motion.div
              animate={{ y: [0, -11, 0] }}
              transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="drop-shadow-[0_28px_70px_rgba(0,0,0,0.55)]"
            >
              <LogoMark size={170} />
            </motion.div>
          </motion.div>

          {/* Wordmark: letters rise one by one */}
          <div className="relative mt-7 flex">
            {word.split('').map((ch, i) => (
              <motion.span
                key={i}
                className="font-display text-[2rem] font-semibold text-white"
                style={{ textShadow: '0 3px 20px rgba(0,0,0,0.45)', whiteSpace: 'pre' }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.40 + i * 0.044,
                  type: 'spring',
                  stiffness: 210,
                  damping: 16,
                }}
              >
                {ch}
              </motion.span>
            ))}
          </div>

          <motion.p
            className="relative mt-2 text-[10px] font-bold tracking-[0.25em] text-white/58"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.96, duration: 0.55 }}
          >
            YOUR FORECAST FOR BODY &amp; MOOD
          </motion.p>

          {/* Tri-colour progress bar */}
          <motion.div
            className="relative mt-9 h-[3px] w-44 overflow-hidden rounded-full bg-white/14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FFD166, #FF8FB1, #9A7CF0)' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: minDuration / 1000 - 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Canvas aurora dawn background ───────────────────────────────────────────

function SplashCanvas({ duration }: { duration: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    // alpha:false avoids per-pixel compositing against what's below — measurable
    // perf improvement for a fullscreen canvas that always paints a full background.
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let W = 0, H = 0
    let raf = 0
    // Start clock at effect mount so no frames are wasted while canvas sizes up.
    const startTs = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      // Use window dimensions directly — the canvas is always fixed inset-0.
      W = window.innerWidth
      H = window.innerHeight
      canvas.width  = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    const lc = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, t: number, a = 1) =>
      `rgba(${Math.round(lerp(r1,r2,t))},${Math.round(lerp(g1,g2,t))},${Math.round(lerp(b1,b2,t))},${a})`

    // Stars — fixed layout, twinkle animated
    const stars = [
      { x:0.08, y:0.07, r:1.8, ph:0.31 }, { x:0.22, y:0.12, r:1.2, ph:1.14 },
      { x:0.41, y:0.05, r:2.0, ph:2.01 }, { x:0.58, y:0.09, r:1.5, ph:0.72 },
      { x:0.74, y:0.14, r:1.3, ph:1.63 }, { x:0.91, y:0.08, r:1.6, ph:0.09 },
      { x:0.14, y:0.22, r:1.0, ph:2.52 }, { x:0.34, y:0.17, r:1.7, ph:1.77 },
      { x:0.52, y:0.24, r:1.4, ph:0.44 }, { x:0.68, y:0.19, r:1.1, ph:1.97 },
      { x:0.85, y:0.27, r:1.9, ph:3.15 }, { x:0.05, y:0.35, r:1.3, ph:0.88 },
      { x:0.28, y:0.30, r:1.5, ph:2.33 }, { x:0.47, y:0.38, r:1.2, ph:1.41 },
      { x:0.63, y:0.33, r:1.8, ph:0.65 }, { x:0.80, y:0.41, r:1.0, ph:2.78 },
      { x:0.96, y:0.20, r:1.4, ph:1.22 }, { x:0.38, y:0.44, r:1.6, ph:3.55 },
    ]

    // Aurora ribbons — screen-blend sinusoidal bands
    const ribbons = [
      { yf:0.28, amp:0.07, freq:2.0, spd:0.35, ph:0.0,  r:55,  g:220, b:185, th:0.055 },
      { yf:0.40, amp:0.09, freq:1.6, spd:0.28, ph:2.4,  r:155, g:80,  b:250, th:0.065 },
      { yf:0.19, amp:0.055,freq:2.7, spd:0.42, ph:4.8,  r:255, g:100, b:155, th:0.040 },
    ]

    const render = (ts: number) => {
      raf = requestAnimationFrame(render)
      if (W === 0 || H === 0) return
      const elapsed = (ts - startTs) / 1000
      const progress = Math.min(elapsed / (duration / 1000), 1)
      const skyP = ease(Math.max(0, Math.min((progress - 0.08) / 0.74, 1)))

      ctx.clearRect(0, 0, W, H)

      // ── Sky: night purple → dawn warm rose/amber ──
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0,    lc(10,8,40,  60,48,165,  skyP))
      sky.addColorStop(0.35, lc(22,18,65, 115,95,210, skyP))
      sky.addColorStop(0.68, lc(58,28,95, 210,140,230,skyP))
      sky.addColorStop(0.87, lc(55,15,72, 255,158,115,skyP))
      sky.addColorStop(1,    lc(40,10,55, 255,205,140,skyP))
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      // ── Aurora ribbons (screen blend, vanish as dawn arrives) ──
      const auroraAlpha = Math.max(0, 1 - skyP * 1.65) * 0.75
      if (auroraAlpha > 0.005) {
        ctx.globalCompositeOperation = 'screen'
        for (const rib of ribbons) {
          const cy = H * rib.yf
          const amp = H * rib.amp
          const thick = H * rib.th
          const N = 64
          const dx = W / N
          const wt = (px: number) => cy - thick / 2 + amp * Math.sin((px / W) * Math.PI * rib.freq + rib.ph + elapsed * rib.spd)
          const wb = (px: number) => cy + thick / 2 + amp * Math.sin((px / W) * Math.PI * rib.freq + rib.ph + elapsed * rib.spd + 0.48)

          ctx.beginPath()
          ctx.moveTo(0, wt(0))
          for (let i = 1; i <= N; i++) ctx.lineTo(i * dx, wt(i * dx))
          for (let i = N; i >= 0; i--) ctx.lineTo(i * dx, wb(i * dx))
          ctx.closePath()

          const grad = ctx.createLinearGradient(0, cy - thick, 0, cy + thick)
          grad.addColorStop(0,   `rgba(${rib.r},${rib.g},${rib.b},0)`)
          grad.addColorStop(0.5, `rgba(${rib.r},${rib.g},${rib.b},${auroraAlpha})`)
          grad.addColorStop(1,   `rgba(${rib.r},${rib.g},${rib.b},0)`)
          ctx.fillStyle = grad
          ctx.fill()
        }
        ctx.globalCompositeOperation = 'source-over'
      }

      // ── Rising sun glow at horizon ──
      const sunAlpha = Math.min(skyP * 1.5, 1)
      if (sunAlpha > 0.01) {
        const sunY = H * (1.06 - 0.09 * skyP)
        ctx.globalCompositeOperation = 'screen'
        const sg = ctx.createRadialGradient(W / 2, sunY, 0, W / 2, sunY, W * 0.75)
        sg.addColorStop(0,    `rgba(255,200,80,${0.58 * sunAlpha})`)
        sg.addColorStop(0.28, `rgba(255,130,55,${0.36 * sunAlpha})`)
        sg.addColorStop(0.62, `rgba(255,80,38,${0.12 * sunAlpha})`)
        sg.addColorStop(1,    'rgba(255,50,20,0)')
        ctx.fillStyle = sg
        ctx.fillRect(0, 0, W, H)
        ctx.globalCompositeOperation = 'source-over'
      }

      // ── Stars: twinkle and fade with the dawn ──
      const starFade = Math.max(0, 1 - skyP * 2.5)
      if (starFade > 0.015) {
        for (const s of stars) {
          const twinkle = 0.42 + 0.58 * Math.sin(elapsed * 2.3 + s.ph)
          const a = starFade * (0.28 + 0.72 * twinkle)
          const sx = s.x * W, sy = s.y * H

          if (s.r > 1.5) {
            const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 7)
            halo.addColorStop(0, `rgba(200,218,255,${a * 0.32})`)
            halo.addColorStop(1, 'rgba(200,218,255,0)')
            ctx.fillStyle = halo
            ctx.beginPath()
            ctx.arc(sx, sy, s.r * 7, 0, Math.PI * 2)
            ctx.fill()
          }

          ctx.beginPath()
          ctx.arc(sx, sy, s.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${a})`
          ctx.fill()
        }
      }

      // ── Vignette (multiply) ──
      ctx.globalCompositeOperation = 'multiply'
      const vig = ctx.createRadialGradient(W / 2, H * 0.4, H * 0.12, W / 2, H * 0.4, H)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,0,0.52)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'source-over'

    }

    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [duration])

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />
}
