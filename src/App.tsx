import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { CalendarIcon, ChartIcon, DownloadIcon, SettingsIcon, UploadIcon } from './components/Icons'
import { migrateGuestEntries } from './data/firestoreRepository'
import { buildDeletedEntries, buildSavedEntries, createFirestoreEntryRepository, guestEntryRepository } from './data/repository'
import { clearGuestEntries, createBackup, loadEntries, mergeBackup, parseBackup } from './data/storage'
import { auth, firebaseConfigured, googleProvider, requireAuth } from './firebase/client'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import { DiaryEntry, Emotion } from './types'
import { toLocalDateKey } from './utils/date'
import maeumLogo from './assets/maeum-logo.jpg'

type Tab = 'home' | 'analysis'
type Toast = { type: 'success' | 'error'; message: string }
type AuthStatus = 'loading' | 'guest' | 'migrating' | 'authenticated' | 'error'

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [requestedDate, setRequestedDate] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')
  const [operationBusy, setOperationBusy] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [storageError, setStorageError] = useState('')
  const importRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    const enterGuestMode = () => {
      if (!active) return
      setUser(null)
      try {
        setEntries(loadEntries())
        setStorageError('')
      } catch (error) {
        setStorageError(error instanceof Error ? error.message : '기록을 불러오지 못했습니다.')
      }
      setAuthStatus('guest')
    }

    if (!auth) {
      enterGuestMode()
      return () => { active = false }
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        enterGuestMode()
        return
      }

      setUser(nextUser)
      setAuthStatus('migrating')
      try {
        const guestEntries = loadEntries()
        const syncedEntries = await migrateGuestEntries(nextUser.uid, guestEntries)
        if (!active) return
        clearGuestEntries()
        setEntries(syncedEntries)
        setStorageError('')
        setAuthStatus('authenticated')
      } catch (error) {
        if (!active) return
        setStorageError(error instanceof Error ? error.message : '계정 기록을 불러오지 못했습니다.')
        setAuthStatus('error')
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!settingsOpen && !accountOpen) return
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setSettingsOpen(false)
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [settingsOpen, accountOpen])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 3000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const showError = (error: unknown, fallback: string) => {
    const message = error instanceof Error ? error.message : fallback
    setToast({ type: 'error', message })
  }

  const handleSave = async (date: string, emotion: Emotion, note: string) => {
    const existed = entries.some((entry) => entry.date === date)
    const next = buildSavedEntries(entries, { date, emotion, note })
    const repository = user ? createFirestoreEntryRepository(user.uid) : guestEntryRepository
    setOperationBusy(true)
    try {
      await repository.save(next.entry, next.entries)
      setEntries(next.entries)
      setToast({ type: 'success', message: existed ? '마음 기록을 수정했어요.' : '오늘의 마음을 저장했어요.' })
    } catch (error) {
      showError(error, user ? '계정에 기록을 저장하지 못했습니다.' : '브라우저에 저장하지 못했습니다.')
    } finally {
      setOperationBusy(false)
    }
  }

  const handleDelete = async (date: string) => {
    if (!window.confirm('이 기록을 삭제할까요? 삭제한 기록은 되돌릴 수 없습니다.')) return
    const next = buildDeletedEntries(entries, date)
    const repository = user ? createFirestoreEntryRepository(user.uid) : guestEntryRepository
    setOperationBusy(true)
    try {
      await repository.delete(date, next)
      setEntries(next)
      setToast({ type: 'success', message: '마음 기록을 삭제했어요.' })
    } catch (error) {
      showError(error, '기록을 삭제하지 못했습니다.')
    } finally {
      setOperationBusy(false)
    }
  }

  const handleSignIn = async () => {
    if (!firebaseConfigured) {
      setToast({ type: 'error', message: 'Firebase 환경 설정이 필요합니다.' })
      return
    }
    try {
      await signInWithPopup(requireAuth(), googleProvider)
    } catch (error) {
      const code = (error as { code?: string }).code
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return
      setToast({ type: 'error', message: code === 'auth/popup-blocked' ? '브라우저에서 로그인 팝업을 허용해주세요.' : 'Google 로그인에 실패했습니다.' })
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(requireAuth())
      setAccountOpen(false)
      setToast({ type: 'success', message: '로그아웃했어요.' })
    } catch (error) {
      showError(error, '로그아웃하지 못했습니다.')
    }
  }

  const handleExport = () => {
    const backup = createBackup(entries)
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `마음일기-백업-${toLocalDateKey(new Date())}.json`
    link.click()
    URL.revokeObjectURL(url)
    setSettingsOpen(false)
    setToast({ type: 'success', message: '백업 파일을 내려받았어요.' })
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const backup = parseBackup(await file.text())
      if (!window.confirm(`백업의 ${backup.entries.length}개 기록을 현재 기록과 합칠까요? 같은 날짜는 백업 기록으로 바뀝니다.`)) return
      const next = mergeBackup(entries, backup)
      const repository = user ? createFirestoreEntryRepository(user.uid) : guestEntryRepository
      setOperationBusy(true)
      await repository.import(next)
      setEntries(next)
      setToast({ type: 'success', message: '백업 기록을 안전하게 합쳤어요.' })
      setSettingsOpen(false)
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : '백업 파일을 읽지 못했습니다.' })
    } finally {
      setOperationBusy(false)
    }
  }

  const openEntry = (date: string) => {
    setRequestedDate(date)
    setTab('home')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <button className="brand" onClick={() => setTab('home')} aria-label="마음 일기 홈">
            <img className="brand-mark" src={maeumLogo} alt="" aria-hidden="true" />
            <span>마음 일기</span>
          </button>
          <nav className="desktop-nav" aria-label="주요 메뉴">
            <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}><CalendarIcon />홈</button>
            <button className={tab === 'analysis' ? 'active' : ''} onClick={() => setTab('analysis')}><ChartIcon />분석</button>
          </nav>
          <div className="header-actions">
            {user ? (
              <div className="account-wrap" ref={accountRef}>
                <button className="account-button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen} aria-haspopup="menu">
                  {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <span className="account-avatar">{(user.displayName || user.email || '나').charAt(0)}</span>}
                  <span className="account-name">{user.displayName || '내 계정'}</span>
                </button>
                {accountOpen && (
                  <div className="account-menu" role="menu">
                    <div><strong>{user.displayName || 'Google 사용자'}</strong><small>{user.email}</small></div>
                    <button role="menuitem" onClick={handleSignOut}>로그아웃</button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-button" onClick={handleSignIn} disabled={authStatus === 'loading'}><span className="google-mark">G</span><span>Google로 로그인</span></button>
            )}
            <div className="settings-wrap" ref={menuRef}>
              <button className="settings-button" onClick={() => setSettingsOpen((open) => !open)} aria-expanded={settingsOpen} aria-haspopup="menu"><SettingsIcon /><span>설정</span></button>
              {settingsOpen && (
                <div className="settings-menu" role="menu">
                  <div className="menu-heading"><strong>내 기록 관리</strong><span>{user ? '기록이 Google 계정에 동기화돼요.' : '로그인하면 기록을 계정으로 옮겨드려요.'}</span></div>
                  <button role="menuitem" onClick={handleExport}><DownloadIcon /><span><strong>백업 다운로드</strong><small>기록을 파일로 보관해요</small></span></button>
                  <button role="menuitem" onClick={() => importRef.current?.click()}><UploadIcon /><span><strong>백업 불러오기</strong><small>기존 기록과 안전하게 합쳐요</small></span></button>
                </div>
              )}
              <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
            </div>
          </div>
        </div>
      </header>
      {(authStatus === 'loading' || authStatus === 'migrating') && <div className="sync-banner" role="status">{authStatus === 'loading' ? '로그인 상태를 확인하고 있어요…' : '비회원 기록과 계정 기록을 안전하게 연결하고 있어요…'}</div>}
      {authStatus === 'guest' && <div className="guest-banner">비회원 기록은 이 브라우저에만 저장돼요. <button onClick={handleSignIn}>Google 로그인으로 안전하게 보관하기</button></div>}
      {storageError && <div className="storage-warning" role="alert"><strong>기록을 불러오지 못했어요.</strong> {storageError} 백업 파일이 있다면 설정에서 다시 불러와주세요.</div>}
      <div className={operationBusy || authStatus === 'migrating' ? 'content-busy' : ''} aria-busy={operationBusy || authStatus === 'migrating'}>
        {tab === 'home' ? <HomePage entries={entries} onSave={handleSave} onDelete={handleDelete} requestedDate={requestedDate} /> : <AnalysisPage entries={entries} onDelete={handleDelete} onOpenEntry={openEntry} />}
      </div>
      <nav className="mobile-nav" aria-label="주요 메뉴">
        <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}><CalendarIcon /><span>홈</span></button>
        <button className={tab === 'analysis' ? 'active' : ''} onClick={() => setTab('analysis')}><ChartIcon /><span>분석</span></button>
      </nav>
      {toast && <div className={`toast ${toast.type}`} role="status">{toast.type === 'success' && '✓ '}{toast.message}</div>}
    </div>
  )
}
