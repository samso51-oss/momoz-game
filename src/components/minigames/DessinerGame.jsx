import { useState, useRef, useEffect, useCallback } from 'react'

const CANVAS_SIZE = 280
const POINT_RADIUS = 12
const SUCCESS_THRESHOLD = 0.6

// Heart shape points
function generateHeartPoints(cx, cy, scale) {
  const points = []
  const steps = 24
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const x = cx + scale * 16 * Math.pow(Math.sin(t), 3)
    const y = cy - scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    points.push({ x, y, covered: false })
  }
  return points
}

export default function DessinerGame({ onSuccess, onFailure }) {
  const canvasRef = useRef(null)
  const [points, setPoints] = useState(() =>
    generateHeartPoints(CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 10, 5)
  )
  const [drawing, setDrawing] = useState(false)
  const [coverage, setCoverage] = useState(0)
  const doneRef = useRef(false)
  const timeoutRef = useRef(null)

  // Start a 10s timeout
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true
        if (coverage >= SUCCESS_THRESHOLD * 100) onSuccess()
        else onFailure('Pas assez precis ! Rate !')
      }
    }, 10000)
    return () => clearTimeout(timeoutRef.current)
  }, []) // eslint-disable-line

  // Draw the template and covered points
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw dotted template
    for (const p of points) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, POINT_RADIUS, 0, Math.PI * 2)
      if (p.covered) {
        ctx.fillStyle = 'rgba(62, 207, 207, 0.7)'
        ctx.fill()
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.setLineDash([4, 4])
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.setLineDash([])
      }
    }
  }, [points])

  const checkCoverage = useCallback((x, y) => {
    if (doneRef.current) return

    let newCovered = 0
    const updated = points.map((p) => {
      if (p.covered) { newCovered++; return p }
      const dx = x - p.x
      const dy = y - p.y
      if (Math.sqrt(dx * dx + dy * dy) <= POINT_RADIUS * 1.5) {
        newCovered++
        return { ...p, covered: true }
      }
      return p
    })

    setPoints(updated)
    const pct = (newCovered / points.length) * 100
    setCoverage(pct)

    if (pct >= SUCCESS_THRESHOLD * 100 && !doneRef.current) {
      doneRef.current = true
      clearTimeout(timeoutRef.current)
      onSuccess()
    }
  }, [points, onSuccess])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = CANVAS_SIZE / rect.width
    const scaleY = CANVAS_SIZE / rect.height
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handleStart = (e) => {
    e.preventDefault()
    setDrawing(true)
    const pos = getPos(e)
    checkCoverage(pos.x, pos.y)
  }

  const handleMove = (e) => {
    e.preventDefault()
    if (!drawing) return
    const pos = getPos(e)
    checkCoverage(pos.x, pos.y)
  }

  const handleEnd = (e) => {
    e.preventDefault()
    setDrawing(false)
  }

  return (
    <div className="screen minigame-screen" style={{ justifyContent: 'center', gap: 16 }}>
      <h2 style={{ color: '#fff', fontSize: 20 }}>Dessine le coeur !</h2>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
        Trace par-dessus les pointilles
      </p>

      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{
          borderRadius: 16, background: 'rgba(0,0,0,0.2)',
          maxWidth: '100%', touchAction: 'none', cursor: 'crosshair',
        }}
      />

      <div style={{
        width: '80%', maxWidth: 280, height: 16,
        background: 'rgba(255,255,255,0.3)', borderRadius: 10, overflow: 'hidden',
      }}>
        <div style={{
          width: `${coverage}%`, height: '100%',
          background: coverage >= 60 ? '#4CAF50' : '#3ECFCF',
          borderRadius: 10, transition: 'width 0.15s ease',
        }} />
      </div>

      <p style={{ color: '#fff', fontWeight: 700 }}>{Math.round(coverage)}% couvert</p>
    </div>
  )
}
