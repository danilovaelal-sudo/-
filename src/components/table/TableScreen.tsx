import { Mascot } from '../shared/Mascot'
import { MultiplicationTable } from './MultiplicationTable'
import './TableScreen.css'

export function TableScreen() {
  return (
    <div className="screen table-screen">
      <div className="table-screen__header">
        <Mascot mood="happy" size="small" />
        <h2>Таблица умножения</h2>
        <p className="table-screen__hint">Нажми на клеточку, чтобы услышать пример!</p>
      </div>
      <MultiplicationTable />
    </div>
  )
}
