import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import {
  loadProgress,
  recordExampleAnswer,
  recordSession as recordSessionInStore,
  resetProgress as resetProgressInStore,
  saveProgress,
  updateSettings as updateSettingsInStore,
} from './progressStore'
import { PracticeConfig, Progress, Screen, SessionRecord, Settings, TableNumber } from './types'

type State = {
  screen: Screen
  progress: Progress
  activeLessonTable: TableNumber | null
  activePracticeConfig: PracticeConfig | null
}

type AnswerInput = { correct: boolean; hintUsed: boolean; supported: boolean }

type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'RECORD_ANSWER'; a: number; b: number; input: AnswerInput }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<Settings> }
  | { type: 'RESET_PROGRESS' }
  | { type: 'RECORD_SESSION'; session: Omit<SessionRecord, 'date'> }
  | { type: 'START_LESSON'; table: TableNumber }
  | { type: 'START_PRACTICE'; config: PracticeConfig }
  | { type: 'END_FLOW'; nextScreen: Screen }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen }
    case 'RECORD_ANSWER':
      return { ...state, progress: recordExampleAnswer(state.progress, action.a, action.b, action.input) }
    case 'UPDATE_SETTINGS':
      return { ...state, progress: updateSettingsInStore(state.progress, action.patch) }
    case 'RESET_PROGRESS':
      return { ...state, progress: resetProgressInStore() }
    case 'RECORD_SESSION':
      return { ...state, progress: recordSessionInStore(state.progress, action.session) }
    case 'START_LESSON':
      return { ...state, screen: 'lesson', activeLessonTable: action.table }
    case 'START_PRACTICE':
      return { ...state, screen: 'practiceSession', activePracticeConfig: action.config }
    case 'END_FLOW':
      return { ...state, screen: action.nextScreen, activeLessonTable: null, activePracticeConfig: null }
    default:
      return state
  }
}

type AppContextValue = {
  screen: Screen
  progress: Progress
  activeLessonTable: TableNumber | null
  activePracticeConfig: PracticeConfig | null
  setScreen: (screen: Screen) => void
  recordAnswer: (a: number, b: number, input: AnswerInput) => void
  updateSettings: (patch: Partial<Settings>) => void
  resetProgress: () => void
  recordSession: (session: Omit<SessionRecord, 'date'>) => void
  startLesson: (table: TableNumber) => void
  startPractice: (config: PracticeConfig) => void
  endFlow: (nextScreen: Screen) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    screen: 'today' as Screen,
    progress: loadProgress(),
    activeLessonTable: null,
    activePracticeConfig: null,
  }))

  useEffect(() => {
    saveProgress(state.progress)
  }, [state.progress])

  useEffect(() => {
    const root = document.documentElement
    if (state.progress.settings.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }
  }, [state.progress.settings.reducedMotion])

  const setScreen = useCallback((screen: Screen) => dispatch({ type: 'SET_SCREEN', screen }), [])
  const recordAnswer = useCallback(
    (a: number, b: number, input: AnswerInput) => dispatch({ type: 'RECORD_ANSWER', a, b, input }),
    [],
  )
  const updateSettings = useCallback((patch: Partial<Settings>) => dispatch({ type: 'UPDATE_SETTINGS', patch }), [])
  const resetProgress = useCallback(() => dispatch({ type: 'RESET_PROGRESS' }), [])
  const recordSession = useCallback(
    (session: Omit<SessionRecord, 'date'>) => dispatch({ type: 'RECORD_SESSION', session }),
    [],
  )
  const startLesson = useCallback((table: TableNumber) => dispatch({ type: 'START_LESSON', table }), [])
  const startPractice = useCallback((config: PracticeConfig) => dispatch({ type: 'START_PRACTICE', config }), [])
  const endFlow = useCallback((nextScreen: Screen) => dispatch({ type: 'END_FLOW', nextScreen }), [])

  const value = useMemo<AppContextValue>(
    () => ({
      screen: state.screen,
      progress: state.progress,
      activeLessonTable: state.activeLessonTable,
      activePracticeConfig: state.activePracticeConfig,
      setScreen,
      recordAnswer,
      updateSettings,
      resetProgress,
      recordSession,
      startLesson,
      startPractice,
      endFlow,
    }),
    [state, setScreen, recordAnswer, updateSettings, resetProgress, recordSession, startLesson, startPractice, endFlow],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
