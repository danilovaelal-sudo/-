import { ReactNode } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { useApp } from '../../state/AppContext'
import { Screen } from '../../state/types'

const MAIN_TABS: Screen[] = ['today', 'learn', 'practice', 'progress']

export function AppShell({ children }: { children: ReactNode }) {
  const { screen } = useApp()
  const isMainTab = MAIN_TABS.includes(screen)

  return (
    <div className="app-shell">
      {isMainTab && <Header />}
      <main className="app-main">{children}</main>
      {isMainTab && <BottomNav />}
    </div>
  )
}
