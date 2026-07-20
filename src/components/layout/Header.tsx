import { Logo } from '../brand/Logo'
import { IconButton } from '../shared/IconButton'
import { Icon } from '../icons/Icon'
import { useApp } from '../../state/AppContext'
import './Header.css'

export function Header() {
  const { progress, updateSettings, setScreen } = useApp()

  return (
    <header className="app-header">
      <Logo />
      <div className="app-header__actions">
        {progress.streakDays > 0 && (
          <span className="app-header__streak">
            <Icon name="flame" size={16} />
            {progress.streakDays}
          </span>
        )}
        <IconButton
          icon={progress.settings.soundEnabled ? 'soundOn' : 'soundOff'}
          label={progress.settings.soundEnabled ? 'Выключить звук' : 'Включить звук'}
          active={progress.settings.soundEnabled}
          onClick={() => updateSettings({ soundEnabled: !progress.settings.soundEnabled })}
        />
        <IconButton icon="settings" label="Настройки" onClick={() => setScreen('settings')} />
      </div>
    </header>
  )
}
