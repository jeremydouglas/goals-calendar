async function fetchPaletteFromCoolors(apiKey: string) {
  // Best-effort: Coolors API usage may vary; this is a safe attempt and will fail gracefully.
  try {
    const res = await fetch('https://coolors.co/api/palettes/random', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json'
      }
    })
    if (!res.ok) throw new Error('coolors fetch failed')
    const data = await res.json()
    // Expect data.colors to be an array of hex strings, but be defensive
    if (data && Array.isArray(data.colors) && data.colors.length) return data.colors.map((c: string) => c.replace('#', ''))
  } catch (e) {
    // ignore and fallback
  }
  return null
}

const FALLBACK_PALETTES: string[][] = [
  ['e2dbbe', 'd5d6aa', '9dbbaa', '769fb6', '188fa7'], // user-supplied
  ['f6f3ea', 'd8e2dc', '3e7c6b', '6b8e87', '2f4858'],
  ['f0ece2', 'c9d6d5', '8fb29a', '5b8c8a', '2f6f6f'],
  ['f4efe6', 'd0c9b8', '9fb3c8', '6b8ea3', '335b73']
]

function hashToIndex(s: string, mod: number) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h % mod
}

export async function applyDailyPalette() {
  if (typeof document === 'undefined') return
  const today = new Date().toISOString().slice(0, 10)
  const storageKey = `palette:${today}`
  try {
    const cached = localStorage.getItem(storageKey)
    if (cached) {
      const cols = JSON.parse(cached) as string[]
      applyCssVars(cols)
      return
    }
  } catch (e) {}

  let palette: string[] | null = null
  const apiKey = (import.meta as any).env?.VITE_COOLORS_API_KEY
  if (apiKey) {
    palette = await fetchPaletteFromCoolors(apiKey)
  }

  if (!palette) {
    const idx = hashToIndex(today, FALLBACK_PALETTES.length)
    palette = FALLBACK_PALETTES[idx]
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(palette))
  } catch (e) {}
  applyCssVars(palette)
}

function applyCssVars(cols: string[]) {
  const root = document.documentElement
  // Map first five colors to our variables, fallback to existing if missing
  const vars = ['--sand-dune', '--vanilla-custard', '--muted-teal', '--steel-blue', '--pacific-cyan']
  for (let i = 0; i < vars.length; i++) {
    const c = cols[i] ? `#${cols[i]}` : ''
    if (c) root.style.setProperty(vars[i], c)
  }
}

export default applyDailyPalette
