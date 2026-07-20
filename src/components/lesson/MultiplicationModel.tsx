import { useEffect, useState } from 'react'
import './MultiplicationModel.css'

type Props = {
  a: number
  b: number
  revealMode?: 'full' | 'timed' | 'hidden'
  timedDurationMs?: number
  activeRow?: number | null
  onRowTap?: (row: number) => void
}

export function MultiplicationModel({
  a,
  b,
  revealMode = 'full',
  timedDurationMs = 2200,
  activeRow = null,
  onRowTap,
}: Props) {
  const [visible, setVisible] = useState(revealMode !== 'hidden')

  useEffect(() => {
    setVisible(revealMode !== 'hidden')
    if (revealMode === 'timed') {
      const timer = setTimeout(() => setVisible(false), timedDurationMs)
      return () => clearTimeout(timer)
    }
  }, [revealMode, timedDurationMs, a, b])

  return (
    <div
      className={`model ${visible ? '' : 'model--hidden'}`}
      aria-label={`Модель: ${a} рядов по ${b}`}
      role="img"
    >
      {Array.from({ length: a }, (_, rowIndex) => (
        <div
          key={rowIndex}
          className={`model__row ${activeRow === rowIndex ? 'model__row--active' : ''}`}
          onClick={onRowTap ? () => onRowTap(rowIndex) : undefined}
          style={onRowTap ? { cursor: 'pointer' } : undefined}
        >
          {Array.from({ length: b }, (_, cellIndex) => (
            <span
              key={cellIndex}
              className="model__cell"
              style={{ animationDelay: `${(rowIndex * b + cellIndex) * 18}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
