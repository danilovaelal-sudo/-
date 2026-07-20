import { useEffect, useRef, useState } from 'react'
import { buildLesson } from '../../engine/lessonPlanner'
import { useApp } from '../../state/AppContext'
import { Fact, LessonStep } from '../../state/types'
import { useSound } from '../../audio/useSound'
import { ScreenHeader } from '../layout/ScreenHeader'
import { Pix, PixMood } from '../pix/Pix'
import { ExplainStep } from './ExplainStep'
import { MultiplicationModel } from './MultiplicationModel'
import { HintPanel } from './HintPanel'
import { FeedbackPanel } from './FeedbackPanel'
import { LessonSummary } from './LessonSummary'
import { ChoiceExercise } from './exercises/ChoiceExercise'
import { InputExercise } from './exercises/InputExercise'
import { FillBlankExercise } from './exercises/FillBlankExercise'
import { GroupsExercise } from './exercises/GroupsExercise'
import { MatchExercise } from './exercises/MatchExercise'
import './LessonScreen.css'

type Phase = 'question' | 'hint' | 'feedback'

function factKey(f: Fact) {
  return `${f.a}x${f.b}`
}

export function LessonScreen() {
  const { progress, activeLessonTable, recordAnswer, recordSession, endFlow, startPractice } = useApp()
  const { correct: playCorrect, hint: playHintSound, lessonComplete } = useSound()

  const table = activeLessonTable!
  const initialExamplesRef = useRef(progress.examples)
  const startTimeRef = useRef(Date.now())
  const touchedRef = useRef<Map<string, Fact>>(new Map())

  const [steps, setSteps] = useState<LessonStep[]>(() => buildLesson(table, progress))
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('question')
  const [retry, setRetry] = useState(false)
  const [pixMood, setPixMood] = useState<PixMood>('neutral')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const step = steps[stepIndex]

  function scheduleAdvance(delayMs: number, action: () => void) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(action, delayMs)
  }

  function goToStep(index: number) {
    setStepIndex(index)
    setPhase('question')
    setRetry(false)
    setPixMood('neutral')
  }

  function handleSingleAnswered(fact: Fact, support: 'full' | 'partial' | 'none', correct: boolean) {
    touchedRef.current.set(factKey(fact), fact)
    recordAnswer(fact.a, fact.b, { correct, hintUsed: retry, supported: support !== 'none' })

    if (correct) {
      playCorrect()
      setPixMood('joy')
      setPhase('feedback')
      scheduleAdvance(900, () => goToStep(stepIndex + 1))
    } else if (!retry) {
      playHintSound()
      setPixMood('calm')
      setPhase('hint')
      const hintDuration = fact.a * (fact.a > 6 ? 160 : 260) + 900
      scheduleAdvance(hintDuration, () => {
        setPhase('question')
        setRetry(true)
      })
    } else {
      // second miss in a row — move on gently, no extra punishment
      setPixMood('calm')
      setPhase('feedback')
      scheduleAdvance(900, () => goToStep(stepIndex + 1))
    }
  }

  function handlePairResolved(fact: Fact, hadMistake: boolean) {
    touchedRef.current.set(factKey(fact), fact)
    recordAnswer(fact.a, fact.b, { correct: true, hintUsed: hadMistake, supported: false })
  }

  function handleMatchComplete() {
    playCorrect()
    setPixMood('joy')
    setPhase('feedback')
    scheduleAdvance(900, () => goToStep(stepIndex + 1))
  }

  function finishAndExit(nextScreen: 'today' | 'learn') {
    if (touchedRef.current.size > 0) {
      recordSession({
        tableNumber: table,
        durationSec: Math.round((Date.now() - startTimeRef.current) / 1000),
        completedCount: touchedRef.current.size,
        newlyMastered: newlyConfident().length,
      })
    }
    endFlow(nextScreen)
  }

  function newlyConfident(): Fact[] {
    const initial = initialExamplesRef.current
    const result: Fact[] = []
    touchedRef.current.forEach((fact, key) => {
      const before = initial[key as keyof typeof initial]
      const after = progress.examples[key as keyof typeof progress.examples]
      if (after?.state === 'confident' && before?.state !== 'confident') result.push(fact)
    })
    return result
  }

  function confidentTouched(): Fact[] {
    const result: Fact[] = []
    touchedRef.current.forEach((fact, key) => {
      if (progress.examples[key as keyof typeof progress.examples]?.state === 'confident') result.push(fact)
    })
    return result
  }

  function reviewTouched(): Fact[] {
    const result: Fact[] = []
    touchedRef.current.forEach((fact, key) => {
      if (progress.examples[key as keyof typeof progress.examples]?.state === 'review') result.push(fact)
    })
    return result
  }

  if (!step) return null

  return (
    <div className="screen lesson-screen">
      <ScreenHeader title={`Таблица на ${table}`} onBack={() => finishAndExit('today')} />

      {step.kind !== 'summary' && (
        <div className="lesson-screen__progress" aria-hidden="true">
          {steps
            .filter((s) => s.kind !== 'summary')
            .map((_, i) => (
              <span
                key={i}
                className={`lesson-screen__dot ${i < stepIndex ? 'lesson-screen__dot--done' : i === stepIndex ? 'lesson-screen__dot--current' : ''}`}
              />
            ))}
        </div>
      )}

      {step.kind === 'explain' && <ExplainStep fact={step.fact} onContinue={() => goToStep(stepIndex + 1)} />}

      {step.kind === 'question' && (
        <div className="lesson-screen__stage">
          <div className="lesson-screen__pix">
            <Pix mood={phase === 'hint' ? 'calm' : pixMood} size={56} />
          </div>

          {phase === 'hint' ? (
            <HintPanel fact={step.fact} />
          ) : (
            <>
              {step.support === 'full' && <MultiplicationModel a={step.fact.a} b={step.fact.b} revealMode="full" />}
              {step.support === 'partial' && <MultiplicationModel a={step.fact.a} b={step.fact.b} revealMode="timed" />}

              <p className="lesson-screen__prompt">
                {step.fact.a} × {step.fact.b} = ?
              </p>

              {step.exercise === 'choice' && (
                <ChoiceExercise
                  key={`${step.id}-${retry}`}
                  fact={step.fact}
                  disabled={phase === 'feedback'}
                  onAnswered={(c) => handleSingleAnswered(step.fact, step.support, c)}
                />
              )}
              {step.exercise === 'input' && (
                <InputExercise
                  key={`${step.id}-${retry}`}
                  fact={step.fact}
                  disabled={phase === 'feedback'}
                  onAnswered={(c) => handleSingleAnswered(step.fact, step.support, c)}
                />
              )}
              {step.exercise === 'fillBlank' && (
                <FillBlankExercise
                  key={`${step.id}-${retry}`}
                  fact={step.fact}
                  disabled={phase === 'feedback'}
                  onAnswered={(c) => handleSingleAnswered(step.fact, step.support, c)}
                />
              )}
              {step.exercise === 'groups' && (
                <GroupsExercise
                  key={`${step.id}-${retry}`}
                  fact={step.fact}
                  disabled={phase === 'feedback'}
                  onAnswered={(c) => handleSingleAnswered(step.fact, step.support, c)}
                />
              )}
              {step.exercise === 'match' && step.matchPairs && (
                <MatchExercise
                  key={step.id}
                  pairs={step.matchPairs}
                  disabled={phase === 'feedback'}
                  onPairResolved={handlePairResolved}
                  onComplete={handleMatchComplete}
                />
              )}

              {phase === 'feedback' && <FeedbackPanel text={retry ? 'Идём дальше' : 'Верно'} />}
            </>
          )}
        </div>
      )}

      {step.kind === 'summary' && (
        <LessonSummary
          newlyConfident={newlyConfident()}
          confidentFacts={confidentTouched()}
          reviewFacts={reviewTouched()}
          onRepeatDifficult={() => {
            lessonComplete()
            const facts = reviewTouched()
            finishAndExit('today')
            startPractice({ mode: 'hard', count: Math.max(5, facts.length) as 5 | 10 | 15 })
          }}
          onFinish={() => {
            lessonComplete()
            finishAndExit('today')
          }}
          onContinue={() => {
            const nextSteps = buildLesson(table, progress).filter((s) => s.kind !== 'explain')
            setSteps(nextSteps)
            goToStep(0)
          }}
        />
      )}
    </div>
  )
}
