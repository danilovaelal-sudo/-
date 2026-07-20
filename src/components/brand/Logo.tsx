import { APP_NAME } from '../../config/appConfig'
import './Logo.css'

export function Logo({ size = 'medium' }: { size?: 'medium' | 'large' }) {
  return (
    <span className="logo" style={size === 'large' ? { fontSize: '1.7rem' } : undefined}>
      <span>{APP_NAME}</span>
      <span className="logo__dot" aria-hidden="true" />
    </span>
  )
}
