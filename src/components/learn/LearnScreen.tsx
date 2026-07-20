import { orderForSettings } from '../../engine/exampleProgress'
import { useApp } from '../../state/AppContext'
import { TableNumber } from '../../state/types'
import { Icon } from '../icons/Icon'
import { TableModuleCard } from './TableModuleCard'
import './LearnScreen.css'

export function LearnScreen() {
  const { progress, startLesson, setScreen } = useApp()
  const order = orderForSettings(progress.settings.order)

  function handleSelect(table: TableNumber) {
    startLesson(table)
  }

  return (
    <div className="screen learn-screen">
      <div className="learn-screen__header">
        <h2>Учиться</h2>
        <p>Таблицы открываются по порядку — от простых к сложным.</p>
      </div>

      <div className="learn-screen__list">
        {order.map((table) => (
          <TableModuleCard key={table} tableNumber={table} progress={progress} onSelect={handleSelect} />
        ))}
      </div>

      <button className="card learn-screen__full-table" onClick={() => setScreen('fullTable')}>
        <div>
          <div style={{ fontWeight: 800 }}>Вся таблица</div>
          <p>Справочник 2–10 для поиска и проверки примеров</p>
        </div>
        <Icon name="chevronRight" size={20} />
      </button>
    </div>
  )
}
