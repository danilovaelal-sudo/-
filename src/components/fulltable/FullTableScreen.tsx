import { Fragment, useState } from 'react'
import { useApp } from '../../state/AppContext'
import { useSound } from '../../audio/useSound'
import { isTableNumber } from '../../data/curriculum'
import { ScreenHeader } from '../layout/ScreenHeader'
import { LearnTabs } from '../learn/LearnTabs'
import { Button } from '../shared/Button'
import { MultiplicationModel } from '../lesson/MultiplicationModel'
import { EquationDisplay } from '../lesson/EquationDisplay'
import './FullTableScreen.css'

const NUMBERS = Array.from({ length: 10 }, (_, i) => i + 1)

export function FullTableScreen() {
  const { setScreen, startPractice } = useApp()
  const { speak, speechSupported } = useSound()
  const [selected, setSelected] = useState<{ a: number; b: number } | null>(null)
  const [hover, setHover] = useState<{ a: number; b: number } | null>(null)

  function handleSelect(a: number, b: number) {
    setSelected({ a, b })
    if (speechSupported) speak(`${a} умножить на ${b} равно ${a * b}`)
  }

  const practiceTableNumber = selected && isTableNumber(selected.a) ? selected.a : null

  return (
    <div className="screen full-table-screen">
      <ScreenHeader title="Учиться" onBack={() => setScreen('today')} />
      <LearnTabs />
      <p style={{ marginBottom: 12 }}>Нажми на клетку, чтобы увидеть пример и модель.</p>

      <div className="full-table__scroll">
        <div className="full-table__grid" onMouseLeave={() => setHover(null)}>
          <div className="full-table__header-cell full-table__header-cell--corner">×</div>
          {NUMBERS.map((n) => (
            <div key={`col-${n}`} className="full-table__header-cell">{n}</div>
          ))}

          {NUMBERS.map((a) => (
            <Fragment key={`row-${a}`}>
              <div className="full-table__header-cell">{a}</div>
              {NUMBERS.map((b) => {
                const isSelected = selected?.a === a && selected?.b === b
                const isMirror = !!selected && selected.a === b && selected.b === a && !isSelected
                const isHighlighted = hover?.a === a || hover?.b === b
                return (
                  <button
                    key={`${a}-${b}`}
                    className={[
                      'full-table__cell',
                      isHighlighted ? 'full-table__cell--highlight' : '',
                      isSelected ? 'full-table__cell--selected' : '',
                      isMirror ? 'full-table__cell--mirror' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onMouseEnter={() => setHover({ a, b })}
                    onClick={() => handleSelect(a, b)}
                    aria-label={`${a} умножить на ${b} равно ${a * b}`}
                  >
                    {a * b}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {selected && (
        <div className="card full-table__detail">
          <EquationDisplay a={selected.a} b={selected.b} showSum={false} />
          <MultiplicationModel a={selected.a} b={selected.b} />
          {practiceTableNumber !== null && (
            <Button variant="secondary" onClick={() => startPractice({ mode: 'free', count: 10, tables: [practiceTableNumber] })}>
              Тренировать таблицу на {practiceTableNumber}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
