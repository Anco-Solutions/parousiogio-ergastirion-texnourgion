const PERIODS = {
  WINTER: [['A','Α'],['D','Δ'],['ST','ΣΤ']],
  SPRING: [['B','Β'],['G','Γ'],['E','Ε']],
}

function setText(el, value) {
  if (el && el.textContent !== value) el.textContent = value
}

function updateDateTime() {
  const topbar = document.querySelector('.topbar')
  if (!topbar) return
  let box = topbar.querySelector('.aen-datetime')
  if (!box) {
    box = document.createElement('div')
    box.className = 'aen-datetime'
    box.innerHTML = '<strong class="aen-clock"></strong><span class="aen-date"></span>'
    topbar.appendChild(box)
  }
  const now = new Date()
  setText(box.querySelector('.aen-clock'), new Intl.DateTimeFormat('el-GR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(now))
  setText(box.querySelector('.aen-date'), new Intl.DateTimeFormat('el-GR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  }).format(now))
}

function patchBrand() {
  const eyebrow = document.querySelector('.brand-button .eyebrow')
  const brand = document.querySelector('.brand-button strong')
  const mark = document.querySelector('.brand-mark')
  setText(eyebrow, 'ΑΕΝ ΑΣΠΡΟΠΥΡΓΟΥ • ΣΧΟΛΗ ΜΗΧΑΝΙΚΩΝ')
  setText(brand, 'Παρουσιολόγια')

  if (mark && !mark.dataset.aenLogoRendered) {
    mark.classList.add('aen-logo-mark')
    mark.innerHTML = `<img class="aen-exact-logo" src="${import.meta.env.BASE_URL}aem-logo.svg" alt="ΑΕΝ Ασπροπύργου • Σχολή Μηχανικών">`
    mark.dataset.aenLogoRendered = 'true'
  }
}

function patchLogin() {
  const heading = [...document.querySelectorAll('h1')].find(h => h.textContent.includes('Σύνδεση διαχειριστή'))
  const page = heading?.closest('.data-page')
  const form = page?.querySelector('form.data-card')
  if (heading) heading.classList.add('admin-login-title')
  if (!form) return

  form.classList.add('admin-login-card')
  ;[...form.querySelectorAll(':scope > label')].forEach((label, i) => {
    label.classList.add('admin-login-field')
    if (i === 0) label.classList.add('admin-user-field')
    if (i === 1) label.classList.add('admin-login-password')
    const input = label.querySelector('input')
    if (input) input.classList.add('admin-login-input')
    const toggle = label.querySelector('button[type="button"]')
    if (toggle) toggle.classList.add('admin-password-toggle')
  })
  form.querySelector('button.primary-button')?.classList.add('admin-login-submit')
}

function patchSemesters() {
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
  if (document.getElementById('aen-professional-polish')) return
  const style = document.createElement('style')
  style.id = 'aen-professional-polish'
  style.textContent = `
    body{background:#eef3f9!important}
    .topbar{min-height:0!important;height:auto!important;padding:24px clamp(22px,6vw,76px) 30px!important;background:linear-gradient(135deg,#06192d 0%,#0b3158 55%,#123f6d 100%)!important;position:relative!important;overflow:hidden!important;box-shadow:0 8px 30px rgba(4,20,38,.2)!important}
    .topbar:after{content:"";position:absolute;left:-5%;right:-5%;bottom:-66px;height:125px;border-top:2px solid rgba(255,255,255,.11);border-radius:50%;box-shadow:0 -20px 0 rgba(255,255,255,.035),0 -42px 0 rgba(255,255,255,.025);pointer-events:none}
    .brand-button{position:relative!important;z-index:2!important;display:flex!important;align-items:center!important;gap:26px!important;min-width:0!important;max-width:calc(100% - 270px)!important}
    .brand-button>span:last-child{min-width:0!important;display:flex!important;flex-direction:column!important;justify-content:center!important}
    .brand-button strong{order:1!important;color:#fff!important;font-size:clamp(38px,6vw,68px)!important;line-height:.98!important;letter-spacing:-.045em!important;font-weight:900!important;white-space:nowrap!important}
    .brand-button .eyebrow{order:2!important;margin:13px 0 0!important;color:#dbeafe!important;font-size:clamp(12px,1.45vw,18px)!important;letter-spacing:.14em!important;font-weight:800!important;line-height:1.25!important;white-space:nowrap!important}
    .aen-logo-mark{width:190px!important;height:190px!important;min-width:190px!important;min-height:190px!important;padding:0!important;border-radius:28px!important;background:#fff!important;border:3px solid rgba(255,255,255,.82)!important;box-shadow:0 12px 34px rgba(0,0,0,.22)!important;overflow:hidden!important}
    .aen-exact-logo{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important}
    .topbar>div:last-child{position:absolute!important;right:clamp(18px,5vw,76px)!important;top:18px!important;z-index:5!important;display:flex!important;align-items:center!important;gap:10px!important;flex-wrap:nowrap!important}
    .connection{display:none!important}
    .topbar .secondary-button{background:rgba(255,255,255,.1)!important;color:#fff!important;border:1px solid rgba(255,255,255,.25)!important;border-radius:12px!important;padding:8px 13px!important;font-weight:800!important}
    .aen-datetime{position:absolute!important;right:clamp(18px,5vw,76px)!important;bottom:23px!important;z-index:4!important;display:flex!important;flex-direction:row!important;align-items:baseline!important;gap:10px!important;color:#fff!important;text-align:right!important;pointer-events:none!important;text-shadow:0 2px 12px rgba(0,0,0,.18)!important}
    .aen-clock{font-size:clamp(18px,2vw,27px)!important;line-height:1!important;letter-spacing:.035em!important;font-weight:850!important;font-variant-numeric:tabular-nums!important}
    .aen-date{font-size:clamp(10px,1vw,14px)!important;font-weight:650!important;color:#d9eaff!important;white-space:nowrap!important;text-transform:capitalize!important}
    .layout{display:block!important;min-height:0!important}
    .sidebar{background:#fff!important;border:0!important;border-bottom:1px solid #dfe7f0!important;padding:10px clamp(12px,4vw,54px)!important;display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;justify-content:flex-start!important;gap:8px!important;overflow-x:auto!important;overflow-y:hidden!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;touch-action:pan-x!important;overscroll-behavior-x:contain!important;overscroll-behavior-y:none!important;scroll-behavior:auto!important;scroll-snap-type:none!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;box-shadow:0 4px 18px rgba(15,23,42,.06)!important}
    .sidebar::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}
    .sidebar::before,.sidebar::after{content:"";flex:0 0 12px}
    .sidebar>*{flex:0 0 auto!important;width:max-content!important;max-width:none!important;min-width:max-content!important}
    .nav-label{display:none!important}
    .nav-item{width:auto!important;min-width:max-content!important;flex:0 0 auto!important;padding:12px 16px!important;border-radius:13px!important;color:#5b6d86!important;font-size:15px!important;font-weight:750!important;gap:9px!important;background:transparent!important}
    .nav-item span{width:28px!important;font-size:23px!important}
    .nav-item.active{background:#eaf2ff!important;color:#163f70!important;box-shadow:inset 0 -2px 0 #2f6edb!important}
    main{max-width:1180px!important;padding:34px clamp(18px,4vw,52px) 60px!important}
    .hero{display:none!important}
    .admin-login-card{width:min(100%,760px)!important;max-width:760px!important;margin:28px auto 50px!important;padding:40px 44px 34px!important;border-radius:28px!important;border:1px solid #dce5f1!important;box-shadow:0 22px 65px rgba(15,23,42,.12)!important;background:#fff!important}
    .admin-login-title{margin-top:14px!important;text-align:center!important;color:#0b2445!important;font-size:clamp(34px,5vw,54px)!important;letter-spacing:-.045em!important}
    .admin-login-card:before{content:"🔒";display:grid;place-items:center;width:76px;height:76px;margin:0 auto 18px;border-radius:50%;background:#eaf2ff;font-size:36px}
    .admin-login-card:after{content:"ΑΕΝ ΑΣΠΡΟΠΥΡΓΟΥ • ΣΧΟΛΗ ΜΗΧΑΝΙΚΩΝ\\AΠαρουσιολόγια Εργαστηρίων";white-space:pre;display:block;text-align:center;margin-top:26px;padding-top:20px;border-top:1px solid #dce5f1;color:#516681;font-size:13px;line-height:1.7;font-weight:700}
    .admin-login-field{display:block!important;width:100%!important;margin:0!important;color:#0d2445!important;font-size:18px!important;font-weight:850!important}
    .admin-login-field:before{display:inline-block!important;margin-right:8px!important;font-size:18px!important}
    .admin-user-field:before{content:"👤"!important}
    .admin-login-password{margin-top:22px!important}
    .admin-login-password:before{content:"🔒"!important}
    .admin-login-input{display:block!important;width:100%!important;height:64px!important;box-sizing:border-box!important;margin-top:9px!important;padding:0 20px!important;border:2px solid #c8d8ed!important;border-radius:16px!important;background:#f8fafc!important;color:#0b1f3d!important;font-size:19px!important;outline:none!important}
    .admin-login-input:focus{border-color:#3c76d8!important;background:#fff!important;box-shadow:0 0 0 4px rgba(60,118,216,.12)!important}
    .admin-login-password>div{position:relative!important}
    .admin-login-password .admin-login-input{padding-right:68px!important}
    .admin-password-toggle{position:absolute!important;right:10px!important;top:50%!important;transform:translateY(-50%)!important;width:46px!important;height:46px!important;border:0!important;border-radius:12px!important;background:transparent!important;color:#5b6d86!important;font-size:21px!important;cursor:pointer!important}
    .admin-login-submit{width:100%!important;min-height:64px!important;margin-top:26px!important;border-radius:16px!important;background:linear-gradient(135deg,#1769e8,#2d6fe4)!important;font-size:20px!important;font-weight:900!important;box-shadow:0 12px 28px rgba(37,99,235,.25)!important}
    @media(max-width:900px){.topbar{padding:20px 18px 28px!important}.brand-button{gap:18px!important;max-width:calc(100% - 190px)!important}.aen-logo-mark{width:132px!important;height:132px!important;min-width:132px!important;min-height:132px!important}.aen-datetime{right:18px!important;bottom:22px!important}.aen-clock{font-size:20px!important}.aen-date{font-size:9px!important}.sidebar{padding:9px 12px!important}.nav-item{padding:10px 13px!important;font-size:14px!important}.nav-item span{font-size:21px!important}.admin-login-card{padding:34px 28px 30px!important}}
    @media(max-width:650px){.topbar{padding:14px 14px 22px!important;min-height:190px!important}.topbar>div:last-child{right:14px!important;top:10px!important}.topbar .secondary-button{padding:6px 10px!important;font-size:12px!important}.brand-button{gap:13px!important;max-width:100%!important;width:100%!important;padding-top:23px!important;padding-right:0!important;align-items:flex-start!important}.aen-logo-mark{width:92px!important;height:92px!important;min-width:92px!important;min-height:92px!important;border-radius:17px!important}.brand-button strong{font-size:clamp(31px,9vw,44px)!important;white-space:nowrap!important;line-height:1!important}.brand-button .eyebrow{font-size:8.5px!important;letter-spacing:.08em!important;line-height:1.25!important;margin-top:9px!important;white-space:normal!important;max-width:calc(100vw - 120px)!important}.aen-datetime{right:14px!important;bottom:9px!important;gap:6px!important}.aen-clock{font-size:18px!important}.aen-date{font-size:8.5px!important}.sidebar{gap:4px!important}.nav-item{padding:9px 10px!important;font-size:13px!important}.nav-item span{width:24px!important;font-size:19px!important}.admin-login-card{margin:20px 0 36px!important;padding:28px 18px 24px!important;border-radius:22px!important}.admin-login-title{font-size:34px!important;line-height:1.05!important}.admin-login-card:before{width:68px;height:68px;font-size:32px;margin-bottom:14px}.admin-login-field{font-size:16px!important}.admin-login-input{height:58px!important;font-size:17px!important;padding:0 16px!important}.admin-login-submit{min-height:58px!important;font-size:18px!important}}
  `
  document.head.appendChild(style)
}

let queued = false
function schedulePatch() {
  if (queued) return
  queued = true
  window.requestAnimationFrame(() => {
    queued = false
    patchBrand()
    patchLogin()
    patchSemesters()
    updateDateTime()
    installStyles()
  })
}

// Keep the patch lightweight: avoid a document-wide MutationObserver on Safari.
schedulePatch()
setTimeout(schedulePatch, 100)
setTimeout(schedulePatch, 300)
setTimeout(schedulePatch, 700)
setTimeout(schedulePatch, 1500)
setTimeout(schedulePatch, 3000)

document.addEventListener('click', (event) => {
  if (event.target?.closest?.('.nav-item, button, a')) setTimeout(schedulePatch, 0)
}, { passive: true })

window.addEventListener('popstate', schedulePatch)
setInterval(updateDateTime, 1000)
