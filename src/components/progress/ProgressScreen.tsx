import { useApp } from '../../state/AppContext'
import { Mascot } from '../shared/Mascot'
import { Button } from '../shared/Button'
import { StatsGrid } from './StatsGrid'
import { BadgeShelf } from './BadgeShelf'
import './ProgressScreen.css'

export function ProgressScreen() {
  const { progress, resetProgress } = useApp()

  function handleReset() {
    if (window.confirm('Точно хочешь сбросить весь прогресс и награды?')) {
      resetProgress()
    }
  }

  return (
    <div className="screen progress-screen">
      <div className="text-center">
        <Mascot mood="excited" size="small" />
        <h2>Мой прогресс</h2>
      </div>

      <div className="progress-screen__summary">
        <div>
          <div className="progress-screen__summary-value">{progress.totalStars}</div>
          <div>Звёзд собрано</div>
        </div>
        <div>
          <div className="progress-screen__summary-value">{progress.bestStreak}</div>
          <div>Лучшая серия</div>
        </div>
        <div>
          <div className="progress-screen__summary-value">{progress.badges.length}</div>
          <div>Наград</div>
        </div>
      </div>

      <h3 className="progress-screen__section-title">Награды</h3>
      <BadgeShelf earnedIds={progress.badges} />

      <h3 className="progress-screen__section-title">Успехи по числам</h3>
      <StatsGrid statsByNumber={progress.statsByNumber} />

      <div className="progress-screen__reset">
        <Button variant="ghost" onClick={handleReset}>Сбросить прогресс</Button>
      </div>
    </div>
  )
}
