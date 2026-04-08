import { useState, useMemo, useEffect, useRef } from 'react'
import { goodFood, junkFood } from '../data/foods.js'

function formatDelta(delta) {
  if (!delta) return ''
  const LABELS = { faim: '🍖', energie: '⚡', bonheur: '😊', sante: '❤️' }
  const parts = Object.entries(delta)
    .filter(([, v]) => v !== 0)
    .map(([k, v]) => `${LABELS[k]} ${v > 0 ? '+' : ''}${v}`)
  return parts.length ? '\n' + parts.join('  ') : ''
}

function getPersonalizedFoodMessage(isJunk, traits, delta) {
  let base
  if (!isJunk) {
    if (traits.includes('Tetu')) base = 'Bof... il mange quand même. 😒'
    else if (traits.includes('Gourmand')) base = 'Il fait la grimace mais avale quand même. 😤'
    else if (delta && delta.bonheur <= -10) base = 'Vraiment pas fan... mais c\'est bon pour lui ! 🥦'
    else base = 'Mange bien ! Santé au top 💪'
  } else {
    if (traits.includes('Gourmand')) base = 'TROP BON ! Son bonheur explose ! 🤩'
    else if (traits.includes('Tetu')) base = 'Personne peut l\'en empêcher. 😈'
    else if (delta && delta.bonheur >= 25) base = 'Aux anges ! Mais la santé... 🍔💥'
    else base = 'Un petit plaisir coupable 😅'
  }
  return base + formatDelta(delta)
}

const TAPS_REQUIRED = 5
const IDLE_TIMEOUT = 5000

export default function FoodScreen({ onFeed, onBack, traits = [], lastGaugeDelta }) {
  const [fed, setFed] = useState(null)
  const [message, setMessage] = useState(null)

  // Mini-game state
  const [eating, setEating] = useState(null) // { food, isJunk }
  const [tapProgress, setTapProgress] = useState(0)
  const [bouncing, setBouncing] = useState(false)
  const idleTimerRef = useRef(null)
  const pendingFoodRef = useRef(null)

  const allFoods = useMemo(() => {
    const foods = [
      ...goodFood.map((f) => ({ ...f, isJunk: false })),
      ...junkFood.map((f) => ({ ...f, isJunk: true })),
    ]
    return foods.sort(() => Math.random() - 0.5)
  }, [])

  // Reset idle timer on each tap
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      setEating(null)
      setTapProgress(0)
    }, IDLE_TIMEOUT)
  }

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  const handleSelectFood = (food) => {
    setEating(food)
    setTapProgress(0)
    resetIdleTimer()
  }

  const handleTapFood = () => {
    if (!eating) return
    const next = tapProgress + 1
    setTapProgress(next)
    setBouncing(true)
    setTimeout(() => setBouncing(false), 200)
    resetIdleTimer()

    if (next >= TAPS_REQUIRED) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      const foodData = { ...eating }
      onFeed(foodData, foodData.isJunk)
      setFed(foodData.id)
      setEating(null)
      pendingFoodRef.current = { isJunk: foodData.isJunk }
    }
  }

  // Quand lastGaugeDelta arrive, construire le message avec les vraies valeurs
  useEffect(() => {
    if (lastGaugeDelta && pendingFoodRef.current) {
      setMessage(getPersonalizedFoodMessage(pendingFoodRef.current.isJunk, traits, lastGaugeDelta))
      pendingFoodRef.current = null
    }
  }, [lastGaugeDelta, traits])

  // Auto-fermeture de secours à 5000ms
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => onBack(), 5000)
    return () => clearTimeout(timer)
  }, [message, onBack])

  if (message) {
    return (
      <div
        className="screen food-screen"
        onClick={onBack}
        style={{ cursor: 'pointer', justifyContent: 'center' }}
      >
        <div className="activity-message">
          <p>{message}</p>
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>Appuie pour continuer</p>
        </div>
      </div>
    )
  }

  if (eating) {
    const pct = (tapProgress / TAPS_REQUIRED) * 100
    return (
      <div className="screen food-screen" style={{ justifyContent: 'center', gap: 24 }}>
        <h2 style={{ color: '#fff', fontSize: 20 }}>Nourris ton Momoz !</h2>
        <div
          onClick={handleTapFood}
          style={{
            fontSize: 100,
            cursor: 'pointer',
            transition: 'transform 0.15s',
            transform: bouncing ? 'scale(1.3)' : 'scale(1)',
            userSelect: 'none',
          }}
        >
          {eating.emoji}
        </div>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
          Tape pour manger ! {tapProgress}/{TAPS_REQUIRED}
        </p>
        <div style={{
          width: '80%',
          maxWidth: 280,
          height: 16,
          background: 'rgba(255,255,255,0.3)',
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: '#3ECFCF',
            borderRadius: 10,
            transition: 'width 0.2s ease',
          }} />
        </div>
        <button
          className="btn-back"
          onClick={() => { setEating(null); setTapProgress(0); if (idleTimerRef.current) clearTimeout(idleTimerRef.current) }}
          style={{ marginTop: 8 }}
        >
          ← Annuler
        </button>
      </div>
    )
  }

  return (
    <div className="screen food-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>← Retour</button>
        <h2>Nourrir ton Momoz</h2>
      </div>

      <div className="food-grid">
        {allFoods.map((food) => (
          <button
            key={food.id}
            className={`food-btn ${fed === food.id ? 'fed' : ''} ${food.isJunk ? 'junk' : 'good'}`}
            onClick={() => handleSelectFood(food)}
            disabled={!!fed}
          >
            <span className="food-emoji">{food.emoji}</span>
            <span className="food-name">{food.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
