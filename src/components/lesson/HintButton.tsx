import { Icon } from '../icons/Icon'
import './HintButton.css'

export function HintButton({ onClick, disabled, firstTime }: { onClick: () => void; disabled?: boolean; firstTime?: boolean }) {
  return (
    <button className="hint-button" onClick={onClick} disabled={disabled}>
      <Icon name="hint" size={18} />
      {firstTime ? 'Не получается? Показать подсказку' : 'Показать подсказку'}
    </button>
  )
}
