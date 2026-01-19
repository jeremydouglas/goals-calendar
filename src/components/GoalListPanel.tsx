// GoalListPanel removed - kept as an empty module to avoid import errors during cleanup
export default function GoalListPanel() { return null }
            const entries = dayEntries.filter(e => e.goalId === goal.id)
            const computedPct = yearProgress(entries, year)
            const manualPct = goal.metadata?.manualPercent as number | undefined
            const pct = typeof manualPct === 'number' ? manualPct : computedPct
            return (
              <li key={goal.id} className="flex items-center gap-2">
                <button
                  className="flex-1 text-left hover:underline text-gray-100"
                  onClick={() => selectGoal(goal.id)}
                >
                  {goal.title}
                </button>
                <span className="text-xs px-2 py-1 bg-gray-700 rounded font-mono text-gray-100">{pct.toFixed(1)}%</span>
                <button
                  className="text-xs text-indigo-300 hover:underline"
                  onClick={() => { selectGoal(goal.id); setEditId(goal.id) }}
                >Edit</button>
              </li>
            )
          })}
        </ul>
        {editId && (
          <GoalEditModal goalId={editId} onClose={() => setEditId(null)} />
        )}
      </div>
    </div>
  )
}

function GoalEditModal({ goalId, onClose }: { goalId: string, onClose: () => void }) {
  const goals = useStore(s => s.goals)
  const dayEntries = useStore(s => s.dayEntries)
  const updateGoal = useStore(s => (s as any).updateGoal as (g: any) => Promise<void>)
  const year = useStore(s => s.year)
  const selectGoal = useStore(s => s.selectGoal)

  const goal = goals.find(g => g.id === goalId)
  const entries = dayEntries.filter(e => e.goalId === goalId)
  const computedPct = goal ? yearProgress(entries, year) : 0

  const [title, setTitle] = useState(goal?.title ?? '')
  const [manual, setManual] = useState<number | ''>((goal?.metadata?.manualPercent as number) ?? '')

  if (!goal) return null

  async function save() {
    const next = { ...goal, title, metadata: { ...(goal.metadata || {}), manualPercent: manual === '' ? undefined : Number(manual) } }
    await updateGoal(next)
    selectGoal(goal.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-gray-800 rounded shadow-lg w-80 p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-100">Edit Goal</h3>
          <button onClick={onClose} className="text-gray-300">✕</button>
        </div>
        <div className="space-y-3">
          <label className="block text-xs text-gray-300">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-700 bg-gray-900 text-gray-100 rounded" />
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-xs text-gray-300">Computed percent</div>
              <div className="text-sm font-medium text-gray-100">{computedPct.toFixed(1)}%</div>
            </div>
            <div className="text-xs text-gray-400">(based on days marked in the year)</div>
          </div>
          <div>
            <label className="block text-xs text-gray-300">Manual override percent</label>
            <input
              type="number"
              min={0}
              max={100}
              value={manual === '' ? '' : String(manual)}
              onChange={e => setManual(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-700 bg-gray-900 text-gray-100 rounded"
              placeholder="Leave blank to use computed"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded">Save</button>
            <button onClick={onClose} className="px-3 py-2 bg-gray-700 text-gray-100 rounded">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
