import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'yellow' | 'green' | 'blue' | 'ghost'
type Size = 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: Props) {
  const classes = ['btn', `btn-${variant}`, size === 'lg' ? 'btn-lg' : '', className].filter(Boolean).join(' ')
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
