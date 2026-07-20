let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    audioCtx = new Ctor()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => undefined)
  }
  return audioCtx
}

type Tone = { freq: number; start: number; duration: number; type?: OscillatorType; gain?: number }

function playTones(tones: Tone[]) {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  for (const tone of tones) {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = tone.type ?? 'sine'
    osc.frequency.value = tone.freq
    const peak = tone.gain ?? 0.16
    const startAt = now + tone.start
    const endAt = startAt + tone.duration
    gainNode.gain.setValueAtTime(0, startAt)
    gainNode.gain.linearRampToValueAtTime(peak, startAt + 0.015)
    gainNode.gain.exponentialRampToValueAtTime(0.001, endAt)
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.start(startAt)
    osc.stop(endAt + 0.02)
  }
}

/** Short, quiet click for taps. */
export function playTap(): void {
  playTones([{ freq: 480, start: 0, duration: 0.06, type: 'sine', gain: 0.1 }])
}

/** Soft chime for a correct answer — no fanfare. */
export function playCorrect(): void {
  playTones([
    { freq: 587, start: 0, duration: 0.1, type: 'sine', gain: 0.14 },
    { freq: 784, start: 0.08, duration: 0.16, type: 'sine', gain: 0.14 },
  ])
}

/** Calm two-note prompt when a hint appears — not a failure sound. */
export function playHint(): void {
  playTones([
    { freq: 440, start: 0, duration: 0.14, type: 'sine', gain: 0.1 },
    { freq: 392, start: 0.12, duration: 0.16, type: 'sine', gain: 0.1 },
  ])
}

/** More noticeable, still gentle, resolution at the end of a lesson. */
export function playLessonComplete(): void {
  playTones([
    { freq: 523, start: 0, duration: 0.12, type: 'sine', gain: 0.15 },
    { freq: 659, start: 0.1, duration: 0.12, type: 'sine', gain: 0.15 },
    { freq: 784, start: 0.2, duration: 0.12, type: 'sine', gain: 0.15 },
    { freq: 1047, start: 0.32, duration: 0.28, type: 'sine', gain: 0.16 },
  ])
}

function pickRussianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  return voices.find((v) => v.lang?.toLowerCase().startsWith('ru')) ?? null
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** Speaks a phrase if the browser supports speech synthesis and a Russian voice is available; no-ops otherwise. */
export function speak(text: string): void {
  if (!isSpeechSupported()) return
  try {
    const voice = pickRussianVoice()
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ru-RU'
    utterance.rate = 0.95
    if (voice) utterance.voice = voice
    window.speechSynthesis.speak(utterance)
  } catch {
    // speech synthesis can throw in some embedded browsers — fail silently
  }
}

export function stopSpeech(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // ignore
    }
  }
}
