import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../state/AppContext'
import { useSound } from '../../audio/useSound'
import { generateQuestion } from '../../engine/quizEngine'
import { QuizQuestion } from '../../state/types'
import { Button } from '../shared/Button'
import { Mascot } from '../shared/Mascot'
import { QuizSetup } from './QuizSetup'
import { QuestionCard } from './QuestionCard'
import { AnswerOptions } from './AnswerOptions'
import { ResultFeedback } from './ResultFeedback'
import './QuizScreen.css'

const ADVANCE_DELAY_MS = 1500

export function QuizScreen() {
  const { progress, recordAnswer } = useApp()
  const { correct: playCorrect, wrong: playWrong, speak } = useSound()

  const [range, setRange] = useState<number[] | null>(null)
  const [question, setQuestion] = useState<QuizQuestion | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function startQuiz(selectedRange: number[]) {
    setRange(selectedRange)
    setSessionCorrect(0)
    setSessionTotal(0)
    setSelected(null)
    setFeedback(null)
    setQuestion(generateQuestion(selectedRange, progress.statsByNumber))
  }

  function endQuiz() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setRange(null)
    setQuestion(null)
  }

  function handleAnswer(value: number) {
    if (!question || selected !== null) return
    const isCorrect = value === question.answer
    setSelected(value)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setSessionTotal((t) => t + 1)
    if (isCorrect) setSessionCorrect((c) => c + 1)

    recordAnswer(question.a, isCorrect)

    if (isCorrect) {
      playCorrect()
      speak('Правильно!')
    } else {
      playWrong()
      speak(`Правильный ответ: ${question.answer}`)
    }

    timeoutRef.current = setTimeout(() => {
      setSelected(null)
      setFeedback(null)
      setQuestion(generateQuestion(range ?? [], progress.statsByNumber))
    }, ADVANCE_DELAY_MS)
  }

  if (!range || !question) {
    return <QuizSetup onStart={startQuiz} />
  }

  return (
    <div className="screen quiz-active">
      <div className="quiz-score">
        <span>✅ Верно: {sessionCorrect}</span>
        <span>📋 Всего: {sessionTotal}</span>
      </div>

      <Mascot mood={feedback === 'wrong' ? 'sad' : feedback === 'correct' ? 'excited' : 'happy'} />

      <QuestionCard question={question} />

      <AnswerOptions
        options={question.options}
        correctAnswer={question.answer}
        selected={selected}
        onSelect={handleAnswer}
      />

      <div style={{ minHeight: 32 }}>
        {feedback && <ResultFeedback status={feedback} correctAnswer={question.answer} />}
      </div>

      <Button variant="ghost" onClick={endQuiz}>Закончить тренировку</Button>
    </div>
  )
}
