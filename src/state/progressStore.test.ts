import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultProgress, loadProgress, recordExampleAnswer, recordSession, resetProgress, saveProgress } from './progressStore'

class MemoryStorage {
  private store = new Map<string, string>()
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null
  }
  setItem(key: string, value: string) {
    this.store.set(key, value)
  }
  removeItem(key: string) {
    this.store.delete(key)
  }
  clear() {
    this.store.clear()
  }
}

beforeEach(() => {
  ;(globalThis as unknown as { localStorage: MemoryStorage }).localStorage = new MemoryStorage()
})

describe('loadProgress', () => {
  it('returns default progress when nothing is stored', () => {
    const progress = loadProgress()
    expect(progress.version).toBe(2)
    expect(Object.keys(progress.examples)).toHaveLength(0)
  })

  it('falls back to defaults when localStorage contains corrupted JSON', () => {
    localStorage.setItem('umno:progress:v2', '{not valid json')
    const progress = loadProgress()
    expect(progress).toEqual(createDefaultProgress())
  })

  it('falls back to defaults when the stored version does not match', () => {
    localStorage.setItem('umno:progress:v2', JSON.stringify({ version: 1, foo: 'bar' }))
    const progress = loadProgress()
    expect(progress.version).toBe(2)
  })

  it('round-trips a saved progress object', () => {
    const progress = recordExampleAnswer(createDefaultProgress(), 2, 3, { correct: true, hintUsed: false, supported: false })
    saveProgress(progress)
    const loaded = loadProgress()
    expect(loaded.examples['2x3'].state).toBe('familiar')
  })
})

describe('resetProgress', () => {
  it('clears stored progress back to defaults', () => {
    const progress = recordExampleAnswer(createDefaultProgress(), 2, 3, { correct: true, hintUsed: false, supported: false })
    saveProgress(progress)
    const reset = resetProgress()
    expect(Object.keys(reset.examples)).toHaveLength(0)
    expect(loadProgress().examples).toEqual({})
  })
})

describe('recordSession streaks', () => {
  it('starts a streak of 1 on the first session', () => {
    const progress = recordSession(createDefaultProgress(), { tableNumber: 2, durationSec: 120, completedCount: 6, newlyMastered: 1 })
    expect(progress.streakDays).toBe(1)
  })

  it('does not double-count a second session on the same day', () => {
    let progress = recordSession(createDefaultProgress(), { tableNumber: 2, durationSec: 120, completedCount: 6, newlyMastered: 1 })
    progress = recordSession(progress, { tableNumber: 2, durationSec: 60, completedCount: 3, newlyMastered: 0 })
    expect(progress.streakDays).toBe(1)
    expect(progress.sessions).toHaveLength(2)
  })

  it('resets the streak when a day is skipped', () => {
    let progress = createDefaultProgress()
    progress = { ...progress, streakDays: 5, lastActiveDate: '2000-01-01' }
    progress = recordSession(progress, { tableNumber: 2, durationSec: 60, completedCount: 3, newlyMastered: 0 })
    expect(progress.streakDays).toBe(1)
  })
})
