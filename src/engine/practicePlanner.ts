import { tableModuleStatus, tableFactStates, allDifficultExamples, orderForSettings } from './exampleProgress'
import { ExampleState, Fact, Progress, TableNumber } from '../state/types'

export type PracticeMode = 'hard' | 'mixed' | 'free'

const STATE_WEIGHT: Record<ExampleState, number> = {
  review: 5,
  new: 4,
  learning: 3,
  familiar: 2,
  confident: 1,
}

function pickWeighted<T>(pool: T[], weightOf: (item: T) => number): T {
  const weights = pool.map(weightOf)
  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

function shuffleWeighted(pool: (Fact & { state: ExampleState })[]): (Fact & { state: ExampleState })[] {
  const remaining = [...pool]
  const result: (Fact & { state: ExampleState })[] = []
  while (remaining.length > 0) {
    const pick = pickWeighted(remaining, (f) => STATE_WEIGHT[f.state])
    result.push(pick)
    remaining.splice(remaining.indexOf(pick), 1)
  }
  return result
}

function cycledSample(pool: (Fact & { state: ExampleState })[], count: number): Fact[] {
  if (pool.length === 0) return []
  const result: Fact[] = []
  let remaining = shuffleWeighted(pool)
  while (result.length < count) {
    if (remaining.length === 0) remaining = shuffleWeighted(pool)
    const next = remaining.shift()
    if (next) result.push({ a: next.a, b: next.b })
  }
  return result
}

export function unlockedTables(progress: Progress): TableNumber[] {
  return orderForSettings(progress.settings.order).filter((t) => tableModuleStatus(progress, t) !== 'locked')
}

export function practicedTables(progress: Progress): TableNumber[] {
  return unlockedTables(progress).filter((t) => tableModuleStatus(progress, t) !== 'available')
}

function factsForTables(progress: Progress, tables: TableNumber[]): (Fact & { state: ExampleState })[] {
  const facts: (Fact & { state: ExampleState })[] = []
  for (const a of tables) {
    tableFactStates(progress, a).forEach((f, i) => facts.push({ a, b: i + 1, state: f.state }))
  }
  return facts
}

export function buildPracticeSet(
  mode: PracticeMode,
  count: number,
  progress: Progress,
  selectedTables?: TableNumber[],
): Fact[] {
  if (mode === 'hard') {
    const hard = allDifficultExamples(progress).map((f) => ({ a: f.a, b: f.b, state: 'review' as ExampleState }))
    if (hard.length >= count) return cycledSample(hard, count)
    const fallbackPool = factsForTables(progress, practicedTables(progress)).filter(
      (f) => f.state !== 'confident' && !hard.some((h) => h.a === f.a && h.b === f.b),
    )
    return cycledSample([...hard, ...fallbackPool], count)
  }

  if (mode === 'free') {
    const tables = selectedTables && selectedTables.length > 0 ? selectedTables : practicedTables(progress)
    return cycledSample(factsForTables(progress, tables), count)
  }

  // mixed
  const tables = practicedTables(progress)
  return cycledSample(factsForTables(progress, tables), count)
}
