import { Icon } from '../icons/Icon'
import './FeedbackPanel.css'

export function FeedbackPanel({ text = 'Верно' }: { text?: string }) {
  return (
    <div className="feedback-panel" role="status">
      <Icon name="check" size={20} className="feedback-panel__icon" />
      {text}
    </div>
  )
}
