export const EMOTIONS = ['happy', 'depressed', 'angry', 'neutral'] as const

export type Emotion = (typeof EMOTIONS)[number]

export interface DiaryEntry {
  date: string
  emotion: Emotion
  note: string
  createdAt: string
  updatedAt: string
}

export interface DiaryBackup {
  version: 1
  exportedAt: string
  entries: DiaryEntry[]
}

export const EMOTION_META: Record<Emotion, { label: string; emoji: string; color: string }> = {
  happy: { label: '행복', emoji: '😊', color: '#e5b95c' },
  depressed: { label: '우울', emoji: '😔', color: '#7188a6' },
  angry: { label: '화남', emoji: '😠', color: '#d47768' },
  neutral: { label: '평범', emoji: '😌', color: '#73978b' },
}
