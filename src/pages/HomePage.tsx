import { useEffect, useState } from 'react'
import Calendar from '../components/Calendar'
import EntryForm from '../components/EntryForm'
import { DiaryEntry, Emotion } from '../types'
import { fromLocalDateKey, toLocalDateKey } from '../utils/date'

interface HomePageProps {
  entries: DiaryEntry[]
  onSave: (date: string, emotion: Emotion, note: string) => void
  onDelete: (date: string) => void
  requestedDate?: string | null
}

export default function HomePage({ entries, onSave, onDelete, requestedDate }: HomePageProps) {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(toLocalDateKey(today))
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  useEffect(() => {
    if (!requestedDate) return
    const target = fromLocalDateKey(requestedDate)
    setSelectedDate(requestedDate)
    setMonth(new Date(target.getFullYear(), target.getMonth(), 1))
  }, [requestedDate])

  const entry = entries.find((item) => item.date === selectedDate)
  return (
    <main className="page home-page">
      <div className="page-intro">
        <span className="eyebrow">나를 돌보는 작은 습관</span>
        <h1>오늘 마음은 어땠나요?</h1>
        <p>하루의 감정을 알아차리고, 그 이유를 천천히 적어보세요.</p>
      </div>
      <div className="home-layout">
        <Calendar month={month} selectedDate={selectedDate} entries={entries} onMonthChange={setMonth} onSelect={setSelectedDate} />
        <EntryForm date={selectedDate} entry={entry} onSave={(emotion, note) => onSave(selectedDate, emotion, note)} onDelete={() => onDelete(selectedDate)} />
      </div>
    </main>
  )
}

