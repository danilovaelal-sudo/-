import { Mascot } from '../shared/Mascot'
import { useApp } from '../../state/AppContext'
import { Screen } from '../../state/types'
import './HomeScreen.css'

const MODES: { screen: Screen; icon: string; title: string; desc: string }[] = [
  { screen: 'table', icon: '🔢', title: 'Таблица умножения', desc: 'Смотри и слушай примеры' },
  { screen: 'quiz', icon: '🎯', title: 'Тренажёр', desc: 'Отвечай на вопросы и получай звёзды' },
  { screen: 'progress', icon: '🏆', title: 'Мой прогресс', desc: 'Награды и успехи' },
]

export function HomeScreen() {
  const { setScreen, progress } = useApp()

  return (
    <div className="screen home-screen">
      <div className="home-screen__hero">
        <Mascot mood="excited" />
        <h1 className="home-screen__title">Привет! Учим таблицу умножения!</h1>
        <p className="home-screen__subtitle">Выбери, чем хочешь заняться сегодня</p>
      </div>

      <div className="home-screen__modes">
        {MODES.map((mode) => (
          <button key={mode.screen} className="card mode-card" onClick={() => setScreen(mode.screen)}>
            <span className="mode-card__icon" role="img" aria-hidden="true">{mode.icon}</span>
            <span className="mode-card__title">{mode.title}</span>
            <p>{mode.desc}</p>
          </button>
        ))}
      </div>

      {progress.currentStreak > 0 && (
        <div className="home-screen__streak">
          <p>🔥 Серия верных ответов: {progress.currentStreak}</p>
        </div>
      )}
    </div>
  )
}
