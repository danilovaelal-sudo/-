import { useCallback } from 'react'
import { useApp } from '../state/AppContext'
import * as sound from './soundManager'

export function useSound() {
  const { progress } = useApp()
  const enabled = progress.settings.soundEnabled

  const tap = useCallback(() => enabled && sound.playTap(), [enabled])
  const correct = useCallback(() => enabled && sound.playCorrect(), [enabled])
  const hint = useCallback(() => enabled && sound.playHint(), [enabled])
  const lessonComplete = useCallback(() => enabled && sound.playLessonComplete(), [enabled])
  const speak = useCallback((text: string) => enabled && sound.speak(text), [enabled])

  return { tap, correct, hint, lessonComplete, speak, enabled, speechSupported: sound.isSpeechSupported() }
}
