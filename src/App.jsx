import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'

const modules = [
  ['👥', 'Σπουδαστές', 'students'],
  ['🎓', 'Τμήματα & Ομάδες', 'groups'],
  ['📚', 'Μαθήματα', 'subjects'],
  ['🧑‍🏫', 'Καθηγητές', 'teachers'],
  ['🗓️', 'Πρόγραμμα', 'schedule'],
  ['✅', 'Παρουσίες', 'attendance_records'],
]

function App() {
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

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">AEN • ΕΡΓΑΣΤΗΡΙΑ ΤΕΧΝΟΛΟΓΙΩΝ</div>
          <h1>Παρουσιολόγιο</h1>
        </div>
        <div className={`connection ${status.includes('Σφάλμα') ? 'error' : ''}`}>
          <span className="dot" />
          {status}
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="kicker">Κεντρικός πίνακας</p>
            <h2>Παρουσιολόγιο Εργαστηρίων Τεχνολογιών</h2>
            <p className="hero-copy">
              Η εφαρμογή θα οργανώνει σπουδαστές, ομάδες, μαθήματα, πρόγραμμα και
              καταγραφή παρουσιών σε ένα ενιαίο περιβάλλον.
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
            <div>
              <p className="kicker">Διαχείριση</p>
              <h3>Ενότητες εφαρμογής</h3>
            </div>
          </div>
          <div className="module-grid">
            {modules.map(([icon, title, table]) => (
              <button className="module-card" key={table} type="button">
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

        {!isSupabaseConfigured && (
          <aside className="notice">
            <strong>Το πρώτο τεχνικό βήμα ολοκληρώθηκε.</strong>
            <p>
              Ο κώδικας είναι έτοιμος να συνδεθεί με το Supabase. Δεν βάζουμε κλειδιά
              μέσα στο GitHub· θα χρησιμοποιήσουμε μεταβλητές περιβάλλοντος.
            </p>
          </aside>
        )}
      </main>
    </div>
  )
}

export default App
