import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from '../state/store'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function buildMonthWeeks(year: number, month: number) {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = first.getDay()
  const cells: (number | null)[] = []
  for (let i = 0; i < leading; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export default function CalendarGrid() {
  const year = useStore(s => s.year)
  const selectedGoalId = useStore(s => s.selectedGoalId)
  const dayEntries = useStore(s => s.dayEntries)
  const loadAll = useStore(s => s.loadAll)
  const toggleDay = useStore(s => s.toggleDay)

  useEffect(() => {
    loadAll(year)
  }, [year])

  const contributedSet = useMemo(() => new Set(
    dayEntries.filter(e => e.goalId === selectedGoalId && e.contributed).map(e => e.dateIso)
  ), [dayEntries, selectedGoalId])

  const todayIso = new Date().toISOString().slice(0, 10)

  // clicking now toggles immediately; modal removed

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-full">
        {Array.from({ length: 12 }).map((_, month) => {
          const weeks = buildMonthWeeks(year, month)
          return (
            <div key={month} className="flex flex-col h-full" style={{ backgroundColor: 'var(--muted-teal)' }}>
              <div className="px-2 py-1 text-[11px] font-medium text-on-vanilla text-left opacity-20 uppercase" style={{ backgroundColor: 'transparent' }}>
                {MONTH_NAMES[month]}
              </div>
              <div className="flex-1 flex flex-col">
                <table
                  className="w-full h-full table-fixed text-xs border-collapse"
                  style={{ borderRight: '2px solid color-mix(in srgb, var(--muted-teal) 95%, black 5%)' }}
                >
                  <tbody>
                    {weeks.map((week, wi) => (
                      <tr key={wi}>
                        {week.map((day, di) => {
                            if (day == null) return (
                              <td key={di} className="p-0 border-0">
                                <div className="w-full h-8" style={{ backgroundColor: 'var(--muted-teal)' }} />
                              </td>
                            )
                          const mm = String(month + 1).padStart(2, '0')
                          const dd = String(day).padStart(2, '0')
                          const iso = `${year}-${mm}-${dd}`
                          const contributed = contributedSet.has(iso)
                          const isPast = iso < todayIso
                          const baseBtnClass = 'w-8 h-8 flex items-center justify-center'
                          const btnStyle: any = { minWidth: 0, minHeight: 0, color: 'var(--pacific-cyan)', backgroundColor: 'transparent' }

                          return (
                            <td key={di} className="p-0 overflow-hidden border-0">
                              <button
                                title={iso}
                                onClick={async () => {
                                    if (!selectedGoalId) {
                                      alert('Please select a goal first')
                                      return
                                    }
                                    await toggleDay(selectedGoalId, iso)
                                  }}
                                className={baseBtnClass + ' w-full h-full relative overflow-hidden'}
                                style={btnStyle}
                              >
                                {contributed ? (
                                  <svg className="relative z-20" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                ) : isPast ? (
                                  <span className="relative z-20 text-[11px]" style={{ color: 'var(--pacific-cyan)' }} aria-hidden>✕</span>
                                ) : (
                                  <span className="relative z-20 text-[11px]" style={{ color: 'var(--pacific-cyan)' }}>{day}</span>
                                )}
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
      {/* modal removed: clicks toggle immediately */}
    </div>
  )
}
