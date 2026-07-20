import { ButtonHTMLAttributes } from 'react'
import { Icon, IconName } from '../icons/Icon'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName
  label: string
  active?: boolean
}

export function IconButton({ icon, label, active, className = '', ...rest }: Props) {
  return (
    <button
      className={`icon-btn ${className}`}
      aria-label={label}
      aria-pressed={active}
      title={label}
      {...rest}
    >
      <Icon name={icon} size={20} />
    </button>
  )
}
