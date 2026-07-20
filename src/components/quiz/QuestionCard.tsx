import { QuizQuestion } from '../../state/types'

export function QuestionCard({ question }: { question: QuizQuestion }) {
  return (
    <div className="card quiz-question">
      <p>Сколько будет?</p>
      <div className="quiz-question__expr">
        {question.a} × {question.b} = ?
      </div>
    </div>
  )
}
