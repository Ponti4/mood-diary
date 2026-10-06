import { useMemo, useState } from 'react'
import { DiaryEntry, Emotion, EMOTION_META, EMOTIONS } from '../types'
import { formatKoreanDate, startDateKeyForRange, toLocalDateKey } from '../utils/date'
import { TrashIcon } from '../components/Icons'

type EmotionFilter = 'all' | Emotion

interface AnalysisPageProps {
  entries: DiaryEntry[]
  onDelete: (date: string) => void
  onOpenEntry: (date: string) => void
}

export default function AnalysisPage({ entries, onDelete, onOpenEntry }: AnalysisPageProps) {
  const [range, setRange] = useState<7 | 30>(7)
  const [emotion, setEmotion] = useState<EmotionFilter>('all')
  const filtered = useMemo(() => {
    const start = startDateKeyForRange(range)
    const today = toLocalDateKey(new Date())
    return entries.filter((entry) => entry.date >= start && entry.date <= today && (emotion === 'all' || entry.emotion === emotion))
  }, [entries, range, emotion])

  return (
    <main className="page analysis-page">
      <div className="page-intro analysis-intro">
        <span className="eyebrow">지난 마음 돌아보기</span>
        <h1>내 마음의 기록</h1>
        <p>지나온 마음들을 다시 읽으며 나를 조금 더 이해해보세요.</p>
      </div>
      <section className="analysis-panel" aria-label="기록 필터">
        <div className="range-switch" role="group" aria-label="조회 기간">
          {([7, 30] as const).map((days) => <button key={days} className={range === days ? 'active' : ''} onClick={() => setRange(days)}>최근 {days}일</button>)}
        </div>
        <div className="emotion-filters" role="group" aria-label="감정 필터">
          <button className={emotion === 'all' ? 'active' : ''} onClick={() => setEmotion('all')}>전체</button>
          {EMOTIONS.map((key) => <button key={key} className={emotion === key ? `active emotion-${key}` : ''} onClick={() => setEmotion(key)}><span aria-hidden="true">{EMOTION_META[key].emoji}</span>{EMOTION_META[key].label}</button>)}
        </div>
      </section>
      <div className="results-heading">
        <h2>{emotion === 'all' ? '모든 마음' : `${EMOTION_META[emotion].label}했던 날`}</h2>
        <span>{filtered.length}개의 기록</span>
      </div>
      {filtered.length ? (
        <div className="entry-list">
          {filtered.map((entry) => {
            const meta = EMOTION_META[entry.emotion]
            return (
              <article className="entry-list-card" key={entry.date}>
                <button className="entry-card-main" onClick={() => onOpenEntry(entry.date)} aria-label={`${formatKoreanDate(entry.date)} 기록 열기`}>
                  <span className={`entry-emotion-icon emotion-${entry.emotion}`} aria-hidden="true">{meta.emoji}</span>
                  <span className="entry-copy">
                    <span className="entry-meta"><strong>{meta.label}</strong><time dateTime={entry.date}>{formatKoreanDate(entry.date)}</time></span>
                    <span className="entry-note">{entry.note}</span>
                  </span>
                </button>
                <button className="icon-button delete-icon" onClick={() => onDelete(entry.date)} aria-label={`${formatKoreanDate(entry.date)} 기록 삭제`}><TrashIcon /></button>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="empty-state"><span aria-hidden="true">🌿</span><h2>아직 기록이 없어요</h2><p>선택한 기간과 감정에 해당하는 기록이 없습니다.<br />오늘의 마음부터 천천히 남겨보세요.</p></div>
      )}
    </main>
  )
}

