import { useState } from 'react'
import { allDifficultExamples } from '../../engine/exampleProgress'
import { practicedTables, unlockedTables } from '../../engine/practicePlanner'
import { useApp } from '../../state/AppContext'
import { PracticeMode, TableNumber } from '../../state/types'
import { Button } from '../shared/Button'
import './PracticeScreen.css'

const MODES: { mode: PracticeMode; title: string; description: (hardCount: number) => string }[] = [
  { mode: 'hard', title: 'Трудные примеры', description: (n) => (n > 0 ? `${n} примеров, где были ошибки` : 'Пока нет трудных примеров') },
  { mode: 'mixed', title: 'Смешанная тренировка', description: () => 'Из уже изученных таблиц' },
  { mode: 'free', title: 'Свободный выбор', description: () => 'Выбери таблицы сам' },
]

const COUNT_OPTIONS = [5, 10, 15] as const

export function PracticeScreen() {
  const { progress, startPractice } = useApp()
  const [mode, setMode] = useState<PracticeMode>('mixed')
  const [count, setCount] = useState<5 | 10 | 15>(progress.settings.defaultQuestionCount)
  const unlocked = unlockedTables(progress)
  const learned = practicedTables(progress)
  const [selectedTables, setSelectedTables] = useState<TableNumber[]>(learned)
  const hardCount = allDifficultExamples(progress).length

  function toggleTable(table: TableNumber) {
    setSelectedTables((prev) => (prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]))
  }

  const canStart = mode !== 'free' || selectedTables.length > 0

  return (
    <div className="screen practice-screen">
      <h2>Тренироваться</h2>
      <p>Без таймера — в своём темпе.</p>

      <div className="practice-modes">
        {MODES.map((m) => (
          <button
            key={m.mode}
            className={`card practice-mode ${mode === m.mode ? 'practice-mode--selected' : ''}`}
            onClick={() => setMode(m.mode)}
            aria-pressed={mode === m.mode}
          >
            <span>
              <div className="practice-mode__title">{m.title}</div>
              <p>{m.description(hardCount)}</p>
            </span>
          </button>
        ))}
      </div>

      {mode === 'free' && (
        <>
          <p>Какие таблицы тренируем:</p>
          <div className="practice-tables">
            {unlocked.map((t) => (
              <button
                key={t}
                className={`practice-table-chip ${selectedTables.includes(t) ? 'practice-table-chip--selected' : ''}`}
                onClick={() => toggleTable(t)}
                aria-pressed={selectedTables.includes(t)}
              >
                ×{t}
              </button>
            ))}
          </div>
        </>
      )}

      <p>Сколько заданий:</p>
      <div className="practice-options">
        {COUNT_OPTIONS.map((c) => (
          <button
            key={c}
            className={`practice-chip ${count === c ? 'practice-chip--selected' : ''}`}
            onClick={() => setCount(c)}
            aria-pressed={count === c}
          >
            {c} заданий
          </button>
        ))}
      </div>

      <p className="practice-summary">Без таймера · будет визуальная помощь при первой ошибке</p>

      <Button
        variant="primary"
        size="lg"
        style={{ width: '100%' }}
        disabled={!canStart}
        onClick={() => startPractice({ mode, count, tables: mode === 'free' ? selectedTables : undefined })}
      >
        Начать тренировку
      </Button>
    </div>
  )
}
