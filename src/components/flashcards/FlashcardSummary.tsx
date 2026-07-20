import { Fact } from '../../state/types'
import { Button } from '../shared/Button'
import { Pix } from '../pix/Pix'
import './FlashcardSummary.css'

type Props = {
  viewed: number
  known: number
  review: number
  reviewFacts: Fact[]
  onRepeat: () => void
  onFinish: () => void
  onChooseOther: () => void
}

export function FlashcardSummary({ viewed, known, review, reviewFacts, onRepeat, onFinish, onChooseOther }: Props) {
  return (
    <div className="flashcard-summary">
      <Pix mood="joy" size={72} />
      <h2>Карточки закончились</h2>

      <div className="flashcard-summary__stats">
        <div className="card">
          <div className="flashcard-summary__stat-value">{viewed}</div>
          <div className="flashcard-summary__stat-label">Просмотрено</div>
        </div>
        <div className="card">
          <div className="flashcard-summary__stat-value">{known}</div>
          <div className="flashcard-summary__stat-label">Знал</div>
        </div>
        <div className="card">
          <div className="flashcard-summary__stat-value">{review}</div>
          <div className="flashcard-summary__stat-label">Повторить</div>
        </div>
      </div>

      {reviewFacts.length > 0 && (
        <div>
          <p>Стоит повторить:</p>
          <div className="flashcard-summary__list">
            {reviewFacts.map((f) => (
              <span className="flashcard-summary__chip" key={`${f.a}x${f.b}`}>{f.a} × {f.b}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flashcard-summary__actions">
        {reviewFacts.length > 0 && (
          <Button variant="secondary" onClick={onRepeat}>Повторить эти карточки</Button>
        )}
        <Button variant="primary" onClick={onFinish}>Закончить</Button>
        <Button variant="quiet" onClick={onChooseOther}>Выбрать другие таблицы</Button>
      </div>
    </div>
  )
}
