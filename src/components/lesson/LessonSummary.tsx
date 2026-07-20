import { Fact } from '../../state/types'
import { Button } from '../shared/Button'
import { Pix } from '../pix/Pix'
import './LessonSummary.css'

type Props = {
  newlyConfident: Fact[]
  confidentFacts: Fact[]
  reviewFacts: Fact[]
  onRepeatDifficult: () => void
  onFinish: () => void
  onContinue: () => void
}

export function LessonSummary({ newlyConfident, confidentFacts, reviewFacts, onRepeatDifficult, onFinish, onContinue }: Props) {
  return (
    <div className="lesson-summary">
      <Pix mood="joy" size={72} />
      <h2 className="lesson-summary__headline">
        {newlyConfident.length > 0
          ? `Сегодня освоено примеров: ${newlyConfident.length}`
          : 'Хорошая тренировка!'}
      </h2>

      {confidentFacts.length > 0 && (
        <div>
          <p>Уверенно:</p>
          <div className="lesson-summary__list">
            {confidentFacts.map((f) => (
              <span className="lesson-summary__chip" key={`${f.a}x${f.b}`}>{f.a} × {f.b}</span>
            ))}
          </div>
        </div>
      )}

      {reviewFacts.length > 0 && (
        <div>
          <p>Стоит ещё повторить:</p>
          <div className="lesson-summary__list">
            {reviewFacts.map((f) => (
              <span className="lesson-summary__chip lesson-summary__chip--review" key={`${f.a}x${f.b}`}>{f.a} × {f.b}</span>
            ))}
          </div>
        </div>
      )}

      <div className="lesson-summary__actions">
        {reviewFacts.length > 0 && (
          <Button variant="secondary" onClick={onRepeatDifficult}>Повторить трудный пример</Button>
        )}
        <Button variant="primary" onClick={onContinue}>Ещё 3 задания</Button>
        <Button variant="quiet" onClick={onFinish}>Закончить</Button>
      </div>
    </div>
  )
}
