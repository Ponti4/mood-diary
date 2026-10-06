import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { CalendarIcon, ChartIcon, DownloadIcon, SettingsIcon, UploadIcon } from './components/Icons'
import { createBackup, deleteEntry, loadEntries, mergeBackup, parseBackup, persistEntries, upsertEntry } from './data/storage'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import { DiaryEntry, Emotion } from './types'
import { toLocalDateKey } from './utils/date'
import maeumLogo from './assets/maeum-logo.png'

type Tab = 'home' | 'analysis'
type Toast = { type: 'success' | 'error'; message: string }

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [requestedDate, setRequestedDate] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [storageError, setStorageError] = useState('')
  const importRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      setEntries(loadEntries())
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : '기록을 불러오지 못했습니다.')
    }
  }, [])

  useEffect(() => {
    if (!settingsOpen) return
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setSettingsOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [settingsOpen])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 3000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const saveAll = (next: DiaryEntry[], successMessage: string) => {
    try {
      setEntries(persistEntries(next))
      setToast({ type: 'success', message: successMessage })
    } catch {
      setToast({ type: 'error', message: '브라우저에 저장하지 못했습니다. 저장 공간을 확인해주세요.' })
    }
  }

  const handleSave = (date: string, emotion: Emotion, note: string) => {
    const existed = entries.some((entry) => entry.date === date)
    saveAll(upsertEntry(entries, { date, emotion, note }), existed ? '마음 기록을 수정했어요.' : '오늘의 마음을 저장했어요.')
  }

  const handleDelete = (date: string) => {
    if (!window.confirm('이 기록을 삭제할까요? 삭제한 기록은 되돌릴 수 없습니다.')) return
    saveAll(deleteEntry(entries, date), '마음 기록을 삭제했어요.')
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
      saveAll(mergeBackup(entries, backup), '백업 기록을 안전하게 합쳤어요.')
      setSettingsOpen(false)
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : '백업 파일을 읽지 못했습니다.' })
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
            <img className="brand-mark" src={maeumLogo} alt="마음 일기" />
          </button>
          <nav className="desktop-nav" aria-label="주요 메뉴">
            <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}><CalendarIcon />홈</button>
            <button className={tab === 'analysis' ? 'active' : ''} onClick={() => setTab('analysis')}><ChartIcon />분석</button>
          </nav>
          <div className="settings-wrap" ref={menuRef}>
            <button className="settings-button" onClick={() => setSettingsOpen((open) => !open)} aria-expanded={settingsOpen} aria-haspopup="menu"><SettingsIcon /><span>설정</span></button>
            {settingsOpen && (
              <div className="settings-menu" role="menu">
                <div className="menu-heading"><strong>내 기록 관리</strong><span>기록은 이 브라우저에만 저장돼요.</span></div>
                <button role="menuitem" onClick={handleExport}><DownloadIcon /><span><strong>백업 다운로드</strong><small>기록을 파일로 보관해요</small></span></button>
                <button role="menuitem" onClick={() => importRef.current?.click()}><UploadIcon /><span><strong>백업 불러오기</strong><small>기존 기록과 안전하게 합쳐요</small></span></button>
              </div>
            )}
            <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
          </div>
        </div>
      </header>
      {storageError && <div className="storage-warning" role="alert"><strong>기록을 불러오지 못했어요.</strong> {storageError} 백업 파일이 있다면 설정에서 다시 불러와주세요.</div>}
      {tab === 'home' ? <HomePage entries={entries} onSave={handleSave} onDelete={handleDelete} requestedDate={requestedDate} /> : <AnalysisPage entries={entries} onDelete={handleDelete} onOpenEntry={openEntry} />}
      <nav className="mobile-nav" aria-label="주요 메뉴">
        <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}><CalendarIcon /><span>홈</span></button>
        <button className={tab === 'analysis' ? 'active' : ''} onClick={() => setTab('analysis')}><ChartIcon /><span>분석</span></button>
      </nav>
      {toast && <div className={`toast ${toast.type}`} role="status">{toast.type === 'success' && '✓ '}{toast.message}</div>}
    </div>
  )
}
