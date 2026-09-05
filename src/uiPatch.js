const PERIODS = { WINTER: [['A','Α'],['D','Δ'],['ST','ΣΤ']], SPRING: [['B','Β'],['G','Γ'],['E','Ε']] }

function setText(el, value) {
  if (el && el.textContent !== value) el.textContent = value
}

function applyBrand() {
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
      mark.innerHTML = '<svg class="aen-inline-logo" viewBox="0 0 400 400" role="img" aria-label="ΑΕΝ Ασπροπύργου – Σχολή Μηχανικών"><rect width="400" height="400" rx="44" fill="#ffffff"/><circle cx="200" cy="200" r="166" fill="#f7fbff" stroke="#174b78" stroke-width="12"/><circle cx="200" cy="200" r="142" fill="none" stroke="#86a9c5" stroke-width="5"/><g fill="#174b78"><path d="M200 40l25 120-25 45-25-45z"/><path d="M360 200l-120 25-45-25 45-25z"/><path d="M200 360l-25-120 25-45 25 45z"/><path d="M40 200l120-25 45 25-45 25z"/></g><circle cx="200" cy="200" r="69" fill="#fff" stroke="#174b78" stroke-width="8"/><path d="M200 145c19 0 33 14 33 31 0 14-10 23-25 29 15 6 25 15 25 30 0 17-14 31-33 31s-33-14-33-31c0-15 10-24 25-30-15-6-25-15-25-29 0-17 14-31 33-31z" fill="#174b78"/><circle cx="200" cy="205" r="14" fill="#fff"/><text x="200" y="79" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" font-weight="800" letter-spacing="1.8" fill="#174b78">ΣΧΟΛΗ ΜΗΧΑΝΙΚΩΝ</text><text x="200" y="338" text-anchor="middle" font-family="Arial,sans-serif" font-size="29" font-weight="900" letter-spacing="1.2" fill="#174b78">ΑΕΝ ΑΣΠΡΟΠΥΡΓΟΥ</text></svg>'
      mark.dataset.aenLogoRendered = 'true'
    }
  }
}

function applyLogin() {
  const heading = [...document.querySelectorAll('h1')].find(h => h.textContent.includes('Σύνδεση διαχειριστή'))
  const page = heading?.closest('.data-page')
  const form = page?.querySelector('form.data-card')
  if (!heading || !form) return

  heading.classList.add('admin-login-title')
  if (!heading.dataset.loginIcon) {
    heading.textContent = 'Σύνδεση διαχειριστή'
    const icon = document.createElement('span')
    icon.className = 'admin-login-icon'
    icon.setAttribute('aria-hidden', 'true')
    icon.textContent = '🔒'
    heading.parentElement.insertBefore(icon, heading)
    heading.dataset.loginIcon = 'true'
  }

  const intro = heading.parentElement.querySelector('p:not(.kicker)')
  if (intro) setText(intro, 'Σύνδεση ως admin για ασφαλή πρόσβαση στη διαχείριση.')

  form.classList.add('admin-login-card')
  ;[...form.querySelectorAll(':scope > label')].forEach((label, i) => {
    label.classList.add('admin-login-field')
    if (i === 1) label.classList.add('admin-login-password')
    const input = label.querySelector('input')
    if (input) input.classList.add('admin-login-input')
    const toggle = label.querySelector('button[type="button"]')
    if (toggle) {
      toggle.classList.add('admin-password-toggle')
      toggle.textContent = toggle.textContent.includes('🙈') ? '◉' : '◉'
    }
  })
  const labels = form.querySelectorAll(':scope > label')
  if (labels[0]) labels[0].firstChild.textContent = 'Όνομα χρήστη'
  if (labels[1]) labels[1].firstChild.textContent = 'Κωδικός πρόσβασης'
  const submit = form.querySelector('button.primary-button')
  if (submit) {
    submit.classList.add('admin-login-submit')
    if (!submit.dataset.loginIcon) {
      submit.textContent = ''
      const icon = document.createElement('span')
      icon.textContent = '🔐'
      icon.setAttribute('aria-hidden', 'true')
      submit.append(icon, document.createTextNode(' Σύνδεση'))
      submit.dataset.loginIcon = 'true'
    }
  }
}

