import { NumberStats, TABLE_MAX, TABLE_MIN } from '../../state/types'
import { Card } from '../shared/Card'

const NUMBERS = Array.from({ length: TABLE_MAX - TABLE_MIN + 1 }, (_, i) => TABLE_MIN + i)

function starsLabel(stars: number) {
  return '⭐'.repeat(stars) + '☆'.repeat(3 - stars)
}

export function StatsGrid({ statsByNumber }: { statsByNumber: Record<number, NumberStats> }) {
  return (
    <div className="stats-grid">
      {NUMBERS.map((n) => {
        const stats = statsByNumber[n] ?? { attempts: 0, correct: 0, masteryStars: 0 }
        const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0
        return (
          <Card key={n} className="stats-grid__item">
            <span className="stats-grid__number">Таблица {n}</span>
            <span className="stats-grid__stars">{starsLabel(stats.masteryStars)}</span>
            <span className="stats-grid__accuracy">
              {stats.attempts > 0 ? `${accuracy}% из ${stats.attempts}` : 'Ещё не пробовали'}
            </span>
          </Card>
        )
      })}
    </div>
  )
}
