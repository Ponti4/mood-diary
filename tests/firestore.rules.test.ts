import { readFileSync } from 'node:fs'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { RulesTestEnvironment, assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'

const projectId = 'mood-diary-rules-test'
let testEnvironment: RulesTestEnvironment

const validEntry = {
  date: '2026-10-07',
  emotion: 'happy',
  note: '좋은 하루였어요.',
  createdAt: '2026-10-07T10:00:00.000Z',
  updatedAt: '2026-10-07T10:00:00.000Z',
}

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})

afterEach(() => testEnvironment.clearFirestore())
afterAll(() => testEnvironment.cleanup())

describe('Firestore diary rules', () => {
  it('allows an authenticated owner to create, read and delete an entry', async () => {
    const db = testEnvironment.authenticatedContext('user-a').firestore()
    const entry = doc(db, 'users/user-a/entries/2026-10-07')
    await assertSucceeds(setDoc(entry, validEntry))
    await assertSucceeds(getDoc(entry))
    await assertSucceeds(deleteDoc(entry))
  })

  it('rejects access to another user records', async () => {
    const db = testEnvironment.authenticatedContext('user-b').firestore()
    await assertFails(getDoc(doc(db, 'users/user-a/entries/2026-10-07')))
    await assertFails(setDoc(doc(db, 'users/user-a/entries/2026-10-07'), validEntry))
  })

  it('rejects invalid document ids, emotions and notes', async () => {
    const db = testEnvironment.authenticatedContext('user-a').firestore()
    await assertFails(setDoc(doc(db, 'users/user-a/entries/not-a-date'), validEntry))
    await assertFails(setDoc(doc(db, 'users/user-a/entries/2026-10-07'), { ...validEntry, emotion: 'excited' }))
    await assertFails(setDoc(doc(db, 'users/user-a/entries/2026-10-07'), { ...validEntry, note: ' '.repeat(4) }))
    await assertFails(setDoc(doc(db, 'users/user-a/entries/2026-10-07'), { ...validEntry, note: '가'.repeat(101) }))
  })
})
