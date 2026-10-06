import { FormEvent, useEffect, useState } from 'react'
import { DiaryEntry, Emotion, EMOTION_META, EMOTIONS } from '../types'
import { formatKoreanDate } from '../utils/date'
import { CheckIcon, TrashIcon } from './Icons'

interface EntryFormProps {
  date: string
  entry?: DiaryEntry
  onSave: (emotion: Emotion, note: string) => void
  onDelete: () => void
}

export default function EntryForm({ date, entry, onSave, onDelete }: EntryFormProps) {
  const [emotion, setEmotion] = useState<Emotion | null>(entry?.emotion ?? null)
  const [note, setNote] = useState(entry?.note ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    setEmotion(entry?.emotion ?? null)
    setNote(entry?.note ?? '')
    setError('')
  }, [date, entry])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!emotion) {
      setError('오늘의 감정을 하나 골라주세요.')
      return
    }
    if (!note.trim()) {
      setError('그렇게 느낀 이유를 적어주세요.')
      return
    }
    onSave(emotion, note.trim())
    setError('')
  }

  return (
    <section className="entry-card" aria-labelledby="entry-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">마음 기록</span>
          <h2 id="entry-title">{formatKoreanDate(date)}</h2>
        </div>
        {entry && <span className="saved-badge"><CheckIcon /> 저장된 기록</span>}
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend>오늘은 어떤 마음이었나요?</legend>
          <div className="emotion-options">
            {EMOTIONS.map((key) => {
              const meta = EMOTION_META[key]
              return (
                <label key={key} className={`emotion-option emotion-${key}${emotion === key ? ' active' : ''}`}>
                  <input type="radio" name="emotion" value={key} checked={emotion === key} onChange={() => { setEmotion(key); setError('') }} />
                  <span className="emotion-emoji" aria-hidden="true">{meta.emoji}</span>
                  <span>{meta.label}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
        <label className="note-label" htmlFor="diary-note">왜 그렇게 느꼈나요?</label>
        <div className="textarea-wrap">
          <textarea
            id="diary-note"
            value={note}
            maxLength={100}
            rows={4}
            placeholder="오늘 있었던 일을 짧게 적어보세요."
            onChange={(event) => { setNote(event.target.value); setError('') }}
            aria-describedby="note-help form-error"
          />
          <span id="note-help" className="char-count">{note.length} / 100</span>
        </div>
        {error && <p id="form-error" className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          {entry && <button type="button" className="button danger-button" onClick={onDelete}><TrashIcon />기록 삭제</button>}
          <button type="submit" className="button primary-button">{entry ? '수정하기' : '기록 저장'}</button>
        </div>
      </form>
    </section>
  )
}

