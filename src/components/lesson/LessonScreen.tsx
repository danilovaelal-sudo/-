import { useEffect, useRef, useState } from 'react'
import { buildLesson } from '../../engine/lessonPlanner'
import { useApp } from '../../state/AppContext'
import { ExampleKey, Fact, LessonStep } from '../../state/types'
import { useSound } from '../../audio/useSound'
import { ScreenHeader } from '../layout/ScreenHeader'
import { Pix, PixMood } from '../pix/Pix'
import { ExplainStep } from './ExplainStep'
import { MultiplicationModel } from './MultiplicationModel'
import { HintPanel } from './HintPanel'
import { FeedbackPanel } from './FeedbackPanel'
import { LessonSummary } from './LessonSummary'
import { LessonProgressBar } from './LessonProgressBar'
import { ExerciseInstruction } from './ExerciseInstruction'
import { HintButton } from './HintButton'
import { IntroTip } from './IntroTip'
import { LeaveLessonDialog } from './LeaveLessonDialog'
import { exerciseInstructionFor, INTRO_TIPS } from './exerciseCopy'
import { ChoiceExercise } from './exercises/ChoiceExercise'
import { InputExercise } from './exercises/InputExercise'
import { FillBlankExercise } from './exercises/FillBlankExercise'
import { GroupsExercise } from './exercises/GroupsExercise'
import { MatchExercise } from './exercises/MatchExercise'
import './LessonScreen.css'

type Phase = 'question' | 'hint' | 'feedback'

function factKey(f: Fact): ExampleKey {
  return `${f.a}x${f.b}`
}

const PIX_LINES: Record<Phase, string> = {
  question: '',
  hint: 'Давай посмотрим',
  feedback: '',
}

