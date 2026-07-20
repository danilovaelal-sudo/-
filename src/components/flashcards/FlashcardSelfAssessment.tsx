import { Icon } from '../icons/Icon'
import './FlashcardSelfAssessment.css'

export function FlashcardSelfAssessment({ onKnown, onReview }: { onKnown: () => void; onReview: () => void }) {
  return (
    <div className="flashcard-assessment">
      <button className="flashcard-assessment__btn flashcard-assessment__btn--known" onClick={onKnown}>
        <Icon name="check" size={18} />
        Я знал
      </button>
      <button className="flashcard-assessment__btn flashcard-assessment__btn--review" onClick={onReview}>
        <Icon name="repeat" size={18} />
        Нужно повторить
      </button>
    </div>
  )
}
