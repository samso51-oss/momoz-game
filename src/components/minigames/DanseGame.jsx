import { useState, useEffect, useRef, useCallback } from 'react'

const NOTES = ['🎵', '🎶', '💃', '🌟', '✨']
const NOTE_COUNT = 5
const FALL_DURATION = 2000 // ms to fall from top to hit line
const HIT_WINDOW = 300 // ms tolerance
const NOTE_SPACING = 1200 // ms between notes
const HIT_LINE_Y = 85 // % from top

export default function DanseGame({ onSuccess, onFailure }) {
  const [notes, setNotes] = useState([])
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState(0)
  const [done, setDone] = useState(false)
  const processedRef = useRef(new Set())
  const startRef = useRef(Date.now())
  const animRef = useRef(null)

  // Initialize notes with spawn times
  useEffect(() => {
    const n = NOTES.slice(0, NOTE_COUNT).map((emoji, i) => ({
      id: i,
      emoji,
      spawnAt: 500 + i * NOTE_SPACING,
      hitAt: 500 + i * NOTE_SPACING + FALL_DURATION,
      hit: false,
      missed: false,
    }))
    setNotes(n)
  }, [])

  // Animation loop to check for missed notes
  useEffect(() => {
    function loop() {
      const now = Date.now() - startRef.current
      let newMissed = 0
      let changed = false

      setNotes((prev) => prev.map((n) => {
        if (!n.hit && !n.missed && now > n.hitAt + HIT_WINDOW) {
          if (!processedRef.current.has(n.id)) {
            processedRef.current.add(n.id)
            newMissed++
            changed = true
          }
          return { ...n, missed: true }
        }
        return n
      }))

      if (newMissed > 0) {
        setMissed((m) => m + newMissed)
      }

      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  // Check end condition
  useEffect(() => {
    if (done) return
    if (score + missed >= NOTE_COUNT) {
      setDone(true)
      setTimeout(() => {
        if (score >= 4) onSuccess()
        else onFailure('Rate !')
      }, 500)
    }
  }, [score, missed, done, onSuccess, onFailure])

  const handleTap = useCallback(() => {
    if (done) return
    const now = Date.now() - startRef.current

    setNotes((prev) => {
      // Find the closest unhit note within hit window
      let bestIdx = -1
      let bestDist = Infinity
      for (let i = 0; i < prev.length; i++) {
        const n = prev[i]
        if (n.hit || n.missed) continue
        const dist = Math.abs(now - n.hitAt)
        if (dist < HIT_WINDOW && dist < bestDist) {
          bestIdx = i
          bestDist = dist
        }
      }

      if (bestIdx >= 0) {
        processedRef.current.add(prev[bestIdx].id)
        setScore((s) => s + 1)
        return prev.map((n, i) => i === bestIdx ? { ...n, hit: true } : n)
      }
      return prev
    })
  }, [done])

  const now = Date.now() - startRef.current

  return (
    <div
      className="screen minigame-screen"
      style={{ justifyContent: 'flex-start', gap: 10, position: 'relative', overflow: 'hidden' }}
      onClick={handleTap}
      onTouchStart={(e) => { e.preventDefault(); handleTap() }}
    >
      <h2 style={{ color: '#fff', fontSize: 20, marginTop: 10 }}>Danse ! {score}/{NOTE_COUNT}</h2>

      {/* Play area */}
      <div style={{
        position: 'relative', width: '100%', flex: 1, maxHeight: 400, overflow: 'hidden',
      }}>
        {/* Hit line */}
        <div style={{
          position: 'absolute', top: `${HIT_LINE_Y}%`, left: '10%', right: '10%',
          height: 4, background: '#3ECFCF', borderRadius: 2,
        }} />
        <p style={{
          position: 'absolute', top: `${HIT_LINE_Y + 2}%`, width: '100%',
          textAlign: 'center', color: '#3ECFCF', fontWeight: 700, fontSize: 12,
        }}>
          Tape ici !
        </p>

        {/* Falling notes */}
        {notes.map((n) => {
          if (n.hit || n.missed) return null
          const elapsed = now - n.spawnAt
          if (elapsed < 0) return null
          const progress = Math.min(elapsed / FALL_DURATION, 1.2)
          const top = progress * HIT_LINE_Y

          return (
            <div
              key={n.id}
              style={{
                position: 'absolute',
                top: `${top}%`,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 40,
                transition: 'none',
              }}
            >
              {n.emoji}
            </div>
          )
        })}

        {/* Hit feedback */}
        {notes.map((n) => {
          if (!n.hit) return null
          return (
            <div
              key={`hit-${n.id}`}
              style={{
                position: 'absolute', top: `${HIT_LINE_Y - 5}%`, left: '50%',
                transform: 'translateX(-50%)', fontSize: 32,
                animation: 'feedPop 0.4s ease forwards', opacity: 0.8,
              }}
            >
              ✅
            </div>
          )
        })}
      </div>
    </div>
  )
}