export function LessonScreen() {
  const {
    progress,
    activeLessonTable,
    recordAnswer,
    recordSession,
    endFlow,
    startPractice,
    markIntroSeen,
    savePendingLesson,
    clearPendingLesson,
  } = useApp()
  const { correct: playCorrect, hint: playHintSound, lessonComplete } = useSound()

  const table = activeLessonTable!
  const resumable = progress.pendingLesson?.tableNumber === table ? progress.pendingLesson : null

  const initialExamplesRef = useRef(progress.examples)
  const startTimeRef = useRef(resumable ? new Date(resumable.startedAt).getTime() : Date.now())
  const touchedRef = useRef<Map<string, Fact>>(
    new Map((resumable?.touchedFactKeys ?? []).map((k) => [k, keyToFact(k)])),
  )

  const [steps, setSteps] = useState<LessonStep[]>(() => resumable?.steps ?? buildLesson(table, progress))
  const [stepIndex, setStepIndex] = useState(resumable?.stepIndex ?? 0)
  const [phase, setPhase] = useState<Phase>('question')
  const [retry, setRetry] = useState(false)
  const [pixMood, setPixMood] = useState<PixMood>('neutral')
  const [matchHintLevel, setMatchHintLevel] = useState(0)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const step = steps[stepIndex]
  const questionSteps = steps.filter((s) => s.kind === 'question')
  const currentQuestionIndex = step?.kind === 'question' ? questionSteps.findIndex((s) => s.id === step.id) : -1

  function scheduleAdvance(delayMs: number, action: () => void) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(action, delayMs)
  }

  function goToStep(index: number) {
    setStepIndex(index)
    setPhase('question')
    setRetry(false)
    setPixMood('neutral')
    setMatchHintLevel(0)
  }

  function triggerHint(fact: Fact) {
    playHintSound()
    setPixMood('calm')
    setPhase('hint')
    const hintDuration = fact.a * (fact.a > 6 ? 160 : 260) + 900
    scheduleAdvance(hintDuration, () => {
      setPhase('question')
      setRetry(true)
    })
  }

  function handleSingleAnswered(fact: Fact, support: 'full' | 'partial' | 'none', correct: boolean) {
    touchedRef.current.set(factKey(fact), fact)
    recordAnswer(fact.a, fact.b, { correct, hintUsed: retry, supported: support !== 'none' })

    if (correct) {
      playCorrect()
      setPixMood('joy')
      setPhase('feedback')
      scheduleAdvance(1000, () => goToStep(stepIndex + 1))
    } else if (!retry) {
      triggerHint(fact)
    } else {
      // second miss in a row — move on gently, no extra punishment
      setPixMood('calm')
      setPhase('feedback')
      scheduleAdvance(1000, () => goToStep(stepIndex + 1))
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
    scheduleAdvance(1000, () => goToStep(stepIndex + 1))
  }

  function requestManualHint() {
    if (phase !== 'question' || step?.kind !== 'question') return
    if (step.exercise === 'match') {
      setMatchHintLevel((l) => Math.min(2, l + 1))
      return
    }
    triggerHint(step.fact)
  }

  function finishAndExit(nextScreen: 'today' | 'learn', endedEarly = false) {
    if (touchedRef.current.size > 0) {
      recordSession({
        tableNumber: table,
        durationSec: Math.round((Date.now() - startTimeRef.current) / 1000),
        completedCount: touchedRef.current.size,
        newlyMastered: newlyConfident().length,
        endedEarly,
      })
    }
    clearPendingLesson()
    endFlow(nextScreen)
  }

  function handleContinueLater() {
    savePendingLesson({
      tableNumber: table,
      steps,
      stepIndex,
      touchedFactKeys: Array.from(touchedRef.current.keys()) as ExampleKey[],
      startedAt: new Date(startTimeRef.current).toISOString(),
    })
    if (touchedRef.current.size > 0) {
      recordSession({
        tableNumber: table,
        durationSec: Math.round((Date.now() - startTimeRef.current) / 1000),
        completedCount: touchedRef.current.size,
        newlyMastered: newlyConfident().length,
        endedEarly: true,
      })
    }
    endFlow('today')
  }

  function handleBack() {
    if (step?.kind === 'summary') {
      finishAndExit('today')
      return
    }
    setShowLeaveDialog(true)
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

  const instruction = step.kind === 'question' ? exerciseInstructionFor(step.exercise, step.fact) : null
  const showIntroTip = step.kind === 'question' && phase === 'question' && !progress.settings.seenIntros[step.exercise]

  return (
    <div className="screen lesson-screen">
      <ScreenHeader title={`Таблица на ${table}`} onBack={handleBack} />

      {step.kind === 'question' && <LessonProgressBar total={questionSteps.length} current={currentQuestionIndex} />}

      {step.kind === 'explain' && <ExplainStep fact={step.fact} onContinue={() => goToStep(stepIndex + 1)} />}

      {step.kind === 'question' && (
        <div className="lesson-screen__stage">
          <div className="lesson-screen__pix">
            <Pix mood={phase === "hint" ? "calm" : pixMood} size={64} />
            {PIX_LINES[phase] && <p className="lesson-screen__pix-line">{PIX_LINES[phase]}</p>}
          </div>

          {phase === 'hint' ? (
            <HintPanel fact={step.fact} />
          ) : (
            <>
              {instruction && <ExerciseInstruction title={instruction.title} subtitle={instruction.subtitle} />}

              {showIntroTip && (
                <IntroTip lines={INTRO_TIPS[step.exercise]} onDismiss={() => markIntroSeen(step.exercise)} />
              )}

              {step.support === 'full' && <MultiplicationModel a={step.fact.a} b={step.fact.b} revealMode="full" />}
              {step.support === 'partial' && <MultiplicationModel a={step.fact.a} b={step.fact.b} revealMode="timed" />}

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
                  hintLevel={matchHintLevel}
                  onPairResolved={handlePairResolved}
                  onComplete={handleMatchComplete}
                />
              )}

              {phase === 'feedback' && <FeedbackPanel text={retry ? 'Идём дальше' : 'Верно'} />}
              {phase === 'question' && !showIntroTip && (
                <HintButton
                  onClick={requestManualHint}
                  disabled={step.exercise === 'match' ? matchHintLevel >= 2 : retry}
                  firstTime={step.exercise === 'match' ? matchHintLevel === 0 : !retry}
                />
              )}
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

      {showLeaveDialog && (
        <LeaveLessonDialog
          onContinueLater={() => {
            setShowLeaveDialog(false)
            handleContinueLater()
          }}
          onFinishNow={() => {
            setShowLeaveDialog(false)
            finishAndExit('today', stepIndex < steps.length - 1)
          }}
          onStay={() => setShowLeaveDialog(false)}
        />
      )}
    </div>
  )
}

function keyToFact(key: string): Fact {
  const [a, b] = key.split('x').map(Number)
  return { a, b }
}
