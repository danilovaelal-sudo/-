import { useMemo, useState } from 'react'
import { generateChoiceOptions } from '../../../engine/answers'
import { SingleExerciseProps } from './exerciseTypes'
import './ChoiceExercise.css'

export function ChoiceExercise({ fact, disabled, onAnswered }: SingleExerciseProps) {
  const answer = fact.a * fact.b
  const options = useMemo(() => generateChoiceOptions(fact.a, fact.b), [fact.a, fact.b])
  const [selected, setSelected] = useState<number | null>(null)

  function handleSelect(value: number) {
    if (selected !== null || disabled) return
    setSelected(value)
    onAnswered(value === answer)
  }

  return (
    <div className="choice-grid" role="group" aria-label={`Варианты ответа для ${fact.a} умножить на ${fact.b}`}>
      {options.map((option) => {
        let extra = ''
        if (selected !== null) {
          if (option === answer) extra = 'choice-option--correct'
          else if (option === selected) extra = 'choice-option--incorrect'
        }
        return (
          <button
            key={option}
            className={`choice-option ${extra}`}
            onClick={() => handleSelect(option)}
            disabled={selected !== null || disabled}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
