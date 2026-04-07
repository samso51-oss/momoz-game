import { useState } from 'react'
import { activities } from '../data/activities.js'

const FUN_MESSAGES = {
  jouer: 'Ton Momoz s\'éclate ! 🎮',
  dormir: 'Ton Momoz va dormir 30 min 😴 Reviens plus tard !',
  laver: 'Tout propre ! ✨',
  lire: 'Ton Momoz dévore un livre ! 📚',
  danser: 'Ton Momoz adore danser ! 💃',
  courir: 'En avant toute ! 🏃',
  calin: 'Un gros câlin ! 🤗',
  dessiner: 'Quel artiste ! 🎨',
}

export default function ActivityScreen({ onDoActivity, onBack, isSleeping }) {
  const [message, setMessage] = useState(null)

  const handleActivity = (activity) => {
    onDoActivity(activity)
    setMessage(FUN_MESSAGES[activity.id] || 'Super !')
    if (activity.id !== 'dormir') {
      setTimeout(() => {
        setMessage(null)
        onBack()
      }, 1500)
    }
  }

  if (message) {
    return (
      <div className="screen activity-screen">
        <div className="activity-message">
          <p>{message}</p>
          {message.includes('dormir') && (
            <button className="btn btn-primary" onClick={onBack}>OK</button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="screen activity-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>← Retour</button>
        <h2>Activités</h2>
      </div>

      <div className="activity-grid">
        {activities.map((act) => (
          <button
            key={act.id}
            className="activity-btn"
            onClick={() => handleActivity(act)}
            disabled={isSleeping}
          >
            <span className="activity-emoji">{act.emoji}</span>
            <span className="activity-name">{act.name}</span>
            <span className="activity-pts">+{act.points} pts</span>
          </button>
        ))}
      </div>
    </div>
  )
}
