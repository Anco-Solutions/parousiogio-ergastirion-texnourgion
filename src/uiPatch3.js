// Final header polish: compact title lane, HH:MM clock, and safe DOM updates.
(function () {
  const apply = () => {
    const topbar = document.querySelector('.topbar')
    if (!topbar) return false

    const logo = topbar.querySelector('.aen-exact-logo, .aen-logo-mark img, .brand-mark img')
    if (logo) {
      logo.style.setProperty('left', '-2%', 'important')
      logo.style.setProperty('top', '-2%', 'important')
      logo.style.setProperty('width', '104%', 'important')
      logo.style.setProperty('height', '104%', 'important')
      logo.style.setProperty('object-fit', 'contain', 'important')
      logo.style.setProperty('object-position', 'center', 'important')
    }

    const eyebrow = topbar.querySelector('.eyebrow')
    if (eyebrow && !eyebrow.dataset.splitInstitution) {
      eyebrow.dataset.splitInstitution = '1'
      eyebrow.innerHTML = '<span class="aen-school-primary">ΑΕΝ ΑΣΠΡΟΠΥΡΓΟΥ</span><span class="aen-school-secondary">ΣΧΟΛΗ ΜΗΧΑΝΙΚΩΝ</span>'
    }

    const datetime = topbar.querySelector('.aen-datetime')
    if (datetime) {
      datetime.style.setProperty('position', 'absolute', 'important')
      datetime.style.setProperty('top', '6px', 'important')
      datetime.style.setProperty('right', '9px', 'important')
      datetime.style.setProperty('left', 'auto', 'important')
      datetime.style.setProperty('bottom', 'auto', 'important')
      datetime.style.setProperty('transform', 'none', 'important')
      datetime.style.setProperty('display', 'flex', 'important')
      datetime.style.setProperty('flex-direction', 'row', 'important')
      datetime.style.setProperty('align-items', 'baseline', 'important')
      datetime.style.setProperty('justify-content', 'flex-end', 'important')
      datetime.style.setProperty('gap', '5px', 'important')
      datetime.style.setProperty('width', 'auto', 'important')
      datetime.style.setProperty('max-width', 'none', 'important')
      datetime.style.setProperty('white-space', 'nowrap', 'important')
      datetime.style.setProperty('z-index', '20', 'important')
    }

    const cleanClock = () => {
      const clock = topbar.querySelector('.aen-datetime .aen-clock')
      if (!clock) return
      const current = clock.textContent
      const cleaned = current.replace(/(\d{1,2}:\d{2})(?::\d{2})/g, '$1')
      if (current !== cleaned) clock.textContent = cleaned
    }
    cleanClock()

    const styleId = 'aen-final-polish-style'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .topbar .aen-school-primary,
        .topbar .aen-school-secondary { display:inline !important; white-space:nowrap !important; }
        .topbar .aen-school-primary::after { content:' • '; }
        .topbar .aen-school-primary,
        .topbar .aen-school-secondary { margin:0 !important; }
        .topbar .brand-button .eyebrow { display:block !important; white-space:nowrap !important; text-align:center !important; letter-spacing:.06em !important; }
        .topbar .brand-button > span:last-child {
          left:84px !important;
          right:8px !important;
          width:auto !important;
          max-width:none !important;
          transform:none !important;
          align-items:center !important;
        }
        @media (max-width:650px) {
          .topbar .brand-button > span:last-child { top:31px !important; }
          .topbar .brand-button strong { font-size:28px !important; letter-spacing:.01em !important; }
          .topbar .brand-button .eyebrow { font-size:8px !important; line-height:1.1 !important; letter-spacing:.045em !important; }
          .topbar .aen-datetime .aen-date { font-size:8px !important; }
          .topbar .aen-datetime .aen-clock { font-size:15px !important; }
        }
        @media (min-width:651px) {
          .topbar .brand-button > span:last-child { left:108px !important; right:108px !important; top:40px !important; }
          .topbar .brand-button strong { font-size:34px !important; letter-spacing:.01em !important; }
          .topbar .brand-button .eyebrow { font-size:9px !important; }
        }
      `
      document.head.appendChild(style)
    }
    return true
  }

  let tries = 0
  const timer = setInterval(() => {
    if (apply() || ++tries > 80) clearInterval(timer)
  }, 100)

  const observeClock = () => {
    const topbar = document.querySelector('.topbar')
    if (!topbar) return
    const clock = topbar.querySelector('.aen-datetime .aen-clock')
    if (!clock || clock.dataset.secondsObserver) return
    clock.dataset.secondsObserver = '1'
    const clean = () => {
      const current = clock.textContent
      const cleaned = current.replace(/(\d{1,2}:\d{2})(?::\d{2})/g, '$1')
      if (current !== cleaned) clock.textContent = cleaned
    }
    clean()
    new MutationObserver(clean).observe(clock, { childList: true, characterData: true, subtree: true })
  }

  apply()
  setTimeout(observeClock, 300)
})()
