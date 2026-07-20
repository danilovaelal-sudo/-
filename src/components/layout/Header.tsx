import { useApp } from '../../state/AppContext'
import './Header.css'

export function Header() {
  const { progress, toggleSound } = useApp()

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span role="img" aria-hidden="true">✖️</span>
        <span>Таблица умножения</span>
      </div>
      <div className="app-header__actions">
        <div className="app-header__stars" aria-label={`Собрано звёзд: ${progress.totalStars}`}>
          <span role="img" aria-hidden="true">⭐</span>
          <span>{progress.totalStars}</span>
        </div>
        <button
          className="app-header__sound-btn"
          onClick={toggleSound}
          aria-label={progress.soundEnabled ? 'Выключить звук' : 'Включить звук'}
          aria-pressed={progress.soundEnabled}
        >
          {progress.soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>
    </header>
  )
}
