import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import applyDailyPalette from './utils/palette'

;(async () => {
  await applyDailyPalette()
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})()

// Register a minimal service worker to enable installability in supporting browsers (Safari/Chrome)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

