import { describe, expect, it } from 'vitest'
import { DiaryEntry } from '../types'
import { missingGuestEntries } from './firestoreRepository'

const entry = (date: string, note: string): DiaryEntry => ({
  date,
  emotion: 'happy',
  note,
  createdAt: '2026-10-07T00:00:00.000Z',
  updatedAt: '2026-10-07T00:00:00.000Z',
})

describe('guest entry migration', () => {
  it('only returns dates that are absent from the account', () => {
    const cloud = [entry('2026-10-06', '계정 기록')]
    const guest = [entry('2026-10-06', '비회원 기록'), entry('2026-10-07', '새 기록')]
    expect(missingGuestEntries(cloud, guest)).toEqual([guest[1]])
  })
})
