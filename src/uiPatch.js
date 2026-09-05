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
      mark.innerHTML = '<svg class="aen-inline-logo" viewBox="0 0 400 400" role="img" aria-label="ΑΕΝ Ασπροπύργου – Σχολή Μηχανικών"><rect width="400" height="400" rx="44" fill="#fff"/><circle cx="200" cy="200" r="166" fill="#f8fafc" stroke="#174b78" stroke-width="12"/><circle cx="200" cy="200" r="140" fill="none" stroke="#9bb7cf" stroke-width="4"/><g fill="#174b78"><path d="M200 42l25 118-25 42-25-42z"/><path d="M358 200l-118 25-42-25 42-25z"/><path d="M200 358l-25-118 25-42 25 42z"/><path d="M42 200l118-25 42 25-42 25z"/></g><circle cx="200" cy="200" r="66" fill="#fff" stroke="#174b78" stroke-width="7"/><path d="M200 148c18 0 31 13 31 29 0 14-11 22-24 27 13 5 24 14 24 29 0 16-13 29-31 29s-31-13-31-29c0-15 11-24 24-29-13-5-24-13-24-27 0-16 13-29 31-29z" fill="#174b78"/><circle cx="200" cy="205" r="13" fill="#fff"/><text x="200" y="78" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="800" letter-spacing="2" fill="#174b78">ΣΧΟΛΗ ΜΗΧΑΝΙΚΩΝ</text><text x="200" y="336" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="900" letter-spacing="1.5" fill="#174b78">ΑΕΝ ΑΣΠΡΟΠΥΡΓΟΥ</text></svg>'
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
  if (period && semester) {
    const options = PERIODS[period.value] || PERIODS.WINTER
    const signature = `${period.value}:${options.map(x => x[0]).join(',')}`
    if (semester.dataset.uiPatchSignature !== signature) {
      semester.innerHTML = '<option value="">Επιλέξτε εξάμηνο</option>'
      options.forEach(([code, label]) => { const o = document.createElement('option'); o.value = code; o.textContent = label; semester.appendChild(o) })
      semester.dataset.uiPatchSignature = signature
    }
  }
}

