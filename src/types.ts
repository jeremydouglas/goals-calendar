export interface Goal {
  id: string
  title: string
  year: number
  metadata?: Record<string, unknown>
}

export interface DayEntry {
  id?: number
  goalId: string
  dateIso: string // YYYY-MM-DD
  contributed: boolean
}

export interface Backup {
  version: string
  createdAt: string
  goals: Goal[]
  dayEntries: DayEntry[]
}
