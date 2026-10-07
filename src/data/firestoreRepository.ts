import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { requireDb } from '../firebase/client'
import { DiaryEntry } from '../types'
import { isDiaryEntry } from './storage'

const MAX_BATCH_SIZE = 500

function entriesCollection(uid: string) {
  return collection(requireDb(), 'users', uid, 'entries')
}

function entryDocument(uid: string, date: string) {
  return doc(requireDb(), 'users', uid, 'entries', date)
}

function sortEntries(entries: DiaryEntry[]): DiaryEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))
}

export function missingGuestEntries(cloud: DiaryEntry[], guest: DiaryEntry[]): DiaryEntry[] {
  const cloudDates = new Set(cloud.map((entry) => entry.date))
  return guest.filter((entry) => !cloudDates.has(entry.date))
}

async function writeEntries(uid: string, entries: DiaryEntry[]): Promise<void> {
  for (let offset = 0; offset < entries.length; offset += MAX_BATCH_SIZE) {
    const batch = writeBatch(requireDb())
    entries.slice(offset, offset + MAX_BATCH_SIZE).forEach((entry) => {
      batch.set(entryDocument(uid, entry.date), entry)
    })
    await batch.commit()
  }
}

export async function loadCloudEntries(uid: string): Promise<DiaryEntry[]> {
  const snapshot = await getDocs(entriesCollection(uid))
  const entries = snapshot.docs.map((item) => item.data()).filter(isDiaryEntry)
  return sortEntries(entries)
}

export async function saveCloudEntry(uid: string, entry: DiaryEntry): Promise<void> {
  await setDoc(entryDocument(uid, entry.date), entry)
}

export async function deleteCloudEntry(uid: string, date: string): Promise<void> {
  await deleteDoc(entryDocument(uid, date))
}

export async function importCloudEntries(uid: string, entries: DiaryEntry[]): Promise<void> {
  await writeEntries(uid, entries)
}

export async function migrateGuestEntries(uid: string, guest: DiaryEntry[]): Promise<DiaryEntry[]> {
  const cloud = await loadCloudEntries(uid)
  const missing = missingGuestEntries(cloud, guest)
  if (missing.length) await writeEntries(uid, missing)
  return sortEntries([...cloud, ...missing])
}
