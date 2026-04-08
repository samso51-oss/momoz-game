import { useState, useRef, useCallback } from 'react'
import { activities } from '../data/activities.js'
import RunnerGame from '../components/RunnerGame.jsx'
import SimonGame from '../components/minigames/SimonGame.jsx'
import BerceGame from '../components/minigames/BerceGame.jsx'
import FrotterGame from '../components/minigames/FrotterGame.jsx'
import PageGame from '../components/minigames/PageGame.jsx'
import DanseGame from '../components/minigames/DanseGame.jsx'
import CalinGame from '../components/minigames/CalinGame.jsx'
import DessinerGame from '../components/minigames/DessinerGame.jsx'

const FUN_MESSAGES = {
  jouer: 'Ton Momoz s\'eclate ! 🎮',
  dormir: 'Ton Momoz va dormir 30 min 😴 Reviens plus tard !',
  laver: 'Tout propre ! ✨',
  lire: 'Ton Momoz devore un livre ! 📚',
  danser: 'Ton Momoz adore danser ! 💃',
  courir: 'En avant toute ! 🏃',
  calin: 'Un gros calin ! 🤗',
  dessiner: 'Quel artiste ! 🎨',
}

function getPersonalizedActivityMessage(activityId, traits, delta) {
  if (activityId === 'jouer' && traits.includes('Curieux')) return 'Il joue et explore partout ! 🎮🔍'
  if (activityId === 'jouer' && traits.includes('Calin')) return `Il préfèrerait un câlin... 🎮😕 (bonheur ${delta?.bonheur})`
  if (activityId === 'dormir' && traits.includes('Paresseux')) return `Son activité préférée ! 😴💤 +${delta?.bonheur} bonheur`
  if (activityId === 'dormir' && traits.includes('Energique')) return 'Il dort mal, trop d energie ! ⚡😴'
  if (activityId === 'courir' && traits.includes('Energique')) return `Il adore courir ! 🏃⚡ +${delta?.bonheur} bonheur`
  if (activityId === 'courir' && traits.includes('Paresseux')) return `Il déteste ça... 🏃😩 (bonheur ${delta?.bonheur})`
  if (activityId === 'courir' && traits.includes('Curieux')) return 'Pas son truc, trop répétitif. 🏃🥱'
  if (activityId === 'danser' && traits.includes('Energique')) return 'Il danse comme une fusée ! 💃⚡'
  if (activityId === 'danser' && traits.includes('Paresseux')) return 'Il traîne les pieds... 💃😒'
  if (activityId === 'calin' && traits.includes('Calin')) return `Un énorme câlin ! Trop de bonheur ! 🤗💕 +${delta?.bonheur} bonheur`
  if (activityId === 'lire' && traits.includes('Curieux')) return `Il dévore le livre ! 📚🔍 +${delta?.bonheur} bonheur`
  if (activityId === 'dessiner' && traits.includes('Curieux')) return `Un chef-d oeuvre ! 🎨✨ +${delta?.bonheur} bonheur`
  if (activityId === 'laver' && traits.includes('Tetu')) return 'Il résiste mais finit par obéir. 🛁😤'
  return null
}

const GAME_MAP = {
  jouer: SimonGame,
  dormir: BerceGame,
  laver: FrotterGame,
  lire: PageGame,
  danser: DanseGame,
  courir: RunnerGame,
  calin: CalinGame,
  dessiner: DessinerGame,
}

export default function ActivityScreen({ onDoActivity, onBack, isSleeping, traits = [], lastGaugeDelta }) {
  const [message, setMessage] = useState(null)
  const [activeGame, setActiveGame] = useState(null)
  const [failMessage, setFailMessage] = useState(null)

  const handleActivity = (activity) => {
    const GameComponent = GAME_MAP[activity.id]
    if (GameComponent) {
      setActiveGame({ activity, Component: GameComponent })
      return
    }
    applyActivity(activity)
  }

  const applyActivity = (activity) => {
    onDoActivity(activity)
    setMessage(getPersonalizedActivityMessage(activity.id, traits, lastGaugeDelta) || FUN_MESSAGES[activity.id] || 'Super !')
    if (activity.id !== 'dormir') {
      setTimeout(() => onBack(), 1500)
    }
  }

  const handleGameSuccess = () => {
    const activity = activeGame.activity
    setActiveGame(null)
    applyActivity(activity)
  }

  const handleGameFail = (msg) => {
    setActiveGame(null)
    setFailMessage(msg || 'Rate ! Reessaie')
    setTimeout(() => setFailMessage(null), 1500)
  }

  // Active mini-game
  if (activeGame) {
    const { Component, activity } = activeGame
    const props = { onSuccess: handleGameSuccess }

    if (activity.id === 'courir') {
      props.onFail = () => handleGameFail('Rate ! Reessaie')
    } else {
      props.onFailure = handleGameFail
    }

    return <Component {...props} />
  }

  // Fail message
  if (failMessage) {
    return (
      <div className="screen activity-screen">
        <div className="activity-message">
          <p style={{ color: '#FFCDD2' }}>{failMessage}</p>
        </div>
      </div>
    )
  }

  // Success message
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
        <h2>Activites</h2>
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
