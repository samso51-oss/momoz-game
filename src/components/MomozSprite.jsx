const SPRITES = {
  M: [
    '/assets/momoz-bebe.jpg',
    '/assets/momoz-ado.jpg',
    '/assets/momoz-male-adulte.jpg',
    '/assets/momoz-vieux.jpg',
  ],
  F: [
    '/assets/momoz-bebe-femelle.jpg',
    '/assets/momoz-ado-femelle.jpg',
    '/assets/momoz-femelle-adulte.jpg',
    '/assets/momoz-vieille-femelle.jpg',
  ],
}

export default function MomozSprite({ gender, stage, isSick, isSleeping }) {
  const src = SPRITES[gender]?.[stage] || SPRITES.M[0]

  return (
    <div className="momoz-sprite">
      <img
        src={src}
        alt="Momoz"
        className={`sprite-img ${isSleeping ? 'sleeping' : 'idle-bounce'}`}
      />
      {isSick && <div className="badge-sick">🤒</div>}
      {isSleeping && <div className="badge-sleep">💤</div>}
    </div>
  )
}
