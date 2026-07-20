import { NumberStats, QuizQuestion, TABLE_MAX, TABLE_MIN } from '../state/types'

function pickWeighted(numbers: number[], weightOf: (n: number) => number): number {
  const weights = numbers.map(weightOf)
  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = Math.random() * total
  for (let i = 0; i < numbers.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return numbers[i]
  }
  return numbers[numbers.length - 1]
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildOptions(answer: number): number[] {
  const options = new Set<number>([answer])
  const candidateDeltas = [-20, -10, -2, -1, 1, 2, 10, 20]
  const shuffledDeltas = shuffle(candidateDeltas)
  for (const delta of shuffledDeltas) {
    if (options.size >= 4) break
    const candidate = answer + delta
    if (candidate > 0 && !options.has(candidate)) options.add(candidate)
  }
  while (options.size < 4) {
    const candidate = answer + Math.floor(Math.random() * 15) + 1
    options.add(candidate)
  }
  return shuffle(Array.from(options))
}

export function generateQuestion(
  range: number[],
  statsByNumber: Record<number, NumberStats>,
): QuizQuestion {
  const numbers = range.length > 0 ? range : Array.from({ length: TABLE_MAX - TABLE_MIN + 1 }, (_, i) => TABLE_MIN + i)
  const weightOf = (n: number) => 4 - (statsByNumber[n]?.masteryStars ?? 0)
  const a = pickWeighted(numbers, weightOf)
  const b = Math.floor(Math.random() * (TABLE_MAX - TABLE_MIN + 1)) + TABLE_MIN
  const answer = a * b
  return { a, b, answer, options: buildOptions(answer) }
}
