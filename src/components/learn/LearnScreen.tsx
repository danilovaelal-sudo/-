import { orderForSettings } from '../../engine/exampleProgress'
import { useApp } from '../../state/AppContext'
import { TableNumber } from '../../state/types'
import { LearnTabs } from './LearnTabs'
import { TableModuleCard } from './TableModuleCard'
import './LearnScreen.css'

export function LearnScreen() {
  const { progress, startLesson } = useApp()
  const order = orderForSettings(progress.settings.order)

  function handleSelect(table: TableNumber) {
    startLesson(table)
  }

  return (
    <div className="screen learn-screen">
      <div className="learn-screen__header">
        <h2>Учиться</h2>
      </div>

      <LearnTabs />

      <p className="learn-screen__hint">Мой путь: таблицы открываются по порядку — от простых к сложным.</p>

      <div className="learn-screen__list">
        {order.map((table) => (
          <TableModuleCard key={table} tableNumber={table} progress={progress} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  )
}
