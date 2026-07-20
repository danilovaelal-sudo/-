import { useMemo, useState } from 'react'
import { shuffle } from '../../../engine/answers'
import { NumberKeypad } from '../../shared/NumberKeypad'
import { SingleExerciseProps } from './exerciseTypes'
import './FillBlankExercise.css'
import './ChoiceExercise.css'

type Variant = 'missingA' | 'missingB' | 'missingProduct'

function factorChoices(correct: number): number[] {
  const pool = Array.from({ length: 10 }, (_, i) => i + 1).filter((n) => n !== correct)
  const distractors = shuffle(pool).slice(0, 3)
  return shuffle([correct, ...distractors])
}

export function FillBlankExercise({ fact, disabled, onAnswered }: SingleExerciseProps) {
  const variant = useMemo<Variant>(() => {
    const variants: Variant[] = ['missingA', 'missingB', 'missingProduct']
    return variants[Math.floor(Math.random() * variants.length)]
  }, [fact.a, fact.b])

  const product = fact.a * fact.b
  const [selected, setSelected] = useState<number | null>(null)
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const answer = variant === 'missingA' ? fact.a : variant === 'missingB' ? fact.b : product
  const options = useMemo(() => (variant !== 'missingProduct' ? factorChoices(answer) : []), [variant, answer])

  function handleChoice(value: number) {
    if (selected !== null || disabled) return
    setSelected(value)
    onAnswered(value === answer)
  }

  function handleKeypadConfirm() {
    if (submitted || value === '') return
    setSubmitted(true)
    onAnswered(Number(value) === answer)
  }

  const equationLabel =
    variant === 'missingA'
      ? [<span key="q" className="fill-blank__blank">?</span>, ` × ${fact.b} = ${product}`]
      : variant === 'missingB'
        ? [`${fact.a} × `, <span key="q" className="fill-blank__blank">?</span>, ` = ${product}`]
        : [`${fact.a} × ${fact.b} = `, <span key="q" className="fill-blank__blank">?</span>]

  return (
    <div>
      <div className="fill-blank__equation">{equationLabel}</div>
      {variant === 'missingProduct' ? (
        <NumberKeypad value={value} onChange={setValue} onConfirm={handleKeypadConfirm} disabled={disabled || submitted} />
      ) : (
        <div className="choice-grid">
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
                onClick={() => handleChoice(option)}
                disabled={selected !== null || disabled}
              >
                {option}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
