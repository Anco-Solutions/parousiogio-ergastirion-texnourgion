import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

const emptyForm = { id: '', name: '', latitude: '', longitude: '', geofence_radius_meters: 50, active: true }

function googleMapsUrl(row) {
  return `https://www.google.com/maps?q=${row.latitude},${row.longitude}`
}

export default function AdminWorkshopsView() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    if (!supabase) return
    setLoading(true)
    setError('')
    const { data, error: queryError } = await supabase
      .from('workshop_locations')
      .select('id,name,latitude,longitude,geofence_radius_meters,active,created_at,updated_at')
      .order('name')
    if (queryError) setError(queryError.message)
    else setRows(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function change(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function useMyPosition() {
    setError('')
    setMessage('')
    if (!navigator.geolocation) {
      setError('Η συσκευή/φυλλομετρητής δεν υποστηρίζει εντοπισμό θέσης.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        const accuracy = position.coords.accuracy
        setForm((current) => ({ ...current, latitude, longitude }))
        setMessage(`📍 Η θέση λήφθηκε. Ακρίβεια GPS περίπου ${Math.round(accuracy)} m.`)
        setLocating(false)
      },
      (geoError) => {
        const messages = {
          1: 'Δεν δόθηκε άδεια πρόσβασης στην τοποθεσία. Ενεργοποίησε την Τοποθεσία για το Safari και ξαναδοκίμασε.',
          2: 'Δεν ήταν δυνατός ο εντοπισμός της θέσης. Δοκίμασε ξανά σε λίγο.',
          3: 'Ο εντοπισμός θέσης καθυστέρησε. Δοκίμασε ξανά.',
        }
        setError(messages[geoError.code] || 'Αποτυχία λήψης θέσης.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    )
  }

  function edit(row) {
    setMessage('')
    setError('')
    setForm({
      id: row.id,
      name: row.name || '',
      latitude: row.latitude ?? '',
      longitude: row.longitude ?? '',
      geofence_radius_meters: row.geofence_radius_meters ?? 50,
      active: row.active !== false,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function reset() {
    setForm(emptyForm)
    setMessage('')
    setError('')
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    const payload = {
      name: form.name.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      geofence_radius_meters: Number(form.geofence_radius_meters),
      active: Boolean(form.active),
    }
    if (!payload.name) { setError('Συμπλήρωσε όνομα εργαστηρίου.'); setSaving(false); return }
    if (!Number.isFinite(payload.latitude) || payload.latitude < -90 || payload.latitude > 90) { setError('Το γεωγραφικό πλάτος δεν είναι έγκυρο.'); setSaving(false); return }
    if (!Number.isFinite(payload.longitude) || payload.longitude < -180 || payload.longitude > 180) { setError('Το γεωγραφικό μήκος δεν είναι έγκυρο.'); setSaving(false); return }
    if (!Number.isFinite(payload.geofence_radius_meters) || payload.geofence_radius_meters <= 0) { setError('Η ακτίνα πρέπει να είναι μεγαλύτερη από 0 μέτρα.'); setSaving(false); return }

    const result = form.id
      ? await supabase.from('workshop_locations').update(payload).eq('id', form.id).select().single()
      : await supabase.from('workshop_locations').insert(payload).select().single()

    if (result.error) setError(`Αποτυχία αποθήκευσης: ${result.error.message}`)
    else {
      setMessage(form.id ? 'Το εργαστήριο ενημερώθηκε επιτυχώς.' : 'Το εργαστήριο προστέθηκε επιτυχώς.')
      setForm(emptyForm)
      await load()
    }
    setSaving(false)
  }

  async function deactivate(row) {
    if (!window.confirm(`Να απενεργοποιηθεί το «${row.name}»; Δεν θα εμφανίζεται πλέον στην καταχώρηση άφιξης.`)) return
    setError('')
    setMessage('')
    const { error: updateError } = await supabase.from('workshop_locations').update({ active: false }).eq('id', row.id)
    if (updateError) setError(`Αποτυχία απενεργοποίησης: ${updateError.message}`)
    else { setMessage('Το εργαστήριο απενεργοποιήθηκε και η ενέργεια καταγράφηκε στο ιστορικό.'); await load() }
  }

  async function activate(row) {
    setError('')
    setMessage('')
    const { error: updateError } = await supabase.from('workshop_locations').update({ active: true }).eq('id', row.id)
    if (updateError) setError(`Αποτυχία ενεργοποίησης: ${updateError.message}`)
    else { setMessage('Το εργαστήριο ενεργοποιήθηκε.'); await load() }
  }

  return <section className="data-page">
    <div className="page-title-row">
      <div><p className="kicker">Διαχείριση διαχειριστή</p><h1>⚙️ Εργαστήρια & χώροι</h1><p>Προσθήκη, αλλαγή και ενεργοποίηση/απενεργοποίηση χώρων με γεωγραφική ακτίνα.</p></div>
      <span className="count-badge">{rows.length} χώροι</span>
    </div>

    <form className="data-card" style={{ padding: '1.25rem' }} onSubmit={save}>
      <div className="section-heading"><p className="kicker">{form.id ? 'Επεξεργασία' : 'Νέο εργαστήριο'}</p><h2>{form.id ? '✏️ Επεξεργασία χώρου' : '➕ Προσθήκη εργαστηρίου'}</h2></div>
      <div style={{ display: 'grid', gap: '0.9rem' }}>
        <label>Ονομασία<input value={form.name} onChange={(e) => change('name', e.target.value)} placeholder="π.χ. Εργαστήριο Προσομοιωτή" /></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.9rem' }}>
          <label>Γεωγραφικό πλάτος<input type="number" step="any" value={form.latitude} onChange={(e) => change('latitude', e.target.value)} placeholder="38.0388302" /></label>
          <label>Γεωγραφικό μήκος<input type="number" step="any" value={form.longitude} onChange={(e) => change('longitude', e.target.value)} placeholder="23.5862993" /></label>
          <label>Ακτίνα GPS (μέτρα)<input type="number" min="1" step="1" value={form.geofence_radius_meters} onChange={(e) => change('geofence_radius_meters', e.target.value)} /></label>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="secondary-button" type="button" onClick={useMyPosition} disabled={locating}>
            {locating ? '📡 Εντοπισμός θέσης…' : '📍 Πάρε τη θέση μου'}
          </button>
          <span style={{ opacity: 0.8 }}>Βρίσκεσαι στο εργαστήριο; Πάτησέ το και οι συντεταγμένες συμπληρώνονται αυτόματα.</span>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}><input type="checkbox" checked={form.active} onChange={(e) => change('active', e.target.checked)} /> Ενεργό εργαστήριο</label>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Αποθήκευση…' : form.id ? '💾 Αποθήκευση αλλαγών' : '➕ Προσθήκη εργαστηρίου'}</button>
        {form.id && <button className="secondary-button" type="button" onClick={reset}>Άκυρο / Νέο</button>}
      </div>
      {error && <div className="error-box" style={{ marginTop: '1rem' }}>{error}</div>}
      {message && <div className="audit-note" style={{ marginTop: '1rem' }}><span>{message}</span></div>}
    </form>

    <div className="data-card table-wrap" style={{ marginTop: '1rem' }}>
      {loading ? <div className="loading">Φόρτωση εργαστηρίων…</div> : rows.length === 0 ? <div className="empty-state compact"><div className="empty-icon">🏫</div><h2>Δεν υπάρχουν χώροι</h2><p>Πρόσθεσε το πρώτο εργαστήριο από την παραπάνω φόρμα.</p></div> : <table>
        <thead><tr><th>Εργαστήριο</th><th>Συντεταγμένες</th><th>Ακτίνα</th><th>Κατάσταση</th><th>Ενέργειες</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id}>
          <td><strong>{row.name}</strong></td>
          <td className="mono-cell">{Number(row.latitude).toFixed(6)}, {Number(row.longitude).toFixed(6)}</td>
          <td>{Math.round(row.geofence_radius_meters)} m</td>
          <td>{row.active ? '🟢 Ενεργό' : '⚪ Ανενεργό'}</td>
          <td><div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="secondary-button" type="button" onClick={() => edit(row)}>✏️ Επεξεργασία</button>
            <a className="secondary-button" href={googleMapsUrl(row)} target="_blank" rel="noreferrer">📍 Χάρτης</a>
            {row.active ? <button className="secondary-button" type="button" onClick={() => deactivate(row)}>⏸️ Απενεργοποίηση</button> : <button className="secondary-button" type="button" onClick={() => activate(row)}>▶️ Ενεργοποίηση</button>}
          </div></td>
        </tr>)}</tbody>
      </table>}
    </div>
  </section>
}
