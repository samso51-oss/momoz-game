import { useState, useEffect, useCallback } from 'react'

const COLORS = [
  { emoji: '🔴', name: 'rouge', bg: '#F44336' },
  { emoji: '🔵', name: 'bleu', bg: '#2196F3' },
  { emoji: '🟡', name: 'jaune', bg: '#FFEB3B' },
  { emoji: '🟢', name: 'vert', bg: '#4CAF50' },
  { emoji: '🟣', name: 'violet', bg: '#9C27B0' },
]

function generateSequence(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * COLORS.length))
}

export default function SimonGame({ onSuccess, onFailure }) {
  const [round, setRound] = useState(0) // 0, 1, 2
  const [sequence, setSequence] = useState(() => generateSequence(3))
  const [phase, setPhase] = useState('showing') // 'showing' | 'input' | 'result'
  const [showIndex, setShowIndex] = useState(0)
  const [inputIndex, setInputIndex] = useState(0)
  const [flash, setFlash] = useState(null)

  const currentLength = 3 + round // 3, 4, 5

  // Show sequence animation
  useEffect(() => {
    if (phase !== 'showing') return
    if (showIndex >= currentLength) {
      setPhase('input')
      setInputIndex(0)
      return
    }
    const timer = setTimeout(() => {
      setFlash(sequence[showIndex])
      setTimeout(() => {
        setFlash(null)
        setShowIndex((i) => i + 1)
      }, 500)
    }, 300)
    return () => clearTimeout(timer)
  }, [phase, showIndex, currentLength, sequence])

  const handleTap = useCallback((colorIdx) => {
    if (phase !== 'input') return

    if (colorIdx !== sequence[inputIndex]) {
      onFailure('Rate !')
      return
    }

    const nextInput = inputIndex + 1
    if (nextInput >= currentLength) {
      // Round complete
      const nextRound = round + 1
      if (nextRound >= 3) {
        onSuccess()
      } else {
        setRound(nextRound)
        setSequence(generateSequence(3 + nextRound))
        setShowIndex(0)
        setInputIndex(0)
        setPhase('showing')
      }
    } else {
      setInputIndex(nextInput)
    }
  }, [phase, sequence, inputIndex, currentLength, round, onSuccess, onFailure])

  return (
    <div className="screen minigame-screen" style={{ justifyContent: 'center', gap: 20 }}>
      <h2 style={{ color: '#fff', fontSize: 20 }}>Simon ! Round {round + 1}/3</h2>

      {phase === 'showing' && (
        <div style={{ display: 'flex', gap: 12, fontSize: 48, justifyContent: 'center', minHeight: 60 }}>
          {flash !== null && <span style={{ animation: 'feedPop 0.4s ease' }}>{COLORS[flash].emoji}</span>}
        </div>
      )}

      {phase === 'showing' && (
        <p style={{ color: '#fff', fontWeight: 700 }}>Memorise la sequence...</p>
      )}

      {phase === 'input' && (
        <>
          <p style={{ color: '#fff', fontWeight: 700 }}>
            A toi ! {inputIndex}/{currentLength}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {COLORS.map((c, i) => (
              <button
                key={i}
                onClick={() => handleTap(i)}
                style={{
                  fontSize: 40,
                  padding: '12px 16px',
                  borderRadius: 16,
                  border: 'none',
                  background: 'rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                }}
              >
                {c.emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
