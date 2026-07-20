import { useApp } from '../../state/AppContext'
import { Screen } from '../../state/types'
import './NavBar.css'

const ITEMS: { screen: Screen; label: string; icon: string }[] = [
  { screen: 'home', label: 'Главная', icon: '🏠' },
  { screen: 'table', label: 'Таблица', icon: '🔢' },
  { screen: 'quiz', label: 'Тренажёр', icon: '🎯' },
  { screen: 'progress', label: 'Прогресс', icon: '🏆' },
]

export function NavBar() {
  const { screen, setScreen } = useApp()

  return (
    <nav className="nav-bar">
      {ITEMS.map((item) => (
        <button
          key={item.screen}
          className={`nav-bar__item ${screen === item.screen ? 'nav-bar__item--active' : ''}`}
          onClick={() => setScreen(item.screen)}
          aria-current={screen === item.screen ? 'page' : undefined}
        >
          <span className="nav-bar__item-icon" role="img" aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
