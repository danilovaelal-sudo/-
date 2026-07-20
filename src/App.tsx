import { AppShell } from './components/layout/AppShell'
import { TodayScreen } from './components/today/TodayScreen'
import { LearnScreen } from './components/learn/LearnScreen'
import { PracticeScreen } from './components/practice/PracticeScreen'
import { PracticeSessionScreen } from './components/practice/PracticeSessionScreen'
import { ProgressScreen } from './components/progress/ProgressScreen'
import { SettingsScreen } from './components/settings/SettingsScreen'
import { FullTableScreen } from './components/fulltable/FullTableScreen'
import { LessonScreen } from './components/lesson/LessonScreen'
import { FlashcardsSetup } from './components/flashcards/FlashcardsSetup'
import { FlashcardSession } from './components/flashcards/FlashcardSession'
import { useApp } from './state/AppContext'

export function App() {
  const { screen } = useApp()

  return (
    <AppShell>
      {screen === 'today' && <TodayScreen />}
      {screen === 'learn' && <LearnScreen />}
      {screen === 'practice' && <PracticeScreen />}
      {screen === 'practiceSession' && <PracticeSessionScreen />}
      {screen === 'progress' && <ProgressScreen />}
      {screen === 'settings' && <SettingsScreen />}
      {screen === 'fullTable' && <FullTableScreen />}
      {screen === 'lesson' && <LessonScreen />}
      {screen === 'flashcardsSetup' && <FlashcardsSetup />}
      {screen === 'flashcardsSession' && <FlashcardSession />}
    </AppShell>
  )
}
