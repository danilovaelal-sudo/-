import { MASTERY_UNLOCK_THRESHOLD } from '../data/curriculum'
import {
  CUSTOM_ORDER,
  ExampleProgress,
  LearningOrder,
  Progress,
  SCHOOL_ORDER,
  TableModuleStatus,
  TableNumber,
  exampleKey,
} from '../state/types'

export function emptyExampleProgress(): ExampleProgress {
  return {
    attempts: 0,
    correct: 0,
    incorrect: 0,
    independentStreak: 0,
    hintUsedLast: false,
    lastResult: null,
    lastPracticedAt: null,
    state: 'new',
    flashcardViews: 0,
    selfKnownCount: 0,
    selfReviewCount: 0,
    lastFlashcardAt: null,
  }
}

export function orderForSettings(order: LearningOrder): TableNumber[] {
  return order === 'school' ? SCHOOL_ORDER : CUSTOM_ORDER
}

type AnswerInput = {
  correct: boolean
  hintUsed: boolean
  /** Visual model (dot grid) was shown alongside the question. */
  supported: boolean
}

export function applyAnswer(prev: ExampleProgress, input: AnswerInput): ExampleProgress {
  const base: ExampleProgress = {
    ...prev,
    attempts: prev.attempts + 1,
    correct: prev.correct + (input.correct ? 1 : 0),
    incorrect: prev.incorrect + (input.correct ? 0 : 1),
    hintUsedLast: input.hintUsed,
    lastResult: input.correct ? 'correct' : 'incorrect',
    lastPracticedAt: new Date().toISOString(),
  }

  if (!input.correct) {
    return { ...base, state: 'review', independentStreak: 0 }
  }

  if (input.hintUsed) {
    // A correct answer right after a hint proves the fact still needs support.
    return { ...base, state: 'learning', independentStreak: 0 }
  }

  if (input.supported) {
    const state = prev.state === 'new' || prev.state === 'review' ? 'learning' : prev.state
    return { ...base, state }
  }

  // Independent recall: no hint, no visual support on screen.
  const independentStreak = prev.independentStreak + 1
  if (prev.state === 'confident') {
    return { ...base, state: 'confident', independentStreak }
  }
  if (prev.state === 'familiar' && independentStreak >= 2) {
    return { ...base, state: 'confident', independentStreak }
  }
  if (prev.state === 'familiar') {
    return { ...base, state: 'familiar', independentStreak }
  }
  // new, learning, or recovering from review
  return { ...base, state: 'familiar', independentStreak: 1 }
}

/**
 * Flashcards self-assessment is a weaker signal than a verified answer — it only
 * updates the flashcard-specific counters, never the main mastery `state`.
 */
export function applyFlashcardAssessment(prev: ExampleProgress, known: boolean): ExampleProgress {
  return {
    ...prev,
    flashcardViews: prev.flashcardViews + 1,
    selfKnownCount: prev.selfKnownCount + (known ? 1 : 0),
    selfReviewCount: prev.selfReviewCount + (known ? 0 : 1),
    lastFlashcardAt: new Date().toISOString(),
  }
}

export function tableFactStates(progress: Progress, tableNumber: TableNumber): ExampleProgress[] {
  const facts: ExampleProgress[] = []
  for (let b = 1; b <= 10; b++) {
    facts.push(progress.examples[exampleKey(tableNumber, b)] ?? emptyExampleProgress())
  }
  return facts
}

export function confidentCount(progress: Progress, tableNumber: TableNumber): number {
  return tableFactStates(progress, tableNumber).filter((f) => f.state === 'confident').length
}

/** Facts the child has met at least once (any state past "new"), regardless of mastery. */
export function introducedCount(progress: Progress, tableNumber: TableNumber): number {
  return tableFactStates(progress, tableNumber).filter((f) => f.state !== 'new').length
}

export function hasReviewFacts(progress: Progress, tableNumber: TableNumber): boolean {
  return tableFactStates(progress, tableNumber).some((f) => f.state === 'review')
}

export function attemptedCount(progress: Progress, tableNumber: TableNumber): number {
  return tableFactStates(progress, tableNumber).filter((f) => f.attempts > 0).length
}

export function tableModuleStatus(progress: Progress, tableNumber: TableNumber): TableModuleStatus {
  const order = orderForSettings(progress.settings.order)
  const idx = order.indexOf(tableNumber)
  const prevMastered =
    idx <= 0 || confidentCount(progress, order[idx - 1]) >= MASTERY_UNLOCK_THRESHOLD
  if (!prevMastered) return 'locked'
  if (confidentCount(progress, tableNumber) >= MASTERY_UNLOCK_THRESHOLD) return 'mastered'
  if (attemptedCount(progress, tableNumber) > 0) return 'in_progress'
  return 'available'
}

export function nextRecommendedTable(progress: Progress): TableNumber | null {
  const order = orderForSettings(progress.settings.order)
  for (const table of order) {
    const status = tableModuleStatus(progress, table)
    if (status === 'available' || status === 'in_progress') return table
  }
  // everything mastered, or nothing unlocked yet (first run) -> first table
  return order[0] ?? null
}

export function tableStateCounts(progress: Progress, tableNumber: TableNumber): Record<ExampleProgress['state'], number> {
  const counts: Record<ExampleProgress['state'], number> = { new: 0, learning: 0, familiar: 0, confident: 0, review: 0 }
  for (const fact of tableFactStates(progress, tableNumber)) {
    counts[fact.state] += 1
  }
  return counts
}

export function overallStats(progress: Progress): {
  startedTables: number
  masteredTables: number
  totalConfidentFacts: number
  totalIntroducedFacts: number
  totalFacts: number
  percentComplete: number
} {
  const order = orderForSettings(progress.settings.order)
  let startedTables = 0
  let masteredTables = 0
  let totalConfidentFacts = 0
  let totalIntroducedFacts = 0
  for (const table of order) {
    const status = tableModuleStatus(progress, table)
    if (status === 'locked') continue
    if (attemptedCount(progress, table) > 0) startedTables += 1
    if (status === 'mastered') masteredTables += 1
    totalConfidentFacts += confidentCount(progress, table)
    totalIntroducedFacts += introducedCount(progress, table)
  }
  const totalFacts = order.length * 10
  const percentComplete = totalFacts > 0 ? Math.round((totalConfidentFacts / totalFacts) * 100) : 0
  return { startedTables, masteredTables, totalConfidentFacts, totalIntroducedFacts, totalFacts, percentComplete }
}

export function allDifficultExamples(progress: Progress): { a: TableNumber; b: number; progress: ExampleProgress }[] {
  const order = orderForSettings(progress.settings.order)
  const results: { a: TableNumber; b: number; progress: ExampleProgress }[] = []
  for (const a of order) {
    if (tableModuleStatus(progress, a) === 'locked') continue
    for (let b = 1; b <= 10; b++) {
      const key = exampleKey(a, b)
      const fact = progress.examples[key]
      if (fact && fact.state === 'review') {
        results.push({ a, b, progress: fact })
      }
    }
  }
  return results.sort((x, y) => (y.progress.lastPracticedAt ?? '').localeCompare(x.progress.lastPracticedAt ?? ''))
}
