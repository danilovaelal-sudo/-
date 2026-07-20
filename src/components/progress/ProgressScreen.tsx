import { useState } from 'react'
import {
  allDifficultExamples,
  confidentCount,
  introducedCount,
  orderForSettings,
  overallStats,
  tableModuleStatus,
  tableStateCounts,
} from '../../engine/exampleProgress'
import { useApp } from '../../state/AppContext'
import { TableNumber } from '../../state/types'
import { Button } from '../shared/Button'
import { ProgressBar } from '../shared/ProgressBar'
import { Icon } from '../icons/Icon'
import './ProgressScreen.css'

export function ProgressScreen() {
  const { progress, setScreen, startPractice } = useApp()
  const [expanded, setExpanded] = useState<TableNumber | null>(null)
  const order = orderForSettings(progress.settings.order)
  const unlockedOrder = order.filter((t) => tableModuleStatus(progress, t) !== 'locked')
  const stats = overallStats(progress)
  const difficult = allDifficultExamples(progress).slice(0, 6)
  const today = new Date().toISOString().slice(0, 10)
  const todaysFlashcards = progress.flashcardSessions.filter((s) => s.date === today)
  const flashcardsToday = todaysFlashcards.reduce(
    (acc, s) => ({ viewed: acc.viewed + s.viewed, known: acc.known + s.known, review: acc.review + s.review }),
    { viewed: 0, known: 0, review: 0 },
  )

  return (
    <div className="screen progress-screen">
      <h2>Прогресс</h2>

      <div className="progress-overview">
        <div className="card">
          <div className="progress-overview-value">{stats.startedTables}</div>
          <div className="progress-overview-label">Таблиц начато</div>
        </div>
        <div className="card">
          <div className="progress-overview-value">{stats.masteredTables}</div>
          <div className="progress-overview-label">Освоено</div>
        </div>
        <div className="card">
          <div className="progress-overview-value">{stats.totalIntroducedFacts}</div>
          <div className="progress-overview-label">Познакомился</div>
        </div>
        <div className="card">
          <div className="progress-overview-value">{stats.totalConfidentFacts}</div>
          <div className="progress-overview-label">Знает уверенно</div>
        </div>
      </div>

      {unlockedOrder.length > 0 && (
        <>
          <h3 className="progress-section-title">По таблицам</h3>
          <div className="stack">
            {unlockedOrder.map((table) => {
              const confident = confidentCount(progress, table)
              const introduced = introducedCount(progress, table)
              const isOpen = expanded === table
              const counts = tableStateCounts(progress, table)
              return (
                <div key={table}>
                  <button
                    className={`card table-progress-row${isOpen ? '' : ''}`}
                    style={isOpen ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : undefined}
                    onClick={() => setExpanded(isOpen ? null : table)}
                    aria-expanded={isOpen}
                  >
                    <span className="table-progress-row__label">×{table}</span>
                    <div className="grow">
                      <ProgressBar value={confident} max={10} label={`Таблица на ${table}: ${confident} из 10`} />
                    </div>
                    <span>{introduced} изучается · {confident} уверенно</span>
                  </button>
                  {isOpen && (
                    <div className="table-progress-detail">
                      <div className="table-progress-detail__stats">
                        <span>Уверенно: {counts.confident}</span>
                        <span>Знакомо: {counts.familiar}</span>
                        <span>Изучается: {counts.learning}</span>
                        <span>Повторить: {counts.review}</span>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => startPractice({ mode: 'free', count: 10, tables: [table] })}
                      >
                        Тренировать эту таблицу
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {difficult.length > 0 && (
        <>
          <h3 className="progress-section-title">Стоит повторить</h3>
          <div className="stack">
            {difficult.map((d) => (
              <div className="card difficult-row" key={`${d.a}x${d.b}`}>
                <span className="difficult-row__fact">{d.a} × {d.b}</span>
                <Icon name="review" size={18} />
              </div>
            ))}
            <Button variant="secondary" onClick={() => setScreen('practice')}>Повторить</Button>
          </div>
        </>
      )}

      {progress.sessions.length > 0 && (
        <>
          <h3 className="progress-section-title">Последние занятия</h3>
          <div className="card">
            {progress.sessions.slice(0, 8).map((s, i) => (
              <div className="history-row" key={i}>
                <span>{s.date} · таблица на {s.tableNumber}{s.endedEarly ? ' · не закончено' : ''}</span>
                <span>{s.completedCount} заданий · {Math.round(s.durationSec / 60)} мин</span>
              </div>
            ))}
          </div>
        </>
      )}

      {progress.flashcardSessions.length > 0 && (
        <>
          <h3 className="progress-section-title">Карточки</h3>
          <div className="progress-overview">
            <div className="card">
              <div className="progress-overview-value">{flashcardsToday.viewed}</div>
              <div className="progress-overview-label">Просмотрено сегодня</div>
            </div>
            <div className="card">
              <div className="progress-overview-value">{flashcardsToday.known}</div>
              <div className="progress-overview-label">«Я знал»</div>
            </div>
            <div className="card">
              <div className="progress-overview-value">{flashcardsToday.review}</div>
              <div className="progress-overview-label">На повторение</div>
            </div>
          </div>
        </>
      )}

      {progress.streakDays > 0 && (
        <>
          <h3 className="progress-section-title">Серия занятий</h3>
          <p>{progress.streakDays} {daysLabel(progress.streakDays)} подряд — отличный темп.</p>
        </>
      )}
    </div>
  )
}

function daysLabel(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'дня'
  return 'дней'
}
