import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../state/AppContext'
import { ExampleKey, Fact } from '../../state/types'
import { ScreenHeader } from '../layout/ScreenHeader'
import { Button } from '../shared/Button'
import { LessonProgressBar } from '../lesson/LessonProgressBar'
import { LeaveLessonDialog } from '../lesson/LeaveLessonDialog'
import { Flashcard } from './Flashcard'
import { FlashcardSelfAssessment } from './FlashcardSelfAssessment'
import { FlashcardSummary } from './FlashcardSummary'
import { MultiplicationExplanation } from './MultiplicationExplanation'
import './FlashcardSession.css'

function factKey(f: Fact): ExampleKey {
  return `${f.a}x${f.b}`
}

function randomRequeueOffset(): number {
  return 3 + Math.floor(Math.random() * 3) // 3, 4, or 5 cards later
}

export function FlashcardSession() {
  const {
    progress,
    setScreen,
    recordFlashcardAssessment,
    recordFlashcardSession,
    updatePendingFlashcards,
    clearPendingFlashcards,
    endFlow,
  } = useApp()
  const pending = progress.pendingFlashcards

  const [deck, setDeck] = useState<Fact[]>(pending?.deck ?? [])
  const [index, setIndex] = useState(pending?.index ?? 0)
  const [known, setKnown] = useState(pending?.known ?? 0)
  const [review, setReview] = useState(pending?.review ?? 0)
  const [lastAssessment] = useState<Map<ExampleKey, 'known' | 'review'>>(
    () => new Map((pending?.reviewedFacts ?? []).map((k) => [k, 'review' as const])),
  )
  const [flipped, setFlipped] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const startTimeRef = useRef(pending ? new Date(pending.startedAt).getTime() : Date.now())
  const sessionRecordedRef = useRef(false)

  const atEnd = pending ? index >= deck.length : false

  useEffect(() => {
    if (!pending) setScreen('flashcardsSetup')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (atEnd) recordSessionOnce()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atEnd])

  if (!pending) return null

  const fact = deck[index]
  const isRepeat = fact ? lastAssessment.has(factKey(fact)) : false

  function goToNext() {
    setFlipped(false)
    setShowExplanation(false)
    setIndex((i) => i + 1)
  }

  function handleKnown() {
    recordFlashcardAssessment(fact.a, fact.b, true)
    lastAssessment.set(factKey(fact), 'known')
    setKnown((k) => k + 1)
    goToNext()
  }

  function handleReview() {
    recordFlashcardAssessment(fact.a, fact.b, false)
    lastAssessment.set(factKey(fact), 'review')
    setReview((r) => r + 1)
    const insertAt = Math.min(deck.length, index + randomRequeueOffset())
    setDeck((prev) => {
      const next = [...prev]
      next.splice(insertAt, 0, fact)
      return next
    })
    goToNext()
  }

  function recordSessionOnce() {
    if (sessionRecordedRef.current) return
    sessionRecordedRef.current = true
    recordFlashcardSession({ viewed: known + review, known, review })
  }

  function handleFinishNow() {
    recordSessionOnce()
    clearPendingFlashcards()
    endFlow('today')
  }

  function handleContinueLater() {
    updatePendingFlashcards({
      deck,
      index,
      known,
      review,
      requeue: [],
      reviewedFacts: Array.from(lastAssessment.entries()).filter(([, v]) => v === 'review').map(([k]) => k),
      startedAt: new Date(startTimeRef.current).toISOString(),
    })
    if (known + review > 0) recordFlashcardSession({ viewed: known + review, known, review })
    endFlow('today')
  }

  function handleBack() {
    if (atEnd) {
      handleFinishNow()
      return
    }
    setShowLeaveDialog(true)
  }

  const reviewFacts: Fact[] = Array.from(lastAssessment.entries())
    .filter(([, v]) => v === 'review')
    .map(([k]) => {
      const [a, b] = k.split('x').map(Number)
      return { a, b }
    })

  if (atEnd) {
    return (
      <div className="screen flashcards-session">
        <ScreenHeader title="Карточки" onBack={handleFinishNow} />
        <FlashcardSummary
          viewed={known + review}
          known={known}
          review={review}
          reviewFacts={reviewFacts}
          onRepeat={() => {
            clearPendingFlashcards()
            setDeck(reviewFacts)
            setIndex(0)
            setKnown(0)
            setReview(0)
            lastAssessment.clear()
            sessionRecordedRef.current = false
            startTimeRef.current = Date.now()
          }}
          onFinish={handleFinishNow}
          onChooseOther={() => {
            clearPendingFlashcards()
            endFlow('flashcardsSetup')
          }}
        />
      </div>
    )
  }

  return (
    <div className="screen flashcards-session">
      <ScreenHeader title="Карточки" onBack={handleBack} />
      <LessonProgressBar total={deck.length} current={index} />

      <div className="flashcard-session__stage">
        {isRepeat && <p className="flashcard-session__requeue-note">Попробуем ещё раз</p>}
        <Flashcard
          key={`${index}-${fact.a}-${fact.b}`}
          fact={fact}
          flipped={flipped}
          reducedMotion={progress.settings.reducedMotion}
          onFlip={() => setFlipped(true)}
          backContent={
            <>
              <span className="flashcard-face__equation">{fact.a} × {fact.b} = {fact.a * fact.b}</span>
              <span className="flashcard-face__answer">{fact.a * fact.b}</span>
            </>
          }
        />

        {flipped && (
          <div className="flashcard-session__back-content">
            <button className="flashcard-session__explain-btn" onClick={() => setShowExplanation((s) => !s)}>
              {showExplanation ? 'Скрыть объяснение' : 'Показать как получилось'}
            </button>
            {showExplanation && <MultiplicationExplanation fact={fact} />}
            <div className="flashcard-session__footer">
              <FlashcardSelfAssessment onKnown={handleKnown} onReview={handleReview} />
            </div>
          </div>
        )}
      </div>

      {showLeaveDialog && (
        <LeaveLessonDialog
          onContinueLater={() => {
            setShowLeaveDialog(false)
            handleContinueLater()
          }}
          onFinishNow={() => {
            setShowLeaveDialog(false)
            handleFinishNow()
          }}
          onStay={() => setShowLeaveDialog(false)}
        />
      )}

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button variant="quiet" onClick={handleBack}>Завершить</Button>
      </div>
    </div>
  )
}
