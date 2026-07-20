import { useState } from 'react'
import { Button } from '../../shared/Button'
import { Icon } from '../../icons/Icon'
import { SingleExerciseProps } from './exerciseTypes'
import './GroupsExercise.css'

const MAX_ROWS = 12

export function GroupsExercise({ fact, disabled, onAnswered }: SingleExerciseProps) {
  const [rows, setRows] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (submitted) return
    setSubmitted(true)
    onAnswered(rows === fact.a)
  }

  return (
    <div className="groups-exercise">
      <p className="groups-exercise__instruction">
        Собери {fact.a} {groupsLabel(fact.a)} по {fact.b}
      </p>

      <div className="groups-exercise__rows" aria-live="polite">
        {Array.from({ length: rows }, (_, r) => (
          <div className="groups-exercise__row" key={r}>
            {Array.from({ length: fact.b }, (_, c) => (
              <span key={c} className="groups-exercise__cell" />
            ))}
          </div>
        ))}
      </div>

      <div className="groups-exercise__controls">
        <button
          className="groups-exercise__step-btn"
          onClick={() => setRows((r) => Math.max(0, r - 1))}
          disabled={disabled || submitted || rows === 0}
          aria-label="Убрать группу"
        >
          −
        </button>
        <span className="groups-exercise__count">{rows}</span>
        <button
          className="groups-exercise__step-btn"
          onClick={() => setRows((r) => Math.min(MAX_ROWS, r + 1))}
          disabled={disabled || submitted || rows >= MAX_ROWS}
          aria-label="Добавить группу"
        >
          <Icon name="plus" size={18} />
        </button>
      </div>

      <Button variant="primary" onClick={handleSubmit} disabled={disabled || submitted || rows === 0}>
        Готово
      </Button>
    </div>
  )
}

function groupsLabel(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'группу'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'группы'
  return 'групп'
}
