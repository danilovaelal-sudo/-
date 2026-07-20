import { allDifficultExamples, overallStats, tableFactStates } from '../../engine/exampleProgress'
import { nextRecommendedTable } from '../../engine/exampleProgress'
import { useApp } from '../../state/AppContext'
import { Button } from '../shared/Button'
import { CircularProgress } from '../shared/CircularProgress'
import { Icon } from '../icons/Icon'
import { Pix } from '../pix/Pix'
import './TodayScreen.css'

function timeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Доброе утро'
  if (hour < 18) return 'Добрый день'
  return 'Добрый вечер'
}

export function TodayScreen() {
  const { progress, startLesson, setScreen } = useApp()
  const isFirstRun = Object.keys(progress.examples).length === 0
  const nextTable = nextRecommendedTable(progress)
  const stats = overallStats(progress)
  const difficult = allDifficultExamples(progress).slice(0, 3)

  const facts = nextTable ? tableFactStates(progress, nextTable) : []
  const confident = facts.filter((f) => f.state === 'confident').length
  const newCount = Math.min(3, facts.filter((f) => f.state === 'new').length)
  const greetingText = progress.settings.childName ? `${timeGreeting()}, ${progress.settings.childName}` : 'Продолжим?'

  return (
    <div className="screen today-screen">
      <div className="today-screen__greeting">
        <Pix mood={isFirstRun ? 'greeting' : 'neutral'} size={56} />
        <h1 className="today-screen__greeting-text">{isFirstRun ? 'Привет! Я Пикс.' : greetingText}</h1>
      </div>

      {nextTable && (
        <div className="lesson-card">
          <div className="lesson-card__table">Таблица на {nextTable}</div>
          <p>{isFirstRun ? 'Начнём с самого понятного — с таблицы на 2.' : `Освоено ${confident} из 10 примеров`}</p>

          <div className="row lesson-card__progress">
            <CircularProgress value={confident} max={10} size={48} strokeWidth={6} label="Прогресс по таблице" />
            <div className="lesson-card__meta">
              {!isFirstRun && (
                <span className="lesson-card__meta-item">
                  <Icon name="plus" size={16} /> Сегодня {newCount || 0} новых
                </span>
              )}
              <span className="lesson-card__meta-item">
                <Icon name="clock" size={16} /> Около 5–8 минут
              </span>
            </div>
          </div>

          <Button variant="primary" size="lg" style={{ width: '100%' }} onClick={() => startLesson(nextTable)}>
            Продолжить
          </Button>
        </div>
      )}

      {difficult.length > 0 && (
        <>
          <h3 className="today-screen__section-title">Стоит повторить</h3>
          <div className="stack">
            {difficult.map((d) => (
              <div className="card review-card" key={`${d.a}x${d.b}`}>
                <span className="review-card__fact">{d.a} × {d.b}</span>
                <Icon name="review" size={20} />
              </div>
            ))}
            <Button
              variant="secondary"
              onClick={() => setScreen('practice')}
            >
              Повторить трудные примеры
            </Button>
          </div>
        </>
      )}

      {!isFirstRun && (
        <>
          <h3 className="today-screen__section-title">Обзор</h3>
          <div className="today-screen__overview">
            <div className="card">
              <div className="today-screen__overview-value">{stats.percentComplete}%</div>
              <div className="today-screen__overview-label">Всего освоено</div>
            </div>
            <div className="card">
              <div className="today-screen__overview-value">{stats.masteredTables}</div>
              <div className="today-screen__overview-label">Таблиц освоено</div>
            </div>
            <div className="card">
              <div className="today-screen__overview-value">{progress.streakDays}</div>
              <div className="today-screen__overview-label">Дней подряд</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
