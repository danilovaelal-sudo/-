import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { BADGES } from '../engine/mastery'
import { loadProgress, recordAnswer as recordAnswerInStore, resetProgress as resetProgressInStore, saveProgress, toggleSound as toggleSoundInStore } from './progressStore'
import { Progress, Screen } from './types'

type State = {
  screen: Screen
  progress: Progress
  lastEarnedBadgeId: string | null
}

type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'RECORD_ANSWER'; tableNumber: number; correct: boolean }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'RESET_PROGRESS' }
  | { type: 'CLEAR_NEW_BADGE' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen }
    case 'RECORD_ANSWER': {
      const prevBadges = new Set(state.progress.badges)
      const nextProgress = recordAnswerInStore(state.progress, action.tableNumber, action.correct)
      const newlyEarned = nextProgress.badges.find((id) => !prevBadges.has(id)) ?? null
      return { ...state, progress: nextProgress, lastEarnedBadgeId: newlyEarned }
    }
    case 'TOGGLE_SOUND':
      return { ...state, progress: toggleSoundInStore(state.progress) }
    case 'RESET_PROGRESS':
      return { ...state, progress: resetProgressInStore() }
    case 'CLEAR_NEW_BADGE':
      return { ...state, lastEarnedBadgeId: null }
    default:
      return state
  }
}

type AppContextValue = {
  screen: Screen
  progress: Progress
  setScreen: (screen: Screen) => void
  recordAnswer: (tableNumber: number, correct: boolean) => void
  toggleSound: () => void
  resetProgress: () => void
  newlyEarnedBadge: ReturnType<typeof getBadgeById>
  clearNewBadge: () => void
}

function getBadgeById(id: string | null) {
  if (!id) return null
  return BADGES.find((b) => b.id === id) ?? null
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    screen: 'home' as Screen,
    progress: loadProgress(),
    lastEarnedBadgeId: null,
  }))

  useEffect(() => {
    saveProgress(state.progress)
  }, [state.progress])

  const setScreen = useCallback((screen: Screen) => dispatch({ type: 'SET_SCREEN', screen }), [])
  const recordAnswer = useCallback(
    (tableNumber: number, correct: boolean) => dispatch({ type: 'RECORD_ANSWER', tableNumber, correct }),
    [],
  )
  const toggleSound = useCallback(() => dispatch({ type: 'TOGGLE_SOUND' }), [])
  const resetProgress = useCallback(() => dispatch({ type: 'RESET_PROGRESS' }), [])
  const clearNewBadge = useCallback(() => dispatch({ type: 'CLEAR_NEW_BADGE' }), [])

  const value = useMemo<AppContextValue>(
    () => ({
      screen: state.screen,
      progress: state.progress,
      setScreen,
      recordAnswer,
      toggleSound,
      resetProgress,
      newlyEarnedBadge: getBadgeById(state.lastEarnedBadgeId),
      clearNewBadge,
    }),
    [state, setScreen, recordAnswer, toggleSound, resetProgress, clearNewBadge],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
