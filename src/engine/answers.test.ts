import { describe, expect, it } from 'vitest'
import { generateChoiceOptions, generateDistractors } from './answers'

describe('generateDistractors', () => {
  it('never includes the correct answer', () => {
    for (let a = 2; a <= 10; a++) {
      for (let b = 1; b <= 10; b++) {
        const answer = a * b
        const distractors = generateDistractors(a, b)
        expect(distractors).not.toContain(answer)
      }
    }
  })

  it('never produces negative or zero values', () => {
    for (let a = 2; a <= 10; a++) {
      for (let b = 1; b <= 10; b++) {
        const distractors = generateDistractors(a, b)
        for (const d of distractors) expect(d).toBeGreaterThan(0)
      }
    }
  })

  it('returns unique values', () => {
    const distractors = generateDistractors(4, 6)
    expect(new Set(distractors).size).toBe(distractors.length)
  })
})

describe('generateChoiceOptions', () => {
  it('always includes exactly one correct answer among 4 unique options', () => {
    for (let a = 2; a <= 10; a++) {
      for (let b = 1; b <= 10; b++) {
        const answer = a * b
        const options = generateChoiceOptions(a, b)
        expect(options).toHaveLength(4)
        expect(new Set(options).size).toBe(4)
        expect(options.filter((o) => o === answer)).toHaveLength(1)
        for (const o of options) expect(o).toBeGreaterThan(0)
      }
    }
  })
})
