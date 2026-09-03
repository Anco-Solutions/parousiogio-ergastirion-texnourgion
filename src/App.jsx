import { useEffect, useState } from 'react'
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

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [status, setStatus] = useState('Έλεγχος σύνδεσης…')
  const [studentCount, setStudentCount] = useState(null)

  useEffect(() => {
    async function checkConnection() {
      if (!isSupabaseConfigured) {
        setStatus('Αναμονή ρυθμίσεων Supabase')
        return
      }

      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })

      if (error) {
        setStatus(`Σφάλμα σύνδεσης: ${error.message}`)
        return
      }

      setStudentCount(count ?? 0)
      setStatus('Συνδεδεμένο με Supabase')
    }

    checkConnection()
  }, [])

  const activeModule = [...modules, ...extraModules].find(([, , , id]) => id === activeView)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <button className="brand-button" type="button" onClick={() => setActiveView('dashboard')}>
            <span className="brand-mark">A</span>
            <span>
              <span className="eyebrow">AEN • ΕΡΓΑΣΤΗΡΙΑ ΤΕΧΝΟΛΟΓΙΩΝ</span>
              <strong>Παρουσιολόγιο</strong>
            </span>
          </button>
        </div>
        <div className={`connection ${status.includes('Σφάλμα') ? 'error' : ''}`}>
          <span className="dot" />
          {status}
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <button className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')} type="button">
            <span>⌂</span> Πίνακας ελέγχου
          </button>

          <div className="nav-label">Διαχείριση</div>
          {modules.map(([icon, title, table, id]) => (
            <button className={`nav-item ${activeView === id ? 'active' : ''}`} key={id} onClick={() => setActiveView(id)} type="button">
              <span>{icon}</span> {title}
            </button>
          ))}

          <div className="nav-label">Ρυθμίσεις</div>
          {extraModules.map(([icon, title, table, id]) => (
            <button className={`nav-item ${activeView === id ? 'active' : ''}`} key={id} onClick={() => setActiveView(id)} type="button">
              <span>{icon}</span> {title}
            </button>
          ))}
        </aside>

        <main>
          {activeView === 'dashboard' ? (
            <>
              <section className="hero">
                <div>
                  <p className="kicker">Κεντρικός πίνακας</p>
                  <h1>Παρουσιολόγιο Εργαστηρίων Τεχνολογιών</h1>
                  <p className="hero-copy">
                    Κεντρικό περιβάλλον για σπουδαστές, ομάδες, μαθήματα, καθηγητές,
                    πρόγραμμα και καταγραφή παρουσιών.
                  </p>
                </div>
                <div className="semester-card">
                  <span>Τρέχον εξάμηνο</span>
                  <strong>Δεν έχει οριστεί</strong>
                  <small>Θα συνδεθεί με τον πίνακα semesters</small>
                </div>
              </section>

              <section className="stats">
                <div className="stat-card">
                  <span>Σπουδαστές</span>
                  <strong>{studentCount === null ? '—' : studentCount}</strong>
                </div>
                <div className="stat-card">
                  <span>Παρουσίες</span>
                  <strong>—</strong>
                </div>
                <div className="stat-card">
                  <span>Σημερινά εργαστήρια</span>
                  <strong>—</strong>
                </div>
              </section>

              <section>
                <div className="section-heading">
                  <p className="kicker">Γρήγορη πρόσβαση</p>
                  <h2>Ενότητες εφαρμογής</h2>
                </div>
                <div className="module-grid">
                  {modules.map(([icon, title, table, id]) => (
                    <button className="module-card" key={id} onClick={() => setActiveView(id)} type="button">
                      <span className="module-icon">{icon}</span>
                      <span>
                        <strong>{title}</strong>
                        <small>{table}</small>
                      </span>
                      <span className="arrow">→</span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="module-page">
              <p className="kicker">Ενότητα εφαρμογής</p>
              <div className="page-title-row">
                <div>
                  <h1>{activeModule?.[0]} {activeModule?.[1]}</h1>
                  <p>Η λειτουργία της ενότητας θα συνδεθεί με τα δεδομένα του Supabase.</p>
                </div>
                <span className="table-badge">public.{activeModule?.[2]}</span>
              </div>
              <div className="empty-state">
                <div className="empty-icon">{activeModule?.[0]}</div>
                <h2>Η ενότητα είναι έτοιμη για υλοποίηση</h2>
                <p>Το κέλυφος της εφαρμογής λειτουργεί. Στο επόμενο βήμα περνάμε στις πραγματικές εγγραφές, αναζητήσεις και φόρμες.</p>
              </div>
            </section>
          )}
        </main>
      </div>

      {!isSupabaseConfigured && (
        <aside className="notice">
          <strong>Το Supabase δεν έχει ρυθμιστεί στο περιβάλλον εκτέλεσης.</strong>
          <p>Τα κλειδιά παραμένουν εκτός GitHub και θα δοθούν ως environment variables στο deployment.</p>
        </aside>
      )}
    </div>
  )
}

export default App
