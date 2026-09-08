import { useEffect, useMemo, useState } from 'react'
import { createWorker } from 'tesseract.js'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'

const SYSTEM_KEYS = new Set(['id', 'created_at', 'updated_at', 'deleted_at'])
const LABELS = {
  registry_number: 'Αριθμός Μητρώου',
  registration_number: 'Αριθμός Μητρώου',
  registry_no: 'Αριθμός Μητρώου',
  am: 'Αριθμός Μητρώου',
  student_number: 'Αριθμός Μητρώου',
  last_name: 'Επώνυμο',
  surname: 'Επώνυμο',
  first_name: 'Όνομα',
  name: 'Όνομα',
  full_name: 'Ονοματεπώνυμο',
  phone: 'Τηλέφωνο',
  semester: 'Εξάμηνο',
  group: 'Ομάδα',
  status: 'Κατάσταση',
}

function labelFor(key) {
  return LABELS[key] || key.replaceAll('_', ' ')
}

function valueFor(row, aliases) {
  const key = Object.keys(row || {}).find((candidate) => aliases.includes(candidate))
  return key ? row[key] : ''
}

function StudentForm({ row, columns, onCancel, onSave, busy }) {
  const editableColumns = columns.filter((column) => !SYSTEM_KEYS.has(column))
  const [draft, setDraft] = useState(() => ({ ...(row || {}) }))

  useEffect(() => setDraft({ ...(row || {}) }), [row])

  function setValue(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  return <form className="data-card" onSubmit={(event) => { event.preventDefault(); onSave(draft) }} style={{ padding: '1rem', marginBottom: '1rem' }}>
    <div className="page-title-row">
      <div><p className="kicker">{row?.id ? 'Επεξεργασία' : 'Νέα εγγραφή'}</p><h2>{row?.id ? '✏️ Διόρθωση σπουδαστή' : '➕ Νέος σπουδαστής'}</h2><p>Όλα τα διαθέσιμα στοιχεία παραμένουν διορθώσιμα πριν την αποθήκευση.</p></div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.85rem' }}>
      {editableColumns.map((column) => <label key={column}>{labelFor(column)}<input value={draft[column] == null ? '' : String(draft[column])} onChange={(event) => setValue(column, event.target.value)} /></label>)}
    </div>
    <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', marginTop: '1rem', flexWrap: 'wrap' }}>
      <button type="button" className="secondary-button" onClick={onCancel}>Ακύρωση</button>
      <button type="submit" className="primary-button" disabled={busy}>{busy ? 'Αποθήκευση…' : 'Αποθήκευση'}</button>
    </div>
  </form>
}

function parseOcrText(text) {
  const results = []
  const seen = new Set()
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/[|]/g, ' ').replace(/\s+/g, ' ').trim()
    if (!line) continue
    const match = line.match(/^(?:\d{1,3}\s+)?(\d{4,6})\s+(.{3,})$/u)
    if (!match) continue
    const registryNumber = match[1]
    let fullName = match[2].trim()
    fullName = fullName.replace(/\s+(?:Π|P|Α|A)\s*$/i, '').trim()
    if (seen.has(registryNumber)) continue
    seen.add(registryNumber)
    const parts = fullName.split(/\s+/)
    results.push({ registryNumber, fullName, lastName: parts[0] || '', firstName: parts.slice(1).join(' ') })
  }
  return results
}

