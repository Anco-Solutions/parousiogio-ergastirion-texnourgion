// Final header polish: correct AEN logo crop, split institution subtitle, and move date/time to the top-right.
(function () {
  const apply = () => {
    const topbar = document.querySelector('.topbar')
    if (!topbar) return false

    const logo = topbar.querySelector('.aen-exact-logo, .aen-logo-mark img, .brand-mark img')
    if (logo) {
      logo.style.setProperty('left', '-4%', 'important')
      logo.style.setProperty('top', '-4%', 'important')
      logo.style.setProperty('width', '108%', 'important')
      logo.style.setProperty('height', '108%', 'important')
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
      datetime.style.setProperty('top', '9px', 'important')
      datetime.style.setProperty('right', '10px', 'important')
      datetime.style.setProperty('left', 'auto', 'important')
      datetime.style.setProperty('bottom', 'auto', 'important')
      datetime.style.setProperty('transform', 'none', 'important')
      datetime.style.setProperty('display', 'flex', 'important')
      datetime.style.setProperty('flex-direction', 'row', 'important')
      datetime.style.setProperty('align-items', 'baseline', 'important')
      datetime.style.setProperty('justify-content', 'flex-end', 'important')
      datetime.style.setProperty('gap', '7px', 'important')
      datetime.style.setProperty('width', 'auto', 'important')
      datetime.style.setProperty('max-width', 'calc(100% - 96px)', 'important')
      datetime.style.setProperty('white-space', 'nowrap', 'important')
      datetime.style.setProperty('z-index', '20', 'important')
    }

    const styleId = 'aen-final-polish-style'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .topbar .aen-school-primary,
        .topbar .aen-school-secondary { display:block !important; white-space:nowrap !important; }
        .topbar .aen-school-primary { margin:0 !important; }
        .topbar .aen-school-secondary { margin-top:2px !important; }
        .topbar .brand-button .eyebrow { display:flex !important; flex-direction:column !important; align-items:center !important; gap:0 !important; }
        @media (max-width:650px) {
          .topbar .brand-button > span:last-child { top:51px !important; }
          .topbar .brand-button strong { font-size:30px !important; }
          .topbar .brand-button .eyebrow { font-size:8.5px !important; line-height:1.15 !important; }
          .topbar .aen-datetime .aen-date { font-size:9px !important; }
          .topbar .aen-datetime .aen-clock { font-size:17px !important; }
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
  apply()
})()
