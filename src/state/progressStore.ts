import { applyAnswer, applyFlashcardAssessment, emptyExampleProgress } from '../engine/exampleProgress'
import {
  ExampleKey,
  ExampleProgress,
  FlashcardSessionRecord,
  IntroKey,
  PendingFlashcards,
  PendingLesson,
  Progress,
  SessionRecord,
  Settings,
  exampleKey,
} from './types'

const STORAGE_KEY = 'umno:progress:v3'
const LEGACY_STORAGE_KEY = 'umno:progress:v2'
const MAX_SESSIONS = 20
const MAX_FLASHCARD_SESSIONS = 20

function defaultSettings(): Settings {
  return {
    childName: '',
    soundEnabled: true,
    reducedMotion: false,
    order: 'custom',
    defaultQuestionCount: 10,
    seenIntros: {},
  }
}

export function createDefaultProgress(): Progress {
  return {
    version: 3,
    examples: {},
    settings: defaultSettings(),
    streakDays: 0,
    lastActiveDate: null,
    sessions: [],
    flashcardSessions: [],
    pendingLesson: null,
    pendingFlashcards: null,
  }
}

function migrateExample(raw: Partial<ExampleProgress> | undefined): ExampleProgress {
  const base = emptyExampleProgress()
  if (!raw || typeof raw !== 'object') return base
  return {
    ...base,
    ...raw,
    flashcardViews: typeof raw.flashcardViews === 'number' ? raw.flashcardViews : 0,
    selfKnownCount: typeof raw.selfKnownCount === 'number' ? raw.selfKnownCount : 0,
    selfReviewCount: typeof raw.selfReviewCount === 'number' ? raw.selfReviewCount : 0,
    lastFlashcardAt: typeof raw.lastFlashcardAt === 'string' ? raw.lastFlashcardAt : null,
  }
}

/** Reads a v2 (or older) save, filling every field this version needs with a safe default. */
function migrateFromLegacy(parsed: Record<string, unknown>): Progress {
  const fallback = createDefaultProgress()
  const rawExamples = (parsed.examples ?? {}) as Record<string, Partial<ExampleProgress>>
  const examples: Progress['examples'] = {}
  for (const [key, value] of Object.entries(rawExamples)) {
    examples[key as ExampleKey] = migrateExample(value)
  }
  const rawSettings = (parsed.settings ?? {}) as Partial<Settings>
  return {
    ...fallback,
    examples,
    settings: { ...fallback.settings, ...rawSettings, seenIntros: rawSettings.seenIntros ?? {} },
    streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 0,
    lastActiveDate: typeof parsed.lastActiveDate === 'string' ? (parsed.lastActiveDate as string) : null,
    sessions: Array.isArray(parsed.sessions) ? (parsed.sessions as SessionRecord[]) : [],
  }
}

export function loadProgress(): Progress {
  const fallback = createDefaultProgress()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && parsed.version === 3) {
        return {
          version: 3,
          examples: typeof parsed.examples === 'object' && parsed.examples ? parsed.examples : {},
          settings: { ...fallback.settings, ...(parsed.settings ?? {}), seenIntros: parsed.settings?.seenIntros ?? {} },
          streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 0,
          lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : null,
          sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
          flashcardSessions: Array.isArray(parsed.flashcardSessions) ? parsed.flashcardSessions : [],
          pendingLesson: parsed.pendingLesson ?? null,
          pendingFlashcards: parsed.pendingFlashcards ?? null,
        }
      }
    }

    // No v3 save yet — try to migrate an existing v2 save so progress isn't lost.
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw)
      if (legacyParsed && typeof legacyParsed === 'object') {
        const migrated = migrateFromLegacy(legacyParsed)
        saveProgress(migrated)
        return migrated
      }
    }

    return fallback
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

export function markIntroSeen(progress: Progress, key: IntroKey): Progress {
  if (progress.settings.seenIntros[key]) return progress
  return { ...progress, settings: { ...progress.settings, seenIntros: { ...progress.settings.seenIntros, [key]: true } } }
}

export function resetIntro(progress: Progress, key: IntroKey): Progress {
  const seenIntros = { ...progress.settings.seenIntros }
  delete seenIntros[key]
  return { ...progress, settings: { ...progress.settings, seenIntros } }
}

type AnswerInput = { correct: boolean; hintUsed: boolean; supported: boolean }

export function recordExampleAnswer(progress: Progress, a: number, b: number, input: AnswerInput): Progress {
  const key: ExampleKey = exampleKey(a, b)
  const prev = progress.examples[key] ?? emptyExampleProgress()
  const next = applyAnswer(prev, input)
  return { ...progress, examples: { ...progress.examples, [key]: next } }
}

export function recordFlashcardAssessment(progress: Progress, a: number, b: number, known: boolean): Progress {
  const key: ExampleKey = exampleKey(a, b)
  const prev = progress.examples[key] ?? emptyExampleProgress()
  const next = applyFlashcardAssessment(prev, known)
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

function bumpStreak(progress: Progress): { streakDays: number; lastActiveDate: string } {
  const today = todayDateOnly()
  let streakDays = progress.streakDays
  if (progress.lastActiveDate === today) {
    // already counted today
  } else if (progress.lastActiveDate && isYesterday(progress.lastActiveDate)) {
    streakDays += 1
  } else {
    streakDays = 1
  }
  return { streakDays, lastActiveDate: today }
}

export function recordSession(progress: Progress, session: Omit<SessionRecord, 'date'>): Progress {
  const { streakDays, lastActiveDate } = bumpStreak(progress)
  const sessions = [{ ...session, date: lastActiveDate }, ...progress.sessions].slice(0, MAX_SESSIONS)
  return { ...progress, streakDays, lastActiveDate, sessions }
}

export function recordFlashcardSession(progress: Progress, record: Omit<FlashcardSessionRecord, 'date'>): Progress {
  const { streakDays, lastActiveDate } = bumpStreak(progress)
  const flashcardSessions = [{ ...record, date: lastActiveDate }, ...progress.flashcardSessions].slice(0, MAX_FLASHCARD_SESSIONS)
  return { ...progress, streakDays, lastActiveDate, flashcardSessions }
}

export function savePendingLesson(progress: Progress, pendingLesson: PendingLesson): Progress {
  return { ...progress, pendingLesson }
}

export function clearPendingLesson(progress: Progress): Progress {
  if (!progress.pendingLesson) return progress
  return { ...progress, pendingLesson: null }
}

export function savePendingFlashcards(progress: Progress, pendingFlashcards: PendingFlashcards): Progress {
  return { ...progress, pendingFlashcards }
}

export function clearPendingFlashcards(progress: Progress): Progress {
  if (!progress.pendingFlashcards) return progress
  return { ...progress, pendingFlashcards: null }
}
