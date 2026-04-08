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
import DeltaDisplay from '../components/DeltaDisplay.jsx'

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

export default function ActivityScreen({ onDoActivity, onBack, isSleeping, getGauges }) {
  const [message, setMessage] = useState(null)
  const [activeGame, setActiveGame] = useState(null) // { activity, Component }
  const [failMessage, setFailMessage] = useState(null)
  const [delta, setDelta] = useState(null) // { before, after }
  const gaugesBeforeRef = useRef(null)

  const handleActivity = (activity) => {
    const GameComponent = GAME_MAP[activity.id]
    if (GameComponent) {
      gaugesBeforeRef.current = getGauges()
      setActiveGame({ activity, Component: GameComponent })
      return
    }
    // Fallback: apply directly
    applyActivity(activity)
  }

  const applyActivity = (activity) => {
    const before = gaugesBeforeRef.current || getGauges()
    onDoActivity(activity)
    // Small delay to let state update, then read new gauges
    setTimeout(() => {
      const after = getGauges()
      setDelta({ before, after })
      setMessage(FUN_MESSAGES[activity.id] || 'Super !')
      if (activity.id !== 'dormir') {
        setTimeout(() => {
          setMessage(null)
          setDelta(null)
          onBack()
        }, 2000)
      }
    }, 50)
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

    // RunnerGame uses onFail, others use onFailure
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
            <button className="btn btn-primary" onClick={() => { setDelta(null); onBack() }}>OK</button>
          )}
        </div>
        {delta && <DeltaDisplay before={delta.before} after={delta.after} />}
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
