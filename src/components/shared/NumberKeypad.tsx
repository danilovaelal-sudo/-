import { Icon } from '../icons/Icon'
import './NumberKeypad.css'

type Props = {
  value: string
  onChange: (value: string) => void
  onConfirm: () => void
  disabled?: boolean
  maxLength?: number
}

export function NumberKeypad({ value, onChange, onConfirm, disabled, maxLength = 3 }: Props) {
  function pressDigit(digit: string) {
    if (disabled) return
    if (value.length >= maxLength) return
    if (value === '0') {
      onChange(digit)
    } else {
      onChange(value + digit)
    }
  }

  function pressBackspace() {
    if (disabled) return
    onChange(value.slice(0, -1))
  }

  return (
    <div className="keypad">
      <div className="keypad__display" aria-live="polite">
        {value || '—'}
      </div>
      <div className="keypad__grid">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} className="keypad__key" onClick={() => pressDigit(d)} disabled={disabled} aria-label={`Цифра ${d}`}>
            {d}
          </button>
        ))}
        <button className="keypad__key" onClick={pressBackspace} disabled={disabled} aria-label="Удалить цифру">
          <Icon name="backspace" size={20} />
        </button>
        <button className="keypad__key" onClick={() => pressDigit('0')} disabled={disabled} aria-label="Цифра 0">
          0
        </button>
        <button
          className="keypad__key keypad__key--confirm"
          onClick={onConfirm}
          disabled={disabled || value === ''}
          aria-label="Подтвердить ответ"
        >
          <Icon name="check" size={20} />
        </button>
      </div>
    </div>
  )
}
