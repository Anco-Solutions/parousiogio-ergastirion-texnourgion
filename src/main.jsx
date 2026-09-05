import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import './styles.css'
import './readability.css'
import './mobile.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

// Load the visual compatibility patch only after React has mounted.
// If it fails, the application itself remains usable.
setTimeout(() => {
  import('./uiPatch.js').catch((error) => {
    console.error('UI patch could not be loaded:', error)
  })
}, 0)
