export default function ScoreDisplay({ pseudo, avatarEmoji, totalScore }) {
  return (
    <div className="score-display">
      <span className="score-avatar">{avatarEmoji}</span>
      <span className="score-pseudo">{pseudo}</span>
      <span className="score-points">⭐ {totalScore} pts</span>
    </div>
  )
}
