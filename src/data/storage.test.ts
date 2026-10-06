import { beforeEach, describe, expect, it } from 'vitest'
import { createBackup, loadEntries, mergeBackup, parseBackup, persistEntries, STORAGE_KEY, upsertEntry } from './storage'
import { DiaryEntry } from '../types'

const first: DiaryEntry = {
  date: '2026-10-01', emotion: 'happy', note: '좋은 일이 있었다.',
  createdAt: '2026-10-01T10:00:00.000Z', updatedAt: '2026-10-01T10:00:00.000Z',
}

describe('diary storage', () => {
  beforeEach(() => localStorage.clear())

  it('saves and loads entries', () => {
    persistEntries([first])
    expect(loadEntries()).toEqual([first])
  })

  it('preserves createdAt when updating a day', () => {
    const updated = upsertEntry([first], { date: first.date, emotion: 'neutral', note: '평범한 하루' }, new Date('2026-10-02T10:00:00.000Z'))
    expect(updated[0].createdAt).toBe(first.createdAt)
    expect(updated[0].updatedAt).toBe('2026-10-02T10:00:00.000Z')
  })

  it('rejects damaged stored data', () => {
    localStorage.setItem(STORAGE_KEY, '[{"bad":true}]')
    expect(() => loadEntries()).toThrow('올바르지 않습니다')
  })

  it('rejects invalid backup without changing current storage', () => {
    persistEntries([first])
    expect(() => parseBackup('{"version":2}')).toThrow()
    expect(loadEntries()).toEqual([first])
  })

  it('merges backup and gives imported entry priority for duplicate dates', () => {
    const imported = { ...first, emotion: 'angry' as const, note: '화나는 일이 있었다.' }
    const result = mergeBackup([first], createBackup([imported]))
    expect(result).toHaveLength(1)
    expect(result[0].emotion).toBe('angry')
  })
})

