/** The "Готово" button in the groups exercise only unlocks on an exact match. */
export function isGroupsComplete(rows: number, target: number): boolean {
  return rows === target
}

export function isGroupsOverflowing(rows: number, target: number): boolean {
  return rows > target
}
