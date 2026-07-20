import { emptyExampleProgress } from '../engine/exampleProgress'
import { applyAnswer } from '../engine/exampleProgress'
import { ExampleKey, Progress, SessionRecord, Settings, exampleKey } from './types'

const STORAGE_KEY = 'umno:progress:v2'
const MAX_SESSIONS = 20

function defaultSettings(): Settings {
  return {
    childName: '',
    soundEnabled: true,
    reducedMotion: false,
    order: 'custom',
    defaultQuestionCount: 10,
  }
}

export function createDefaultProgress(): Progress {
  return {
    version: 2,
    examples: {},
    settings: defaultSettings(),
    streakDays: 0,
    lastActiveDate: null,
    sessions: [],
  }
}

export function loadProgress(): Progress {
  const fallback = createDefaultProgress()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.version !== 2 || typeof parsed !== 'object') return fallback
    return {
      version: 2,
      examples: typeof parsed.examples === 'object' && parsed.examples ? parsed.examples : {},
      settings: { ...fallback.settings, ...(parsed.settings ?? {}) },
      streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 0,
      lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : null,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    }
  } catch {
    return fallback
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // localStorage unavailable (private mode / quota) — silently skip persistence
  }
}

export function resetProgress(): Progress {
  const fresh = createDefaultProgress()
  saveProgress(fresh)
  return fresh
}

export function updateSettings(progress: Progress, patch: Partial<Settings>): Progress {
  return { ...progress, settings: { ...progress.settings, ...patch } }
}

type AnswerInput = { correct: boolean; hintUsed: boolean; supported: boolean }

export function recordExampleAnswer(progress: Progress, a: number, b: number, input: AnswerInput): Progress {
  const key: ExampleKey = exampleKey(a, b)
  const prev = progress.examples[key] ?? emptyExampleProgress()
  const next = applyAnswer(prev, input)
  return { ...progress, examples: { ...progress.examples, [key]: next } }
}

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10)
}

function isYesterday(dateOnly: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return dateOnly === yesterday.toISOString().slice(0, 10)
}

export function recordSession(progress: Progress, session: Omit<SessionRecord, 'date'>): Progress {
  const today = todayDateOnly()
  let streakDays = progress.streakDays
  if (progress.lastActiveDate === today) {
    // already counted today
  } else if (progress.lastActiveDate && isYesterday(progress.lastActiveDate)) {
    streakDays += 1
  } else {
    streakDays = 1
  }

  const sessions = [{ ...session, date: today }, ...progress.sessions].slice(0, MAX_SESSIONS)

  return { ...progress, streakDays, lastActiveDate: today, sessions }
}
