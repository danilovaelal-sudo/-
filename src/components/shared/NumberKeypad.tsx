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
      <div className="keypad__digits">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} className="keypad__key" onClick={() => pressDigit(d)} disabled={disabled} aria-label={`Цифра ${d}`}>
            {d}
          </button>
        ))}
      </div>
      <div className="keypad__bottom-row">
        <button className="keypad__key keypad__key--wide" onClick={pressBackspace} disabled={disabled} aria-label="Удалить цифру">
          <Icon name="backspace" size={20} />
        </button>
        <button className="keypad__key keypad__key--wide" onClick={() => pressDigit('0')} disabled={disabled} aria-label="Цифра 0">
          0
        </button>
      </div>
      <button className="keypad__confirm" onClick={onConfirm} disabled={disabled || value === ''}>
        <Icon name="check" size={18} />
        <span>Проверить</span>
      </button>
    </div>
  )
}
