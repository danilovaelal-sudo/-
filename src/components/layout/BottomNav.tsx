import { Icon, IconName } from '../icons/Icon'
import { useApp } from '../../state/AppContext'
import { Screen } from '../../state/types'
import './BottomNav.css'

const ITEMS: { screen: Screen; label: string; icon: IconName }[] = [
  { screen: 'today', label: 'Сегодня', icon: 'today' },
  { screen: 'learn', label: 'Учиться', icon: 'learn' },
  { screen: 'practice', label: 'Тренироваться', icon: 'practice' },
  { screen: 'progress', label: 'Прогресс', icon: 'progress' },
]

export function BottomNav() {
  const { screen, setScreen } = useApp()

  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      {ITEMS.map((item) => (
        <button
          key={item.screen}
          className={`bottom-nav__item ${screen === item.screen ? 'bottom-nav__item--active' : ''}`}
          onClick={() => setScreen(item.screen)}
          aria-current={screen === item.screen ? 'page' : undefined}
        >
          <Icon name={item.icon} size={22} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
