import { useState, useEffect } from 'react'

export default function GaugeBar({ label, value, emoji, delta }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  const color = pct > 60 ? '#4CAF50' : pct > 30 ? '#FF9800' : '#F44336'

  const [showDelta, setShowDelta] = useState(false)

  useEffect(() => {
    if (delta != null && delta !== 0) {
      setShowDelta(true)
      const timer = setTimeout(() => setShowDelta(false), 2000)
      return () => clearTimeout(timer)
    } else {
      setShowDelta(false)
    }
  }, [delta])

  return (
    <div className="gauge-bar">
      <div className="gauge-label">
        <span>{emoji} {label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {pct}%
          {showDelta && delta != null && delta !== 0 && (
            <span className="gauge-delta" style={{
              background: delta > 0 ? '#4CAF50' : '#F44336',
            }}>
              {delta > 0 ? '+' : ''}{delta}
            </span>
          )}
        </span>
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
