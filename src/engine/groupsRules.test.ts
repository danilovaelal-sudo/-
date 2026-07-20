import { describe, expect, it } from 'vitest'
import { isGroupsComplete, isGroupsOverflowing } from './groupsRules'

describe('isGroupsComplete', () => {
  it('is false below the target', () => {
    expect(isGroupsComplete(1, 2)).toBe(false)
  })
  it('is true only on an exact match', () => {
    expect(isGroupsComplete(2, 2)).toBe(true)
  })
  it('is false when overshooting the target', () => {
    expect(isGroupsComplete(3, 2)).toBe(false)
  })
})

describe('isGroupsOverflowing', () => {
  it('is false at or below the target', () => {
    expect(isGroupsOverflowing(0, 2)).toBe(false)
    expect(isGroupsOverflowing(2, 2)).toBe(false)
  })
  it('is true once past the target', () => {
    expect(isGroupsOverflowing(3, 2)).toBe(true)
  })
})
