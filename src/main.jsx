import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import './styles.css'
import './readability.css'
import './mobile.css'
import './siteHeader.css'

function HeaderFixes() {
  useEffect(() => {
    const logoBox = document.querySelector('.topbar .brand-mark')
    if (logoBox && !logoBox.querySelector('img')) {
      const logo = document.createElement('img')
      logo.src = `${import.meta.env.BASE_URL}aem-logo.svg?v=20260906-1`
      logo.alt = 'Σχολή Μηχανικών ΑΕΝ Ασπροπύργου'
      logo.className = 'aen-logo-image'
      logoBox.replaceChildren(logo)
    }

    const eyebrow = document.querySelector('.topbar .eyebrow')
    if (eyebrow && eyebrow.textContent !== 'AEN • ΕΡΓΑΣΤΗΡΙΑ ΤΕΧΝΟΥΡΓΕΙΩΝ') {
      eyebrow.textContent = 'AEN • ΕΡΓΑΣΤΗΡΙΑ ΤΕΧΝΟΥΡΓΕΙΩΝ'
    }

    const dashboardTitle = document.querySelector('.hero h1')
    if (dashboardTitle && dashboardTitle.textContent !== 'Παρουσιολόγιο Εργαστηρίων Τεχνουργείων') {
      dashboardTitle.textContent = 'Παρουσιολόγιο Εργαστηρίων Τεχνουργείων'
    }
  }, [])

  return null
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <HeaderFixes />
    </ErrorBoundary>
  </React.StrictMode>,
)
