import { useState, useMemo } from 'react'
import { goodFood, junkFood } from '../data/foods.js'

export default function FoodScreen({ onFeed, onBack }) {
  const [fed, setFed] = useState(null)

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
    setTimeout(() => onBack(), 1000)
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