function applySemesterOptions() {
  const period = [...document.querySelectorAll('select')].find(s => s.getAttribute('aria-label') === 'Επιλογή ακαδημαϊκής περιόδου')
  const semester = [...document.querySelectorAll('select')].find(s => s.getAttribute('aria-label') === 'Επιλογή τρέχοντος εξαμήνου')
  if (!period || !semester) return
  const options = PERIODS[period.value] || PERIODS.WINTER
  const signature = `${period.value}:${options.map(x => x[0]).join(',')}`
  if (semester.dataset.uiPatchSignature === signature) return
  semester.innerHTML = '<option value="">Επιλέξτε εξάμηνο</option>'
  options.forEach(([code, label]) => {
    const option = document.createElement('option')
    option.value = code
    option.textContent = label
    semester.appendChild(option)
  })
  semester.value = ''
  semester.dataset.uiPatchSignature = signature
}

function installStyles() {
  if (document.getElementById('aen-visual-polish')) return
  const style = document.createElement('style')
  style.id = 'aen-visual-polish'
  style.textContent = `
.topbar{min-height:96px!important;padding:14px clamp(16px,4vw,56px)!important;background:linear-gradient(120deg,#071b31 0%,#0d3155 55%,#174b78 100%)!important;box-shadow:0 5px 22px rgba(7,27,49,.18)!important;position:relative!important;z-index:2!important}
.brand-button{gap:16px!important;align-items:center!important}
.brand-button>span:last-child{gap:2px!important}
.brand-button strong{font-size:clamp(23px,3vw,31px)!important;letter-spacing:-.02em!important}
.brand-button .eyebrow{font-size:11px!important;letter-spacing:.12em!important;color:#dbeafe!important}
.aen-logo-mark{width:76px!important;height:76px!important;min-width:76px!important;min-height:76px!important;border-radius:18px!important;background:#fff!important;border:2px solid rgba(255,255,255,.85)!important;box-shadow:0 8px 25px rgba(0,0,0,.2)!important;overflow:hidden!important;padding:3px!important;box-sizing:border-box!important}
.aen-inline-logo{width:100%!important;height:100%!important;display:block!important}
.hero{grid-template-columns:minmax(0,1fr) 300px!important;gap:24px!important;margin-bottom:28px!important;padding:30px 32px!important;border-radius:24px!important;background:linear-gradient(115deg,#0a2340 0%,#123d67 62%,#174b78 100%)!important;color:#fff!important;box-shadow:0 16px 38px rgba(10,35,64,.18)!important;position:relative!important;overflow:hidden!important}
.hero:after{content:"";position:absolute;right:-90px;bottom:-105px;width:360px;height:240px;border-radius:50%;border:2px solid rgba(255,255,255,.10);box-shadow:0 0 0 22px rgba(255,255,255,.025),0 0 0 44px rgba(255,255,255,.018);pointer-events:none!important}
.hero .kicker{color:#bfdbfe!important}
.hero h1{color:#fff!important;max-width:820px!important;font-size:clamp(31px,4.4vw,50px)!important}
.hero-copy{color:#dbeafe!important;max-width:760px!important;font-size:16px!important}
.semester-card{position:relative!important;z-index:1!important;background:rgba(255,255,255,.98)!important;border:1px solid rgba(255,255,255,.55)!important;box-shadow:0 12px 30px rgba(0,0,0,.14)!important}
.semester-card strong{color:#0f2945!important}
.module-card{border-color:#dbe5ef!important}
.module-icon{background:#edf5fb!important;color:#174b78!important}
.nav-item.active{background:#eaf3fb!important;color:#174b78!important}
.primary-button{background:linear-gradient(135deg,#2563eb,#174b78)!important}
.admin-login-card{width:min(100%,680px)!important;max-width:680px!important;margin:20px auto 48px!important;padding:34px!important;border-radius:24px!important;border:1px solid #d9e4f0!important;box-shadow:0 18px 50px rgba(15,23,42,.10)!important;background:#fff!important}
.admin-login-title{margin:0!important;letter-spacing:-.035em!important;color:#0b2340!important;text-align:center!important;font-size:clamp(31px,4vw,45px)!important}
.admin-login-icon{width:72px!important;height:72px!important;margin:6px auto 16px!important;display:grid!important;place-items:center!important;border-radius:50%!important;background:#e8f1ff!important;font-size:32px!important;box-shadow:inset 0 0 0 1px #d4e3f8!important}
.admin-login-title+ p{color:#71819a!important;text-align:center!important;font-size:17px!important;line-height:1.5!important;max-width:520px!important;margin:10px auto 28px!important}
.admin-login-field{display:block!important;width:100%!important;margin:0!important;color:#0f1b33!important;font-size:1.05rem!important;font-weight:800!important}
.admin-login-password{margin-top:20px!important}
.admin-login-input{display:block!important;width:100%!important;height:62px!important;box-sizing:border-box!important;margin-top:9px!important;padding:0 20px!important;border:2px solid #d7e2f0!important;border-radius:15px!important;background:#f8fafc!important;color:#0f172a!important;font-size:1.12rem!important;outline:none!important}
.admin-login-input:focus{border-color:#3563e9!important;background:#fff!important;box-shadow:0 0 0 4px rgba(53,99,233,.12)!important}
.admin-login-password>div{position:relative!important}
.admin-login-password .admin-login-input{padding-right:64px!important}
.admin-password-toggle{position:absolute!important;right:10px!important;top:50%!important;transform:translateY(-50%)!important;width:46px!important;height:46px!important;border:0!important;border-radius:12px!important;background:transparent!important;color:#53657f!important;font-size:1.25rem!important;cursor:pointer!important}
.admin-login-submit{width:100%!important;min-height:62px!important;margin-top:24px!important;border-radius:15px!important;font-size:1.18rem!important;font-weight:900!important;box-shadow:0 10px 24px rgba(23,75,120,.22)!important}
@media(max-width:900px){.hero{grid-template-columns:1fr!important}.semester-card{max-width:100%!important}}
@media(max-width:650px){.topbar{min-height:90px!important;padding:12px!important}.aen-logo-mark{width:64px!important;height:64px!important;min-width:64px!important;min-height:64px!important;border-radius:15px!important}.brand-button{gap:12px!important}.brand-button strong{font-size:22px!important}.brand-button .eyebrow{font-size:9px!important;letter-spacing:.09em!important}.hero{padding:24px 18px!important;border-radius:20px!important}.hero h1{font-size:32px!important}.hero-copy{font-size:15px!important}.admin-login-card{margin:18px 0 36px!important;padding:25px 18px 22px!important;border-radius:20px!important}.admin-login-icon{width:62px!important;height:62px!important;font-size:28px!important}.admin-login-input{height:58px!important;font-size:1.05rem!important}.admin-login-submit{min-height:58px!important}}
`
  document.head.appendChild(style)
}

let queued = false
function schedulePatch() {
  if (queued) return
  queued = true
  window.requestAnimationFrame(() => {
    queued = false
    applyBrand()
    applyLogin()
    applySemesterOptions()
    installStyles()
  })
}

const observer = new MutationObserver(schedulePatch)
observer.observe(document.documentElement, { childList:true, subtree:true })
window.addEventListener('change', event => {
  if (event.target?.matches?.('select[aria-label="Επιλογή ακαδημαϊκής περιόδου"]')) schedulePatch()
})
schedulePatch()
