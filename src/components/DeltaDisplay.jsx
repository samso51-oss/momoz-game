import { useState, useEffect } from 'react'

const GAUGE_LABELS = {
  faim: 'Faim',
  energie: 'Energie',
  bonheur: 'Bonheur',
  sante: 'Sante',
}

export default function DeltaDisplay({ before, after, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onDone) onDone()
    }, 2000)
    return () => clearTimeout(timer)
  }, [onDone])

  if (!visible || !before || !after) return null

  const deltas = []
  for (const key of ['faim', 'energie', 'bonheur', 'sante']) {
    const diff = Math.round(after[key] - before[key])
    if (diff !== 0) {
      deltas.push({ key, label: GAUGE_LABELS[key], diff })
    }
  }

  if (deltas.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.75)',
      borderRadius: 16,
      padding: '12px 20px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px 16px',
      justifyContent: 'center',
      zIndex: 100,
      animation: 'deltaSlideIn 0.3s ease',
      maxWidth: '90vw',
    }}>
      {deltas.map((d) => (
        <span
          key={d.key}
          style={{
            color: d.diff > 0 ? '#81C784' : '#EF9A9A',
            fontWeight: 800,
            fontSize: 14,
            fontFamily: "'Nunito', sans-serif",
            whiteSpace: 'nowrap',
          }}
        >
          {d.label} {d.diff > 0 ? '+' : ''}{d.diff}
        </span>
      ))}
    </div>
  )
}
