import { DiaryEntry, EMOTION_META } from '../types'
import { toLocalDateKey } from '../utils/date'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons'

interface CalendarProps {
  month: Date
  selectedDate: string
  entries: DiaryEntry[]
  onMonthChange: (date: Date) => void
  onSelect: (date: string) => void
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function Calendar({ month, selectedDate, entries, onMonthChange, onSelect }: CalendarProps) {
  const todayKey = toLocalDateKey(new Date())
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDay = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const entryMap = new Map(entries.map((entry) => [entry.date, entry]))
  const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const isCurrentMonth = year === currentMonth.getFullYear() && monthIndex === currentMonth.getMonth()

  const moveMonth = (offset: number) => onMonthChange(new Date(year, monthIndex + offset, 1))

  return (
    <section className="calendar-card" aria-label={`${year}년 ${monthIndex + 1}월 달력`}>
      <div className="calendar-heading">
        <button className="icon-button" onClick={() => moveMonth(-1)} aria-label="이전 달"><ChevronLeftIcon /></button>
        <h2>{year}년 {monthIndex + 1}월</h2>
        <button className="icon-button" onClick={() => moveMonth(1)} disabled={isCurrentMonth} aria-label="다음 달"><ChevronRightIcon /></button>
      </div>
      <div className="calendar-grid weekday-row">
        {WEEKDAYS.map((day, index) => <span key={day} className={index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}>{day}</span>)}
      </div>
      <div className="calendar-grid days-grid">
        {cells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />
          const dateKey = toLocalDateKey(new Date(year, monthIndex, day))
          const isFuture = dateKey > todayKey
          const isSelected = dateKey === selectedDate
          const isToday = dateKey === todayKey
          const entry = entryMap.get(dateKey)
          return (
            <button
              key={dateKey}
              className={`day-button${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
              disabled={isFuture}
              onClick={() => onSelect(dateKey)}
              aria-label={`${monthIndex + 1}월 ${day}일${entry ? `, ${EMOTION_META[entry.emotion].label} 기록 있음` : ''}`}
              aria-pressed={isSelected}
            >
              <span>{day}</span>
              {entry && <i className="emotion-dot" style={{ backgroundColor: EMOTION_META[entry.emotion].color }} aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </section>
  )
}

