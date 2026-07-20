type Props = {
  status: 'correct' | 'wrong'
  correctAnswer: number
}

export function ResultFeedback({ status, correctAnswer }: Props) {
  if (status === 'correct') {
    return <div className="quiz-feedback quiz-feedback--correct">Отлично! Молодец! 🎉</div>
  }
  return (
    <div className="quiz-feedback quiz-feedback--wrong">
      Почти! Правильный ответ: {correctAnswer}
    </div>
  )
}
