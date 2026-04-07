export default function DeathScreen({ deathType, score, onNewMomoz }) {
  const isNatural = deathType === 'natural'

  return (
    <div className={`screen death-screen ${isNatural ? 'natural' : 'premature'}`}>
      <div className="death-content">
        {isNatural ? (
          <>
            <div className="confetti">🎉✨🌟💫🎊</div>
            <h2>Ton Momoz a vécu une belle vie !</h2>
            <p className="death-bonus">+200 pts bonus ✨</p>
            <p>Score final : {score} pts</p>
          </>
        ) : (
          <>
            <div className="tear">😢</div>
            <h2>Ton Momoz s'est envolé...</h2>
            <p className="death-loss">Points perdus 💔</p>
          </>
        )}

        <button className="btn btn-primary" onClick={onNewMomoz}>
          Adopter un nouvel œuf 🥚
        </button>
      </div>
    </div>
  )
}
