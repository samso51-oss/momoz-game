import { useState } from 'react'

const AVATARS = ['🐱', '🐶', '🦊', '🐸', '🦁', '🐯', '🐼', '🐨', '🦋', '🌟']

export default function CreateScreen({ onCreatePlayer, onCreateMomoz, playerExists }) {
  const [step, setStep] = useState(playerExists ? 'momoz' : 'player')

  // Player creation
  const [gender, setGender] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [pseudo, setPseudo] = useState('')
  const [pin, setPin] = useState('')

  // Momoz creation
  const [momozName, setMomozName] = useState('')
  const [hatching, setHatching] = useState(false)
  const [hatched, setHatched] = useState(false)
  const [traits, setTraits] = useState([])

  const handleCreatePlayer = () => {
    if (!pseudo || !pin || pin.length < 4 || !avatar || !gender) return
    onCreatePlayer(pseudo, avatar, pin)
    setStep('momoz')
  }

  const handleHatch = () => {
    if (!momozName.trim()) return
    setHatching(true)
    const t = onCreateMomoz(momozName.trim(), gender || 'M')
    setTraits(t)
    setTimeout(() => {
      setHatching(false)
      setHatched(true)
    }, 2000)
  }

  if (step === 'player') {
    return (
      <div className="screen create-screen">
        <h2>Crée ton profil</h2>

        <div className="section">
          <p className="label">Genre de ton Momoz</p>
          <div className="gender-btns">
            <button
              className={`btn btn-gender ${gender === 'M' ? 'active' : ''}`}
              onClick={() => setGender('M')}
            >
              Garçon 💙
            </button>
            <button
              className={`btn btn-gender ${gender === 'F' ? 'active' : ''}`}
              onClick={() => setGender('F')}
            >
              Fille 💗
            </button>
          </div>
        </div>

        <div className="section">
          <p className="label">Choisis ton avatar</p>
          <div className="avatar-grid">
            {AVATARS.map((a) => (
              <button
                key={a}
                className={`avatar-btn ${avatar === a ? 'active' : ''}`}
                onClick={() => setAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          className="input"
        />
        <input
          type="password"
          placeholder="PIN (4 chiffres)"
          maxLength={4}
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          className="input"
        />

        <button
          className="btn btn-primary"
          onClick={handleCreatePlayer}
          disabled={!pseudo || pin.length < 4 || !avatar || !gender}
        >
          Créer !
        </button>
      </div>
    )
  }

  // Step: momoz creation
  return (
    <div className="screen create-screen">
      {!hatched ? (
        <>
          <h2>Ton nouvel œuf !</h2>
          <div className="egg-container">
            <img
              src="/assets/momoz-oeuf.jpg"
              alt="Œuf Momoz"
              className={`egg-img ${hatching ? 'hatching' : 'egg-idle'}`}
            />
          </div>
          {!hatching && (
            <>
              <input
                type="text"
                placeholder="Prénom de ton Momoz"
                value={momozName}
                onChange={(e) => setMomozName(e.target.value)}
                className="input"
              />
              <button
                className="btn btn-primary"
                onClick={handleHatch}
                disabled={!momozName.trim()}
              >
                Faire éclore ! 🐣
              </button>
            </>
          )}
          {hatching && <p className="hatching-text">Éclosion en cours...</p>}
        </>
      ) : (
        <>
          <h2>Bienvenue {momozName} !</h2>
          <div className="egg-container">
            <img
              src={`/assets/momoz-bebe${gender === 'F' ? '-femelle' : ''}.jpg`}
              alt="Bébé Momoz"
              className="sprite-img idle-bounce"
            />
          </div>
          <div className="traits-list">
            <p className="label">Traits de caractère :</p>
            {traits.map((t) => (
              <span key={t} className="trait-badge">{t}</span>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            C'est parti ! 🎉
          </button>
        </>
      )}
    </div>
  )
}
