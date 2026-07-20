import { Fragment, useState } from 'react'
import { TABLE_MAX, TABLE_MIN } from '../../state/types'
import { useSound } from '../../audio/useSound'
import { TableCell } from './TableCell'

const NUMBERS = Array.from({ length: TABLE_MAX - TABLE_MIN + 1 }, (_, i) => TABLE_MIN + i)

export function MultiplicationTable() {
  const [active, setActive] = useState<{ a: number; b: number } | null>(null)
  const [hoverRow, setHoverRow] = useState<number | null>(null)
  const [hoverCol, setHoverCol] = useState<number | null>(null)
  const { click, speak } = useSound()

  function handleSelect(a: number, b: number) {
    setActive({ a, b })
    click()
    speak(`${a} умножить на ${b} равно ${a * b}`)
  }

  function handleHover(a: number, b: number) {
    setHoverRow(a)
    setHoverCol(b)
  }

  return (
    <div
      className="mult-table"
      onMouseLeave={() => {
        setHoverRow(null)
        setHoverCol(null)
      }}
    >
      <div className="mult-table__header-cell mult-table__header-cell--corner">×</div>
      {NUMBERS.map((n) => (
        <div key={`col-${n}`} className="mult-table__header-cell">
          {n}
        </div>
      ))}

      {NUMBERS.map((a) => (
        <Fragment key={`row-${a}`}>
          <div className="mult-table__header-cell">{a}</div>
          {NUMBERS.map((b) => (
            <TableCell
              key={`${a}-${b}`}
              a={a}
              b={b}
              isActive={active?.a === a && active?.b === b}
              isHighlighted={hoverRow === a || hoverCol === b}
              onSelect={handleSelect}
              onHover={handleHover}
            />
          ))}
        </Fragment>
      ))}
    </div>
  )
}
