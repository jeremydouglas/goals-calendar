import React from 'react'
import { useStore } from '../state/store'

export default function GoalPanel() {
  const goals = useStore(s => s.goals)
  const selectedGoalId = useStore(s => s.selectedGoalId)
  const selectGoal = useStore(s => s.selectGoal)

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium">Goals</h2>
      </div>

      <ul className="space-y-2">
        {goals.map(g => (
          <li key={g.id}>
            <button
              onClick={() => selectGoal(g.id)}
              className={`w-full text-left p-2 rounded ${selectedGoalId === g.id ? 'bg-indigo-50 border' : 'hover:bg-gray-50'}`}>
              {g.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
