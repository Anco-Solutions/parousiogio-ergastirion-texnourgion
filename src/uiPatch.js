const PERIODS = {
  WINTER: [
    ['A', 'Α'],
    ['D', 'Δ'],
    ['ST', 'ΣΤ'],
  ],
  SPRING: [
    ['B', 'Β'],
    ['G', 'Γ'],
    ['E', 'Ε'],
  ],
}

function setText(element, value) {
  if (element && element.textContent !== value) element.textContent = value
}

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
    const img = mark.querySelector('img')
    if (img) {
      img.alt = 'ΑΕΝ Ασπροπύργου – Σχολή Μηχανικών'
      img.classList.add('aen-logo-image')
    }
  }

  const loginHeading = [...document.querySelectorAll('h1')].find((h) => h.textContent.includes('Σύνδεση διαχειριστή'))
  if (loginHeading) loginHeading.classList.add('admin-login-title')

  const loginPage = loginHeading?.closest('.data-page')
  const loginForm = loginPage?.querySelector('form.data-card')
  if (loginForm) {
    loginForm.classList.add('admin-login-card')
    const labels = [...loginForm.querySelectorAll(':scope > label')]
    labels.forEach((label, index) => {
      label.classList.add('admin-login-field')
      if (index === 0) label.classList.add('admin-login-user')
      if (index === 1) label.classList.add('admin-login-password')
      const input = label.querySelector('input')
      if (input) input.classList.add('admin-login-input')
      const toggle = label.querySelector('button[type="button"]')
      if (toggle) toggle.classList.add('admin-password-toggle')
    })
    const submit = loginForm.querySelector('button.primary-button')
    if (submit) submit.classList.add('admin-login-submit')
  }

  const periodSelect = [...document.querySelectorAll('select')].find((s) => s.getAttribute('aria-label') === 'Επιλογή ακαδημαϊκής περιόδου')
  const semesterSelect = [...document.querySelectorAll('select')].find((s) => s.getAttribute('aria-label') === 'Επιλογή τρέχοντος εξαμήνου')
  if (!periodSelect || !semesterSelect) return

  const options = PERIODS[periodSelect.value] || PERIODS.WINTER
  const signature = `${periodSelect.value}:${options.map((x) => x[0]).join(',')}`
  if (semesterSelect.dataset.uiPatchSignature !== signature) {
    const current = semesterSelect.value
    semesterSelect.innerHTML = ''

    const placeholder = document.createElement('option')
    placeholder.value = ''
    placeholder.textContent = 'Επιλέξτε εξάμηνο'
    semesterSelect.appendChild(placeholder)

    for (const [code, label] of options) {
      const option = document.createElement('option')
      option.value = code
      option.textContent = label
      semesterSelect.appendChild(option)
    }

    semesterSelect.value = options.some(([code]) => code === current) ? current : ''
    semesterSelect.dataset.uiPatchSignature = signature
  }
}

function installLoginStyles() {
  if (document.getElementById('aen-login-polish')) return
  const style = document.createElement('style')
  style.id = 'aen-login-polish'
  style.textContent = `
    .aen-logo-mark {
      width: 112px !important;
      height: 112px !important;
      min-width: 112px !important;
      min-height: 112px !important;
      border-radius: 18px !important;
      background: #fff !important;
      border: 2px solid rgba(255,255,255,.7) !important;
      box-shadow: 0 8px 24px rgba(0,0,0,.18) !important;
      overflow: hidden !important;
      padding: 5px !important;
      box-sizing: border-box !important;
    }
    .aen-logo-image {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      border-radius: 12px !important;
      display: block !important;
    }
    .admin-login-card {
      width: min(100%, 680px) !important;
      max-width: 680px !important;
      margin: 28px auto 48px !important;
      padding: 34px 34px 30px !important;
      border-radius: 24px !important;
      border: 1px solid #dce5f1 !important;
      box-shadow: 0 18px 50px rgba(15,23,42,.10) !important;
      background: #fff !important;
    }
    .admin-login-title {
      letter-spacing: -.03em !important;
    }
    .admin-login-field {
      display: block !important;
      width: 100% !important;
      margin: 0 !important;
      color: #0f1b33 !important;
      font-size: 1.05rem !important;
      font-weight: 800 !important;
    }
    .admin-login-password { margin-top: 20px !important; }
    .admin-login-input {
      display: block !important;
      width: 100% !important;
      height: 62px !important;
      box-sizing: border-box !important;
      margin-top: 9px !important;
      padding: 0 20px !important;
      border: 2px solid #d7e2f0 !important;
      border-radius: 15px !important;
      background: #f8fafc !important;
      color: #0f172a !important;
      font-size: 1.12rem !important;
      outline: none !important;
      transition: border-color .18s ease, box-shadow .18s ease, background .18s ease !important;
    }
    .admin-login-input:focus {
      border-color: #3563e9 !important;
      background: #fff !important;
      box-shadow: 0 0 0 4px rgba(53,99,233,.12) !important;
    }
    .admin-login-password > div { position: relative !important; }
    .admin-login-password .admin-login-input { padding-right: 64px !important; }
    .admin-password-toggle {
      position: absolute !important;
      right: 10px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 46px !important;
      height: 46px !important;
      border: 0 !important;
      border-radius: 12px !important;
      background: transparent !important;
      color: #53657f !important;
      font-size: 1.45rem !important;
      cursor: pointer !important;
    }
    .admin-password-toggle:active { background: #edf3ff !important; }
    .admin-login-submit {
      width: 100% !important;
      min-height: 62px !important;
      margin-top: 24px !important;
      border-radius: 15px !important;
      font-size: 1.18rem !important;
      font-weight: 900 !important;
      letter-spacing: .01em !important;
      box-shadow: 0 10px 24px rgba(53,99,233,.22) !important;
    }
    @media (max-width: 650px) {
      .aen-logo-mark { width: 92px !important; height: 92px !important; min-width: 92px !important; min-height: 92px !important; }
      .admin-login-card { margin: 22px 0 36px !important; padding: 25px 18px 22px !important; border-radius: 20px !important; }
      .admin-login-input { height: 58px !important; font-size: 1.05rem !important; }
      .admin-login-submit { min-height: 58px !important; }
    }
  `
  document.head.appendChild(style)
}

let queued = false
function schedulePatch() {
  if (queued) return
  queued = true
  window.requestAnimationFrame(() => {
    queued = false
    applyPatch()
    installLoginStyles()
  })
}

const observer = new MutationObserver(schedulePatch)
observer.observe(document.documentElement, { childList: true, subtree: true })
window.addEventListener('change', (event) => {
  if (event.target?.matches?.('select[aria-label="Επιλογή ακαδημαϊκής περιόδου"]')) schedulePatch()
})
schedulePatch()
