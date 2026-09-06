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

// Load the visual patches in a STRICT sequence. The older patches contain
// persistent timers, so loading them concurrently allowed a later patch to
// undo the final logo positioning. uiPatch4 must always be the last one.
setTimeout(async () => {
  try {
    await import('./uiPatch.js')
    await import('./uiPatch2.js')
    await import('./uiPatch3.js')
    await import('./uiPatch4.js')
  } catch (error) {
    console.error('UI patch loading failed:', error)
  }
}, 0)
