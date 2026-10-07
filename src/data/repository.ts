import { DiaryEntry } from '../types'
import { deleteCloudEntry, importCloudEntries, loadCloudEntries, saveCloudEntry } from './firestoreRepository'
import { deleteEntry, loadEntries, persistEntries, upsertEntry } from './storage'

export interface EntryRepository {
  load(): Promise<DiaryEntry[]>
  save(entry: DiaryEntry, entries: DiaryEntry[]): Promise<void>
  delete(date: string, entries: DiaryEntry[]): Promise<void>
  import(entries: DiaryEntry[]): Promise<void>
}

export const guestEntryRepository: EntryRepository = {
  async load() {
    return loadEntries()
  },
  async save(_entry, entries) {
    persistEntries(entries)
  },
  async delete(_date, entries) {
    persistEntries(entries)
  },
  async import(entries) {
    persistEntries(entries)
  },
}

export function createFirestoreEntryRepository(uid: string): EntryRepository {
  return {
    load: () => loadCloudEntries(uid),
    save: (entry) => saveCloudEntry(uid, entry),
    delete: (date) => deleteCloudEntry(uid, date),
    import: (entries) => importCloudEntries(uid, entries),
  }
}

export function buildSavedEntries(
  entries: DiaryEntry[],
  input: Pick<DiaryEntry, 'date' | 'emotion' | 'note'>,
): { entry: DiaryEntry; entries: DiaryEntry[] } {
  const next = upsertEntry(entries, input)
  return { entry: next.find((item) => item.date === input.date)!, entries: next }
}

export function buildDeletedEntries(entries: DiaryEntry[], date: string): DiaryEntry[] {
  return deleteEntry(entries, date)
}
