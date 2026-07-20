import { useEffect, useRef } from 'react'
import { Button } from '../shared/Button'
import '../shared/ConfirmDialog.css'

type Props = {
  onContinueLater: () => void
  onFinishNow: () => void
  onStay: () => void
}

export function LeaveLessonDialog({ onContinueLater, onFinishNow, onStay }: Props) {
  const stayRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    stayRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onStay()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onStay])

  return (
    <div className="confirm-dialog__overlay" onClick={onStay}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="leave-lesson-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="leave-lesson-title" className="confirm-dialog__title">Что сделать с занятием?</h3>
        <div className="confirm-dialog__actions" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <Button variant="primary" onClick={onContinueLater}>Продолжить позже</Button>
          <Button variant="outline" onClick={onFinishNow}>Закончить занятие</Button>
          <Button variant="quiet" ref={stayRef} onClick={onStay}>Остаться</Button>
        </div>
      </div>
    </div>
  )
}
