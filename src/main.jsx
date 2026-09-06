import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import './styles.css'
import './readability.css'
import './mobile.css'
import './finalMobileFix.css'
import './headerFinal.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

// Load the older visual patches in sequence. A failure in one older patch
// must never prevent the authoritative final header patch from loading.
setTimeout(async () => {
  try {
    await import('./uiPatch.js')
    await import('./uiPatch2.js')
    await import('./uiPatch3.js')
  } catch (error) {
    console.error('Earlier UI patch loading failed:', error)
  }
}, 0)

// Load the authoritative logo positioning independently so it ALWAYS runs,
// even if one of the older visual patches throws during module evaluation.
setTimeout(() => {
  import('./uiPatch4.js').catch((error) => {
    console.error('Final header logo patch failed:', error)
  })
}, 1000)
