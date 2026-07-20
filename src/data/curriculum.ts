import { TableNumber, TABLE_NUMBERS } from '../state/types'

export const FACTOR_RANGE = Array.from({ length: 10 }, (_, i) => i + 1)

/** How many confident facts (out of 10) are needed before the next table unlocks. */
export const MASTERY_UNLOCK_THRESHOLD = 7

export function factsForTable(tableNumber: TableNumber): { a: TableNumber; b: number }[] {
  return FACTOR_RANGE.map((b) => ({ a: tableNumber, b }))
}

export function isTableNumber(value: number): value is TableNumber {
  return (TABLE_NUMBERS as readonly number[]).includes(value)
}
