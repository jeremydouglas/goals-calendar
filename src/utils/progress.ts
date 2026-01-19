import { DayEntry } from '../types'

function daysInRange(startIso: string, endIso: string) {
  const start = new Date(startIso)
  const end = new Date(endIso)
  let count = 0
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) count++
  return count
}

export function quarterRange(year: number, quarter: number) {
  const q = Math.max(1, Math.min(4, quarter))
  const startMonth = (q - 1) * 3
  const start = new Date(year, startMonth, 1).toISOString().slice(0, 10)
  const end = new Date(year, startMonth + 3, 0).toISOString().slice(0, 10)
  return { start, end }
}

export function quarterProgress(entries: DayEntry[], year: number, quarter: number) {
  const { start, end } = quarterRange(year, quarter)
  const total = daysInRange(start, end)
  const contributed = entries.filter(e => e.contributed && e.dateIso >= start && e.dateIso <= end).length
  return total === 0 ? 0 : (contributed / total) * 100
}

export function yearProgress(entries: DayEntry[], year: number) {
  const start = `${year}-01-01`
  const end = `${year}-12-31`
  const total = daysInRange(start, end)
  const contributed = entries.filter(e => e.contributed && e.dateIso >= start && e.dateIso <= end).length
  return total === 0 ? 0 : (contributed / total) * 100
}
