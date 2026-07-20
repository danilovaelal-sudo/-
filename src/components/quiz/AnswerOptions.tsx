type Props = {
  options: number[]
  correctAnswer: number
  selected: number | null
  onSelect: (value: number) => void
}

export function AnswerOptions({ options, correctAnswer, selected, onSelect }: Props) {
  const answered = selected !== null

  return (
    <div className="quiz-options">
      {options.map((option) => {
        let extraClass = ''
        if (answered && option === correctAnswer) extraClass = 'quiz-option--correct'
        else if (answered && option === selected) extraClass = 'quiz-option--wrong'

        return (
          <button
            key={option}
            className={`quiz-option ${extraClass}`}
            onClick={() => onSelect(option)}
            disabled={answered}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
