import { useState } from 'react'
import { Button } from '../../shared/Button'
import { Icon } from '../../icons/Icon'
import { isGroupsComplete, isGroupsOverflowing } from '../../../engine/groupsRules'
import { SingleExerciseProps } from './exerciseTypes'
import './GroupsExercise.css'

const MAX_ROWS = 12

export function GroupsExercise({ fact, disabled, onAnswered }: SingleExerciseProps) {
  const [rows, setRows] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const target = fact.a
  const isExactMatch = isGroupsComplete(rows, target)
  const overflowHint = isGroupsOverflowing(rows, target)

  function addGroup() {
    if (disabled || submitted) return
    setRows((r) => Math.min(MAX_ROWS, r + 1))
  }

  function removeGroup() {
    if (disabled || submitted) return
    setRows((r) => Math.max(0, r - 1))
  }

  function handleSubmit() {
    if (submitted || !isExactMatch) return
    setSubmitted(true)
    onAnswered(true)
  }

  return (
    <div className="groups-exercise">
      <p className="groups-exercise__count" aria-live="polite">
        Собрано групп: {rows} из {target}
      </p>

      <div className="groups-exercise__rows" aria-hidden="true">
        {Array.from({ length: rows }, (_, r) => (
          <div className="groups-exercise__row" key={r}>
            {Array.from({ length: fact.b }, (_, c) => (
              <span key={c} className="groups-exercise__cell" />
            ))}
          </div>
        ))}
      </div>

      {overflowHint && <p className="groups-exercise__overflow">Нужно ровно {target} {groupsWord(target)}</p>}

      <div className="groups-exercise__controls">
        <button
          className="groups-exercise__step-btn"
          onClick={removeGroup}
          disabled={disabled || submitted || rows === 0}
          aria-label="Убрать группу"
        >
          −
        </button>
        <button
          className="groups-exercise__step-btn groups-exercise__step-btn--add"
          onClick={addGroup}
          disabled={disabled || submitted || rows >= MAX_ROWS}
          aria-label="Добавить группу"
        >
          <Icon name="plus" size={18} />
        </button>
      </div>

      <Button variant="primary" onClick={handleSubmit} disabled={disabled || submitted || !isExactMatch}>
        Готово
      </Button>
    </div>
  )
}

function groupsWord(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'группу'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'группы'
  return 'групп'
}
