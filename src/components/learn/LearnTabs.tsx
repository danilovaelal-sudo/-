import { useApp } from '../../state/AppContext'
import { Screen } from '../../state/types'
import './LearnTabs.css'

const TABS: { screen: Screen; label: string }[] = [
  { screen: 'learn', label: 'Мой путь' },
  { screen: 'flashcardsSetup', label: 'Карточки' },
  { screen: 'fullTable', label: 'Вся таблица' },
]

export function LearnTabs() {
  const { screen, setScreen } = useApp()

  return (
    <div className="learn-tabs" role="tablist" aria-label="Раздел «Учиться»">
      {TABS.map((tab) => (
        <button
          key={tab.screen}
          className={`learn-tabs__tab ${screen === tab.screen ? 'learn-tabs__tab--active' : ''}`}
          role="tab"
          aria-selected={screen === tab.screen}
          onClick={() => setScreen(tab.screen)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
