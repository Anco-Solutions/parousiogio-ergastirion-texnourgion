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

// Load the visual compatibility patches only after React has mounted.
// If they fail, the application itself remains usable.
setTimeout(() => {
  import('./uiPatch.js').catch((error) => {
    console.error('UI patch could not be loaded:', error)
  })
  import('./uiPatch2.js').catch((error) => {
    console.error('Final UI patch could not be loaded:', error)
  })
  import('./uiPatch3.js').catch((error) => {
    console.error('Header polish patch could not be loaded:', error)
  })
}, 0)
