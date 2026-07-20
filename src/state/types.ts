export type Screen = 'today' | 'learn' | 'practice' | 'progress' | 'settings' | 'fullTable' | 'lesson' | 'practiceSession'

export const TABLE_NUMBERS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const
export type TableNumber = (typeof TABLE_NUMBERS)[number]

export const CUSTOM_ORDER: TableNumber[] = [2, 5, 10, 3, 4, 6, 9, 7, 8]
export const SCHOOL_ORDER: TableNumber[] = [2, 3, 4, 5, 6, 7, 8, 9, 10]

export type LearningOrder = 'custom' | 'school'

/** Mastery state of a single multiplication fact, e.g. 3x4. */
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
}

export type ExampleKey = `${number}x${number}`

export type SessionRecord = {
  date: string
  tableNumber: TableNumber
  durationSec: number
  completedCount: number
  newlyMastered: number
}

export type Settings = {
  childName: string
  soundEnabled: boolean
  reducedMotion: boolean
  order: LearningOrder
  defaultQuestionCount: 5 | 10 | 15
}

export type Progress = {
  version: 2
  examples: Record<ExampleKey, ExampleProgress>
  settings: Settings
  streakDays: number
  lastActiveDate: string | null
  sessions: SessionRecord[]
}

export type TableModuleStatus = 'locked' | 'available' | 'in_progress' | 'mastered'

export function exampleKey(a: number, b: number): ExampleKey {
  return `${a}x${b}`
}

export type ExerciseType = 'choice' | 'input' | 'groups' | 'fillBlank' | 'match'
export type SupportLevel = 'full' | 'partial' | 'none'

export type Fact = { a: number; b: number }

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

export type PracticeMode = 'hard' | 'mixed' | 'free'

export type PracticeConfig = {
  mode: PracticeMode
  count: 5 | 10 | 15
  tables?: TableNumber[]
}

