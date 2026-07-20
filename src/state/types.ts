export type Screen =
  | 'today'
  | 'learn'
  | 'practice'
  | 'progress'
  | 'settings'
  | 'fullTable'
  | 'lesson'
  | 'practiceSession'
  | 'flashcardsSetup'
  | 'flashcardsSession'

export const TABLE_NUMBERS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const
export type TableNumber = (typeof TABLE_NUMBERS)[number]

export const CUSTOM_ORDER: TableNumber[] = [2, 5, 10, 3, 4, 6, 9, 7, 8]
export const SCHOOL_ORDER: TableNumber[] = [2, 3, 4, 5, 6, 7, 8, 9, 10]

export type LearningOrder = 'custom' | 'school'

/** Mastery state of a single multiplication fact, e.g. 3x4. Driven only by verified answers. */
export type ExampleState = 'new' | 'learning' | 'familiar' | 'confident' | 'review'

export type ExampleProgress = {
  attempts: number
  correct: number
  incorrect: number
  independentStreak: number
  hintUsedLast: boolean
  lastResult: 'correct' | 'incorrect' | null
  lastPracticedAt: string | null
  state: ExampleState
  /** Flashcards self-assessment — a weaker signal, kept separate from `state`. */
  flashcardViews: number
  selfKnownCount: number
  selfReviewCount: number
  lastFlashcardAt: string | null
}

export type ExampleKey = `${number}x${number}`

export type SessionRecord = {
  date: string
  tableNumber: TableNumber
  durationSec: number
  completedCount: number
  newlyMastered: number
  /** A session ended early via "Закончить занятие" instead of reaching the summary naturally. */
  endedEarly?: boolean
}

export type FlashcardSessionRecord = {
  date: string
  viewed: number
  known: number
  review: number
}

export type ExerciseType = 'choice' | 'input' | 'groups' | 'fillBlank' | 'match'
/** Keys for the "seen the first-time explanation" flags — exercise types plus flashcards. */
export type IntroKey = ExerciseType | 'flashcards'

export type Settings = {
  childName: string
  soundEnabled: boolean
  reducedMotion: boolean
  order: LearningOrder
  defaultQuestionCount: 5 | 10 | 15
  seenIntros: Partial<Record<IntroKey, boolean>>
}

export type Fact = { a: number; b: number }

export type SupportLevel = 'full' | 'partial' | 'none'

export type LessonStep =
  | { kind: 'explain'; fact: Fact }
  | {
      kind: 'question'
      id: string
      fact: Fact
      exercise: ExerciseType
      support: SupportLevel
      matchPairs?: Fact[]
    }
  | { kind: 'summary' }

export type PendingLesson = {
  tableNumber: TableNumber
  steps: LessonStep[]
  stepIndex: number
  touchedFactKeys: ExampleKey[]
  startedAt: string
}

export type PracticeMode = 'hard' | 'mixed' | 'free'

export type PracticeConfig = {
  mode: PracticeMode
  count: 5 | 10 | 15
  tables?: TableNumber[]
}

export type FlashcardScope = 'tables' | 'learned' | 'difficult'
export type FlashcardOrder = 'sequential' | 'shuffled'
export type FlashcardCount = 5 | 10 | 'all'

export type FlashcardSelection = {
  scope: FlashcardScope
  tables: TableNumber[]
  order: FlashcardOrder
  count: FlashcardCount
}

export type FlashcardAssessment = 'known' | 'review'

export type PendingFlashcards = {
  deck: Fact[]
  index: number
  known: number
  review: number
  /** Facts marked "needs review" that are due to reappear after a given position. */
  requeue: { fact: Fact; dueAt: number }[]
  reviewedFacts: ExampleKey[]
  startedAt: string
}

export type Progress = {
  version: 3
  examples: Record<ExampleKey, ExampleProgress>
  settings: Settings
  streakDays: number
  lastActiveDate: string | null
  sessions: SessionRecord[]
  flashcardSessions: FlashcardSessionRecord[]
  pendingLesson: PendingLesson | null
  pendingFlashcards: PendingFlashcards | null
}

export type TableModuleStatus = 'locked' | 'available' | 'in_progress' | 'mastered'

export function exampleKey(a: number, b: number): ExampleKey {
  return `${a}x${b}`
}
