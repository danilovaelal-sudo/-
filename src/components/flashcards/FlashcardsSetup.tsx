import { useMemo, useState } from 'react'
import { buildDeck } from '../../engine/flashcardEngine'
import { allDifficultExamples } from '../../engine/exampleProgress'
import { practicedTables } from '../../engine/practicePlanner'
import { useApp } from '../../state/AppContext'
import { FlashcardCount, FlashcardOrder, FlashcardScope, FlashcardSelection, TABLE_NUMBERS, TableNumber } from '../../state/types'
import { Button } from '../shared/Button'
import { ScreenHeader } from '../layout/ScreenHeader'
import { LearnTabs } from '../learn/LearnTabs'
import './FlashcardsSetup.css'

export function FlashcardsSetup() {
  const { progress, setScreen, startFlashcards } = useApp()
  const [scope, setScope] = useState<FlashcardScope>('tables')
  const [tables, setTables] = useState<TableNumber[]>([])
  const [order, setOrder] = useState<FlashcardOrder>('shuffled')
  const [count, setCount] = useState<FlashcardCount>(10)

  const learnedCount = practicedTables(progress).length
  const difficultCount = allDifficultExamples(progress).length

  function toggleTable(t: TableNumber) {
    setScope('tables')
    setTables((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort((a, b) => a - b)))
  }

  function selectScope(next: FlashcardScope) {
    setScope(next)
    if (next !== 'tables') setTables([])
  }

  const selection: FlashcardSelection = { scope, tables, order, count }
  const previewDeck = useMemo(() => buildDeck(selection, progress), [scope, tables, order, count, progress])
  const canStart = previewDeck.length > 0

  function handleStart() {
    const deck = buildDeck(selection, progress)
    startFlashcards({
      deck,
      index: 0,
      known: 0,
      review: 0,
      requeue: [],
      reviewedFacts: [],
      startedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="screen flashcards-setup">
      <ScreenHeader title="Учиться" onBack={() => setScreen('today')} />
      <LearnTabs />

      <div className="flashcards-setup__intro">
        <h2>Карточки</h2>
        <p>Назови ответ, переверни карточку и проверь себя.</p>
      </div>

      <div className="flashcards-setup__group-title">Что повторяем</div>
      <div className="flashcards-setup__scope-row">
        <button
          className={`flashcards-setup__scope-chip ${scope === 'learned' ? 'flashcards-setup__scope-chip--selected' : ''}`}
          onClick={() => selectScope('learned')}
          aria-pressed={scope === 'learned'}
          disabled={learnedCount === 0}
        >
          Все изученные
        </button>
        <button
          className={`flashcards-setup__scope-chip ${scope === 'difficult' ? 'flashcards-setup__scope-chip--selected' : ''}`}
          onClick={() => selectScope('difficult')}
          aria-pressed={scope === 'difficult'}
          disabled={difficultCount === 0}
        >
          Трудные примеры
        </button>
        {tables.length > 0 && (
          <button className="flashcards-setup__scope-chip" onClick={() => setTables([])}>
            Очистить выбор
          </button>
        )}
      </div>

      <div className="flashcards-setup__tables" role="group" aria-label="Выбери одну или несколько таблиц">
        {TABLE_NUMBERS.map((t) => (
          <button
            key={t}
            className={`flashcards-setup__table-chip ${scope === 'tables' && tables.includes(t) ? 'flashcards-setup__table-chip--selected' : ''}`}
            onClick={() => toggleTable(t)}
            aria-pressed={scope === 'tables' && tables.includes(t)}
          >
            ×{t}
          </button>
        ))}
      </div>

      <div className="flashcards-setup__group-title">Порядок</div>
      <div className="flashcards-setup__choice-row" role="radiogroup" aria-label="Порядок карточек">
        {(['shuffled', 'sequential'] as FlashcardOrder[]).map((o) => (
          <button
            key={o}
            className={`flashcards-setup__choice ${order === o ? 'flashcards-setup__choice--selected' : ''}`}
            role="radio"
            aria-checked={order === o}
            onClick={() => setOrder(o)}
          >
            {o === 'shuffled' ? 'Перемешать' : 'По порядку'}
          </button>
        ))}
      </div>

      <div className="flashcards-setup__group-title">Сколько карточек</div>
      <div className="flashcards-setup__choice-row" role="radiogroup" aria-label="Количество карточек">
        {([5, 10, 'all'] as FlashcardCount[]).map((c) => (
          <button
            key={String(c)}
            className={`flashcards-setup__choice ${count === c ? 'flashcards-setup__choice--selected' : ''}`}
            role="radio"
            aria-checked={count === c}
            onClick={() => setCount(c)}
          >
            {c === 'all' ? 'Все выбранные' : `${c} карточек`}
          </button>
        ))}
      </div>

      {!canStart && <p className="flashcards-setup__empty-hint">Выбери хотя бы одну таблицу</p>}

      <Button variant="primary" size="lg" style={{ width: '100%', marginTop: 18 }} disabled={!canStart} onClick={handleStart}>
        Начать
      </Button>
    </div>
  )
}
