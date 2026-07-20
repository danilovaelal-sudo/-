type Props = {
  a: number
  b: number
  isActive: boolean
  isHighlighted: boolean
  onSelect: (a: number, b: number) => void
  onHover: (a: number, b: number) => void
}

export function TableCell({ a, b, isActive, isHighlighted, onSelect, onHover }: Props) {
  const classes = [
    'mult-table__cell',
    isHighlighted ? 'mult-table__cell--highlight' : '',
    isActive ? 'mult-table__cell--active' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classes}
      onClick={() => onSelect(a, b)}
      onMouseEnter={() => onHover(a, b)}
      aria-label={`${a} умножить на ${b} равно ${a * b}`}
    >
      {a * b}
    </button>
  )
}
