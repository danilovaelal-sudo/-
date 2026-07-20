import { tableFactStates } from './exampleProgress'
import { ExampleProgress, ExampleState, Fact, LessonStep, Progress, TableNumber } from '../state/types'

type FactWithState = Fact & { progress: ExampleProgress }

function factsByState(tableNumber: TableNumber, progress: Progress, state: ExampleState): FactWithState[] {
  return tableFactStates(progress, tableNumber)
    .map((p, i) => ({ a: tableNumber, b: i + 1, progress: p }))
    .filter((f) => f.progress.state === state)
}

function withoutUsed(pool: FactWithState[], used: Set<number>): FactWithState[] {
  return pool.filter((f) => !used.has(f.b))
}

/** Builds one short lesson (~6-8 steps) for a table, mixing new, familiar and review facts. */
export function buildLesson(tableNumber: TableNumber, progress: Progress): LessonStep[] {
  const newFacts = factsByState(tableNumber, progress, 'new')
  const learningFacts = factsByState(tableNumber, progress, 'learning')
  const familiarFacts = factsByState(tableNumber, progress, 'familiar')
  const reviewFacts = factsByState(tableNumber, progress, 'review')
  const confidentFacts = factsByState(tableNumber, progress, 'confident')

  const introPool = [...newFacts, ...learningFacts, ...familiarFacts, ...confidentFacts]
  const introFacts = introPool.slice(0, 3)
  const used = new Set(introFacts.map((f) => f.b))

  const reviewPool = withoutUsed([...reviewFacts, ...learningFacts, ...familiarFacts], used)
  const mixPool = withoutUsed([...familiarFacts, ...confidentFacts, ...newFacts, ...learningFacts], used)

  const fillBlankFact = mixPool[0] ?? introFacts[0]
  const inputFact = mixPool[1] ?? introFacts[1] ?? introFacts[0]
  const reviewFact = reviewPool[0] ?? mixPool[0] ?? introFacts[0]

  const steps: LessonStep[] = []

  if (introFacts[0]) {
    steps.push({ kind: 'explain', fact: introFacts[0] })
    steps.push({
      kind: 'question',
      id: 'intro-0',
      fact: introFacts[0],
      exercise: 'choice',
      support: 'full',
    })
  }
  if (introFacts[1]) {
    steps.push({
      kind: 'question',
      id: 'intro-1',
      fact: introFacts[1],
      exercise: 'choice',
      support: 'partial',
    })
  }
  if (introFacts[2]) {
    steps.push({
      kind: 'question',
      id: 'intro-2',
      fact: introFacts[2],
      exercise: 'groups',
      support: 'none',
    })
  }
  if (fillBlankFact) {
    steps.push({
      kind: 'question',
      id: 'fill-blank',
      fact: fillBlankFact,
      exercise: 'fillBlank',
      support: 'none',
    })
  }
  if (inputFact) {
    steps.push({
      kind: 'question',
      id: 'input',
      fact: inputFact,
      exercise: 'input',
      support: 'none',
    })
  }
  if (reviewFact) {
    const matchPairs = introFacts.length >= 2 ? introFacts.slice(0, 3) : [reviewFact, ...introFacts]
    steps.push({
      kind: 'question',
      id: 'match',
      fact: reviewFact,
      exercise: 'match',
      support: 'none',
      matchPairs: matchPairs.slice(0, 3),
    })
  }

  steps.push({ kind: 'summary' })
  return steps
}
