import { describe, expect, it } from 'vitest'
import { buildLesson } from './lessonPlanner'
import { createDefaultProgress } from '../state/progressStore'

describe('buildLesson', () => {
  it('starts with an explanation and ends with a summary for a fresh table', () => {
    const progress = createDefaultProgress()
    const steps = buildLesson(2, progress)
    expect(steps[0].kind).toBe('explain')
    expect(steps[steps.length - 1].kind).toBe('summary')
  })

  it('uses at least five distinct exercise types across a full curriculum pass', () => {
    // A fresh table only shows 3-4 exercise types in one lesson (choice, groups,
    // fillBlank, input, match) — verify all five appear across the first lesson.
    const progress = createDefaultProgress()
    const steps = buildLesson(2, progress)
    const types = new Set(steps.filter((s) => s.kind === 'question').map((s) => (s as { exercise: string }).exercise))
    expect(types.size).toBeGreaterThanOrEqual(5)
  })

  it('never produces an empty question list for a fully mastered table', () => {
    let progress = createDefaultProgress()
    for (let b = 1; b <= 10; b++) {
      progress = {
        ...progress,
        examples: {
          ...progress.examples,
          [`2x${b}`]: { attempts: 5, correct: 5, incorrect: 0, independentStreak: 3, hintUsedLast: false, lastResult: 'correct', lastPracticedAt: null, state: 'confident' },
        },
      }
    }
    const steps = buildLesson(2, progress)
    expect(steps.filter((s) => s.kind === 'question').length).toBeGreaterThan(0)
  })
})
