import Dexie from 'dexie'
import { Goal, DayEntry, Backup } from '../types'

class AppDB extends Dexie {
  goals!: Dexie.Table<Goal, string>
  dayEntries!: Dexie.Table<DayEntry, number>

  constructor() {
    super('CalendarGoalsDB')
    this.version(1).stores({
      goals: '&id,year,title',
      dayEntries: '++id,goalId,dateIso'
    })

    this.goals = this.table('goals')
    this.dayEntries = this.table('dayEntries')
  }
}

export const db = new AppDB()

export async function putGoal(goal: Goal) {
  return db.goals.put(goal)
}

export async function getGoalsByYear(year: number) {
  return db.goals.where('year').equals(year).toArray()
}

export async function deleteGoal(id: string) {
  await db.goals.delete(id)
  await db.dayEntries.where('goalId').equals(id).delete()
}

export async function putDayEntry(entry: DayEntry) {
  const existing = await db.dayEntries
    .where({ goalId: entry.goalId, dateIso: entry.dateIso })
    .first()

  if (existing && existing.id != null) {
    return db.dayEntries.update(existing.id, { contributed: entry.contributed })
  }
  return db.dayEntries.add(entry)
}

export async function getDayEntriesForGoalYear(goalId: string, year: number) {
  const start = `${year}-01-01`
  const end = `${year}-12-31`
  return db.dayEntries
    .where('goalId')
    .equals(goalId)
    .and(e => e.dateIso >= start && e.dateIso <= end)
    .toArray()
}

export async function exportBackup(): Promise<Backup> {
  const goals = await db.goals.toArray()
  const dayEntries = await db.dayEntries.toArray()
  return {
    version: '1',
    createdAt: new Date().toISOString(),
    goals,
    dayEntries
  }
}

export async function importBackup(backup: Backup) {
  if (!backup || typeof backup !== 'object' || !Array.isArray(backup.goals)) {
    throw new Error('Invalid backup format')
  }

  if (!backup.version || backup.version !== '1') {
    throw new Error(`Unsupported backup version: ${backup.version}`)
  }

  await db.transaction('rw', db.goals, db.dayEntries, async () => {
    await db.goals.clear()
    await db.dayEntries.clear()
    await db.goals.bulkPut(backup.goals || [])
    await db.dayEntries.bulkPut(backup.dayEntries || [])
  })
}

export default db
