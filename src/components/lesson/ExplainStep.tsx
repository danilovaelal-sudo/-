import { useState } from 'react'
import { Fact } from '../../state/types'
import { Button } from '../shared/Button'
import { MultiplicationModel } from './MultiplicationModel'
import { EquationDisplay } from './EquationDisplay'

export function ExplainStep({ fact, onContinue }: { fact: Fact; onContinue: () => void }) {
  const [activeRow, setActiveRow] = useState<number | null>(null)

  return (
    <div className="stack" style={{ alignItems: 'center' }}>
      <p>Нажимай на ряды — так устроено умножение</p>
      <MultiplicationModel a={fact.a} b={fact.b} activeRow={activeRow} onRowTap={setActiveRow} />
      <EquationDisplay a={fact.a} b={fact.b} />
      <Button variant="primary" size="lg" onClick={onContinue}>Понятно</Button>
    </div>
  )
}
