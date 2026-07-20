export type Screen = 'home' | 'table' | 'quiz' | 'progress'

export type NumberStats = {
  attempts: number
  correct: number
  masteryStars: 0 | 1 | 2 | 3
}

export type Progress = {
  statsByNumber: Record<number, NumberStats>
  totalStars: number
  badges: string[]
  bestStreak: number
  currentStreak: number
  soundEnabled: boolean
  lastPlayedAt: string
}

export type Badge = {
  id: string
  title: string
  description: string
  icon: string
}

export type QuizQuestion = {
  a: number
  b: number
  answer: number
  options: number[]
}

export const TABLE_MIN = 1
export const TABLE_MAX = 10
