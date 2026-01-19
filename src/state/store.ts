import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { Goal, DayEntry } from '../types'
import * as db from '../db/database'

type State = {
  year: number
  goals: Goal[]
  dayEntries: DayEntry[]
  selectedGoalId?: string
  loadAll: (year?: number) => Promise<void>
  addGoal: (title: string) => Promise<void>
  updateGoal: (goal: Goal) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  toggleDay: (goalId: string, dateIso: string) => Promise<void>
  selectGoal: (id?: string) => void
}

export const useStore = create<State>()(
  devtools(set => {
    const persistedSelected = typeof window !== 'undefined' ? localStorage.getItem('selectedGoalId') ?? undefined : undefined

    return ({
      year: new Date().getFullYear(),
      goals: [],
      dayEntries: [],
      selectedGoalId: persistedSelected,
      loadAll: async (y?: number) => {
        const year = y ?? new Date().getFullYear()
        const goals = await db.getGoalsByYear(year)
        const allEntries = await Promise.all(goals.map(g => db.getDayEntriesForGoalYear(g.id, year)))
        set({ year, goals, dayEntries: allEntries.flat() })

        // restore persisted selected goal if present and valid
        try {
          const sel = localStorage.getItem('selectedGoalId')
          if (sel && goals.find(g => g.id === sel)) set({ selectedGoalId: sel })
          else localStorage.removeItem('selectedGoalId')
        } catch (e) {
          // ignore localStorage errors
        }
      },
      addGoal: async (title: string) => {
        const id = `${Date.now()}`
        const goal: Goal = { id, title, year: new Date().getFullYear() }
        await db.putGoal(goal)
        set(state => ({ goals: [...state.goals, goal], selectedGoalId: id }))
        try { localStorage.setItem('selectedGoalId', id) } catch {}
      },
    updateGoal: async (goal: Goal) => {
      await db.putGoal(goal)
      set(state => ({ goals: state.goals.map(g => (g.id === goal.id ? goal : g)) }))
    },
    deleteGoal: async (id: string) => {
      await db.deleteGoal(id)
      set(state => ({
        goals: state.goals.filter(g => g.id !== id),
        dayEntries: state.dayEntries.filter(e => e.goalId !== id),
        selectedGoalId: state.selectedGoalId === id ? undefined : state.selectedGoalId
      }))
      try { localStorage.removeItem('selectedGoalId') } catch {}
    },
      toggleDay: async (goalId: string, dateIso: string) => {
        const existing = (await db.getDayEntriesForGoalYear(goalId, new Date().getFullYear())).find(e => e.dateIso === dateIso)
        if (existing) {
          await db.putDayEntry({ ...existing, contributed: !existing.contributed })
        } else {
          await db.putDayEntry({ goalId, dateIso, contributed: true })
        }
        const entries = await db.getDayEntriesForGoalYear(goalId, new Date().getFullYear())
        set(state => ({ dayEntries: [...state.dayEntries.filter(e => e.goalId !== goalId), ...entries] }))
      },
      setDay: async (goalId: string, dateIso: string, contributed: boolean) => {
        // write explicit contributed state
        const existing = (await db.getDayEntriesForGoalYear(goalId, new Date().getFullYear())).find(e => e.dateIso === dateIso)
        if (existing) {
          await db.putDayEntry({ ...existing, contributed })
        } else {
          await db.putDayEntry({ goalId, dateIso, contributed })
        }
        const entries = await db.getDayEntriesForGoalYear(goalId, new Date().getFullYear())
        set(state => ({ dayEntries: [...state.dayEntries.filter(e => e.goalId !== goalId), ...entries] }))
      },
      selectGoal: id => {
        try {
          if (id) localStorage.setItem('selectedGoalId', id)
          else localStorage.removeItem('selectedGoalId')
        } catch {}
        set({ selectedGoalId: id })
      }
    })
  })
)
