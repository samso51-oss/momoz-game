import { useState, useRef, useEffect, useCallback } from 'react'

const HOLD_DURATION = 3000 // 3 seconds

export default function CalinGame({ onSuccess, onFailure }) {
  const [progress, setProgress] = useState(0) // 0 to 100
  const [holding, setHolding] = useState(false)
  const holdStartRef = useRef(null)
  const animRef = useRef(null)
  const doneRef = useRef(false)

  useEffect(() => {
    function loop() {
      if (!holdStartRef.current || doneRef.current) {
        animRef.current = requestAnimationFrame(loop)
        return
      }
      const elapsed = Date.now() - holdStartRef.current
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100)
      setProgress(pct)

      if (pct >= 100) {
        doneRef.current = true
        onSuccess()
        return
      }

      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [onSuccess])

  const startHold = useCallback(() => {
    if (doneRef.current) return
    holdStartRef.current = Date.now()
    setHolding(true)
  }, [])

  const endHold = useCallback(() => {
    if (doneRef.current) return
    holdStartRef.current = null
    setHolding(false)

    if (progress < 100) {
      doneRef.current = true
      onFailure('Lache trop tot ! Rate !')
    }
  }, [progress, onFailure])

  return (
    <div
      className="screen minigame-screen"
      style={{ justifyContent: 'center', gap: 20, userSelect: 'none' }}
    >
      <h2 style={{ color: '#fff', fontSize: 20 }}>Fais un calin !</h2>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
        Maintiens appuye pendant 3 secondes
      </p>

      <div
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={(e) => { e.preventDefault(); startHold() }}
        onTouchEnd={(e) => { e.preventDefault(); endHold() }}
        style={{
          cursor: 'pointer',
          transform: holding ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.2s',
        }}
      >
        <img
          src="/assets/momoz-oeuf.jpg"
          alt="Momoz"
          style={{
            width: 140, height: 140, borderRadius: '50%', objectFit: 'cover',
            boxShadow: holding ? '0 0 30px rgba(62,207,207,0.6)' : '0 6px 20px rgba(0,0,0,0.2)',
          }}
        />
      </div>

      <div style={{
        width: '80%', maxWidth: 280, height: 20,
        background: 'rgba(255,255,255,0.3)', borderRadius: 10, overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`, height: '100%',
          background: progress >= 100 ? '#4CAF50' : '#3ECFCF',
          borderRadius: 10, transition: 'width 0.05s linear',
        }} />
      </div>

      <p style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
        {holding ? '...maintiens...' : 'Appuie sur le Momoz !'}
      </p>
    </div>
  )
}
