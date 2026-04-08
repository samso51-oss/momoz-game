import { useState, useEffect, useRef, useCallback } from 'react'

const HITS_NEEDED = 5
const PERIOD = 1500 // ms for full oscillation
const GREEN_ZONE = 0.3 // 30% of bar is green zone (center)

export default function PageGame({ onSuccess, onFailure }) {
  const [hits, setHits] = useState(0)
  const [cursorPos, setCursorPos] = useState(0) // 0 to 1
  const animRef = useRef(null)
  const startRef = useRef(Date.now())
  const doneRef = useRef(false)

  useEffect(() => {
    function loop() {
      const elapsed = Date.now() - startRef.current
      // Oscillate 0 -> 1 -> 0 using sine
      const pos = (Math.sin((elapsed / PERIOD) * Math.PI * 2) + 1) / 2
      setCursorPos(pos)
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  const handleTap = useCallback(() => {
    if (doneRef.current) return

    const inGreen = cursorPos >= (0.5 - GREEN_ZONE / 2) && cursorPos <= (0.5 + GREEN_ZONE / 2)

    if (!inGreen) {
      doneRef.current = true
      onFailure('Hors zone ! Rate !')
      return
    }

    const next = hits + 1
    setHits(next)
    if (next >= HITS_NEEDED) {
      doneRef.current = true
      onSuccess()
    }
  }, [cursorPos, hits, onSuccess, onFailure])

  const barWidth = 280
  const greenStart = (0.5 - GREEN_ZONE / 2) * barWidth
  const greenWidth = GREEN_ZONE * barWidth

  return (
    <div className="screen minigame-screen" style={{ justifyContent: 'center', gap: 20 }} onClick={handleTap}>
      <h2 style={{ color: '#fff', fontSize: 20 }}>Lis avec ton Momoz !</h2>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
        Tape quand le curseur est dans la zone verte ! {hits}/{HITS_NEEDED}
      </p>

      <div style={{
        width: barWidth, height: 40, background: 'rgba(255,255,255,0.2)',
        borderRadius: 10, position: 'relative', overflow: 'hidden', margin: '0 auto',
      }}>
        {/* Green zone */}
        <div style={{
          position: 'absolute', left: greenStart, width: greenWidth, height: '100%',
          background: 'rgba(76,175,80,0.4)', borderRadius: 4,
        }} />
        {/* Cursor */}
        <div style={{
          position: 'absolute', left: cursorPos * (barWidth - 6), top: 0,
          width: 6, height: '100%', background: '#fff', borderRadius: 3,
          transition: 'none',
        }} />
      </div>

      <p style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
        Tape !
      </p>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length: HITS_NEEDED }).map((_, i) => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: '50%',
            background: i < hits ? '#4CAF50' : 'rgba(255,255,255,0.3)',
          }} />
        ))}
      </div>
    </div>
  )
}
