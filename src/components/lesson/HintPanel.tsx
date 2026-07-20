import { useEffect, useState } from 'react'
import { Fact } from '../../state/types'
import { MultiplicationModel } from './MultiplicationModel'
import { EquationDisplay } from './EquationDisplay'
import './HintPanel.css'

export function HintPanel({ fact }: { fact: Fact }) {
  const [activeRow, setActiveRow] = useState(0)
  const [showEquation, setShowEquation] = useState(false)

  useEffect(() => {
    setActiveRow(0)
    setShowEquation(false)
    let row = 0
    const stepMs = fact.a > 6 ? 160 : 260
    const interval = setInterval(() => {
      row += 1
      if (row >= fact.a) {
        clearInterval(interval)
        setShowEquation(true)
      } else {
        setActiveRow(row)
      }
    }, stepMs)
    return () => clearInterval(interval)
  }, [fact.a, fact.b])

  return (
    <div className="hint-panel">
      <p className="hint-panel__lead">Давай посмотрим</p>
      <MultiplicationModel a={fact.a} b={fact.b} activeRow={activeRow} />
      {showEquation && <EquationDisplay a={fact.a} b={fact.b} />}
    </div>
  )
}
