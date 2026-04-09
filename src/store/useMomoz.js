import { useState, useCallback } from 'react'

const STORAGE_KEY = 'momoz-game-state'

const TRAITS_POOL = ['Gourmand', 'Energique', 'Paresseux', 'Calin', 'Tetu', 'Curieux']

const DECAY_PER_HOUR = { faim: 12, energie: 8, bonheur: 6, sante: 3 }

const STAGE_DAYS = [7, 14, 21, 28]
const STAGE_NAMES = ['Bébé', 'Ado', 'Adulte', 'Vieux']
const EVOLUTION_BONUS = [50, 100, 150]

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v))
}

function pickTraits() {
  const shuffled = [...TRAITS_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 2)) // 2 or 3
}

function getTraitMultiplier(traits, gauge) {
  let mult = 1
  if (gauge === 'faim' && traits.includes('Gourmand')) mult *= 1.5
  if (gauge === 'energie' && traits.includes('Energique')) mult *= 1.5
  if (gauge === 'energie' && traits.includes('Paresseux')) mult *= 2
  if (gauge === 'bonheur' && traits.includes('Calin')) mult *= 1.5
  return mult
}

function getHealMultiplier(traits) {
  return traits.includes('Tetu') ? 0.7 : 1
}

function computeStage(bornAt) {
  const days = (Date.now() - bornAt) / (1000 * 60 * 60 * 24)
  if (days >= 28) return 4 // dead of old age
  if (days >= 21) return 3
  if (days >= 14) return 2
  if (days >= 7) return 1
  return 0
}

function computeDaysAlive(bornAt) {
  return Math.floor((Date.now() - bornAt) / (1000 * 60 * 60 * 24))
}

const GAUGE_NOTIF_MESSAGES = {
  faim: '🍖 Ton Momoz a faim ! Donne-lui à manger !',
  energie: '⚡ Ton Momoz est fatigué ! Fais-le dormir !',
  bonheur: '😢 Ton Momoz s\'ennuie ! Joue avec lui !',
  sante: '❤️ Ton Momoz ne va pas bien ! Soigne-le !',
}

function sendGaugeNotification(gauge) {
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification('Momoz 🐣', { body: GAUGE_NOTIF_MESSAGES[gauge] })
  }
}

function applyDecay(momoz) {
  const now = Date.now()
  const hours = (now - momoz.lastUpdated) / (1000 * 60 * 60)
  if (hours <= 0) return momoz

  // Night mode auto-expiry
  let isNightMode = momoz.isNightMode || false
  let nightStart = momoz.nightStart || null
  let nightEnd = momoz.nightEnd || null
  if (isNightMode && nightEnd && now >= nightEnd) {
    isNightMode = false
    nightStart = null
    nightEnd = null
  }

  // Compute night mode multiplier for the elapsed period
  let nightMult = 1
  if (isNightMode && nightEnd) {
    // Entire period is in night mode
    nightMult = 0.2
  }

  // Veille automatique: if delta > 4h and not in night mode, split decay
  const VEILLE_THRESHOLD_HOURS = 4
  const sickMult = momoz.isSick ? 2 : 1
  const oldGauges = { ...momoz.gauges }
  const gauges = { ...momoz.gauges }

  for (const gauge of ['faim', 'energie', 'bonheur', 'sante']) {
    const traitMult = getTraitMultiplier(momoz.traits, gauge)
    let decay
    if (!isNightMode && hours > VEILLE_THRESHOLD_HOURS) {
      // First 4h at normal rate, rest at ×0.33
      const normalDecay = DECAY_PER_HOUR[gauge] * VEILLE_THRESHOLD_HOURS * traitMult * sickMult
      const slowDecay = DECAY_PER_HOUR[gauge] * (hours - VEILLE_THRESHOLD_HOURS) * traitMult * sickMult * 0.33
      decay = normalDecay + slowDecay
    } else {
      decay = DECAY_PER_HOUR[gauge] * hours * traitMult * sickMult * nightMult
    }
    gauges[gauge] = clamp(gauges[gauge] - decay)
  }

  // Notify when a gauge crosses below 50%
  for (const gauge of ['faim', 'energie', 'bonheur', 'sante']) {
    if (oldGauges[gauge] >= 50 && gauges[gauge] < 50) {
      sendGaugeNotification(gauge)
    }
  }

  // Sleep recovery
  if (momoz.isSleeping && momoz.sleepUntil) {
    const sleepEnd = Math.min(now, momoz.sleepUntil)
    const sleepStart = momoz.lastUpdated
    const sleepHours = Math.max(0, (sleepEnd - sleepStart) / (1000 * 60 * 60))
    // 0→100 in 30min = 200/hour
    gauges.energie = clamp(gauges.energie + sleepHours * 200)
  }

  // Check sick expiry
  let isSick = momoz.isSick
  let sickUntil = momoz.sickUntil
  if (isSick && sickUntil && now >= sickUntil) {
    isSick = false
    sickUntil = null
  }

  // Check sleep expiry
  let isSleeping = momoz.isSleeping
  let sleepUntil = momoz.sleepUntil
  if (isSleeping && sleepUntil && now >= sleepUntil) {
    isSleeping = false
    sleepUntil = null
  }

  // Stage evolution
  const oldStage = momoz.stage
  const newStage = computeStage(momoz.bornAt)
  let sessionScore = momoz.sessionScore

  if (newStage <= 3 && newStage > oldStage) {
    for (let s = oldStage; s < newStage && s < 3; s++) {
      sessionScore += EVOLUTION_BONUS[s]
    }
  }

  return {
    ...momoz,
    gauges,
    isSick,
    sickUntil,
    isSleeping,
    sleepUntil,
    isNightMode,
    nightStart,
    nightEnd,
    stage: Math.min(newStage, 3),
    sessionScore,
    lastUpdated: now,
    _naturalDeath: newStage >= 4,
  }
}

