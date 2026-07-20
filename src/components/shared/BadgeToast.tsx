import { useEffect } from 'react'
import { useApp } from '../../state/AppContext'
import { useSound } from '../../audio/useSound'
import { Confetti } from './Confetti'
import './BadgeToast.css'

export function BadgeToast() {
  const { newlyEarnedBadge, clearNewBadge } = useApp()
  const { badge } = useSound()

  useEffect(() => {
    if (!newlyEarnedBadge) return
    badge()
    const timer = setTimeout(clearNewBadge, 3200)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newlyEarnedBadge])

  if (!newlyEarnedBadge) return null

  return (
    <>
      <Confetti />
      <div className="badge-toast" role="status">
        <span className="badge-toast__icon" role="img" aria-hidden="true">{newlyEarnedBadge.icon}</span>
        <div>
          <div className="badge-toast__title">Новая награда! {newlyEarnedBadge.title}</div>
          <div className="badge-toast__desc">{newlyEarnedBadge.description}</div>
        </div>
      </div>
    </>
  )
}
