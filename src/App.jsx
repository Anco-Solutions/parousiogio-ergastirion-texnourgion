import { useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import TeacherArrivalView from './TeacherArrivalView'
import AdminWorkshopsView from './AdminWorkshopsView'

const DEFAULT_SEMESTER_CODE = 'ST'
const ACADEMIC_PERIODS = [
  { code: 'WINTER', name: '❄️ Χειμερινό' },
  { code: 'SPRING', name: '🌸 Εαρινό' },
]
const DEFAULT_ACADEMIC_PERIOD = 'WINTER'

const modules = [
  ['👥', 'Σπουδαστές', 'students', 'students'],
  ['🎓', 'Τμήματα & Ομάδες', 'groups', 'groups'],
  ['📚', 'Μαθήματα', 'subjects', 'subjects'],
  ['🧑‍🏫', 'Καθηγητές', 'teachers', 'teachers'],
  ['🗓️', 'Πρόγραμμα', 'schedule', 'schedule'],
  ['✅', 'Παρουσίες', 'attendance_records', 'attendance'],
  ['🕐', 'Άφιξη καθηγητή', 'teacher_arrivals', 'teacher-arrival'],
]

const extraModules = [
  ['📅', 'Εξάμηνα', 'semesters', 'semesters'],
  ['🏫', 'Ακαδημαϊκά', 'academic', 'academic'],
  ['🧾', 'Ιστορικό ενεργειών', 'audit_logs', 'audit'],
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
    const { data, error: queryError } = await supabase.from('students').select('*').limit(100)
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

  if (!isSupabaseConfigured) return <div className="data-card"><h2>Σπουδαστές</h2><p>Το Supabase δεν έχει ρυθμιστεί στο περιβάλλον εκτέλεσης.</p></div>

  return <section className="data-page">
    <div className="page-title-row"><div><p className="kicker">Διαχείριση</p><h1>👥 Σπουδαστές</h1><p>Πραγματικά δεδομένα από τον πίνακα <strong>students</strong>.</p></div><span className="count-badge">{filteredRows.length} εγγραφές</span></div>
    <div className="toolbar"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Αναζήτηση σε όλους τους σπουδαστές…" aria-label="Αναζήτηση σπουδαστών" /><button type="button" className="secondary-button" onClick={loadStudents}>↻ Ανανέωση</button></div>
    <div className="data-card table-wrap">{loading ? <div className="loading">Φόρτωση σπουδαστών…</div> : error ? <div className="error-box">Αδυναμία φόρτωσης: {error}</div> : rows.length === 0 ? <div className="empty-state compact"><div className="empty-icon">👥</div><h2>Δεν υπάρχουν εγγραφές</h2><p>Ο πίνακας students είναι διαθέσιμος αλλά δεν περιέχει ακόμη σπουδαστές.</p></div> : <table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{filteredRows.map((row, index) => <tr key={row.id ?? index}>{columns.map((column) => <td key={column}>{String(row[column] ?? '—')}</td>)}</tr>)}</tbody></table>}</div>
  </section>
}

function AuditView() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  async function loadAudit() {
    if (!supabase) return
    setLoading(true)
    setError('')
    const { data, error: queryError } = await supabase.from('audit_logs').select('id,table_name,record_id,action,old_data,new_data,changed_at,changed_by').order('changed_at', { ascending: false }).limit(200)
    if (queryError) setError(queryError.message)
    else setRows(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadAudit() }, [])

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((row) => Object.values(row).some((value) => JSON.stringify(value ?? '').toLowerCase().includes(term)))
  }, [rows, search])

  return <section className="data-page">
    <div className="page-title-row"><div><p className="kicker">Έλεγχος</p><h1>🧾 Ιστορικό ενεργειών</h1><p>Ποιος άλλαξε τι και πότε.</p></div><span className="count-badge">{filteredRows.length} εγγραφές</span></div>
    <div className="toolbar"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Αναζήτηση στο ιστορικό…" aria-label="Αναζήτηση ιστορικού" /><button type="button" className="secondary-button" onClick={loadAudit}>↻ Ανανέωση</button></div>
    <div className="data-card table-wrap">{loading ? <div className="loading">Φόρτωση ιστορικού…</div> : error ? <div className="error-box">Αδυναμία φόρτωσης: {error}</div> : filteredRows.length === 0 ? <div className="empty-state compact"><div className="empty-icon">🧾</div><h2>Δεν υπάρχουν καταγεγραμμένες ενέργειες</h2></div> : <table><thead><tr><th>Πίνακας</th><th>Ενέργεια</th><th>Εγγραφή</th><th>Ποιος</th><th>Πότε</th></tr></thead><tbody>{filteredRows.map((row) => <tr key={row.id}><td>{row.table_name}</td><td>{row.action}</td><td>{row.record_id ?? '—'}</td><td>{row.changed_by ?? '—'}</td><td>{row.changed_at ? new Date(row.changed_at).toLocaleString('el-GR') : '—'}</td></tr>)}</tbody></table>}</div>
  </section>
}

