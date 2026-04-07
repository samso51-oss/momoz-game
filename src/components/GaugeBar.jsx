export default function GaugeBar({ label, value, emoji }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  const color = pct > 60 ? '#4CAF50' : pct > 30 ? '#FF9800' : '#F44336'

  return (
    <div className="gauge-bar">
      <div className="gauge-label">
        <span>{emoji} {label}</span>
        <span>{pct}%</span>
      </div>
      <div className="gauge-track">
        <div
          className="gauge-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
