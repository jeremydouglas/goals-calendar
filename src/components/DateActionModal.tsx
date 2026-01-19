import React from 'react'
import { useStore } from '../state/store'

export default function DateActionModal({
  iso,
  onClose
}: {
  iso: string
  onClose: () => void
}) {
  const selectedGoalId = useStore(s => s.selectedGoalId)
  const setDay = useStore(s => (s as any).setDay as (goalId: string, dateIso: string, contributed: boolean) => Promise<void>)

  async function mark(contrib: boolean) {
    if (!selectedGoalId) return
    await setDay(selectedGoalId, iso, contrib)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-gray-800 rounded shadow-lg w-80 p-4 border border-gray-700">
        <div className="text-sm font-medium mb-2 text-gray-100">Set status for {iso}</div>
        <div className="flex gap-2">
          <button onClick={() => mark(true)} className="flex-1 px-3 py-2 bg-green-500 text-white">Mark reached</button>
          <button onClick={() => mark(false)} className="flex-1 px-3 py-2 bg-gray-700 text-gray-100">Mark not reached</button>
        </div>
        <div className="mt-3 text-right">
          <button onClick={onClose} className="text-sm text-gray-300 hover:underline">Cancel</button>
        </div>
      </div>
    </div>
  )
}
