import { describe, expect, it } from 'vitest'
import { buildDeck } from './flashcardEngine'
import { emptyExampleProgress } from './exampleProgress'
import { createDefaultProgress } from '../state/progressStore'
import { exampleKey } from '../state/types'

describe('buildDeck', () => {
  it('builds one card per fact (1-10) for each selected table', () => {
    const progress = createDefaultProgress()
    const deck = buildDeck({ scope: 'tables', tables: [2, 3], order: 'sequential', count: 'all' }, progress)
    expect(deck).toHaveLength(20)
    expect(deck.filter((f) => f.a === 2)).toHaveLength(10)
    expect(deck.filter((f) => f.a === 3)).toHaveLength(10)
  })

  it('keeps sequential order stable and shuffled order a permutation of the same facts', () => {
    const progress = createDefaultProgress()
    const sequential = buildDeck({ scope: 'tables', tables: [2], order: 'sequential', count: 'all' }, progress)
    expect(sequential.map((f) => f.b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    const shuffled = buildDeck({ scope: 'tables', tables: [2], order: 'shuffled', count: 'all' }, progress)
    expect(shuffled).toHaveLength(10)
    expect(new Set(shuffled.map((f) => f.b))).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))
  })

  it('caps the deck at the requested count without losing distinct facts', () => {
    const progress = createDefaultProgress()
    const deck = buildDeck({ scope: 'tables', tables: [2], order: 'sequential', count: 5 }, progress)
    expect(deck).toHaveLength(5)
  })

  it('scope "difficult" only pulls facts left in the review state', () => {
    let progress = createDefaultProgress()
    progress = {
      ...progress,
      examples: {
        ...progress.examples,
        [exampleKey(2, 4)]: { ...emptyExampleProgress(), state: 'review' },
      },
    }
    const deck = buildDeck({ scope: 'difficult', tables: [], order: 'sequential', count: 'all' }, progress)
    expect(deck).toEqual([{ a: 2, b: 4 }])
  })

  it('scope "learned" only pulls facts from tables the child has already started', () => {
    let progress = createDefaultProgress()
    progress = {
      ...progress,
      examples: {
        ...progress.examples,
        [exampleKey(2, 1)]: { ...emptyExampleProgress(), attempts: 1, state: 'learning' },
      },
    }
    const deck = buildDeck({ scope: 'learned', tables: [], order: 'sequential', count: 'all' }, progress)
    expect(deck.every((f) => f.a === 2)).toBe(true)
    expect(deck.length).toBeGreaterThan(0)
  })
})