function OcrImport({ existingRows, columns, onImport, onClose }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [ocrText, setOcrText] = useState('')
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const registryColumn = columns.find((key) => ['registry_number', 'registration_number', 'registry_no', 'am', 'student_number', 'arithmos_mitroou'].includes(key))
  const nameColumn = columns.find((key) => ['full_name', 'name', 'student_name', 'onomateponymo'].includes(key))
  const lastNameColumn = columns.find((key) => ['last_name', 'surname', 'eponymo'].includes(key))
  const firstNameColumn = columns.find((key) => ['first_name', 'onoma'].includes(key))

  async function runOcr() {
    if (!file) return
    setBusy(true); setError(''); setProgress('Προετοιμασία OCR…')
    try {
      const worker = await createWorker('ell', 1, { logger: (message) => { if (message.status) setProgress(`${message.status} ${Math.round((message.progress || 0) * 100)}%`) } })
      const result = await worker.recognize(file)
      const text = result.data.text || ''
      setOcrText(text)
      setItems(parseOcrText(text))
      await worker.terminate()
      setProgress('Η αναγνώριση ολοκληρώθηκε. Ελέγξτε και διορθώστε τα στοιχεία πριν την καταχώριση.')
    } catch (ocrError) {
      setError(ocrError?.message || 'Αποτυχία OCR')
      setProgress('')
    } finally { setBusy(false) }
  }

  function handleFile(event) {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(nextFile); setPreviewUrl(URL.createObjectURL(nextFile)); setItems([]); setOcrText(''); setError(''); setProgress('')
  }

  function updateItem(index, key, value) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  }

  function isExisting(item) {
    const normalized = String(item.registryNumber || '').replace(/\D/g, '')
    return existingRows.some((row) => String(registryColumn ? row[registryColumn] : valueFor(row, ['registry_number', 'registration_number', 'registry_no', 'am', 'student_number'])).replace(/\D/g, '') === normalized)
  }

  function buildRow(item) {
    const row = {}
    if (registryColumn) row[registryColumn] = item.registryNumber.trim()
    if (nameColumn) row[nameColumn] = item.fullName.trim()
    if (lastNameColumn) row[lastNameColumn] = item.lastName.trim()
    if (firstNameColumn) row[firstNameColumn] = item.firstName.trim()
    return row
  }

  return <section className="data-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
    <div className="page-title-row"><div><p className="kicker">Εισαγωγή από έντυπο ISO</p><h2>📷 Σκανάρισμα παρουσιολογίου</h2><p>Το OCR διαβάζει το έντυπο και δημιουργεί <strong>προεπισκόπηση</strong>. Δεν γράφει απευθείας στη βάση.</p></div></div>
    <label style={{ display: 'block', marginBottom: '0.8rem' }}>Φωτογραφία ή scan εντύπου<input type="file" accept="image/*" capture="environment" onChange={handleFile} /></label>
    {previewUrl && <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px,1fr) minmax(220px,1fr)', gap: '1rem', alignItems: 'start' }}><div><img src={previewUrl} alt="Προεπισκόπηση εντύπου ISO" style={{ width: '100%', maxHeight: 420, objectFit: 'contain', border: '1px solid #d8dee8', borderRadius: 10 }} /></div><div><p style={{ marginTop: 0 }}><strong>Αναγνώριση</strong></p><p style={{ fontSize: '0.9rem' }}>Το έντυπο έχει σταθερή διάταξη. Στην επόμενη βελτίωση μπορούμε να περιορίσουμε το OCR μόνο στις στήλες ΑΜ και Ονοματεπώνυμο.</p><button type="button" className="primary-button" onClick={runOcr} disabled={busy}>{busy ? '⏳ Ανάγνωση…' : '🔎 Ανάγνωση εντύπου'}</button></div></div>}
    {progress && <div className="audit-note" style={{ marginTop: '0.8rem' }}>{progress}</div>}
    {error && <div className="error-box" style={{ marginTop: '0.8rem' }}>{error}</div>}
    {items.length > 0 && <div style={{ marginTop: '1rem' }}><div className="page-title-row"><div><h3>Έλεγχος πριν την καταχώριση</h3><p>Διορθώστε ελεύθερα κάθε γραμμή. 🟡 σημαίνει ότι το ΑΜ υπάρχει ήδη.</p></div><span className="count-badge">{items.length} γραμμές</span></div><div className="table-wrap"><table><thead><tr><th>ΑΜ</th><th>Επώνυμο</th><th>Όνομα</th><th>Κατάσταση</th></tr></thead><tbody>{items.map((item, index) => <tr key={`${item.registryNumber}-${index}`}><td><input value={item.registryNumber} onChange={(event) => updateItem(index, 'registryNumber', event.target.value)} /></td><td><input value={item.lastName} onChange={(event) => updateItem(index, 'lastName', event.target.value)} /></td><td><input value={item.firstName} onChange={(event) => updateItem(index, 'firstName', event.target.value)} /></td><td>{isExisting(item) ? '🟡 Ήδη υπάρχει' : '🟢 Νέα εγγραφή'}</td></tr>)}</tbody></table></div><div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', marginTop: '0.8rem', flexWrap: 'wrap' }}><button type="button" className="secondary-button" onClick={onClose}>Ακύρωση</button><button type="button" className="primary-button" onClick={() => onImport(items.filter((item) => !isExisting(item)).map(buildRow))}>💾 Καταχώριση νέων</button></div></div>}
    {ocrText && <details style={{ marginTop: '0.8rem' }}><summary>Τεχνική προεπισκόπηση OCR</summary><pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.78rem' }}>{ocrText}</pre></details>}
  </section>
}

export default function StudentsView() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showOcr, setShowOcr] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function loadStudents() {
    if (!supabase) return
    setLoading(true); setError('')
    const { data, error: queryError } = await supabase.from('students').select('*').limit(500)
    if (queryError) setError(queryError.message); else setRows(data ?? [])
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

  async function saveStudent(draft) {
    setBusy(true); setError(''); setNotice('')
    const payload = { ...draft }
    SYSTEM_KEYS.forEach((key) => delete payload[key])
    const operation = editing?.id ? supabase.from('students').update(payload).eq('id', editing.id).select('*').single() : supabase.from('students').insert(payload).select('*').single()
    const { data, error: saveError } = await operation
    if (saveError) setError(saveError.message)
    else { setRows((current) => editing?.id ? current.map((row) => row.id === editing.id ? data : row) : [data, ...current]); setNotice(editing?.id ? 'Ο σπουδαστής ενημερώθηκε.' : 'Ο σπουδαστής καταχωρίστηκε.'); setEditing(null); setShowForm(false) }
    setBusy(false)
  }

  async function deleteStudent(row) {
    if (!window.confirm(`Να διαγραφεί ο σπουδαστής ${String(valueFor(row, ['full_name', 'name', 'student_name']) || row.id)};\n\nΗ ενέργεια θα καταγραφεί στο ιστορικό.`)) return
    setBusy(true); setError(''); setNotice('')
    const { error: deleteError } = await supabase.from('students').delete().eq('id', row.id)
    if (deleteError) setError(deleteError.message)
    else { setRows((current) => current.filter((item) => item.id !== row.id)); setNotice('Ο σπουδαστής διαγράφηκε και η ενέργεια καταγράφηκε στο ιστορικό.') }
    setBusy(false)
  }

  async function importRows(newRows) {
    if (!newRows.length) { setNotice('Δεν υπάρχουν νέες εγγραφές για καταχώριση.'); return }
    setBusy(true); setError(''); setNotice('')
    const { data, error: importError } = await supabase.from('students').insert(newRows).select('*')
    if (importError) setError(importError.message)
    else { setRows((current) => [...(data ?? []), ...current]); setShowOcr(false); setNotice(`${data?.length || 0} σπουδαστές καταχωρίστηκαν. Οι αλλαγές καταγράφονται από το audit trail.`) }
    setBusy(false)
  }

  if (!isSupabaseConfigured) return <div className="data-card"><h2>Σπουδαστές</h2><p>Το Supabase δεν έχει ρυθμιστεί στο περιβάλλον εκτέλεσης.</p></div>

  return <section className="data-page">
    <div className="page-title-row"><div><p className="kicker">Μητρώο σπουδαστών</p><h1>👥 Σπουδαστές</h1><p>Κεντρικό μητρώο με δυνατότητα <strong>προσθήκης, διόρθωσης, διαγραφής και εισαγωγής από το έντυπο ISO</strong>.</p></div><span className="count-badge">{filteredRows.length} / {rows.length}</span></div>
    {notice && <div className="audit-note" style={{ marginBottom: '0.8rem' }}>{notice}</div>}
    {error && <div className="error-box" style={{ marginBottom: '0.8rem' }}>Αδυναμία ενέργειας: {error}</div>}
    {!showForm && !showOcr && <div className="toolbar" style={{ justifyContent: 'space-between' }}><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Αναζήτηση με ΑΜ, όνομα, επώνυμο…" aria-label="Αναζήτηση σπουδαστών" /><div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}><button type="button" className="secondary-button" onClick={loadStudents}>↻ Ανανέωση</button><button type="button" className="secondary-button" onClick={() => { setShowOcr(true); setShowForm(false) }}>📷 Εισαγωγή από ISO</button><button type="button" className="primary-button" onClick={() => { setEditing(null); setShowForm(true) }}>➕ Νέος σπουδαστής</button></div></div>}
    {showForm && <StudentForm row={editing} columns={columns} onCancel={() => { setShowForm(false); setEditing(null) }} onSave={saveStudent} busy={busy} />}
    {showOcr && <OcrImport existingRows={rows} columns={columns} onImport={importRows} onClose={() => setShowOcr(false)} />}
    {!showForm && !showOcr && <div className="data-card table-wrap">{loading ? <div className="loading">Φόρτωση σπουδαστών…</div> : error && !rows.length ? <div className="error-box">{error}</div> : rows.length === 0 ? <div className="empty-state compact"><div className="empty-icon">👥</div><h2>Δεν υπάρχουν εγγραφές</h2><p>Μπορείτε να δημιουργήσετε τον πρώτο σπουδαστή ή να εισαγάγετε το έντυπο ISO.</p></div> : <table><thead><tr><th>Ενέργειες</th>{columns.map((column) => <th key={column}>{labelFor(column)}</th>)}</tr></thead><tbody>{filteredRows.map((row, index) => <tr key={row.id ?? index}><td><div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}><button type="button" className="secondary-button" onClick={() => { setEditing(row); setShowForm(true); setShowOcr(false) }} disabled={busy}>✏️</button><button type="button" className="secondary-button" onClick={() => deleteStudent(row)} disabled={busy}>🗑️</button></div></td>{columns.map((column) => <td key={column}>{String(row[column] ?? '—')}</td>)}</tr>)}</tbody></table>}</div>}
  </section>
}
