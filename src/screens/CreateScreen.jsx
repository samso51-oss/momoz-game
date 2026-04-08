import { useState } from 'react'

const AVATARS = ['🐱', '🐶', '🦊', '🐸', '🦁', '🐯', '🐼', '🐨', '🦋', '🌟']

export default function CreateScreen({ onCreatePlayer, onCreateMomoz, playerExists }) {
  const [step, setStep] = useState(playerExists ? 'momoz' : 'player')

  // Player creation
  const [avatar, setAvatar] = useState(null)
  const [pseudo, setPseudo] = useState('')
  const [pin, setPin] = useState('')

  // Momoz creation
  const [momozName, setMomozName] = useState('')
  const [gender, setGender] = useState(null)
  const [hatching, setHatching] = useState(false)
  const [hatched, setHatched] = useState(false)
  const [choosingGender, setChoosingGender] = useState(false)
  const [traits, setTraits] = useState([])
  const [tapCount, setTapCount] = useState(0)

  const handleCreatePlayer = () => {
    if (!pseudo || !pin || pin.length < 4 || !avatar) return
    onCreatePlayer(pseudo, avatar, pin)
    setStep('momoz')
  }

  const handleEggTap = () => {
    if (!momozName.trim() || hatching) return
    const next = tapCount + 1
    setTapCount(next)
    if (next >= 3) {
      setHatching(true)
      setTimeout(() => {
        setHatching(false)
        setChoosingGender(true)
      }, 2000)
    }
  }

  const handleGenderChoice = (g) => {
    setGender(g)
    const t = onCreateMomoz(momozName.trim(), g)
    setTraits(t)
    setChoosingGender(false)
    setHatched(true)
  }

  if (step === 'player') {
    return (
      <div className="screen create-screen">
        <h2>Crée ton profil</h2>

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
          disabled={!pseudo || pin.length < 4 || !avatar}
        >
          Créer !
        </button>
      </div>
    )
  }

  // Step: momoz creation
  return (
    <div className="screen create-screen">
      {!hatched && !choosingGender ? (
        <>
          <h2>Ton nouvel œuf !</h2>
          {!hatching && (
            <input
              type="text"
              placeholder="Prénom de ton Momoz"
              value={momozName}
              onChange={(e) => setMomozName(e.target.value)}
              className="input"
            />
          )}
          <div className="egg-container">
            <img
              src="/assets/momoz-oeuf.jpg"
              alt="Œuf Momoz"
              className={`egg-img ${hatching ? 'hatching' : 'egg-idle'} ${tapCount > 0 ? 'egg-cracked-' + tapCount : ''} ${!momozName.trim() ? 'egg-disabled' : ''}`}
              onClick={handleEggTap}
              style={{ cursor: momozName.trim() && !hatching ? 'pointer' : 'not-allowed' }}
            />
          </div>
          {!hatching && (
            <p className="tap-hint" style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
              {!momozName.trim()
                ? 'Entre un prénom puis tape sur l\'œuf !'
                : `Tape l'œuf ! ${tapCount}/3`}
            </p>
          )}
          {hatching && <p className="hatching-text">Éclosion en cours...</p>}
        </>
      ) : choosingGender ? (
        <>
          <h2>C'est un garçon ou une fille ?</h2>
          <div className="egg-container">
            <img
              src="/assets/momoz-oeuf.jpg"
              alt="Œuf Momoz"
              className="egg-img"
            />
          </div>
          <div className="gender-btns">
            <button
              className="btn btn-gender"
              onClick={() => handleGenderChoice('M')}
            >
              Garçon 💙
            </button>
            <button
              className="btn btn-gender"
              onClick={() => handleGenderChoice('F')}
            >
              Fille 💗
            </button>
          </div>
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
