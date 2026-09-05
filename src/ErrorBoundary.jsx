import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Application startup error:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    const error = this.state.error
    return (
      <div style={{ minHeight: '100vh', padding: '32px 20px', fontFamily: 'system-ui, sans-serif', background: '#f8fafc', color: '#0f172a' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 10px 35px rgba(15,23,42,.10)' }}>
          <h1 style={{ marginTop: 0 }}>Δεν ήταν δυνατή η φόρτωση της εφαρμογής</h1>
          <p>Η εφαρμογή ξεκίνησε, αλλά παρουσιάστηκε σφάλμα κατά τη φόρτωση.</p>
          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 16, borderRadius: 12, background: '#f1f5f9', fontSize: 14 }}>{String(error?.stack || error?.message || error)}</pre>
          <button type="button" onClick={() => window.location.reload()} style={{ padding: '12px 18px', border: 0, borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
            Επαναφόρτωση
          </button>
        </div>
      </div>
    )
  }
}
