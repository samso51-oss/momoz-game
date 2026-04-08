import { useState, useEffect, useRef, useCallback } from 'react'

const GAME_DURATION = 20000 // 20 seconds
const CANVAS_W = 380
const CANVAS_H = 250
const GROUND_Y = 200
const PLAYER_SIZE = 40
const OBSTACLE_W = 30
const OBSTACLE_H = 40
const JUMP_VELOCITY = -12
const GRAVITY = 0.6
const BASE_SPEED = 3
const MAX_SPEED = 8
const SPAWN_INTERVAL_START = 1500
const SPAWN_INTERVAL_MIN = 600

export default function RunnerGame({ onSuccess, onFail }) {
  const canvasRef = useRef(null)
  const eggImgRef = useRef(null)
  const stateRef = useRef({
    playerY: GROUND_Y - PLAYER_SIZE,
    velocityY: 0,
    isJumping: false,
    obstacles: [],
    startTime: Date.now(),
    lastSpawn: 0,
    gameOver: false,
    won: false,
  })
  const animRef = useRef(null)
  const [result, setResult] = useState(null) // 'win' | 'lose'

  const jump = useCallback(() => {
    const s = stateRef.current
    if (s.gameOver || s.isJumping) return
    s.velocityY = JUMP_VELOCITY
    s.isJumping = true
  }, [])

  // Preload egg image
  useEffect(() => {
    const img = new Image()
    img.src = '/assets/momoz-oeuf.jpg'
    eggImgRef.current = img
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    stateRef.current.startTime = Date.now()
    stateRef.current.lastSpawn = Date.now()

    function loop() {
      const s = stateRef.current
      if (s.gameOver) return

      const now = Date.now()
      const elapsed = now - s.startTime
      const progress = Math.min(elapsed / GAME_DURATION, 1)
      const speed = BASE_SPEED + (MAX_SPEED - BASE_SPEED) * progress
      const spawnInterval = SPAWN_INTERVAL_START - (SPAWN_INTERVAL_START - SPAWN_INTERVAL_MIN) * progress

      // Win condition
      if (elapsed >= GAME_DURATION) {
        s.gameOver = true
        s.won = true
        setResult('win')
        return
      }

      // Spawn obstacles
      if (now - s.lastSpawn > spawnInterval) {
        s.obstacles.push({ x: CANVAS_W, y: GROUND_Y - OBSTACLE_H })
        s.lastSpawn = now
      }

      // Player physics
      s.velocityY += GRAVITY
      s.playerY += s.velocityY
      if (s.playerY >= GROUND_Y - PLAYER_SIZE) {
        s.playerY = GROUND_Y - PLAYER_SIZE
        s.velocityY = 0
        s.isJumping = false
      }

      // Move obstacles
      s.obstacles = s.obstacles.filter((o) => o.x + OBSTACLE_W > 0)
      for (const o of s.obstacles) {
        o.x -= speed
      }

      // Collision
      const px = 40
      for (const o of s.obstacles) {
        if (
          px + PLAYER_SIZE - 8 > o.x &&
          px < o.x + OBSTACLE_W - 8 &&
          s.playerY + PLAYER_SIZE > o.y + 8
        ) {
          s.gameOver = true
          s.won = false
          setResult('lose')
          return
        }
      }

      // Draw
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

      // Sky
      ctx.fillStyle = '#87CEEB'
      ctx.fillRect(0, 0, CANVAS_W, GROUND_Y)

      // Ground
      ctx.fillStyle = '#8B5E3C'
      ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y)

      // Timer bar
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.fillRect(10, 10, CANVAS_W - 20, 12)
      ctx.fillStyle = '#3ECFCF'
      ctx.fillRect(10, 10, (CANVAS_W - 20) * progress, 12)

      // Player (Momoz egg image)
      const egg = eggImgRef.current
      if (egg && egg.complete) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(px + PLAYER_SIZE / 2, s.playerY + PLAYER_SIZE / 2, PLAYER_SIZE / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(egg, px, s.playerY, PLAYER_SIZE, PLAYER_SIZE)
        ctx.restore()
      } else {
        ctx.font = `${PLAYER_SIZE}px serif`
        ctx.fillText('🥚', px, s.playerY + PLAYER_SIZE - 4)
      }

      // Obstacles
      ctx.font = `${OBSTACLE_H}px serif`
      for (const o of s.obstacles) {
        ctx.fillText('🪨', o.x, o.y + OBSTACLE_H - 4)
      }

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  useEffect(() => {
    if (!result) return
    const timer = setTimeout(() => {
      if (result === 'win') onSuccess()
      else onFail()
    }, 2000)
    return () => clearTimeout(timer)
  }, [result, onSuccess, onFail])

  return (
    <div className="screen" style={{ justifyContent: 'center', gap: 16 }}>
      <h2 style={{ color: '#fff', fontSize: 20 }}>Course du Momoz !</h2>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onClick={jump}
        onTouchStart={(e) => { e.preventDefault(); jump() }}
        style={{
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          touchAction: 'none',
          maxWidth: '100%',
        }}
      />
      {!result && (
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
          Tape pour sauter !
        </p>
      )}
      {result === 'win' && (
        <p style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>
          Bravo ! Tu as survécu ! 🎉
        </p>
      )}
      {result === 'lose' && (
        <p style={{ color: '#FFCDD2', fontWeight: 800, fontSize: 22 }}>
          Raté ! Réessaie 💥
        </p>
      )}
    </div>
  )
}
