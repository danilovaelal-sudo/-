import { useMemo, useRef, useState } from 'react'
import { shuffle } from '../../../engine/answers'
import { Fact } from '../../../state/types'
import './MatchExercise.css'

type Props = {
  pairs: Fact[]
  disabled?: boolean
  /** 0 = no hint, 1 = spotlight one example, 2 = also remove one wrong answer for it. */
  hintLevel?: number
  onPairResolved: (fact: Fact, hadMistake: boolean) => void
  onComplete: () => void
}

export function MatchExercise({ pairs, disabled, hintLevel = 0, onPairResolved, onComplete }: Props) {
  const leftItems = useMemo(() => shuffle(pairs.map((f, i) => ({ id: i, fact: f }))), [pairs])
  const rightItems = useMemo(() => shuffle(pairs.map((f, i) => ({ id: i, value: f.a * f.b }))), [pairs])

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [justMatched, setJustMatched] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState<Set<number>>(new Set())
  const [wrongRight, setWrongRight] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const leftButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  const allDone = matched.size === pairs.length

  const spotlightId = hintLevel >= 1 ? leftItems.find((l) => !matched.has(l.id))?.id ?? null : null
  const hiddenRightId = useMemo(() => {
    if (hintLevel < 2 || spotlightId === null) return null
    const spotlighted = leftItems.find((l) => l.id === spotlightId)!
    const correctValue = spotlighted.fact.a * spotlighted.fact.b
    const wrongOption = rightItems.find((r) => r.value !== correctValue && !matched.has(r.id))
    return wrongOption?.id ?? null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintLevel, spotlightId])

  function selectLeft(id: number) {
    if (disabled || matched.has(id)) return
    setSelectedLeft(id)
    setAnnouncement('Теперь выбери ответ')
  }

  function focusNextIncomplete(nextMatched: Set<number>) {
    const pick = leftItems.find((l) => !nextMatched.has(l.id))
    if (pick) leftButtonRefs.current.get(pick.id)?.focus()
  }

  function selectRight(rightId: number, value: number) {
    if (disabled || selectedLeft === null || matched.has(rightId)) return
    const fact = leftItems.find((l) => l.id === selectedLeft)!.fact
    const isCorrect = fact.a * fact.b === value
    const resolvedLeft = selectedLeft

    if (isCorrect) {
      const nextMatched = new Set(matched)
      nextMatched.add(resolvedLeft)
      setMatched(nextMatched)
      setJustMatched(resolvedLeft)
      setTimeout(() => setJustMatched(null), 500)
      onPairResolved(fact, mistakes.has(resolvedLeft))
      setSelectedLeft(null)
      if (nextMatched.size === pairs.length) {
        setAnnouncement('Все пары собраны')
        onComplete()
      } else {
        setAnnouncement(`Верно, ${fact.a} умножить на ${fact.b} равно ${value}`)
        focusNextIncomplete(nextMatched)
      }
    } else {
      setMistakes((prev) => new Set(prev).add(resolvedLeft))
      setWrongRight(rightId)
      setAnnouncement('Не эта пара. Попробуй ещё')
      setTimeout(() => setWrongRight(null), 400)
      // keep the example selected so the child can try another answer right away
    }
  }

  return (
    <div className="match-exercise">
      <div className="match-exercise__columns" role="group" aria-label="Составь пары: пример и ответ">
        <div className="match-exercise__column">
          <p className="match-exercise__heading">Примеры</p>
          {leftItems.map((item) => (
            <button
              key={item.id}
              ref={(el) => {
                if (el) leftButtonRefs.current.set(item.id, el)
                else leftButtonRefs.current.delete(item.id)
              }}
              className={[
                'match-chip',
                selectedLeft === item.id ? 'match-chip--selected' : '',
                matched.has(item.id) ? 'match-chip--matched' : '',
                justMatched === item.id ? 'match-chip--pulse' : '',
                spotlightId === item.id ? 'match-chip--hint' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => selectLeft(item.id)}
              disabled={disabled || matched.has(item.id)}
              aria-pressed={selectedLeft === item.id}
              aria-disabled={matched.has(item.id)}
            >
              {item.fact.a} × {item.fact.b}
            </button>
          ))}
        </div>
        <div className="match-exercise__column">
          <p className="match-exercise__heading">Ответы</p>
          {rightItems.filter((item) => item.id !== hiddenRightId).map((item) => (
            <button
              key={item.id}
              className={[
                'match-chip',
                matched.has(item.id) ? 'match-chip--matched' : '',
                wrongRight === item.id ? 'match-chip--wrong' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => selectRight(item.id, item.value)}
              disabled={disabled || matched.has(item.id) || selectedLeft === null}
              aria-disabled={matched.has(item.id)}
            >
              {item.value}
            </button>
          ))}
        </div>
      </div>

      <p className="match-exercise__status" aria-live="polite">
        {allDone ? 'Все пары собраны' : announcement}
      </p>
    </div>
  )
}
