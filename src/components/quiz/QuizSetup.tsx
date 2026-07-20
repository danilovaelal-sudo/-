import { useState } from 'react'
import { Button } from '../shared/Button'
import { Mascot } from '../shared/Mascot'
import { TABLE_MAX, TABLE_MIN } from '../../state/types'
import './QuizSetup.css'

const NUMBERS = Array.from({ length: TABLE_MAX - TABLE_MIN + 1 }, (_, i) => TABLE_MIN + i)

export function QuizSetup({ onStart }: { onStart: (range: number[]) => void }) {
  const [selected, setSelected] = useState<number[]>(NUMBERS)

  function toggle(n: number) {
    setSelected((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)))
  }

  return (
    <div className="screen quiz-setup card">
      <div className="text-center">
        <Mascot mood="thinking" size="small" />
        <h2>Выбери числа для тренировки</h2>
        <p>Можно выбрать одно число или несколько</p>
      </div>

      <div className="quiz-setup__presets">
        <Button variant="ghost" onClick={() => setSelected(NUMBERS)}>Все числа</Button>
        <Button variant="ghost" onClick={() => setSelected(NUMBERS.filter((n) => n <= 5))}>1–5</Button>
        <Button variant="ghost" onClick={() => setSelected(NUMBERS.filter((n) => n >= 6))}>6–10</Button>
      </div>

      <div className="quiz-setup__grid">
        {NUMBERS.map((n) => (
          <button
            key={n}
            className={`quiz-setup__number ${selected.includes(n) ? 'quiz-setup__number--selected' : ''}`}
            onClick={() => toggle(n)}
            aria-pressed={selected.includes(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <Button
        variant="green"
        size="lg"
        disabled={selected.length === 0}
        onClick={() => onStart(selected)}
        style={{ width: '100%' }}
      >
        Начать тренировку 🚀
      </Button>
    </div>
  )
}
