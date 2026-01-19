import React, { useState, useEffect } from 'react'
import { useStore } from '../state/store'
import { yearProgress } from '../utils/progress'

export default function GoalEditPanel({ onClose }: { onClose: () => void }) {
  const selectedGoalId = useStore(s => s.selectedGoalId)
  const goals = useStore(s => s.goals)
  const dayEntries = useStore(s => s.dayEntries)
  const updateGoal = useStore(s => (s as any).updateGoal as (g: any) => Promise<void>)
  const year = useStore(s => s.year)

  const goal = goals.find(g => g.id === selectedGoalId)
  const entries = dayEntries.filter(e => e.goalId === selectedGoalId)

  const computedPct = goal ? yearProgress(entries, year) : 0

  const [title, setTitle] = useState(goal?.title ?? '')
  const [manual, setManual] = useState<number | ''>((goal?.metadata?.manualPercent as number) ?? '')

  useEffect(() => {
    setTitle(goal?.title ?? '')
    setManual((goal?.metadata?.manualPercent as number) ?? '')
  }, [selectedGoalId])

  if (!goal) return null

  async function save() {
    const next = { ...goal, title, metadata: { ...(goal.metadata || {}), manualPercent: manual === '' ? undefined : Number(manual) } }
    await updateGoal(next)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="relative bg-white rounded shadow-lg w-80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Edit Goal</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs text-gray-600">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />

          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-xs text-gray-600">Computed percent</div>
              <div className="text-sm font-medium">{computedPct.toFixed(1)}%</div>
            </div>
            <div className="text-xs text-gray-500">(based on days marked in the year)</div>
          </div>

          <div>
            <label className="block text-xs text-gray-600">Manual override percent</label>
            <input
              type="number"
              min={0}
              max={100}
              value={manual === '' ? '' : String(manual)}
              onChange={e => setManual(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              placeholder="Leave blank to use computed"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={save} className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded">Save</button>
            <button onClick={onClose} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
