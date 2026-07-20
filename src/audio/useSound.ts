import { useCallback } from 'react'
import { useApp } from '../state/AppContext'
import * as sound from './soundManager'

export function useSound() {
  const { progress } = useApp()
  const enabled = progress.soundEnabled

  const click = useCallback(() => enabled && sound.playClick(), [enabled])
  const correct = useCallback(() => enabled && sound.playCorrect(), [enabled])
  const wrong = useCallback(() => enabled && sound.playWrong(), [enabled])
  const badge = useCallback(() => enabled && sound.playBadge(), [enabled])
  const speak = useCallback((text: string) => enabled && sound.speak(text), [enabled])

  return { click, correct, wrong, badge, speak, enabled }
}
