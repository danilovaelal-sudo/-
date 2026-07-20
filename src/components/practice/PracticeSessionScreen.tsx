import { useEffect, useRef, useState } from 'react'
import { buildPracticeSet } from '../../engine/practicePlanner'
import { useApp } from '../../state/AppContext'
import { useSound } from '../../audio/useSound'
import { Fact } from '../../state/types'
import { ScreenHeader } from '../layout/ScreenHeader'
import { Button } from '../shared/Button'
import { Pix, PixMood } from '../pix/Pix'
import { HintPanel } from '../lesson/HintPanel'
import { FeedbackPanel } from '../lesson/FeedbackPanel'
import { ChoiceExercise } from '../lesson/exercises/ChoiceExercise'
import { InputExercise } from '../lesson/exercises/InputExercise'
import { FillBlankExercise } from '../lesson/exercises/FillBlankExercise'
import './PracticeSessionScreen.css'

type Phase = 'question' | 'hint' | 'feedback'

const EXERCISE_CYCLE = ['choice', 'input', 'fillBlank'] as const

export function PracticeSessionScreen() {
  const { progress, activePracticeConfig, recordAnswer, endFlow } = useApp()
  const { correct: playCorrect, hint: playHintSound } = useSound()
  const config = activePracticeConfig!

  const [facts] = useState<Fact[]>(() => buildPracticeSet(config.mode, config.count, progress, config.tables))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('question')
  const [retry, setRetry] = useState(false)
  const [pixMood, setPixMood] = useState<PixMood>('neutral')
  const [correctCount, setCorrectCount] = useState(0)
  const stillDifficultRef = useRef<Fact[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const fact = facts[index]
  const exerciseType = EXERCISE_CYCLE[index % EXERCISE_CYCLE.length]

  function schedule(delayMs: number, action: () => void) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(action, delayMs)
  }

  function nextQuestion() {
    setPhase('question')
    setRetry(false)
    setPixMood('neutral')
    setIndex((i) => i + 1)
  }

  function handleAnswered(correct: boolean) {
    recordAnswer(fact.a, fact.b, { correct, hintUsed: retry, supported: false })

    if (correct) {
      if (!retry) setCorrectCount((c) => c + 1)
      playCorrect()
      setPixMood('joy')
      setPhase('feedback')
      schedule(800, nextQuestion)
    } else if (!retry) {
      playHintSound()
      setPixMood('calm')
      setPhase('hint')
      const hintDuration = fact.a * (fact.a > 6 ? 160 : 260) + 900
      schedule(hintDuration, () => {
        setPhase('question')
        setRetry(true)
      })
    } else {
      stillDifficultRef.current.push(fact)
      setPixMood('calm')
      setPhase('feedback')
      schedule(800, nextQuestion)
    }
  }

  if (index >= facts.length) {
    return (
      <div className="screen practice-session">
        <ScreenHeader title="Тренировка" onBack={() => endFlow('practice')} />
        <div className="practice-results">
          <Pix mood="joy" size={72} />
          <div className="practice-results__score">{correctCount} из {facts.length}</div>
          <p>Верных ответов с первого раза</p>
          <div className="practice-results__actions">
            <Button variant="primary" onClick={() => endFlow('today')}>Готово</Button>
            <Button variant="quiet" onClick={() => endFlow('practice')}>Ещё тренировка</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen practice-session">
      <ScreenHeader title="Тренировка" onBack={() => endFlow('practice')} />

      <div className="practice-session__progress" aria-hidden="true">
        {facts.map((_, i) => (
          <span
            key={i}
            className={`practice-session__dot ${i < index ? 'practice-session__dot--done' : i === index ? 'practice-session__dot--current' : ''}`}
          />
        ))}
      </div>

      <div className="practice-session__stage">
        <Pix mood={phase === 'hint' ? 'calm' : pixMood} size={56} />

        {phase === 'hint' ? (
          <HintPanel fact={fact} />
        ) : (
          <>
            <p className="lesson-screen__prompt">{fact.a} × {fact.b} = ?</p>

            {exerciseType === 'choice' && (
              <ChoiceExercise key={`${index}-${retry}`} fact={fact} disabled={phase === 'feedback'} onAnswered={handleAnswered} />
            )}
            {exerciseType === 'input' && (
              <InputExercise key={`${index}-${retry}`} fact={fact} disabled={phase === 'feedback'} onAnswered={handleAnswered} />
            )}
            {exerciseType === 'fillBlank' && (
              <FillBlankExercise key={`${index}-${retry}`} fact={fact} disabled={phase === 'feedback'} onAnswered={handleAnswered} />
            )}

            {phase === 'feedback' && <FeedbackPanel text={retry ? 'Идём дальше' : 'Верно'} />}
          </>
        )}
      </div>
    </div>
  )
}
