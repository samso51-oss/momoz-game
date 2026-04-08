import { useState, useEffect, useRef, useCallback } from 'react'

const TAPS_NEEDED = 8
const TIME_LIMIT = 5000

export default function FrotterGame({ onSuccess, onFailure }) {
  const [taps, setTaps] = useState(0)
  const [bouncing, setBouncing] = useState(false)
  const [timeLeft, setTimeLeft] = useState(5)
  const startRef = useRef(Date.now())
  const doneRef = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const remaining = Math.max(0, Math.ceil((TIME_LIMIT - elapsed) / 1000))
      setTimeLeft(remaining)

      if (elapsed >= TIME_LIMIT && !doneRef.current) {
        doneRef.current = true
        clearInterval(interval)
        onFailure('Temps ecoule ! Rate !')
      }
    }, 100)
    return () => clearInterval(interval)
  }, [onFailure])

  const handleTap = useCallback(() => {
    if (doneRef.current) return
    const next = taps + 1
    setTaps(next)
    setBouncing(true)
    setTimeout(() => setBouncing(false), 150)

    if (next >= TAPS_NEEDED) {
      doneRef.current = true
      onSuccess()
    }
  }, [taps, onSuccess])

  const pct = (taps / TAPS_NEEDED) * 100

  return (
    <div className="screen minigame-screen" style={{ justifyContent: 'center', gap: 20 }}>
      <h2 style={{ color: '#fff', fontSize: 20 }}>Frotte ton Momoz !</h2>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
        Tape 8 fois en moins de 5 secondes !
      </p>

      <p style={{ color: timeLeft <= 2 ? '#FFCDD2' : '#fff', fontWeight: 800, fontSize: 24 }}>
        {timeLeft}s
      </p>

      <div
        onClick={handleTap}
        style={{
          cursor: 'pointer',
          transition: 'transform 0.1s',
          transform: bouncing ? 'scale(1.2) rotate(10deg)' : 'scale(1)',
          userSelect: 'none',
        }}
      >
        <img
          src="/assets/momoz-oeuf.jpg"
          alt="Momoz"
          style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }}
        />
      </div>

      <p style={{ color: '#fff', fontWeight: 700 }}>{taps}/{TAPS_NEEDED}</p>

      <div style={{
        width: '80%', maxWidth: 280, height: 16,
        background: 'rgba(255,255,255,0.3)', borderRadius: 10, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: '#3ECFCF', borderRadius: 10, transition: 'width 0.15s ease',
        }} />
      </div>
    </div>
  )
}
