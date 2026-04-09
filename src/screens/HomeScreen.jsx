import { useState, useEffect } from 'react'
import GaugeBar from '../components/GaugeBar.jsx'
import MomozSprite from '../components/MomozSprite.jsx'
import ScoreDisplay from '../components/ScoreDisplay.jsx'

const STAGE_NAMES = ['Bébé', 'Ado', 'Adulte', 'Vieux']

function formatTime(ts) {
  const d = new Date(ts)
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

export default function HomeScreen({ state, refreshState, onNavigate, gaugeDeltas, startNightMode }) {
  const { player, momoz } = state
  const [showNightModal, setShowNightModal] = useState(false)

  useEffect(() => {
    refreshState()
    const interval = setInterval(refreshState, 60_000)
    return () => clearInterval(interval)
  }, [refreshState])

  if (!momoz) return null

  const daysAlive = Math.floor((Date.now() - momoz.bornAt) / (1000 * 60 * 60 * 24))
  const isNight = momoz.isNightMode && momoz.nightEnd && Date.now() < momoz.nightEnd

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
        {momoz.traits && momoz.traits.length > 0 && (
          <div className="traits-list">
            {momoz.traits.map((t) => (
              <span key={t} className="trait-badge">{t}</span>
            ))}
          </div>
        )}
        {momoz.isSleeping && <p className="status-sleeping">💤 En train de dormir...</p>}
        {momoz.isSick && <p className="status-sick">🤒 Malade !</p>}
      </div>

      {isNight && (
        <div className="night-banner">
          🌙 Ton Momoz est en mode nuit jusqu'à {formatTime(momoz.nightEnd)}
        </div>
      )}

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

      {!isNight && (
        <button className="btn btn-night" onClick={() => setShowNightModal(true)}>
          🌙 Bonne nuit !
        </button>
      )}

      {momoz.isSick && (
        <button className="btn btn-heal" onClick={() => onNavigate('activity')}>
          🛁 Soigner
        </button>
      )}

      {showNightModal && (
        <div className="modal-overlay" onClick={() => setShowNightModal(false)}>
          <div className="night-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🌙 Combien d'heures tu dors ?</h3>
            <div className="night-options">
              {[6, 7, 8, 9, 10].map((h) => (
                <button
                  key={h}
                  className={`btn btn-night-option`}
                  onClick={() => {
                    startNightMode(h)
                    setShowNightModal(false)
                  }}
                >
                  {h}h
                </button>
              ))}
            </div>
            <button className="btn btn-night-confirm" onClick={() => setShowNightModal(false)}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
