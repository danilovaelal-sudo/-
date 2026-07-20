import { useState } from 'react'
import { APP_NAME, ASSISTANT_NAME } from '../../config/appConfig'
import { useApp } from '../../state/AppContext'
import { LearningOrder } from '../../state/types'
import { Button } from '../shared/Button'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { ScreenHeader } from '../layout/ScreenHeader'
import './SettingsScreen.css'

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button className="toggle" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} />
}

export function SettingsScreen() {
  const { progress, updateSettings, resetProgress, setScreen } = useApp()
  const [confirmingReset, setConfirmingReset] = useState(false)
  const settings = progress.settings

  return (
    <div className="screen settings-screen">
      <ScreenHeader title="Настройки" onBack={() => setScreen('today')} />

      <div className="settings-group">
        <div className="settings-group__title">Профиль</div>
        <div className="settings-row" style={{ display: 'block' }}>
          <label htmlFor="child-name" style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>
            Имя ребёнка
          </label>
          <input
            id="child-name"
            className="settings-input"
            value={settings.childName}
            maxLength={24}
            placeholder="Необязательно"
            onChange={(e) => updateSettings({ childName: e.target.value })}
          />
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group__title">Звук и движение</div>
        <div className="settings-row">
          <span>Звук</span>
          <Toggle checked={settings.soundEnabled} onChange={() => updateSettings({ soundEnabled: !settings.soundEnabled })} label="Звук" />
        </div>
        <div className="settings-row">
          <span>Меньше анимации</span>
          <Toggle
            checked={settings.reducedMotion}
            onChange={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
            label="Уменьшение анимации"
          />
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group__title">Порядок изучения</div>
        <div className="settings-choice-row" role="radiogroup" aria-label="Порядок изучения таблиц">
          {(['custom', 'school'] as LearningOrder[]).map((order) => (
            <button
              key={order}
              className={`settings-choice ${settings.order === order ? 'settings-choice--selected' : ''}`}
              role="radio"
              aria-checked={settings.order === order}
              onClick={() => updateSettings({ order })}
            >
              {order === 'custom' ? 'От простого (2, 5, 10…)' : 'Школьный порядок'}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group__title">Тренировка по умолчанию</div>
        <div className="settings-choice-row" role="radiogroup" aria-label="Количество заданий по умолчанию">
          {[5, 10, 15].map((n) => (
            <button
              key={n}
              className={`settings-choice ${settings.defaultQuestionCount === n ? 'settings-choice--selected' : ''}`}
              role="radio"
              aria-checked={settings.defaultQuestionCount === n}
              onClick={() => updateSettings({ defaultQuestionCount: n as 5 | 10 | 15 })}
            >
              {n} заданий
            </button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group__title">Данные</div>
        <Button variant="outline" onClick={() => setConfirmingReset(true)}>
          Сбросить весь прогресс
        </Button>
      </div>

      <div className="settings-group">
        <div className="settings-group__title">О приложении</div>
        <p className="settings-about">
          {APP_NAME} — приложение для изучения таблицы умножения. Цифровой помощник {ASSISTANT_NAME} подсказывает,
          когда это нужно. Весь прогресс хранится только в этом браузере.
        </p>
      </div>

      {confirmingReset && (
        <ConfirmDialog
          title="Сбросить прогресс?"
          message="Все результаты и открытые таблицы будут удалены без возможности восстановить. Это действие нельзя отменить."
          confirmLabel="Сбросить"
          onConfirm={() => {
            resetProgress()
            setConfirmingReset(false)
          }}
          onCancel={() => setConfirmingReset(false)}
        />
      )}
    </div>
  )
}
