import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'quiet'
type Size = 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...rest },
  ref,
) {
  const classes = ['btn', `btn-${variant}`, size === 'lg' ? 'btn-lg' : '', className].filter(Boolean).join(' ')
  return (
    <button ref={ref} className={classes} {...rest}>
      {children}
    </button>
  )
})
