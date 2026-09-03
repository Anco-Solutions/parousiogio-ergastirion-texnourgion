import { useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'

const modules = [
  ['👥', 'Σπουδαστές', 'students', 'students'],
  ['🎓', 'Τμήματα & Ομάδες', 'groups', 'groups'],
  ['📚', 'Μαθήματα', 'subjects', 'subjects'],
  ['🧑‍🏫', 'Καθηγητές', 'teachers', 'teachers'],
  ['🗓️', 'Πρόγραμμα', 'schedule', 'schedule'],
  ['✅', 'Παρουσίες', 'attendance_records', 'attendance'],
]

const extraModules = [
  ['📅', 'Εξάμηνα', 'semesters', 'semesters'],
  ['🏫', 'Ακαδημαϊκά', 'academic', 'academic'],
]

function StudentsView() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  async function loadStudents() {
    if (!supabase) return
    setLoading(true)
    setError('')
    const { data, error: queryError } = await supabase
      .from('students')
      .select('*')
      .limit(100)

    if (queryError) setError(queryError.message)
    else setRows(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadStudents() }, [])

  const columns = useMemo(() => {
    const keys = new Set()
    rows.forEach((row) => Object.keys(row).forEach((key) => keys.add(key)))
    return [...keys]
  }, [rows])

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((row) => Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(term)))
  }, [rows, search])

  if (!isSupabaseConfigured) {
    return <div className="data-card"><h2>Σπουδαστές</h2><p>Το Supabase δεν έχει ρυθμιστεί στο περιβάλλον εκτέλεσης.</p></div>
  }

  return (
    <section className="data-page">
      <div className="page-title-row">
        <div>
          <p className="kicker">Διαχείριση</p>
          <h1>👥 Σπουδαστές</h1>
          <p>Πραγματικά δεδομένα από τον πίνακα <strong>students</strong>.</p>
        </div>
        <span className="count-badge">{filteredRows.length} εγγραφές</span>
      </div>

      <div className="toolbar">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Αναζήτηση σε όλους τους σπουδαστές…" aria-label="Αναζήτηση σπουδαστών" />
        <button type="button" className="secondary-button" onClick={loadStudents}>↻ Ανανέωση</button>
      </div>

      <div className="data-card table-wrap">
        {loading ? <div className="loading">Φόρτωση σπουδαστών…</div> : error ? <div className="error-box">Αδυναμία φόρτωσης: {error}</div> : rows.length === 0 ? <div className="empty-state compact"><div className="empty-icon">👥</div><h2>Δεν υπάρχουν εγγραφές</h2><p>Ο πίνακας students είναι διαθέσιμος αλλά δεν περιέχει ακόμη σπουδαστές.</p></div> : (
          <table>
            <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
            <tbody>{filteredRows.map((row, index) => <tr key={row.id ?? index}>{columns.map((column) => <td key={column}>{String(row[column] ?? '—')}</td>)}</tr>)}</tbody>
          </table>
        )}
      </div>
    </section>
  )
}

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [status, setStatus] = useState('Έλεγχος σύνδεσης…')
  const [studentCount, setStudentCount] = useState(null)

  useEffect(() => {
    async function checkConnection() {
      if (!isSupabaseConfigured) { setStatus('Αναμονή ρυθμίσεων Supabase'); return }
      const { count, error } = await supabase.from('students').select('*', { count: 'exact', head: true })
      if (error) setStatus(`Σφάλμα σύνδεσης: ${error.message}`)
      else { setStudentCount(count ?? 0); setStatus('Συνδεδεμένο με Supabase') }
    }
    checkConnection()
  }, [])

  const allModules = [...modules, ...extraModules]
  const activeModule = allModules.find(([, , , id]) => id === activeView)

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" type="button" onClick={() => setActiveView('dashboard')}>
          <span className="brand-mark">A</span><span><span className="eyebrow">AEN • ΕΡΓΑΣΤΗΡΙΑ ΤΕΧΝΟΛΟΓΙΩΝ</span><strong>Παρουσιολόγιο</strong></span>
        </button>
        <div className={`connection ${status.includes('Σφάλμα') ? 'error' : ''}`}><span className="dot" />{status}</div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <button className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')} type="button"><span>⌂</span> Πίνακας ελέγχου</button>
          <div className="nav-label">Διαχείριση</div>
          {modules.map(([icon, title, table, id]) => <button className={`nav-item ${activeView === id ? 'active' : ''}`} key={id} onClick={() => setActiveView(id)} type="button"><span>{icon}</span>{title}</button>)}
          <div className="nav-label">Ρυθμίσεις</div>
          {extraModules.map(([icon, title, table, id]) => <button className={`nav-item ${activeView === id ? 'active' : ''}`} key={id} onClick={() => setActiveView(id)} type="button"><span>{icon}</span>{title}</button>)}
        </aside>

        <main>
          {activeView === 'dashboard' ? <>
            <section className="hero"><div><p className="kicker">Κεντρικός πίνακας</p><h1>Παρουσιολόγιο Εργαστηρίων Τεχνολογιών</h1><p className="hero-copy">Κεντρικό περιβάλλον για σπουδαστές, ομάδες, μαθήματα, καθηγητές, πρόγραμμα και καταγραφή παρουσιών.</p></div><div className="semester-card"><span>Τρέχον εξάμηνο</span><strong>Δεν έχει οριστεί</strong><small>Θα συνδεθεί με τον πίνακα semesters</small></div></section>
            <section className="stats"><div className="stat-card"><span>Σπουδαστές</span><strong>{studentCount === null ? '—' : studentCount}</strong></div><div className="stat-card"><span>Παρουσίες</span><strong>—</strong></div><div className="stat-card"><span>Σημερινά εργαστήρια</span><strong>—</strong></div></section>
            <section><div className="section-heading"><p className="kicker">Γρήγορη πρόσβαση</p><h2>Ενότητες εφαρμογής</h2></div><div className="module-grid">{modules.map(([icon, title, table, id]) => <button className="module-card" key={id} onClick={() => setActiveView(id)} type="button"><span className="module-icon">{icon}</span><span><strong>{title}</strong><small>{table}</small></span><span className="arrow">→</span></button>)}</div></section>
          </> : activeView === 'students' ? <StudentsView /> : <section className="module-page"><p className="kicker">Ενότητα εφαρμογής</p><div className="page-title-row"><div><h1>{activeModule?.[0]} {activeModule?.[1]}</h1><p>Η ενότητα θα συνδεθεί με τα πραγματικά δεδομένα του Supabase.</p></div><span className="table-badge">public.{activeModule?.[2]}</span></div><div className="empty-state"><div className="empty-icon">{activeModule?.[0]}</div><h2>Έτοιμη για υλοποίηση</h2><p>Το κέλυφος λειτουργεί. Επόμενο βήμα: η πραγματική λειτουργία της συγκεκριμένης ενότητας.</p></div></section>}
        </main>
      </div>

      {!isSupabaseConfigured && <aside className="notice"><strong>Το Supabase δεν έχει ρυθμιστεί στο περιβάλλον εκτέλεσης.</strong><p>Τα κλειδιά δίνονται ως environment variables στο deployment.</p></aside>}
    </div>
  )
}

export default App
