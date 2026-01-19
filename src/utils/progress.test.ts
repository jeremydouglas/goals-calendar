import { quarterProgress, yearProgress } from './progress'

describe('progress utilities', () => {
  const year = 2024 // leap year for predictable counts

  const makeEntry = (iso: string, contributed = true) => ({ id: 1, goalId: 'g', dateIso: iso, contributed })

  test('quarterRange and quarterProgress basic', () => {
    // Q1 2024: 2024-01-01 .. 2024-03-31 -> 91 days (leap year)
    const entries = [
      makeEntry('2024-01-01'),
      makeEntry('2024-02-14'),
      makeEntry('2024-03-31')
    ]

    const pct = quarterProgress(entries, year, 1)
    expect(pct).toBeGreaterThan(0)
    expect(pct).toBeCloseTo((3 / 91) * 100)
  })

  test('yearProgress counts correctly', () => {
    // count a few days in year
    const entries = [
      makeEntry('2024-01-01'),
      makeEntry('2024-06-01'),
      makeEntry('2024-12-31')
    ]

    const pct = yearProgress(entries, year)
    // 2024 is leap year -> 366 days
    expect(pct).toBeCloseTo((3 / 366) * 100)
  })
})
