export function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Plausible near-miss distractors: neighbouring multiples of a or b, and
 * off-by-one-factor products. Always positive, always distinct from the answer.
 */
export function generateDistractors(a: number, b: number, count = 3): number[] {
  const answer = a * b
  const candidates = new Set<number>()
  const add = (value: number) => {
    if (value > 0 && value !== answer) candidates.add(value)
  }

  add((a - 1) * b)
  add((a + 1) * b)
  add(a * (b - 1))
  add(a * (b + 1))
  add(answer - a)
  add(answer + a)
  add(answer - b)
  add(answer + b)
  add(answer - 1)
  add(answer + 1)

  let pool = shuffle(Array.from(candidates))
  let fillerStep = Math.max(a, b, 2)
  while (pool.length < count) {
    fillerStep += 1
    add(answer + fillerStep)
    pool = shuffle(Array.from(candidates))
  }

  return pool.slice(0, count)
}

export function generateChoiceOptions(a: number, b: number): number[] {
  const answer = a * b
  return shuffle([answer, ...generateDistractors(a, b, 3)])
}
