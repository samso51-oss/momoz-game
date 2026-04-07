export default function ProfileScreen({ player, sessionScore, onBack }) {
  return (
    <div className="screen profile-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>← Retour</button>
        <h2>Profil</h2>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">{player.avatarEmoji}</div>
        <h3>{player.pseudo}</h3>
        <p className="total-score">⭐ Score total : {player.totalScore + (sessionScore || 0)} pts</p>
      </div>

      <div className="history-section">
        <h3>Historique des Momoz</h3>
        {player.history.length === 0 ? (
          <p className="empty-history">Aucun Momoz précédent</p>
        ) : (
          <div className="history-table">
            {player.history.map((h, i) => (
              <div key={i} className="history-row">
                <span className="h-name">{h.name}</span>
                <span className="h-stage">{h.stage}</span>
                <span className="h-days">{h.livedDays}j</span>
                <span className="h-pts">{h.points} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
