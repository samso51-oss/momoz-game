import { useState, useRef, useCallback } from 'react'

const TAPS_NEEDED = 5
const MIN_INTERVAL = 800
const MAX_INTERVAL = 1500

export default function BerceGame({ onSuccess, onFailure }) {
  const [taps, setTaps] = useState(0)
  const [message, setMessage] = useState('Tape a un rythme regulier...')
  const lastTapRef = useRef(null)
  const [bouncing, setBouncing] = useState(false)

  const handleTap = useCallback(() => {
    const now = Date.now()

    if (lastTapRef.current !== null) {
      const interval = now - lastTapRef.current
      if (interval < MIN_INTERVAL) {
        onFailure('Trop rapide ! Rate !')
        return
      }
      if (interval > MAX_INTERVAL) {
        onFailure('Trop lent ! Rate !')
        return
      }
    }

    lastTapRef.current = now
    const next = taps + 1
    setTaps(next)
    setBouncing(true)
    setTimeout(() => setBouncing(false), 200)

    if (next >= TAPS_NEEDED) {
      onSuccess()
    } else {
      setMessage(`Bien ! Continue... ${next}/${TAPS_NEEDED}`)
    }
  }, [taps, onSuccess, onFailure])

  return (
    <div className="screen minigame-screen" style={{ justifyContent: 'center', gap: 20 }}>
      <h2 style={{ color: '#fff', fontSize: 20 }}>Berce ton Momoz !</h2>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
        Tape 5 fois a rythme regulier (ni trop vite, ni trop lent)
      </p>

      <div
        onClick={handleTap}
        style={{
          cursor: 'pointer',
          transition: 'transform 0.15s',
          transform: bouncing ? 'scale(1.15)' : 'scale(1)',
          userSelect: 'none',
        }}
      >
        <img
          src="/assets/momoz-oeuf.jpg"
          alt="Momoz"
          style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }}
        />
      </div>

      <p style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{message}</p>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length: TAPS_NEEDED }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: i < taps ? '#3ECFCF' : 'rgba(255,255,255,0.3)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
