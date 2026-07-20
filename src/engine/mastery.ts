import { Badge, NumberStats, Progress, TABLE_MAX, TABLE_MIN } from '../state/types'

export function computeMasteryStars(stats: NumberStats): 0 | 1 | 2 | 3 {
  if (stats.attempts < 3) return 0
  const accuracy = stats.correct / stats.attempts
  if (stats.attempts >= 10 && accuracy >= 0.9) return 3
  if (stats.attempts >= 5 && accuracy >= 0.75) return 2
  if (accuracy >= 0.5) return 1
  return 0
}

export const BADGES: (Badge & { isEarned: (progress: Progress) => boolean })[] = [
  {
    id: 'first-steps',
    title: 'Первые шаги',
    description: 'Ответь правильно на первый пример',
    icon: '🌱',
    isEarned: (p) => Object.values(p.statsByNumber).some((s) => s.correct > 0),
  },
  {
    id: 'streak-5',
    title: 'На волне',
    description: '5 верных ответов подряд',
    icon: '🔥',
    isEarned: (p) => p.bestStreak >= 5,
  },
  {
    id: 'streak-10',
    title: 'Без остановки',
    description: '10 верных ответов подряд',
    icon: '⚡',
    isEarned: (p) => p.bestStreak >= 10,
  },
  {
    id: 'stars-10',
    title: 'Звёздочка',
    description: 'Собери 10 звёзд',
    icon: '⭐',
    isEarned: (p) => p.totalStars >= 10,
  },
  {
    id: 'stars-25',
    title: 'Звёздный дождь',
    description: 'Собери 25 звёзд',
    icon: '🌟',
    isEarned: (p) => p.totalStars >= 25,
  },
  {
    id: 'table-master',
    title: 'Мастер таблицы',
    description: 'Достигни 3 звёзд по каждому числу',
    icon: '🏆',
    isEarned: (p) => {
      for (let n = TABLE_MIN; n <= TABLE_MAX; n++) {
        if ((p.statsByNumber[n]?.masteryStars ?? 0) < 3) return false
      }
      return true
    },
  },
]

export function computeEarnedBadges(progress: Progress): string[] {
  return BADGES.filter((b) => b.isEarned(progress)).map((b) => b.id)
}

export function totalStarsFromStats(statsByNumber: Record<number, NumberStats>): number {
  return Object.values(statsByNumber).reduce((sum, s) => sum + s.masteryStars, 0)
}
