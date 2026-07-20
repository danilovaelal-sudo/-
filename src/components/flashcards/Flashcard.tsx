import { ReactNode } from 'react'
import { Fact } from '../../state/types'
import './Flashcard.css'

type Props = {
  fact: Fact
  flipped: boolean
  reducedMotion: boolean
  onFlip: () => void
  backContent: ReactNode
}

export function Flashcard({ fact, flipped, reducedMotion, onFlip, backContent }: Props) {
  return (
    <div
      className={[
        'flashcard-flip',
        flipped ? 'flashcard-flip--flipped' : '',
        reducedMotion ? 'flashcard-flip--reduced' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flashcard-flip__inner">
        <button
          className="flashcard-face flashcard-face--front"
          onClick={onFlip}
          aria-label={`${fact.a} умножить на ${fact.b}. Нажмите, чтобы показать ответ.`}
          tabIndex={flipped ? -1 : 0}
        >
          <span className="flashcard-face__label">Назови ответ</span>
          <span className="flashcard-face__equation">{fact.a} × {fact.b} = ?</span>
          <span className="flashcard-face__hint">Нажми, чтобы проверить</span>
        </button>
        <div className="flashcard-face flashcard-face--back" aria-hidden={!flipped}>
          {backContent}
        </div>
      </div>
    </div>
  )
}
