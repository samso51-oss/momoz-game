import { useState, useCallback, useEffect, useRef } from 'react'
import { useMomoz } from './store/useMomoz.js'
import LoginScreen from './screens/LoginScreen.jsx'
import CreateScreen from './screens/CreateScreen.jsx'
import HomeScreen from './screens/HomeScreen.jsx'
import FoodScreen from './screens/FoodScreen.jsx'
import ActivityScreen from './screens/ActivityScreen.jsx'
import ProfileScreen from './screens/ProfileScreen.jsx'
import DeathScreen from './screens/DeathScreen.jsx'

export default function App() {
  const {
    state,
    createPlayer,
    login,
    createMomoz,
    feedMomoz,
    doActivity,
    handleDeath,
    refreshState,
    getGauges,
  } = useMomoz()

  const [screen, setScreen] = useState(() => {
    if (!state.player) return 'login'
    if (state.momoz?._deathType) return 'death'
    if (!state.momoz) return 'create'
    return 'home'
  })

  const [loggedIn, setLoggedIn] = useState(!!state.player && !!state.momoz)
  const [gaugeDeltas, setGaugeDeltas] = useState(null)
  const gaugesSnapshotRef = useRef(null)
  const deltasTimerRef = useRef(null)

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Cleanup deltas timer
  useEffect(() => {
    return () => { if (deltasTimerRef.current) clearTimeout(deltasTimerRef.current) }
  }, [])

  const handleLogin = useCallback((pseudo, pin) => {
    const ok = login(pseudo, pin)
    if (ok) {
      setLoggedIn(true)
      const s = JSON.parse(localStorage.getItem('momoz-game-state'))
      if (s?.momoz?._deathType) {
        setScreen('death')
      } else if (!s?.momoz) {
        setScreen('create')
      } else {
        setScreen('home')
      }
    }
    return ok
  }, [login])

  const handleCreatePlayer = useCallback((pseudo, avatarEmoji, pin) => {
    createPlayer(pseudo, avatarEmoji, pin)
    setLoggedIn(true)
  }, [createPlayer])

  const handleNewMomoz = useCallback(() => {
    handleDeath()
    setScreen('create')
  }, [handleDeath])

  const navigate = useCallback((s) => {
    // Snapshot gauges before navigating to food/activity
    if (s === 'food' || s === 'activity') {
      gaugesSnapshotRef.current = getGauges()
    }
    setScreen(s)
  }, [getGauges])

  const handleBack = useCallback(() => {
    // Calculate deltas when coming back from food/activity
    if (gaugesSnapshotRef.current) {
      const after = getGauges()
      const before = gaugesSnapshotRef.current
      if (after && before) {
        const deltas = {}
        for (const g of ['faim', 'energie', 'bonheur', 'sante']) {
          deltas[g] = Math.round(after[g] - before[g])
        }
        setGaugeDeltas(deltas)
        if (deltasTimerRef.current) clearTimeout(deltasTimerRef.current)
        deltasTimerRef.current = setTimeout(() => setGaugeDeltas(null), 2500)
      }
      gaugesSnapshotRef.current = null
    }
    setScreen('home')
  }, [getGauges])

  // Death check
  if (loggedIn && state.momoz?._deathType && screen !== 'death') {
    setScreen('death')
  }

  if (!loggedIn && screen === 'login') {
    return (
      <div className="app-container">
        <LoginScreen
          hasAccount={!!state.player}
          onLogin={handleLogin}
          onGoCreate={() => setScreen('create')}
        />
      </div>
    )
  }

  if (screen === 'create') {
    return (
      <div className="app-container">
        <CreateScreen
          playerExists={!!state.player}
          onCreatePlayer={handleCreatePlayer}
          onCreateMomoz={createMomoz}
        />
      </div>
    )
  }

  if (screen === 'death') {
    return (
      <div className="app-container">
        <DeathScreen
          deathType={state.momoz?._deathType || state._lastDeath || 'premature'}
          score={state._lastDeathScore || 0}
          onNewMomoz={handleNewMomoz}
        />
      </div>
    )
  }

  if (screen === 'food') {
    return (
      <div className="app-container">
        <FoodScreen
          onFeed={feedMomoz}
          onBack={handleBack}
        />
      </div>
    )
  }

  if (screen === 'activity') {
    return (
      <div className="app-container">
        <ActivityScreen
          onDoActivity={doActivity}
          onBack={handleBack}
          isSleeping={state.momoz?.isSleeping}
        />
      </div>
    )
  }

  if (screen === 'profile') {
    return (
      <div className="app-container">
        <ProfileScreen
          player={state.player}
          sessionScore={state.momoz?.sessionScore || 0}
          onBack={() => setScreen('home')}
        />
      </div>
    )
  }

  return (
    <div className="app-container">
      <HomeScreen
        state={state}
        refreshState={refreshState}
        onNavigate={navigate}
        gaugeDeltas={gaugeDeltas}
      />
    </div>
  )
}
