export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromLocalDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatKoreanDate(key: string, includeYear = true): string {
  return new Intl.DateTimeFormat('ko-KR', {
    ...(includeYear ? { year: 'numeric' as const } : {}),
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(fromLocalDateKey(key))
}

export function startDateKeyForRange(days: number, now = new Date()): string {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  start.setDate(start.getDate() - (days - 1))
  return toLocalDateKey(start)
}

export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = fromLocalDateKey(value)
  return toLocalDateKey(date) === value
}
