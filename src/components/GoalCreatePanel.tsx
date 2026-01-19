import React, { useState } from 'react'
import { useStore } from '../state/store'

export default function GoalCreatePanel({ onClose }: { onClose: () => void }) {
  const addGoal = useStore(s => s.addGoal)
  const [title, setTitle] = useState('')

  async function handleAdd(e?: React.FormEvent) {
    e?.preventDefault()
    const t = title.trim()
    if (!t) return
    await addGoal(t)
    setTitle('')
    onClose()
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-800 border border-gray-700 shadow-lg w-72 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-100">New Goal</h3>
          <button onClick={onClose} className="text-gray-300">✕</button>
        </div>

        <form onSubmit={handleAdd} className="space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Goal title" className="w-full px-3 py-2 border border-gray-700 bg-gray-900 text-gray-100 rounded" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded">Create</button>
            <button type="button" onClick={onClose} className="px-3 py-2 bg-gray-700 text-gray-100 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
