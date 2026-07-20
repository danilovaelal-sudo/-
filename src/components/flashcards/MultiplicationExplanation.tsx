import { Fact } from '../../state/types'
import { MultiplicationModel } from '../lesson/MultiplicationModel'
import { EquationDisplay } from '../lesson/EquationDisplay'

export function MultiplicationExplanation({ fact }: { fact: Fact }) {
  return (
    <div className="stack" style={{ alignItems: 'center', marginTop: 8 }}>
      <MultiplicationModel a={fact.a} b={fact.b} />
      <EquationDisplay a={fact.a} b={fact.b} />
    </div>
  )
}
