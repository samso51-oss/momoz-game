import { useEffect } from 'react'
import GaugeBar from '../components/GaugeBar.jsx'
import MomozSprite from '../components/MomozSprite.jsx'
import ScoreDisplay from '../components/ScoreDisplay.jsx'

const STAGE_NAMES = ['Bébé', 'Ado', 'Adulte', 'Vieux']

export default function HomeScreen({ state, refreshState, onNavigate, gaugeDeltas }) {
  const { player, momoz } = state

  useEffect(() => {
    refreshState()
    const interval = setInterval(refreshState, 60_000)
    return () => clearInterval(interval)
  }, [refreshState])

  if (!momoz) return null

  const daysAlive = Math.floor((Date.now() - momoz.bornAt) / (1000 * 60 * 60 * 24))

  return (
    <div className="screen home-screen">
      <ScoreDisplay
        pseudo={player.pseudo}
        avatarEmoji={player.avatarEmoji}
        totalScore={player.totalScore + momoz.sessionScore}
      />

      <MomozSprite
        gender={momoz.gender}
        stage={momoz.stage}
        isSick={momoz.isSick}
        isSleeping={momoz.isSleeping}
      />

      <div className="momoz-info">
        <h2>{momoz.name}</h2>
        <p>{STAGE_NAMES[momoz.stage]} &middot; Jour {daysAlive + 1}</p>
        {momoz.isSleeping && <p className="status-sleeping">💤 En train de dormir...</p>}
        {momoz.isSick && <p className="status-sick">🤒 Malade !</p>}
      </div>

      <div className="gauges">
        <GaugeBar label="Faim" value={momoz.gauges.faim} emoji="🍖" delta={gaugeDeltas?.faim} />
        <GaugeBar label="Énergie" value={momoz.gauges.energie} emoji="⚡" delta={gaugeDeltas?.energie} />
        <GaugeBar label="Bonheur" value={momoz.gauges.bonheur} emoji="😊" delta={gaugeDeltas?.bonheur} />
        <GaugeBar label="Santé" value={momoz.gauges.sante} emoji="❤️" delta={gaugeDeltas?.sante} />
      </div>

      <div className="action-bar">
        <button className="btn btn-action" onClick={() => onNavigate('food')} disabled={momoz.isSleeping}>
          🍖 Nourrir
        </button>
        <button className="btn btn-action" onClick={() => onNavigate('activity')} disabled={momoz.isSleeping}>
          🎮 Activités
        </button>
        <button className="btn btn-action" onClick={() => onNavigate('profile')}>
          👤 Profil
        </button>
      </div>

      {momoz.isSick && (
        <button className="btn btn-heal" onClick={() => onNavigate('activity')}>
          🛁 Soigner
        </button>
      )}
    </div>
  )
}
