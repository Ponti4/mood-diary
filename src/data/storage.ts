import { DiaryBackup, DiaryEntry, EMOTIONS } from '../types'
import { isValidDateKey } from '../utils/date'

export const STORAGE_KEY = 'maeum-diary.entries.v1'

function isValidIsoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

export function isDiaryEntry(value: unknown): value is DiaryEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.date === 'string' &&
    isValidDateKey(entry.date) &&
    typeof entry.emotion === 'string' &&
    EMOTIONS.includes(entry.emotion as DiaryEntry['emotion']) &&
    typeof entry.note === 'string' &&
    entry.note.trim().length >= 1 &&
    entry.note.length <= 100 &&
    isValidIsoDate(entry.createdAt) &&
    isValidIsoDate(entry.updatedAt)
  )
}

function normalize(entries: DiaryEntry[]): DiaryEntry[] {
  const byDate = new Map<string, DiaryEntry>()
  entries.forEach((entry) => byDate.set(entry.date, entry))
  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date))
}

export function loadEntries(storage: Storage = localStorage): DiaryEntry[] {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return []
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed) || !parsed.every(isDiaryEntry)) {
    throw new Error('저장된 기록의 형식이 올바르지 않습니다.')
  }
  return normalize(parsed)
}

export function persistEntries(entries: DiaryEntry[], storage: Storage = localStorage): DiaryEntry[] {
  const normalized = normalize(entries)
  storage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function upsertEntry(
  entries: DiaryEntry[],
  input: Pick<DiaryEntry, 'date' | 'emotion' | 'note'>,
  now = new Date(),
): DiaryEntry[] {
  const existing = entries.find((entry) => entry.date === input.date)
  const timestamp = now.toISOString()
  const next: DiaryEntry = {
    ...input,
    note: input.note.trim(),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  }
  return normalize([...entries.filter((entry) => entry.date !== input.date), next])
}

export function deleteEntry(entries: DiaryEntry[], date: string): DiaryEntry[] {
  return entries.filter((entry) => entry.date !== date)
}

export function createBackup(entries: DiaryEntry[], now = new Date()): DiaryBackup {
  return { version: 1, exportedAt: now.toISOString(), entries: normalize(entries) }
}

export function parseBackup(raw: string): DiaryBackup {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('JSON 형식의 백업 파일이 아닙니다.')
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('백업 파일의 형식이 올바르지 않습니다.')
  const backup = parsed as Record<string, unknown>
  if (
    backup.version !== 1 ||
    !isValidIsoDate(backup.exportedAt) ||
    !Array.isArray(backup.entries) ||
    !backup.entries.every(isDiaryEntry)
  ) {
    throw new Error('지원하지 않거나 손상된 백업 파일입니다.')
  }
  return backup as unknown as DiaryBackup
}

export function mergeBackup(current: DiaryEntry[], backup: DiaryBackup): DiaryEntry[] {
  const importedDates = new Set(backup.entries.map((entry) => entry.date))
  return normalize([...current.filter((entry) => !importedDates.has(entry.date)), ...backup.entries])
}
