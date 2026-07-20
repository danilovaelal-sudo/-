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
    const peak = tone.gain ?? 0.2
    const startAt = now + tone.start
    const endAt = startAt + tone.duration
    gainNode.gain.setValueAtTime(0, startAt)
    gainNode.gain.linearRampToValueAtTime(peak, startAt + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, endAt)
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.start(startAt)
    osc.stop(endAt + 0.02)
  }
}

export function playClick(): void {
  playTones([{ freq: 520, start: 0, duration: 0.08, type: 'triangle', gain: 0.15 }])
}

export function playCorrect(): void {
  playTones([
    { freq: 523.25, start: 0, duration: 0.12, type: 'sine' },
    { freq: 659.25, start: 0.1, duration: 0.12, type: 'sine' },
    { freq: 783.99, start: 0.2, duration: 0.2, type: 'sine' },
  ])
}

export function playWrong(): void {
  playTones([
    { freq: 220, start: 0, duration: 0.18, type: 'sawtooth', gain: 0.15 },
    { freq: 180, start: 0.15, duration: 0.22, type: 'sawtooth', gain: 0.15 },
  ])
}

export function playBadge(): void {
  playTones([
    { freq: 523.25, start: 0, duration: 0.12 },
    { freq: 659.25, start: 0.12, duration: 0.12 },
    { freq: 783.99, start: 0.24, duration: 0.12 },
    { freq: 1046.5, start: 0.36, duration: 0.3 },
  ])
}

export function speak(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ru-RU'
  utterance.rate = 0.95
  utterance.pitch = 1.1
  window.speechSynthesis.speak(utterance)
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}
