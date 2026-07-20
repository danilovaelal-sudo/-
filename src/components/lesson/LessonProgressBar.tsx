import './LessonProgressBar.css'

export function LessonProgressBar({ total, current }: { total: number; current: number }) {
  const currentNumber = Math.min(current + 1, total)
  return (
    <div className="lesson-progress">
      <div className="lesson-progress__dots" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`lesson-progress__dot ${i < current ? 'lesson-progress__dot--done' : i === current ? 'lesson-progress__dot--current' : ''}`}
          />
        ))}
      </div>
      <p className="lesson-progress__label" aria-live="polite">
        Задание {currentNumber} из {total}
        <span className="sr-only"> Выполнено {current} заданий из {total}. Сейчас задание {currentNumber}.</span>
      </p>
    </div>
  )
}
