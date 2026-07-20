import { useMemo, useState } from 'react'
import { shuffle } from '../../../engine/answers'
import { Fact } from '../../../state/types'
import './MatchExercise.css'

type Props = {
  pairs: Fact[]
  disabled?: boolean
  onPairResolved: (fact: Fact, hadMistake: boolean) => void
  onComplete: () => void
}

export function MatchExercise({ pairs, disabled, onPairResolved, onComplete }: Props) {
  const leftItems = useMemo(() => shuffle(pairs.map((f, i) => ({ id: i, fact: f }))), [pairs])
  const rightItems = useMemo(
    () => shuffle(pairs.map((f, i) => ({ id: i, value: f.a * f.b }))),
    [pairs],
  )

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [mistakes, setMistakes] = useState<Set<number>>(new Set())
  const [wrongRight, setWrongRight] = useState<number | null>(null)

  function selectLeft(id: number) {
    if (disabled || matched.has(id)) return
    setSelectedLeft(id)
  }

  function selectRight(rightId: number, value: number) {
    if (disabled || selectedLeft === null || matched.has(rightId)) return
    const fact = leftItems.find((l) => l.id === selectedLeft)!.fact
    const isCorrect = fact.a * fact.b === value

    if (isCorrect) {
      const nextMatched = new Set(matched)
      nextMatched.add(selectedLeft)
      setMatched(nextMatched)
      onPairResolved(fact, mistakes.has(selectedLeft))
      setSelectedLeft(null)
      if (nextMatched.size === pairs.length) onComplete()
    } else {
      setMistakes((prev) => new Set(prev).add(selectedLeft))
      setWrongRight(rightId)
      setTimeout(() => setWrongRight(null), 350)
      setSelectedLeft(null)
    }
  }

  return (
    <div className="match-exercise" role="group" aria-label="Соедини пример и ответ">
      <div className="match-exercise__column">
        {leftItems.map((item) => (
          <button
            key={item.id}
            className={`match-chip ${selectedLeft === item.id ? 'match-chip--selected' : ''} ${matched.has(item.id) ? 'match-chip--matched' : ''}`}
            onClick={() => selectLeft(item.id)}
            disabled={disabled || matched.has(item.id)}
            aria-pressed={selectedLeft === item.id}
          >
            {item.fact.a} × {item.fact.b}
          </button>
        ))}
      </div>
      <div className="match-exercise__column">
        {rightItems.map((item) => (
          <button
            key={item.id}
            className={`match-chip ${matched.has(item.id) ? 'match-chip--matched' : ''} ${wrongRight === item.id ? 'match-chip--wrong' : ''}`}
            onClick={() => selectRight(item.id, item.value)}
            disabled={disabled || matched.has(item.id) || selectedLeft === null}
          >
            {item.value}
          </button>
        ))}
      </div>
    </div>
  )
}