function checkDeath(momoz) {
  if (momoz._naturalDeath) return 'natural'
  const { faim, energie, bonheur, sante } = momoz.gauges
  if (faim <= 0 || energie <= 0 || bonheur <= 0 || sante <= 0) return 'premature'
  return null
}

export function useMomoz() {
  const [state, _setState] = useState(() => {
    const saved = loadState()
    if (!saved) return { player: null, momoz: null, lastGaugeDelta: null }

    if (saved.momoz) {
      saved.momoz = applyDecay(saved.momoz)
      const death = checkDeath(saved.momoz)
      if (death) {
        saved.momoz._deathType = death
      }
    }
    return saved
  })

  const setState = useCallback((updater) => {
    _setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveState(next)
      return next
    })
  }, [])

  const createPlayer = useCallback((pseudo, avatarEmoji, pin) => {
    setState((prev) => ({
      ...prev,
      player: {
        pseudo,
        avatarEmoji,
        pin,
        totalScore: 0,
        history: [],
        lastLoginDate: new Date().toDateString(),
      },
      momoz: null,
    }))
  }, [setState])

  const login = useCallback((pseudo, pin) => {
    const saved = loadState()
    if (!saved || !saved.player) return false
    if (saved.player.pseudo === pseudo && saved.player.pin === pin) {
      // Daily login bonus
      const today = new Date().toDateString()
      let bonus = 0
      if (saved.player.lastLoginDate !== today) {
        bonus = 5
        saved.player.lastLoginDate = today
      }
      if (saved.momoz) {
        saved.momoz = applyDecay(saved.momoz)
        saved.momoz.sessionScore += bonus
        const death = checkDeath(saved.momoz)
        if (death) saved.momoz._deathType = death
      }
      saved.player.totalScore += bonus
      saveState(saved)
      _setState(saved)
      return true
    }
    return false
  }, [])

  const createMomoz = useCallback((name, gender) => {
    const now = Date.now()
    const traits = pickTraits()
    setState((prev) => ({
      ...prev,
      momoz: {
        name,
        gender,
        traits,
        stage: 0,
        bornAt: now,
        gauges: { faim: 80, energie: 80, bonheur: 80, sante: 80 },
        lastUpdated: now,
        junkFoodStreak: 0,
        isSick: false,
        sickUntil: null,
        isSleeping: false,
        sleepUntil: null,
        sessionScore: 0,
        goodFoodStreak: 0,
        healActivityDone: false,
      },
    }))
    return traits
  }, [setState])

  const feedMomoz = useCallback((foodItem, isJunk) => {
    setState((prev) => {
      if (!prev.momoz || prev.momoz.isSleeping) return prev
      const m = { ...prev.momoz, gauges: { ...prev.momoz.gauges } }
      const gaugesBefore = { ...m.gauges }

      if (isJunk) {
        // Malbouffe — base
        m.gauges.bonheur += 25
        m.gauges.faim += 15
        m.gauges.sante -= 20
        m.sessionScore += 1
        m.junkFoodStreak += 1
        m.goodFoodStreak = 0

        // Modificateurs traits malbouffe
        if (m.traits.includes('Gourmand')) {
          m.gauges.bonheur += 10
          m.gauges.faim += 5
        }
        if (m.traits.includes('Tetu')) {
          m.gauges.bonheur += 5
        }

        if (m.junkFoodStreak >= 3 && !m.isSick) {
          m.isSick = true
          m.sickUntil = Date.now() + 24 * 60 * 60 * 1000
        }
      } else {
        // Bonne bouffe — base
        m.gauges.faim += 20
        m.gauges.sante += 15
        m.gauges.bonheur -= 5
        m.sessionScore += 5
        m.junkFoodStreak = 0

        // Modificateurs traits bonne bouffe
        if (m.traits.includes('Gourmand')) {
          m.gauges.bonheur -= 5
        }
        if (m.traits.includes('Tetu')) {
          m.gauges.bonheur += 5
        }

        if (m.isSick) {
          m.goodFoodStreak = (m.goodFoodStreak || 0) + 1
          if (m.goodFoodStreak >= 3 && m.healActivityDone) {
            m.isSick = false
            m.sickUntil = null
            m.goodFoodStreak = 0
            m.healActivityDone = false
            m.sessionScore += 15
          }
        }
      }

      // Clamp all gauges
      for (const g of ['faim', 'energie', 'bonheur', 'sante']) {
        m.gauges[g] = clamp(m.gauges[g])
      }

      m.lastUpdated = Date.now()
      const p = { ...prev.player, totalScore: prev.player.totalScore + (isJunk ? 1 : 5) }
      const delta = {
        faim: Math.round(m.gauges.faim - gaugesBefore.faim),
        energie: Math.round(m.gauges.energie - gaugesBefore.energie),
        bonheur: Math.round(m.gauges.bonheur - gaugesBefore.bonheur),
        sante: Math.round(m.gauges.sante - gaugesBefore.sante),
      }
      return { ...prev, momoz: m, player: p, lastGaugeDelta: delta }
    })
  }, [setState])

  const doActivity = useCallback((activity) => {
    setState((prev) => {
      if (!prev.momoz || prev.momoz.isSleeping) return prev
      const m = { ...prev.momoz, gauges: { ...prev.momoz.gauges } }
      const gaugesBefore = { ...m.gauges }
      const healMult = getHealMultiplier(m.traits)

      // Apply base effects
      for (const [gauge, val] of Object.entries(activity.effects)) {
        const applied = val > 0 ? val * healMult : val
        m.gauges[gauge] = (m.gauges[gauge] || 0) + applied
      }

      // Trait modifiers on activities
      if (m.traits.includes('Energique')) {
        if (activity.id === 'courir' || activity.id === 'danser') {
          m.gauges.bonheur += 10
        }
        if (activity.id === 'dormir' && activity.effects.energie) {
          // Undo base energy effect then apply 80%
          const baseEnergy = activity.effects.energie > 0 ? activity.effects.energie * healMult : activity.effects.energie
          m.gauges.energie -= baseEnergy
          m.gauges.energie += baseEnergy * 0.8
        }
      }

      if (m.traits.includes('Paresseux')) {
        if (activity.id === 'courir') m.gauges.bonheur -= 15
        if (activity.id === 'danser') m.gauges.bonheur -= 5
        if (activity.id === 'dormir') m.gauges.bonheur += 10
      }

      if (m.traits.includes('Calin')) {
        if (activity.id === 'calin') m.gauges.bonheur += 15
        if (activity.id === 'jouer') m.gauges.bonheur -= 5
      }

      if (m.traits.includes('Tetu')) {
        if (activity.id === 'laver' || activity.id === 'dormir') m.gauges.bonheur -= 5
      }

      let pts = activity.points
      if (m.traits.includes('Curieux')) {
        if (activity.id === 'lire' || activity.id === 'dessiner') {
          m.gauges.bonheur += 10
          pts += 5
        }
        if (activity.id === 'jouer') m.gauges.bonheur += 5
        if (activity.id === 'courir') m.gauges.bonheur -= 5
      }

      // Clamp all gauges
      for (const g of ['faim', 'energie', 'bonheur', 'sante']) {
        m.gauges[g] = clamp(m.gauges[g])
      }

      m.sessionScore += pts

      // Sleep
      if (activity.id === 'dormir') {
        m.isSleeping = true
        m.sleepUntil = Date.now() + 30 * 60 * 1000
      }

      // Heal activity (câlin or se laver)
      if (m.isSick && (activity.id === 'calin' || activity.id === 'laver')) {
        m.healActivityDone = true
        if ((m.goodFoodStreak || 0) >= 3) {
          m.isSick = false
          m.sickUntil = null
          m.goodFoodStreak = 0
          m.healActivityDone = false
          m.sessionScore += 15
        }
      }

      m.lastUpdated = Date.now()
      const p = { ...prev.player, totalScore: prev.player.totalScore + pts }
      const delta = {
        faim: Math.round(m.gauges.faim - gaugesBefore.faim),
        energie: Math.round(m.gauges.energie - gaugesBefore.energie),
        bonheur: Math.round(m.gauges.bonheur - gaugesBefore.bonheur),
        sante: Math.round(m.gauges.sante - gaugesBefore.sante),
      }
      return { ...prev, momoz: m, player: p, lastGaugeDelta: delta }
    })
  }, [setState])

  const handleDeath = useCallback(() => {
    setState((prev) => {
      if (!prev.momoz) return prev
      const m = prev.momoz
      const deathType = m._deathType || checkDeath(m) || 'premature'
      const isNatural = deathType === 'natural'
      const finalScore = isNatural ? m.sessionScore + 200 : 0

      const historyEntry = {
        name: m.name,
        gender: m.gender,
        livedDays: computeDaysAlive(m.bornAt),
        points: finalScore,
        cause: isNatural ? 'Mort naturelle' : 'Mort prématurée',
        stage: STAGE_NAMES[m.stage],
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          totalScore: prev.player.totalScore + (isNatural ? 200 : 0),
          history: [...prev.player.history, historyEntry],
        },
        momoz: null,
        _lastDeath: deathType,
        _lastDeathScore: finalScore,
      }
    })
  }, [setState])

  const startNightMode = useCallback((hours) => {
    setState((prev) => {
      if (!prev.momoz) return prev
      const now = Date.now()
      return {
        ...prev,
        momoz: {
          ...prev.momoz,
          isNightMode: true,
          nightStart: now,
          nightEnd: now + hours * 3600000,
        },
      }
    })
  }, [setState])

  const refreshState = useCallback(() => {
    setState((prev) => {
      if (!prev.momoz) return prev
      const m = applyDecay(prev.momoz)
      const death = checkDeath(m)
      if (death) m._deathType = death
      return { ...prev, momoz: m }
    })
  }, [setState])

  const getGauges = useCallback(() => {
    if (!state.momoz) return null
    return { ...state.momoz.gauges }
  }, [state])

  const clearGaugeDelta = useCallback(() => {
    setState((prev) => ({ ...prev, lastGaugeDelta: null }))
  }, [setState])

  return {
    state,
    createPlayer,
    login,
    createMomoz,
    feedMomoz,
    doActivity,
    handleDeath,
    startNightMode,
    refreshState,
    computeDaysAlive,
    getGauges,
    clearGaugeDelta,
    STAGE_NAMES,
  }
}
