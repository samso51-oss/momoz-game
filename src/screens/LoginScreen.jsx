import { useState } from 'react'

export default function LoginScreen({ hasAccount, onLogin, onGoCreate }) {
  const [pseudo, setPseudo] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (!onLogin(pseudo, pin)) {
      setError('Pseudo ou PIN incorrect !')
    }
  }

  return (
    <div className="screen login-screen">
      <div className="logo-container">
        <h1 className="logo">🐣 Momoz</h1>
        <p className="subtitle">Ton compagnon virtuel</p>
      </div>

      {!hasAccount ? (
        <button className="btn btn-primary" onClick={onGoCreate}>
          Créer un compte
        </button>
      ) : (
        <div className="login-form">
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
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" onClick={handleLogin}>
            Jouer !
          </button>
        </div>
      )}
    </div>
  )
}
