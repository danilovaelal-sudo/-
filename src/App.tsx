import { Header } from './components/layout/Header'
import { NavBar } from './components/layout/NavBar'
import { BadgeToast } from './components/shared/BadgeToast'
import { HomeScreen } from './components/home/HomeScreen'
import { TableScreen } from './components/table/TableScreen'
import { QuizScreen } from './components/quiz/QuizScreen'
import { ProgressScreen } from './components/progress/ProgressScreen'
import { useApp } from './state/AppContext'

export function App() {
  const { screen } = useApp()

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        {screen === 'home' && <HomeScreen />}
        {screen === 'table' && <TableScreen />}
        {screen === 'quiz' && <QuizScreen />}
        {screen === 'progress' && <ProgressScreen />}
      </main>
      <NavBar />
      <BadgeToast />
    </div>
  )
}
