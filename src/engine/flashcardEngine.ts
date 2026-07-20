import { allDifficultExamples, tableFactStates } from './exampleProgress'
import { practicedTables } from './practicePlanner'
import { shuffle } from './answers'
import { Fact, FlashcardSelection, Progress, TableNumber } from '../state/types'

export function factsForScope(selection: FlashcardSelection, progress: Progress): Fact[] {
  if (selection.scope === 'difficult') {
    return allDifficultExamples(progress).map((f) => ({ a: f.a, b: f.b }))
  }
  const tables: TableNumber[] = selection.scope === 'learned' ? practicedTables(progress) : selection.tables
  const facts: Fact[] = []
  for (const a of tables) {
    tableFactStates(progress, a).forEach((_, i) => facts.push({ a, b: i + 1 }))
  }
  return facts
}

export function buildDeck(selection: FlashcardSelection, progress: Progress): Fact[] {
  let facts = factsForScope(selection, progress)
  if (selection.order === 'shuffled') facts = shuffle(facts)
  if (selection.count !== 'all') facts = facts.slice(0, selection.count)
  return facts
}
