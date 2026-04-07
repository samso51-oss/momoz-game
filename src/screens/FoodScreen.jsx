import { useState, useMemo } from 'react'
import { goodFood, junkFood } from '../data/foods.js'

const GOOD_MESSAGES = [
  'Miam ! Ton Momoz adore ça ! 😋',
  'Trop bon ! Ton Momoz se régale ! 🥰',
  'Super choix ! Ton Momoz est content ! ✨',
  'Mmmh un délice ! Ton Momoz te remercie ! 🤩',
]

const JUNK_MESSAGES = [
  'Mmmh délicieux... mais pas très sage 😅',
  'Ton Momoz est ravi... mais sa santé trinque 🍔',
  'Interdit mais tellement bon ! 😈',
  'Un petit plaisir coupable ! 🤫',
]

function randomMsg(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function FoodScreen({ onFeed, onBack }) {
  const [fed, setFed] = useState(null)
  const [message, setMessage] = useState(null)

  const allFoods = useMemo(() => {
    const foods = [
      ...goodFood.map((f) => ({ ...f, isJunk: false })),
      ...junkFood.map((f) => ({ ...f, isJunk: true })),
    ]
    return foods.sort(() => Math.random() - 0.5)
  }, [])

  const handleFeed = (food) => {
    onFeed(food, food.isJunk)
    setFed(food.id)
    setMessage(randomMsg(food.isJunk ? JUNK_MESSAGES : GOOD_MESSAGES))
    setTimeout(() => onBack(), 1500)
  }

  if (message) {
    return (
      <div className="screen food-screen">
        <div className="activity-message">
          <p>{message}</p>
        </div>
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
            onClick={() => handleFeed(food)}
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
