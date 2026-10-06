import { describe, expect, it } from 'vitest'
import { isValidDateKey, startDateKeyForRange, toLocalDateKey } from './date'

describe('local date utilities', () => {
  it('uses local date components', () => {
    expect(toLocalDateKey(new Date(2026, 9, 5, 23, 59))).toBe('2026-10-05')
  })

  it('calculates inclusive range start', () => {
    expect(startDateKeyForRange(7, new Date(2026, 9, 5))).toBe('2026-09-29')
    expect(startDateKeyForRange(30, new Date(2026, 9, 5))).toBe('2026-09-06')
  })

  it('validates real calendar dates', () => {
    expect(isValidDateKey('2026-02-28')).toBe(true)
    expect(isValidDateKey('2026-02-31')).toBe(false)
  })
})

