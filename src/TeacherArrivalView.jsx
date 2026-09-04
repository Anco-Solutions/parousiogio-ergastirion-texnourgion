import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

const DEFAULT_RADIUS = 100

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Η συσκευή δεν υποστηρίζει γεωεντοπισμό.'))
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
  })
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (value) => value * Math.PI / 180
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function TeacherArrivalView() {
  const [locations, setLocations] = useState([])
  const [locationId, setLocationId] = useState('')
  const [delayMinutes, setDelayMinutes] = useState(0)
  const [delayReason, setDelayReason] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [lastCheck, setLastCheck] = useState(null)

  useEffect(() => {
    async function loadLocations() {
      if (!supabase) return
      const { data } = await supabase.from('workshop_locations').select('id,name,latitude,longitude,geofence_radius_meters').order('name')
      setLocations(data || [])
      if (data?.[0]) setLocationId(data[0].id)
    }
    loadLocations()
  }, [])

  async function captureLocation() {
    setMessage('')
    setBusy(true)
    try {
      const selected = locations.find((item) => item.id === locationId)
      if (!selected) throw new Error('Δεν έχει οριστεί χώρος εργαστηρίου.')
      const position = await getPosition()
      const { latitude, longitude, accuracy } = position.coords
      const distance = distanceMeters(latitude, longitude, selected.latitude, selected.longitude)
      const radius = selected.geofence_radius_meters ?? DEFAULT_RADIUS
      const passed = distance <= radius
      setLastCheck({ latitude, longitude, accuracy, distance, radius, passed })
      return { selected, latitude, longitude, accuracy, distance, radius, passed }
    } catch (error) {
      setMessage(error.code === 1 ? 'Η άδεια τοποθεσίας απορρίφθηκε. Ενεργοποίησε την τοποθεσία για την καταχώρηση.' : error.message)
      return null
    } finally { setBusy(false) }
  }

  async function declareDelay() {
    const result = await captureLocation()
    if (!result) return
    setBusy(true)
    const { selected, latitude, longitude, accuracy, distance, radius, passed } = result
    const { error } = await supabase.from('teacher_arrivals').insert({
      scheduled_at: new Date().toISOString(), status: 'delay_declared', delay_minutes: Number(delayMinutes) || 0,
      delay_reason: delayReason || null, latitude, longitude, gps_accuracy_meters: accuracy,
      distance_meters: distance, geofence_radius_meters: radius, geofence_passed: passed,
      location_captured_at: new Date().toISOString()
    })
    setBusy(false)
    if (error) setMessage(`Αποτυχία καταγραφής: ${error.message}`)
    else setMessage(`Η καθυστέρηση καταγράφηκε. Απόσταση από ${selected.name}: ${Math.round(distance)} m.`)
  }

  async function markArrived() {
    const result = await captureLocation()
    if (!result) return
    const { selected, latitude, longitude, accuracy, distance, radius, passed } = result
    if (!passed) { setMessage(`Δεν επιτρέπεται άφιξη: βρίσκεσαι περίπου ${Math.round(distance)} m από το εργαστήριο (όριο ${Math.round(radius)} m).`); return }
    setBusy(true)
    const { error } = await supabase.from('teacher_arrivals').insert({
      scheduled_at: new Date().toISOString(), arrival_at: new Date().toISOString(), status: 'arrived',
      latitude, longitude, gps_accuracy_meters: accuracy, distance_meters: distance,
      geofence_radius_meters: radius, geofence_passed: true, location_captured_at: new Date().toISOString()
    })
    setBusy(false)
    if (error) setMessage(`Αποτυχία καταγραφής: ${error.message}`)
    else setMessage(`Άφιξη καταγράφηκε επιτυχώς στον χώρο ${selected.name}.`)
  }

  return <section className="data-page">
    <div className="page-title-row"><div><p className="kicker">Έλεγχος άφιξης</p><h1>🕐 Άφιξη καθηγητή</h1><p>Η θέση και η ώρα καταγράφονται μαζί με τον έλεγχο γεωγραφικής ακτίνας.</p></div></div>
    <div className="data-card" style={{ padding: '1.25rem' }}>
      <label>Εργαστήριο / χώρος<select className="semester-select" value={locationId} onChange={(e) => setLocationId(e.target.value)}><option value="">Επιλογή χώρου…</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
        <label>Λεπτά καθυστέρησης<input type="number" min="0" value={delayMinutes} onChange={(e) => setDelayMinutes(e.target.value)} /></label>
        <label>Αιτιολογία καθυστέρησης<textarea value={delayReason} onChange={(e) => setDelayReason(e.target.value)} placeholder="Προαιρετικά…" /></label>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <button type="button" className="secondary-button" disabled={busy || !locationId} onClick={declareDelay}>🟠 Δηλώνω καθυστέρηση</button>
        <button type="button" className="primary-button" disabled={busy || !locationId} onClick={markArrived}>🟢 Αφίχθηκα</button>
      </div>
      {lastCheck && <div className="audit-note" style={{ marginTop: '1rem' }}><strong>{lastCheck.passed ? '✅ Εντός ακτίνας' : '❌ Εκτός ακτίνας'}</strong><span>Απόσταση: {Math.round(lastCheck.distance)} m · Όριο: {Math.round(lastCheck.radius)} m · Ακρίβεια GPS: περίπου {Math.round(lastCheck.accuracy)} m</span></div>}
      {message && <div className="audit-note" style={{ marginTop: '1rem' }}><span>{message}</span></div>}
    </div>
  </section>
}
