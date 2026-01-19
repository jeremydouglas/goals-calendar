import React from 'react'
import CalendarGrid from './components/CalendarGrid'
import ImportExportPanel from './components/ImportExportPanel'
import GoalCreatePanel from './components/GoalCreatePanel'
import { useStore } from './state/store'
import { useEffect, useState } from 'react'
import { yearProgress } from './utils/progress'
// Goal list panel removed from header

export default function App() {
  const year = useStore(s => s.year)
  const loadAll = useStore(s => s.loadAll)
  const goals = useStore(s => s.goals)
  const selectedGoalId = useStore(s => s.selectedGoalId)
  const selectGoal = useStore(s => s.selectGoal)
  const dayEntries = useStore(s => s.dayEntries)
  const currentGoal = goals.find(g => g.id === selectedGoalId)
  const entries = dayEntries.filter(e => e.goalId === selectedGoalId)
  const manualPct = currentGoal?.metadata?.manualPercent as number | undefined
  const computedPct = currentGoal ? yearProgress(entries, year) : 0
  const pct = typeof manualPct === 'number' ? manualPct : computedPct
  const [showBackup, setShowBackup] = useState(false)
  const [showCreateGoal, setShowCreateGoal] = useState(false)
  
  const updateGoal = useStore(s => (s as any).updateGoal as (g: any) => Promise<void>)
  const [editingPct, setEditingPct] = useState(false)
  const [editPctValue, setEditPctValue] = useState<string>('')

  useEffect(() => {
    loadAll()
  }, [])

  // Keyboard navigation: Left = previous goal, Right = next goal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const active = document.activeElement as HTMLElement | null
      const tag = active?.tagName?.toLowerCase() ?? ''
      const editable = active?.isContentEditable
      if (tag === 'input' || tag === 'textarea' || editable) return

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        if (!goals || goals.length === 0) return
        const idx = goals.findIndex(g => g.id === selectedGoalId)
        let nextIdx = idx
        if (e.key === 'ArrowRight') {
          nextIdx = idx === -1 ? 0 : Math.min(goals.length - 1, idx + 1)
        } else {
          nextIdx = idx === -1 ? goals.length - 1 : Math.max(0, idx - 1)
        }
        const next = goals[nextIdx]
        if (next) selectGoal(next.id)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goals, selectedGoalId, selectGoal])

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100 pr-6">
      <header className="flex items-center justify-between px-6 py-3 text-xs" style={{ backgroundColor: 'var(--steel-blue)', color: 'white' }}>
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold">Goals — {year}</h1>
          <label className="sr-only" htmlFor="goal-select">Select goal</label>
          <select
            id="goal-select"
            value={selectedGoalId ?? ''}
            onChange={e => {
              const v = e.target.value
              if (v === '__new__') {
                setShowCreateGoal(true)
                return
              }
              selectGoal(v || undefined)
            }}
            className="px-2 py-1 border rounded text-sm"
            style={{ backgroundColor: 'var(--vanilla-custard)', color: 'var(--pacific-cyan)', borderColor: 'rgba(0,0,0,0.08)' }}
          >
            <option value="">— Select goal —</option>
            {goals.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
            <option value="__new__">+ Create new goal</option>
          </select>
          {selectedGoalId && currentGoal && (
            <> 
              {!editingPct ? (
                <button
                  onClick={() => {
                    setEditPctValue((manualPct ?? pct).toFixed(1))
                    setEditingPct(true)
                  }}
                  className="text-xs px-2 py-1 rounded font-mono"
                  style={{ backgroundColor: 'var(--vanilla-custard)', color: 'var(--pacific-cyan)' }}
                >
                  {pct.toFixed(1)}%
                </button>
              ) : (
                <form
                  onSubmit={async e => {
                    e.preventDefault()
                    const val = editPctValue === '' ? undefined : Number(editPctValue)
                    const next = { ...currentGoal, metadata: { ...(currentGoal.metadata || {}), manualPercent: val === undefined ? undefined : val } }
                    await updateGoal(next)
                    setEditingPct(false)
                  }}
                >
                  <input
                    autoFocus
                    className="w-16 text-xs px-2 py-1 rounded font-mono"
                    style={{ backgroundColor: 'var(--vanilla-custard)', color: 'var(--pacific-cyan)' }}
                    value={editPctValue}
                    onChange={e => setEditPctValue(e.target.value)}
                    onBlur={async () => {
                      const val = editPctValue === '' ? undefined : Number(editPctValue)
                      const next = { ...currentGoal, metadata: { ...(currentGoal.metadata || {}), manualPercent: val === undefined ? undefined : val } }
                      await updateGoal(next)
                      setEditingPct(false)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Escape') setEditingPct(false)
                    }}
                  />
                </form>
              )}
            </>
          )}
        </div>
        <div className="flex gap-6">
          {selectedGoalId && (
            <button
              onClick={async () => {
                if (!selectedGoalId) return
                if (!confirm('Delete this goal and its entries? This cannot be undone.')) return
                const deleteGoal = (useStore as any).getState().deleteGoal as (id: string) => Promise<void>
                await deleteGoal(selectedGoalId)
              }}
              className="text-sm text-white hover:underline"
            >
              Delete goal
            </button>
          )}
          <button onClick={() => setShowBackup(s => !s)} className="px-3 py-1 bg-gray-800 rounded border border-gray-700 text-gray-100">Backup</button>
        </div>
      </header>

      <main className="grid grid-cols-1" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
        <section className="col-span-1">
          <CalendarGrid />
        </section>
      </main>
      {showBackup && <ImportExportPanel onClose={() => setShowBackup(false)} />}
      {showCreateGoal && <GoalCreatePanel onClose={() => setShowCreateGoal(false)} />}
      
    </div>
  )
}
