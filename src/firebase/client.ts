import { FirebaseApp, initializeApp } from 'firebase/app'
import { Auth, GoogleAuthProvider, getAuth } from 'firebase/auth'
import { Firestore, getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean)

let app: FirebaseApp | null = null
export let auth: Auth | null = null
export let db: Firestore | null = null

if (firebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export function requireAuth(): Auth {
  if (!auth) throw new Error('Firebase 인증 설정이 필요합니다.')
  return auth
}

export function requireDb(): Firestore {
  if (!db) throw new Error('Firebase 데이터베이스 설정이 필요합니다.')
  return db
}
