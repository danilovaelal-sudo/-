import { useState } from 'react'
import { NumberKeypad } from '../../shared/NumberKeypad'
import { SingleExerciseProps } from './exerciseTypes'

export function InputExercise({ fact, disabled, onAnswered }: SingleExerciseProps) {
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleConfirm() {
    if (submitted || value === '') return
    setSubmitted(true)
    onAnswered(Number(value) === fact.a * fact.b)
  }

  return <NumberKeypad value={value} onChange={setValue} onConfirm={handleConfirm} disabled={disabled || submitted} />
}
