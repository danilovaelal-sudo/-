import { useState } from 'react'
import { NumberKeypad } from '../../shared/NumberKeypad'
import { SingleExerciseProps } from './exerciseTypes'
import './sharedExercise.css'

export function InputExercise({ fact, disabled, onAnswered }: SingleExerciseProps) {
  const [value, setValue] = useState('')
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null)

  function handleConfirm() {
    if (result !== null || value === '') return
    const correct = Number(value) === fact.a * fact.b
    setResult(correct ? 'correct' : 'incorrect')
    onAnswered(correct)
  }

  return (
    <div className="stack" style={{ alignItems: 'center' }}>
      <p className={`exercise-equation ${result ? `exercise-equation--${result}` : ''}`}>
        {fact.a} × {fact.b} = <span className="exercise-equation__blank">{value || '__'}</span>
      </p>
      <NumberKeypad value={value} onChange={setValue} onConfirm={handleConfirm} disabled={disabled || result !== null} />
    </div>
  )
}
