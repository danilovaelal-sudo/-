import { beforeEach, describe, expect, it } from 'vitest'
import {
  createDefaultProgress,
  loadProgress,
  markIntroSeen,
  recordExampleAnswer,
  recordFlashcardSession,
  recordSession,
  resetIntro,
  resetProgress,
  saveProgress,
} from './progressStore'

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
    expect(progress.version).toBe(3)
    expect(Object.keys(progress.examples)).toHaveLength(0)
    expect(progress.pendingLesson).toBeNull()
    expect(progress.pendingFlashcards).toBeNull()
  })

  it('falls back to defaults when localStorage contains corrupted JSON', () => {
    localStorage.setItem('umno:progress:v3', '{not valid json')
    const progress = loadProgress()
    expect(progress).toEqual(createDefaultProgress())
  })

  it('round-trips a saved progress object', () => {
    const progress = recordExampleAnswer(createDefaultProgress(), 2, 3, { correct: true, hintUsed: false, supported: false })
    saveProgress(progress)
    const loaded = loadProgress()
    expect(loaded.examples['2x3'].state).toBe('familiar')
  })

  it('migrates an existing v2 save instead of discarding it', () => {
    const legacy = {
      version: 2,
      examples: { '2x3': { attempts: 3, correct: 3, incorrect: 0, independentStreak: 2, hintUsedLast: false, lastResult: 'correct', lastPracticedAt: null, state: 'confident' } },
      settings: { childName: 'Соня', soundEnabled: true, reducedMotion: false, order: 'custom', defaultQuestionCount: 10 },
      streakDays: 4,
      lastActiveDate: '2020-01-01',
      sessions: [{ date: '2020-01-01', tableNumber: 2, durationSec: 90, completedCount: 5, newlyMastered: 1 }],
    }
    localStorage.setItem('umno:progress:v2', JSON.stringify(legacy))

    const progress = loadProgress()
    expect(progress.version).toBe(3)
    expect(progress.examples['2x3'].state).toBe('confident')
    expect(progress.examples['2x3'].flashcardViews).toBe(0)
    expect(progress.settings.childName).toBe('Соня')
    expect(progress.settings.seenIntros).toEqual({})
    expect(progress.streakDays).toBe(4)
    expect(progress.sessions).toHaveLength(1)
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

  it('records an unfinished lesson with its real completed count, not as fully done', () => {
    const progress = recordSession(createDefaultProgress(), {
      tableNumber: 2,
      durationSec: 40,
      completedCount: 2,
      newlyMastered: 0,
      endedEarly: true,
    })
    expect(progress.sessions[0].completedCount).toBe(2)
    expect(progress.sessions[0].endedEarly).toBe(true)
  })
})

describe('recordFlashcardSession', () => {
  it('appends a flashcard session record and bumps the streak like a lesson would', () => {
    const progress = recordFlashcardSession(createDefaultProgress(), { viewed: 6, known: 5, review: 1 })
    expect(progress.flashcardSessions).toHaveLength(1)
    expect(progress.streakDays).toBe(1)
  })
})

describe('intro flags', () => {
  it('marks and clears the first-time explanation flag for an exercise type', () => {
    let progress = createDefaultProgress()
    expect(progress.settings.seenIntros.choice).toBeUndefined()
    progress = markIntroSeen(progress, 'choice')
    expect(progress.settings.seenIntros.choice).toBe(true)
    progress = resetIntro(progress, 'choice')
    expect(progress.settings.seenIntros.choice).toBeUndefined()
  })
})
