const PERIODS = { WINTER: [['A','Α'],['D','Δ'],['ST','ΣΤ']], SPRING: [['B','Β'],['G','Γ'],['E','Ε']] }

function setText(el, value) { if (el && el.textContent !== value) el.textContent = value }

function applyPatch() {
  const eyebrow = document.querySelector('.brand-button .eyebrow')
  const brand = document.querySelector('.brand-button strong')
  const mark = document.querySelector('.brand-mark')
  const title = document.querySelector('.hero h1')
  const copy = document.querySelector('.hero-copy')
  setText(eyebrow, 'ΑΕΝ ΑΣΠΡΟΠΥΡΓΟΥ • ΣΧΟΛΗ ΜΗΧΑΝΙΚΩΝ')
  setText(brand, 'Παρουσιολόγια')
  setText(title, 'Παρουσιολόγια Εργαστηρίων – Τεχνουργείων')
  setText(copy, 'Κεντρικό περιβάλλον για σπουδαστές, ομάδες, μαθήματα, καθηγητές, πρόγραμμα και παρουσιολόγια εργαστηρίων – τεχνουργείων.')

  if (mark) {
    mark.classList.add('aen-logo-mark')
    if (!mark.dataset.aenLogoRendered) {
      mark.innerHTML = '<svg class="aen-inline-logo" viewBox="0 0 400 400" role="img" aria-label="ΑΕΝ Ασπροπύργου – Σχολή Μηχανικών"><rect width="400" height="400" rx="42" fill="#fff"/><circle cx="200" cy="200" r="166" fill="#f8fafc" stroke="#174b78" stroke-width="12"/><circle cx="200" cy="200" r="140" fill="none" stroke="#9bb7cf" stroke-width="4"/><g fill="#174b78"><path d="M200 45l22 112-22 43-22-43z"/><path d="M355 200l-112 22-43-22 43-22z"/><path d="M200 355l-22-112 22-43 22 43z"/><path d="M45 200l112-22 43 22-43 22z"/></g><circle cx="200" cy="200" r="66" fill="#fff" stroke="#174b78" stroke-width="7"/><path d="M200 148c18 0 31 13 31 29 0 14-11 22-24 27 13 5 24 14 24 29 0 16-13 29-31 29s-31-13-31-29c0-15 11-24 24-29-13-5-24-13-24-27 0-16 13-29 31-29z" fill="#174b78"/><circle cx="200" cy="205" r="13" fill="#fff"/><text x="200" y="77" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="800" letter-spacing="2" fill="#174b78">ΣΧΟΛΗ ΜΗΧΑΝΙΚΩΝ</text><text x="200" y="335" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="900" letter-spacing="1.5" fill="#174b78">ΑΕΝ ΑΣΠΡΟΠΥΡΓΟΥ</text></svg>'
      mark.dataset.aenLogoRendered = 'true'
    }
  }

  const heading = [...document.querySelectorAll('h1')].find(h => h.textContent.includes('Σύνδεση διαχειριστή'))
  const page = heading?.closest('.data-page')
  const form = page?.querySelector('form.data-card')
  if (heading) heading.classList.add('admin-login-title')
  if (form) {
    form.classList.add('admin-login-card')
    ;[...form.querySelectorAll(':scope > label')].forEach((label, i) => {
      label.classList.add('admin-login-field')
      if (i === 1) label.classList.add('admin-login-password')
      const input = label.querySelector('input')
      if (input) input.classList.add('admin-login-input')
      const toggle = label.querySelector('button[type="button"]')
      if (toggle) toggle.classList.add('admin-password-toggle')
    })
    form.querySelector('button.primary-button')?.classList.add('admin-login-submit')
  }

  const period = [...document.querySelectorAll('select')].find(s => s.getAttribute('aria-label') === 'Επιλογή ακαδημαϊκής περιόδου')
  const semester = [...document.querySelectorAll('select')].find(s => s.getAttribute('aria-label') === 'Επιλογή τρέχοντος εξαμήνου')
  if (!period || !semester) return
  const options = PERIODS[period.value] || PERIODS.WINTER
  const signature = `${period.value}:${options.map(x => x[0]).join(',')}`
  if (semester.dataset.uiPatchSignature !== signature) {
    semester.innerHTML = '<option value="">Επιλέξτε εξάμηνο</option>'
    options.forEach(([code, label]) => { const o = document.createElement('option'); o.value = code; o.textContent = label; semester.appendChild(o) })
    semester.dataset.uiPatchSignature = signature
  }
}

function installStyles() {
  if (document.getElementById('aen-login-polish')) return
  const style = document.createElement('style')
  style.id = 'aen-login-polish'
  style.textContent = `.aen-logo-mark{width:112px!important;height:112px!important;min-width:112px!important;min-height:112px!important;border-radius:18px!important;background:#fff!important;border:2px solid rgba(255,255,255,.75)!important;box-shadow:0 8px 24px rgba(0,0,0,.18)!important;overflow:hidden!important;padding:4px!important;box-sizing:border-box!important}.aen-inline-logo{width:100%!important;height:100%!important;display:block!important}.admin-login-card{width:min(100%,680px)!important;max-width:680px!important;margin:28px auto 48px!important;padding:34px!important;border-radius:24px!important;border:1px solid #dce5f1!important;box-shadow:0 18px 50px rgba(15,23,42,.10)!important;background:#fff!important}.admin-login-title{letter-spacing:-.03em!important}.admin-login-field{display:block!important;width:100%!important;margin:0!important;color:#0f1b33!important;font-size:1.05rem!important;font-weight:800!important}.admin-login-password{margin-top:20px!important}.admin-login-input{display:block!important;width:100%!important;height:62px!important;box-sizing:border-box!important;margin-top:9px!important;padding:0 20px!important;border:2px solid #d7e2f0!important;border-radius:15px!important;background:#f8fafc!important;color:#0f172a!important;font-size:1.12rem!important;outline:none!important}.admin-login-input:focus{border-color:#3563e9!important;background:#fff!important;box-shadow:0 0 0 4px rgba(53,99,233,.12)!important}.admin-login-password>div{position:relative!important}.admin-login-password .admin-login-input{padding-right:64px!important}.admin-password-toggle{position:absolute!important;right:10px!important;top:50%!important;transform:translateY(-50%)!important;width:46px!important;height:46px!important;border:0!important;border-radius:12px!important;background:transparent!important;color:#53657f!important;font-size:1.45rem!important;cursor:pointer!important}.admin-login-submit{width:100%!important;min-height:62px!important;margin-top:24px!important;border-radius:15px!important;font-size:1.18rem!important;font-weight:900!important;box-shadow:0 10px 24px rgba(53,99,233,.22)!important}@media(max-width:650px){.aen-logo-mark{width:92px!important;height:92px!important;min-width:92px!important;min-height:92px!important}.admin-login-card{margin:22px 0 36px!important;padding:25px 18px 22px!important;border-radius:20px!important}.admin-login-input{height:58px!important;font-size:1.05rem!important}.admin-login-submit{min-height:58px!important}}`
  document.head.appendChild(style)
}

let queued = false
function schedulePatch() { if (queued) return; queued = true; window.requestAnimationFrame(() => { queued = false; applyPatch(); installStyles() }) }
const observer = new MutationObserver(schedulePatch)
observer.observe(document.documentElement, { childList:true, subtree:true })
window.addEventListener('change', e => { if (e.target?.matches?.('select[aria-label="Επιλογή ακαδημαϊκής περιόδου"]')) schedulePatch() })
schedulePatch()
