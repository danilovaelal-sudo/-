import { computeEarnedBadges, computeMasteryStars, totalStarsFromStats } from '../engine/mastery'
import { NumberStats, Progress, TABLE_MAX, TABLE_MIN } from './types'

const STORAGE_KEY = 'multiplication-app:progress:v1'

function emptyStats(): NumberStats {
  return { attempts: 0, correct: 0, masteryStars: 0 }
}

export function createEmptyProgress(): Progress {
  const statsByNumber: Record<number, NumberStats> = {}
  for (let n = TABLE_MIN; n <= TABLE_MAX; n++) {
    statsByNumber[n] = emptyStats()
  }
  return {
    statsByNumber,
    totalStars: 0,
    badges: [],
    bestStreak: 0,
    currentStreak: 0,
    soundEnabled: true,
    lastPlayedAt: new Date().toISOString(),
  }
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyProgress()
    const parsed = JSON.parse(raw) as Progress
    const base = createEmptyProgress()
    return {
      ...base,
      ...parsed,
      statsByNumber: { ...base.statsByNumber, ...parsed.statsByNumber },
    }
  } catch {
    return createEmptyProgress()
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // localStorage unavailable (private mode / quota) — silently skip persistence
  }
}

export function recordAnswer(progress: Progress, tableNumber: number, wasCorrect: boolean): Progress {
  const prevStats = progress.statsByNumber[tableNumber] ?? emptyStats()
  const nextStats: NumberStats = {
    attempts: prevStats.attempts + 1,
    correct: prevStats.correct + (wasCorrect ? 1 : 0),
    masteryStars: 0,
  }
  nextStats.masteryStars = computeMasteryStars(nextStats)

  const statsByNumber = { ...progress.statsByNumber, [tableNumber]: nextStats }
  const currentStreak = wasCorrect ? progress.currentStreak + 1 : 0
  const bestStreak = Math.max(progress.bestStreak, currentStreak)

  const next: Progress = {
    ...progress,
    statsByNumber,
    currentStreak,
    bestStreak,
    totalStars: totalStarsFromStats(statsByNumber),
    lastPlayedAt: new Date().toISOString(),
  }
  next.badges = computeEarnedBadges(next)
  return next
}

export function toggleSound(progress: Progress): Progress {
  return { ...progress, soundEnabled: !progress.soundEnabled }
}

export function resetProgress(): Progress {
  const fresh = createEmptyProgress()
  saveProgress(fresh)
  return fresh
}
