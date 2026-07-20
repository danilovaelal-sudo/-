import { ReactNode } from 'react'
import { IconButton } from '../shared/IconButton'
import './ScreenHeader.css'

export function ScreenHeader({ title, onBack, actions }: { title: string; onBack: () => void; actions?: ReactNode }) {
  return (
    <div className="screen-header">
      <IconButton icon="back" label="Назад" onClick={onBack} />
      <h2 className="screen-header__title grow">{title}</h2>
      {actions}
    </div>
  )
}
