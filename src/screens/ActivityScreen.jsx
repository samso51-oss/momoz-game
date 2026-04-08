import { useState, useRef, useCallback, useEffect } from 'react'
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

function formatDelta(delta) {
  if (!delta) return ''
  const LABELS = { faim: '🍖', energie: '⚡', bonheur: '😊', sante: '❤️' }
  const parts = Object.entries(delta)
    .filter(([, v]) => v !== 0)
    .map(([k, v]) => `${LABELS[k]} ${v > 0 ? '+' : ''}${v}`)
  return parts.length ? '\n' + parts.join('  ') : ''
}

function getPersonalizedActivityMessage(activityId, traits, delta) {
  let base = null
  if (activityId === 'jouer' && traits.includes('Curieux')) base = 'Il joue et explore partout ! 🎮🔍'
  else if (activityId === 'jouer' && traits.includes('Calin')) base = 'Il préfèrerait un câlin... 🎮😕'
  else if (activityId === 'dormir' && traits.includes('Paresseux')) base = 'Son activité préférée ! 😴💤'
  else if (activityId === 'dormir' && traits.includes('Energique')) base = 'Il dort mal, trop d energie ! ⚡😴'
  else if (activityId === 'courir' && traits.includes('Energique')) base = 'Il adore courir ! 🏃⚡'
  else if (activityId === 'courir' && traits.includes('Paresseux')) base = 'Il déteste ça... 🏃😩'
  else if (activityId === 'courir' && traits.includes('Curieux')) base = 'Pas son truc, trop répétitif. 🏃🥱'
  else if (activityId === 'danser' && traits.includes('Energique')) base = 'Il danse comme une fusée ! 💃⚡'
  else if (activityId === 'danser' && traits.includes('Paresseux')) base = 'Il traîne les pieds... 💃😒'
  else if (activityId === 'calin' && traits.includes('Calin')) base = 'Un énorme câlin ! Trop de bonheur ! 🤗💕'
  else if (activityId === 'lire' && traits.includes('Curieux')) base = 'Il dévore le livre ! 📚🔍'
  else if (activityId === 'dessiner' && traits.includes('Curieux')) base = 'Un chef-d oeuvre ! 🎨✨'
  else if (activityId === 'laver' && traits.includes('Tetu')) base = 'Il résiste mais finit par obéir. 🛁😤'
  if (!base) return null
  return base + formatDelta(delta)
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
  const pendingActivityRef = useRef(null)
  const backTimerRef = useRef(null)

  // Quand lastGaugeDelta arrive, construire le message avec les vraies valeurs
  useEffect(() => {
    if (lastGaugeDelta && pendingActivityRef.current) {
      const { activityId } = pendingActivityRef.current
      setMessage((getPersonalizedActivityMessage(activityId, traits, lastGaugeDelta) || (FUN_MESSAGES[activityId] || 'Super !') + formatDelta(lastGaugeDelta)))
      pendingActivityRef.current = null
    }
  }, [lastGaugeDelta, traits])

  // Auto-fermeture de secours à 5000ms (sauf dormir)
  useEffect(() => {
    if (backTimerRef.current) clearTimeout(backTimerRef.current)
    if (message && !message.includes('dormir')) {
      backTimerRef.current = setTimeout(() => onBack(), 5000)
    }
    return () => { if (backTimerRef.current) clearTimeout(backTimerRef.current) }
  }, [message, onBack])

  // Cleanup
  useEffect(() => {
    return () => { if (backTimerRef.current) clearTimeout(backTimerRef.current) }
  }, [])

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
    pendingActivityRef.current = { activityId: activity.id }
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
    const isDormir = message.includes('dormir')
    return (
      <div
        className="screen activity-screen"
        onClick={isDormir ? undefined : onBack}
        style={isDormir ? undefined : { cursor: 'pointer', justifyContent: 'center' }}
      >
        <div className="activity-message">
          <p>{message}</p>
          {isDormir ? (
            <button className="btn btn-primary" onClick={onBack}>OK</button>
          ) : (
            <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>Appuie pour continuer</p>
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
