import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import {
  clearPendingFlashcards as clearPendingFlashcardsInStore,
  clearPendingLesson as clearPendingLessonInStore,
  loadProgress,
  markIntroSeen as markIntroSeenInStore,
  recordExampleAnswer,
  recordFlashcardAssessment as recordFlashcardAssessmentInStore,
  recordFlashcardSession as recordFlashcardSessionInStore,
  recordSession as recordSessionInStore,
  resetIntro as resetIntroInStore,
  resetProgress as resetProgressInStore,
  savePendingFlashcards as savePendingFlashcardsInStore,
  savePendingLesson as savePendingLessonInStore,
  saveProgress,
  updateSettings as updateSettingsInStore,
} from './progressStore'
import {
  FlashcardSessionRecord,
  IntroKey,
  PendingFlashcards,
  PendingLesson,
  PracticeConfig,
  Progress,
  Screen,
  SessionRecord,
  Settings,
  TableNumber,
} from './types'

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
  | { type: 'RESUME_LESSON' }
  | { type: 'START_PRACTICE'; config: PracticeConfig }
  | { type: 'END_FLOW'; nextScreen: Screen }
  | { type: 'MARK_INTRO_SEEN'; key: IntroKey }
  | { type: 'RESET_INTRO'; key: IntroKey }
  | { type: 'RECORD_FLASHCARD_ASSESSMENT'; a: number; b: number; known: boolean }
  | { type: 'RECORD_FLASHCARD_SESSION'; record: Omit<FlashcardSessionRecord, 'date'> }
  | { type: 'SAVE_PENDING_LESSON'; pendingLesson: PendingLesson }
  | { type: 'CLEAR_PENDING_LESSON' }
  | { type: 'START_FLASHCARDS'; pendingFlashcards: PendingFlashcards }
  | { type: 'RESUME_FLASHCARDS' }
  | { type: 'UPDATE_PENDING_FLASHCARDS'; pendingFlashcards: PendingFlashcards }
  | { type: 'CLEAR_PENDING_FLASHCARDS' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen }
    case 'RECORD_ANSWER':
      return { ...state, progress: recordExampleAnswer(state.progress, action.a, action.b, action.input) }
    case 'UPDATE_SETTINGS':
      return { ...state, progress: updateSettingsInStore(state.progress, action.patch) }
    case 'RESET_PROGRESS':
      return { ...state, progress: resetProgressInStore(), activeLessonTable: null, activePracticeConfig: null }
    case 'RECORD_SESSION':
      return { ...state, progress: recordSessionInStore(state.progress, action.session) }
    case 'START_LESSON':
      return { ...state, screen: 'lesson', activeLessonTable: action.table }
    case 'RESUME_LESSON': {
      const table = state.progress.pendingLesson?.tableNumber
      if (!table) return state
      return { ...state, screen: 'lesson', activeLessonTable: table }
    }
    case 'START_PRACTICE':
      return { ...state, screen: 'practiceSession', activePracticeConfig: action.config }
    case 'END_FLOW':
      return { ...state, screen: action.nextScreen, activeLessonTable: null, activePracticeConfig: null }
    case 'MARK_INTRO_SEEN':
      return { ...state, progress: markIntroSeenInStore(state.progress, action.key) }
    case 'RESET_INTRO':
      return { ...state, progress: resetIntroInStore(state.progress, action.key) }
    case 'RECORD_FLASHCARD_ASSESSMENT':
      return { ...state, progress: recordFlashcardAssessmentInStore(state.progress, action.a, action.b, action.known) }
    case 'RECORD_FLASHCARD_SESSION':
      return { ...state, progress: recordFlashcardSessionInStore(state.progress, action.record) }
    case 'SAVE_PENDING_LESSON':
      return { ...state, progress: savePendingLessonInStore(state.progress, action.pendingLesson) }
    case 'CLEAR_PENDING_LESSON':
      return { ...state, progress: clearPendingLessonInStore(state.progress) }
    case 'START_FLASHCARDS':
      return {
        ...state,
        screen: 'flashcardsSession',
        progress: savePendingFlashcardsInStore(state.progress, action.pendingFlashcards),
      }
    case 'RESUME_FLASHCARDS':
      if (!state.progress.pendingFlashcards) return state
      return { ...state, screen: 'flashcardsSession' }
    case 'UPDATE_PENDING_FLASHCARDS':
      return { ...state, progress: savePendingFlashcardsInStore(state.progress, action.pendingFlashcards) }
    case 'CLEAR_PENDING_FLASHCARDS':
      return { ...state, progress: clearPendingFlashcardsInStore(state.progress) }
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
  resumeLesson: () => void
  startPractice: (config: PracticeConfig) => void
  endFlow: (nextScreen: Screen) => void
  markIntroSeen: (key: IntroKey) => void
  resetIntro: (key: IntroKey) => void
  recordFlashcardAssessment: (a: number, b: number, known: boolean) => void
  recordFlashcardSession: (record: Omit<FlashcardSessionRecord, 'date'>) => void
  savePendingLesson: (pendingLesson: PendingLesson) => void
  clearPendingLesson: () => void
  startFlashcards: (pendingFlashcards: PendingFlashcards) => void
  resumeFlashcards: () => void
  updatePendingFlashcards: (pendingFlashcards: PendingFlashcards) => void
  clearPendingFlashcards: () => void
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
  const resumeLesson = useCallback(() => dispatch({ type: 'RESUME_LESSON' }), [])
  const startPractice = useCallback((config: PracticeConfig) => dispatch({ type: 'START_PRACTICE', config }), [])
  const endFlow = useCallback((nextScreen: Screen) => dispatch({ type: 'END_FLOW', nextScreen }), [])
  const markIntroSeen = useCallback((key: IntroKey) => dispatch({ type: 'MARK_INTRO_SEEN', key }), [])
  const resetIntro = useCallback((key: IntroKey) => dispatch({ type: 'RESET_INTRO', key }), [])
  const recordFlashcardAssessment = useCallback(
    (a: number, b: number, known: boolean) => dispatch({ type: 'RECORD_FLASHCARD_ASSESSMENT', a, b, known }),
    [],
  )
  const recordFlashcardSession = useCallback(
    (record: Omit<FlashcardSessionRecord, 'date'>) => dispatch({ type: 'RECORD_FLASHCARD_SESSION', record }),
    [],
  )
  const savePendingLesson = useCallback(
    (pendingLesson: PendingLesson) => dispatch({ type: 'SAVE_PENDING_LESSON', pendingLesson }),
    [],
  )
  const clearPendingLesson = useCallback(() => dispatch({ type: 'CLEAR_PENDING_LESSON' }), [])
  const startFlashcards = useCallback(
    (pendingFlashcards: PendingFlashcards) => dispatch({ type: 'START_FLASHCARDS', pendingFlashcards }),
    [],
  )
  const resumeFlashcards = useCallback(() => dispatch({ type: 'RESUME_FLASHCARDS' }), [])
  const updatePendingFlashcards = useCallback(
    (pendingFlashcards: PendingFlashcards) => dispatch({ type: 'UPDATE_PENDING_FLASHCARDS', pendingFlashcards }),
    [],
  )
  const clearPendingFlashcards = useCallback(() => dispatch({ type: 'CLEAR_PENDING_FLASHCARDS' }), [])

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
      resumeLesson,
      startPractice,
      endFlow,
      markIntroSeen,
      resetIntro,
      recordFlashcardAssessment,
      recordFlashcardSession,
      savePendingLesson,
      clearPendingLesson,
      startFlashcards,
      resumeFlashcards,
      updatePendingFlashcards,
      clearPendingFlashcards,
    }),
    [
      state,
      setScreen,
      recordAnswer,
      updateSettings,
      resetProgress,
      recordSession,
      startLesson,
      resumeLesson,
      startPractice,
      endFlow,
      markIntroSeen,
      resetIntro,
      recordFlashcardAssessment,
      recordFlashcardSession,
      savePendingLesson,
      clearPendingLesson,
      startFlashcards,
      resumeFlashcards,
      updatePendingFlashcards,
      clearPendingFlashcards,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
