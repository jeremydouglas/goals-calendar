import React from 'react'
import * as db from '../db/database'
import { useStore } from '../state/store'

export default function ImportExportPanel({ onClose }: { onClose: () => void }) {
  const loadAll = useStore(s => s.loadAll)

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded shadow-lg w-80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-100">Backup</h3>
          <button onClick={onClose} className="text-gray-300">✕</button>
        </div>

        <div className="space-y-3">
          <button
            onClick={async () => {
              const backup = await db.exportBackup()
              const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `calendar-backup-${new Date().toISOString().slice(0,10)}.json`
              document.body.appendChild(a)
              a.click()
              a.remove()
              URL.revokeObjectURL(url)
            }}
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-700 text-sm text-gray-100"
          >
            Export JSON
          </button>

          <label className="w-full block">
            <div className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-700 text-sm text-center cursor-pointer text-gray-100">Import JSON</div>
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0]
                if (!file) return
                try {
                  const text = await file.text()
                  const parsed = JSON.parse(text)
                  await db.importBackup(parsed)
                  await loadAll()
                  alert('Import successful')
                  onClose()
                } catch (err) {
                  console.error(err)
                  alert('Import failed: ' + (err as Error).message)
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
