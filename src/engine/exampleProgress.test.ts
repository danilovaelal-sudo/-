import { describe, expect, it } from 'vitest'
import { applyAnswer, emptyExampleProgress, tableModuleStatus, allDifficultExamples } from './exampleProgress'
import { createDefaultProgress } from '../state/progressStore'
import { exampleKey } from '../state/types'

describe('applyAnswer state machine', () => {
  it('moves a new fact to review after a wrong answer', () => {
    const next = applyAnswer(emptyExampleProgress(), { correct: false, hintUsed: false, supported: false })
    expect(next.state).toBe('review')
    expect(next.incorrect).toBe(1)
  })

  it('caps a hinted correct answer at "learning", never higher', () => {
    const confident = { ...emptyExampleProgress(), state: 'confident' as const }
    const next = applyAnswer(confident, { correct: true, hintUsed: true, supported: false })
    expect(next.state).toBe('learning')
  })

  it('moves new -> learning on a supported correct answer', () => {
    const next = applyAnswer(emptyExampleProgress(), { correct: true, hintUsed: false, supported: true })
    expect(next.state).toBe('learning')
  })

  it('moves new -> familiar on an independent correct answer', () => {
    const next = applyAnswer(emptyExampleProgress(), { correct: true, hintUsed: false, supported: false })
    expect(next.state).toBe('familiar')
  })

  it('requires two independent correct answers to reach confident', () => {
    let state = emptyExampleProgress()
    state = applyAnswer(state, { correct: true, hintUsed: false, supported: false })
    expect(state.state).toBe('familiar')
    state = applyAnswer(state, { correct: true, hintUsed: false, supported: false })
    expect(state.state).toBe('confident')
  })

  it('never downgrades a confident fact on a supported correct repeat', () => {
    const confident = { ...emptyExampleProgress(), state: 'confident' as const }
    const next = applyAnswer(confident, { correct: true, hintUsed: false, supported: true })
    expect(next.state).toBe('confident')
  })
})

describe('table unlock progression', () => {
  it('locks every table except the first when nothing has been practiced', () => {
    const progress = createDefaultProgress()
    expect(tableModuleStatus(progress, 2)).toBe('available')
    expect(tableModuleStatus(progress, 5)).toBe('locked')
  })

  it('unlocks the next table once the previous one is mastered', () => {
    let progress = createDefaultProgress()
    for (let b = 1; b <= 10; b++) {
      const key = exampleKey(2, b)
      progress = {
        ...progress,
        examples: {
          ...progress.examples,
          [key]: { ...emptyExampleProgress(), state: 'confident', attempts: 2, correct: 2 },
        },
      }
    }
    expect(tableModuleStatus(progress, 2)).toBe('mastered')
    expect(tableModuleStatus(progress, 5)).toBe('available')
    expect(tableModuleStatus(progress, 10)).toBe('locked')
  })
})

describe('difficult examples', () => {
  it('surfaces facts left in the "review" state', () => {
    let progress = createDefaultProgress()
    const key = exampleKey(2, 4)
    progress = {
      ...progress,
      examples: { ...progress.examples, [key]: { ...emptyExampleProgress(), state: 'review', attempts: 2, incorrect: 2 } },
    }
    const difficult = allDifficultExamples(progress)
    expect(difficult.some((f) => f.a === 2 && f.b === 4)).toBe(true)
  })
})