function installStyles() {
  if (document.getElementById('aen-login-polish')) return
  const style = document.createElement('style')
  style.id = 'aen-login-polish'
  style.textContent = `
  body{background:#eef3f9!important}
  .topbar{min-height:0!important;height:auto!important;padding:24px clamp(22px,6vw,76px) 30px!important;background:linear-gradient(135deg,#06192d 0%,#0c3158 52%,#123f6d 100%)!important;position:relative!important;overflow:hidden!important;box-shadow:0 8px 30px rgba(4,20,38,.20)!important}
  .topbar:after{content:"";position:absolute;left:-5%;right:-5%;bottom:-64px;height:120px;border-top:2px solid rgba(255,255,255,.10);border-radius:50%;box-shadow:0 -20px 0 rgba(255,255,255,.035),0 -42px 0 rgba(255,255,255,.025);pointer-events:none}
  .brand-button{position:relative!important;z-index:2!important;gap:26px!important;align-items:center!important;min-width:0!important}
  .brand-button>span:last-child{min-width:0!important;display:flex!important;flex-direction:column!important;justify-content:center!important}
  .brand-button strong{order:1!important;color:#fff!important;font-size:clamp(38px,6vw,68px)!important;line-height:.98!important;letter-spacing:-.04em!important;font-weight:900!important}
  .brand-button .eyebrow{order:2!important;margin:16px 0 0!important;color:#d9eaff!important;font-size:clamp(12px,1.7vw,20px)!important;letter-spacing:.22em!important;font-weight:800!important;text-transform:uppercase!important}
  .aen-logo-mark{width:190px!important;height:190px!important;min-width:190px!important;min-height:190px!important;border-radius:28px!important;background:#fff!important;border:3px solid rgba(255,255,255,.78)!important;box-shadow:0 12px 34px rgba(0,0,0,.22)!important;overflow:hidden!important;padding:5px!important;box-sizing:border-box!important}
  .aen-inline-logo{width:100%!important;height:100%!important;display:block!important}
  .connection{position:relative!important;z-index:3!important;align-self:flex-start!important;margin-top:8px!important;background:rgba(255,255,255,.08)!important;color:#dbeafe!important;border-color:rgba(255,255,255,.20)!important}
  .layout{display:block!important;min-height:0!important}
  .sidebar{background:#fff!important;border:0!important;border-bottom:1px solid #e0e7f0!important;padding:10px clamp(12px,4vw,54px)!important;display:flex!important;align-items:center!important;gap:8px!important;overflow-x:auto!important;box-shadow:0 4px 18px rgba(15,23,42,.06)!important}
  .nav-label{display:none!important}
  .nav-item{width:auto!important;min-width:max-content!important;padding:12px 16px!important;border-radius:13px!important;color:#5b6d86!important;font-size:15px!important;font-weight:750!important;gap:9px!important;background:transparent!important}
  .nav-item span{width:28px!important;font-size:23px!important}
  .nav-item.active{background:#eaf2ff!important;color:#163f70!important;box-shadow:inset 0 -2px 0 #2f6edb!important}
  main{max-width:1180px!important;padding:34px clamp(18px,4vw,52px) 60px!important}
  .hero{display:none!important}
  .data-page{min-height:0!important}
  .data-page .page-title-row{margin-top:4px!important}
  .admin-login-card{width:min(100%,860px)!important;max-width:860px!important;margin:28px auto 50px!important;padding:42px 44px 38px!important;border-radius:28px!important;border:1px solid #dce5f1!important;box-shadow:0 22px 65px rgba(15,23,42,.12)!important;background:rgba(255,255,255,.97)!important}
  .admin-login-title{margin-top:14px!important;text-align:center!important;color:#0b2445!important;font-size:clamp(34px,5vw,54px)!important;letter-spacing:-.045em!important}
  .admin-login-card:before{content:"🔒";display:grid;place-items:center;width:78px;height:78px;margin:0 auto 18px;border-radius:50%;background:#eaf2ff;font-size:38px}
  .admin-login-card:after{content:"ΑΕΝ ΑΣΠΡΟΠΥΡΓΟΥ • ΣΧΟΛΗ ΜΗΧΑΝΙΚΩΝ\\AΠαρουσιολόγια Εργαστηρίων";white-space:pre;display:block;text-align:center;margin-top:28px;padding-top:22px;border-top:1px solid #dce5f1;color:#516681;font-size:14px;line-height:1.7;font-weight:700}
  .admin-login-field{display:block!important;width:100%!important;margin:0!important;color:#0d2445!important;font-size:18px!important;font-weight:850!important}
  .admin-login-password{margin-top:22px!important}
  .admin-login-input{display:block!important;width:100%!important;height:68px!important;box-sizing:border-box!important;margin-top:9px!important;padding:0 22px!important;border:2px solid #c8d8ed!important;border-radius:16px!important;background:#f8fafc!important;color:#0b1f3d!important;font-size:19px!important;outline:none!important}
  .admin-login-input:focus{border-color:#3c76d8!important;background:#fff!important;box-shadow:0 0 0 4px rgba(60,118,216,.12)!important}
  .admin-login-password>div{position:relative!important}
  .admin-login-password .admin-login-input{padding-right:68px!important}
  .admin-password-toggle{position:absolute!important;right:10px!important;top:50%!important;transform:translateY(-50%)!important;width:48px!important;height:48px!important;border:0!important;border-radius:12px!important;background:transparent!important;color:#5b6d86!important;font-size:22px!important;cursor:pointer!important}
  .admin-login-submit{width:100%!important;min-height:68px!important;margin-top:26px!important;border-radius:16px!important;background:linear-gradient(135deg,#1769e8,#2d6fe4)!important;font-size:20px!important;font-weight:900!important;box-shadow:0 12px 28px rgba(37,99,235,.25)!important}
  .admin-login-card .error-box{margin-top:16px!important}
  @media(max-width:900px){.topbar{padding:20px 18px 26px!important}.brand-button{gap:18px!important}.aen-logo-mark{width:132px!important;height:132px!important;min-width:132px!important;min-height:132px!important}.connection{display:none!important}.sidebar{padding:9px 12px!important}.nav-item{padding:10px 13px!important;font-size:14px!important}.nav-item span{font-size:21px!important}.admin-login-card{padding:34px 28px 30px!important}}
  @media(max-width:650px){.topbar{padding:16px 14px 24px!important}.brand-button{gap:14px!important}.aen-logo-mark{width:92px!important;height:92px!important;min-width:92px!important;min-height:92px!important;border-radius:18px!important}.brand-button strong{font-size:clamp(34px,10vw,48px)!important}.brand-button .eyebrow{font-size:10px!important;letter-spacing:.16em!important;margin-top:10px!important}.sidebar{gap:4px!important}.nav-item{padding:9px 10px!important;font-size:13px!important}.nav-item span{width:24px!important;font-size:19px!important}.admin-login-card{margin:20px 0 36px!important;padding:28px 18px 24px!important;border-radius:22px!important}.admin-login-title{font-size:34px!important;line-height:1.05!important}.admin-login-card:before{width:68px;height:68px;font-size:32px;margin-bottom:14px}.admin-login-field{font-size:16px!important}.admin-login-input{height:58px!important;font-size:17px!important;padding:0 16px!important}.admin-login-submit{min-height:58px!important;font-size:18px!important}}
  `
  document.head.appendChild(style)
}

let queued = false
function schedulePatch() { if (queued) return; queued = true; window.requestAnimationFrame(() => { queued = false; applyPatch(); installStyles() }) }
const observer = new MutationObserver(schedulePatch)
observer.observe(document.documentElement, { childList:true, subtree:true })
window.addEventListener('change', e => { if (e.target?.matches?.('select[aria-label="Επιλογή ακαδημαϊκής περιόδου"]')) schedulePatch() })
schedulePatch()