function LoginView({ onDone }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    if (!supabase) { setError('Το Supabase δεν έχει ρυθμιστεί.'); setLoading(false); return }
    const { error: loginError } = await supabase.auth.signInWithPassword({ email: 'ballas.aen@gmail.com', password })
    if (loginError) setError(loginError.message)
    else onDone()
    setLoading(false)
  }

  return <section className="module-page"><p className="kicker">Πρόσβαση</p><h1>🔐 Διαχειριστής</h1><div className="data-card login-card"><form onSubmit={handleLogin}><label>Κωδικός πρόσβασης<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label><button className="primary-button" type="submit" disabled={loading}>{loading ? 'Έλεγχος…' : 'Είσοδος'}</button>{error && <p className="error-box">{error}</p>}</form></div></section>
}

function App() {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeView, setActiveView] = useState('dashboard')
  const [status, setStatus] = useState('Έλεγχος σύνδεσης…')
  const [studentCount, setStudentCount] = useState(null)
  const [semesters, setSemesters] = useState([])
  const [semesterError, setSemesterError] = useState('')
  const [selectedSemesterCode, setSelectedSemesterCode] = useState(() => localStorage.getItem('parousiologio_current_semester') || DEFAULT_SEMESTER_CODE)
  const [academicPeriod, setAcademicPeriod] = useState(() => localStorage.getItem('parousiologio_academic_period') || DEFAULT_ACADEMIC_PERIOD)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function checkRole() {
      if (!supabase || !session?.user) { setIsAdmin(false); return }
      const { data, error } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
      setIsAdmin(!error && data?.role === 'admin')
    }
    checkRole()
  }, [session])

  useEffect(() => {
    async function checkConnection() {
      if (!isSupabaseConfigured) { setStatus('Αναμονή ρυθμίσεων Supabase'); return }
      const { count, error } = await supabase.from('students').select('*', { count: 'exact', head: true })
      if (error) setStatus(`Σφάλμα σύνδεσης: ${error.message}`)
      else { setStudentCount(count ?? 0); setStatus('Συνδεδεμένο με Supabase') }
    }
    checkConnection()
  }, [])

  useEffect(() => {
    async function loadSemesters() {
      if (!supabase) return
      const { data, error } = await supabase.from('semesters').select('code,name')
      if (error) { setSemesterError(error.message); return }
      const available = data ?? []
      setSemesters(available)
      if (!available.some((semester) => semester.code === selectedSemesterCode)) {
        const preferred = available.find((semester) => semester.code === DEFAULT_SEMESTER_CODE) || available[0]
        if (preferred) setSelectedSemesterCode(preferred.code)
      }
    }
    loadSemesters()
  }, [])

  function handleAcademicPeriodChange(event) { const period = event.target.value; setAcademicPeriod(period); localStorage.setItem('parousiologio_academic_period', period) }
  function handleSemesterChange(event) { const code = event.target.value; setSelectedSemesterCode(code); localStorage.setItem('parousiologio_current_semester', code) }
  function openAdmin() { setActiveView(isAdmin ? 'admin-workshops' : 'admin-login') }
  async function signOut() { await supabase?.auth.signOut(); setActiveView('dashboard') }

  const currentSemester = semesters.find((semester) => semester.code === selectedSemesterCode) || null
  const allModules = [...modules, ...extraModules]
  const activeModule = allModules.find(([, , , id]) => id === activeView)

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand-button" type="button" onClick={() => setActiveView('dashboard')} aria-label="Αρχική σελίδα Παρουσιολογίου">
        <span className="brand-mark"><img className="aen-logo-image" src="/parousiogio-ergastirion-texnourgion/aem-logo.svg" alt="ΑΕΝ Ασπροπύργου - Σχολή Μηχανικών" /></span>
        <span><span className="eyebrow">ΑΕΝ ΑΣΠΡΟΠΥΡΓΟΥ • ΣΧΟΛΗ ΜΗΧΑΝΙΚΩΝ</span><strong>Παρουσιολόγια</strong></span>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}><div className={`connection ${status.includes('Σφάλμα') ? 'error' : ''}`}><span className="dot" />{status}</div>{session ? <><span className="count-badge">{isAdmin ? '👑 Admin' : '👤 Χρήστης'}</span><button className="secondary-button" type="button" onClick={signOut}>Έξοδος</button></> : <button className="secondary-button" type="button" onClick={openAdmin}>🔐 Admin</button>}</div>
    </header>

    <div className="layout">
      <aside className="sidebar">
        <button className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')} type="button"><span>⌂</span> Πίνακας ελέγχου</button>
        <div className="nav-label">Διαχείριση</div>
        {modules.map(([icon, title, table, id]) => <button className={`nav-item ${activeView === id ? 'active' : ''}`} key={id} onClick={() => setActiveView(id)} type="button"><span>{icon}</span>{title}</button>)}
        <div className="nav-label">Ρυθμίσεις & έλεγχος</div>
        {extraModules.map(([icon, title, table, id]) => <button className={`nav-item ${activeView === id ? 'active' : ''}`} key={id} onClick={() => setActiveView(id)} type="button"><span>{icon}</span>{title}</button>)}
        {isAdmin && <><div className="nav-label">Διαχειριστής</div><button className={`nav-item ${activeView === 'admin-workshops' ? 'active' : ''}`} onClick={() => setActiveView('admin-workshops')} type="button"><span>⚙️</span> Εργαστήρια & χώροι</button></>}
      </aside>

      <main>
        {activeView === 'dashboard' ? <>
          <section className="hero"><div><p className="kicker">Κεντρικός πίνακας</p><h1>Παρουσιολόγιο Εργαστηρίων Τεχνουργείων</h1><p className="hero-copy">Κεντρικό περιβάλλον για σπουδαστές, ομάδες, μαθήματα, καθηγητές, πρόγραμμα και καταγραφή παρουσιών.</p></div><div className="semester-card"><span>Ακαδημαϊκή περίοδος</span><select className="semester-select" value={academicPeriod} onChange={handleAcademicPeriodChange} aria-label="Επιλογή ακαδημαϊκής περιόδου">{ACADEMIC_PERIODS.map((period) => <option key={period.code} value={period.code}>{period.name}</option>)}</select><span style={{ marginTop: '0.65rem' }}>Εξάμηνο</span>{semesters.length > 0 ? <select className="semester-select" value={selectedSemesterCode} onChange={handleSemesterChange} aria-label="Επιλογή τρέχοντος εξαμήνου">{semesters.map((semester) => <option key={semester.code} value={semester.code}>{semester.name}</option>)}</select> : <strong>{semesterError ? 'Σφάλμα φόρτωσης' : 'Φόρτωση…'}</strong>}<small>{currentSemester ? `Κωδικός: ${currentSemester.code}` : semesterError || 'Ανάκτηση από τον πίνακα semesters'}</small></div></section>
          <section className="stats"><div className="stat-card"><span>Σπουδαστές</span><strong>{studentCount === null ? '—' : studentCount}</strong></div><div className="stat-card"><span>Παρουσίες</span><strong>—</strong></div><div className="stat-card"><span>Σημερινά εργαστήρια</span><strong>—</strong></div></section>
          <section><div className="section-heading"><p className="kicker">Γρήγορη πρόσβαση</p><h2>Ενότητες εφαρμογής</h2></div><div className="module-grid">{modules.map(([icon, title, table, id]) => <button className="module-card" key={id} onClick={() => setActiveView(id)} type="button"><span className="module-icon">{icon}</span><span><strong>{title}</strong><small>{table}</small></span><span className="arrow">→</span></button>)}</div></section>
        </> : activeView === 'students' ? <StudentsView /> : activeView === 'audit' ? <AuditView /> : activeView === 'teacher-arrival' ? <TeacherArrivalView /> : activeView === 'admin-login' ? <LoginView onDone={() => setActiveView('admin-workshops')} /> : activeView === 'admin-workshops' ? (isAdmin ? <AdminWorkshopsView /> : <LoginView onDone={() => setActiveView('admin-workshops')} />) : <section className="module-page"><p className="kicker">Ενότητα εφαρμογής</p><div className="page-title-row"><div><h1>{activeModule?.[0]} {activeModule?.[1]}</h1><p>Η ενότητα θα συνδεθεί με τα πραγματικά δεδομένα του Supabase.</p></div><span className="table-badge">public.{activeModule?.[2]}</span></div><div className="empty-state"><div className="empty-icon">{activeModule?.[0]}</div><h2>Έτοιμη για υλοποίηση</h2><p>Το κέλυφος λειτουργεί. Επόμενο βήμα: η πραγματική λειτουργία της συγκεκριμένης ενότητας.</p></div></section>}
      </main>
    </div>
    {!isSupabaseConfigured && <aside className="notice"><strong>Το Supabase δεν έχει ρυθμιστεί στο περιβάλλον εκτέλεσης.</strong><p>Τα κλειδιά δίνονται ως environment variables στο deployment.</p></aside>}
  </div>
}

export default App
