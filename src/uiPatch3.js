// Final header polish + Safari-safe horizontal navigation.
(function () {
  const installNavFix = () => {
    const nav = document.querySelector('.sidebar')
    if (!nav) return false

    if (!document.getElementById('aen-stable-horizontal-nav')) {
      const style = document.createElement('style')
      style.id = 'aen-stable-horizontal-nav'
      style.textContent = `
        /* Use native block overflow instead of a flex scroller on Safari. */
        .sidebar {
          display:block !important;
          width:100% !important;
          max-width:100% !important;
          min-width:0 !important;
          box-sizing:border-box !important;
          overflow-x:auto !important;
          overflow-y:hidden !important;
          white-space:nowrap !important;
          touch-action:pan-x !important;
          -webkit-overflow-scrolling:touch !important;
          overscroll-behavior-x:contain !important;
          overscroll-behavior-y:none !important;
          scroll-behavior:auto !important;
          scroll-snap-type:none !important;
          scrollbar-width:none !important;
          padding-left:12px !important;
          padding-right:12px !important;
        }
        .sidebar::-webkit-scrollbar { display:none !important; width:0 !important; height:0 !important; }
        .sidebar > * {
          display:inline-flex !important;
          vertical-align:middle !important;
          flex:none !important;
          width:auto !important;
          min-width:0 !important;
          max-width:none !important;
          box-sizing:border-box !important;
        }
        .sidebar > .nav-label { display:none !important; }
        .sidebar > .nav-item {
          width:auto !important;
          min-width:fit-content !important;
          max-width:none !important;
          flex:none !important;
          white-space:nowrap !important;
          margin-right:4px !important;
        }
      `
      document.head.appendChild(style)
    }

    if (!nav.dataset.aenNavFixed) {
      nav.dataset.aenNavFixed = '1'
      // Do not read/write scrollLeft during scroll events. Safari can enter a
      // layout/scroll feedback loop when scrollLeft is clamped on every frame.
      const refresh = () => {
        if (!nav.isConnected) return
        nav.style.setProperty('overflow-x', 'auto', 'important')
      }
      window.addEventListener('resize', refresh, { passive: true })
      window.addEventListener('orientationchange', () => setTimeout(refresh, 100), { passive: true })
      nav.addEventListener('click', () => setTimeout(refresh, 0), { passive: true })
    }

    return true
  }

  const apply = () => {
    const topbar = document.querySelector('.topbar')
    if (!topbar) return false

    const mobile = window.matchMedia('(max-width:650px)').matches
    topbar.style.setProperty('height', mobile ? '104px' : '110px', 'important')
    topbar.style.setProperty('min-height', '0', 'important')
    topbar.style.setProperty('overflow', 'hidden', 'important')

    const logo = topbar.querySelector('.aen-exact-logo, .aen-logo-mark img, .brand-mark img')
    if (logo) {
      logo.style.setProperty('left', '-2%', 'important')
      logo.style.setProperty('top', '0', 'important')
      logo.style.setProperty('width', '104%', 'important')
      logo.style.setProperty('height', '100%', 'important')
      logo.style.setProperty('object-fit', 'contain', 'important')
      logo.style.setProperty('object-position', 'center', 'important')
    }

    const eyebrow = topbar.querySelector('.eyebrow')
    if (eyebrow && !eyebrow.dataset.splitInstitution) {
      eyebrow.dataset.splitInstitution = '1'
      eyebrow.innerHTML = '<span class="aen-school-primary">ΑΕΝ ΑΣΠΡΟΠΥΡΓΟΥ</span><span class="aen-school-secondary">ΣΧΟΛΗ ΜΗΧΑΝΙΚΩΝ</span>'
    }

    const titleLane = topbar.querySelector('.brand-button > span:last-child')
    if (titleLane) {
      titleLane.style.setProperty('left', mobile ? '84px' : '108px', 'important')
      titleLane.style.setProperty('right', mobile ? '8px' : '108px', 'important')
      titleLane.style.setProperty('top', mobile ? '20px' : '38px', 'important')
      titleLane.style.setProperty('width', 'auto', 'important')
      titleLane.style.setProperty('max-width', 'none', 'important')
      titleLane.style.setProperty('transform', 'none', 'important')
      titleLane.style.setProperty('align-items', 'center', 'important')
    }

    const strong = topbar.querySelector('.brand-button strong')
    if (strong) {
      strong.style.setProperty('font-size', mobile ? '28px' : '34px', 'important')
      strong.style.setProperty('letter-spacing', '.012em', 'important')
      strong.style.setProperty('line-height', '1', 'important')
    }

    const eyebrowText = topbar.querySelector('.brand-button .eyebrow')
    if (eyebrowText) {
      eyebrowText.style.setProperty('font-size', mobile ? '8px' : '9px', 'important')
      eyebrowText.style.setProperty('letter-spacing', mobile ? '.045em' : '.06em', 'important')
      eyebrowText.style.setProperty('white-space', 'nowrap', 'important')
    }

    const datetime = topbar.querySelector('.aen-datetime')
    if (datetime) {
      datetime.style.setProperty('position', 'absolute', 'important')
      datetime.style.setProperty('top', mobile ? '5px' : '7px', 'important')
      datetime.style.setProperty('right', mobile ? '8px' : '10px', 'important')
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

    const clock = topbar.querySelector('.aen-datetime .aen-clock')
    if (clock) clock.style.setProperty('font-size', mobile ? '15px' : '16px', 'important')

    const adminWrap = Array.from(topbar.children).find((el) => el !== topbar.querySelector('.aen-datetime') && el.tagName === 'DIV')
    if (adminWrap) {
      adminWrap.style.setProperty('position', 'absolute', 'important')
      adminWrap.style.setProperty('right', mobile ? '8px' : '10px', 'important')
      adminWrap.style.setProperty('bottom', '3px', 'important')
      adminWrap.style.setProperty('top', 'auto', 'important')
      adminWrap.style.setProperty('left', 'auto', 'important')
      adminWrap.style.setProperty('width', 'auto', 'important')
      adminWrap.style.setProperty('margin', '0', 'important')
      adminWrap.style.setProperty('padding', '0', 'important')
      adminWrap.style.setProperty('z-index', '10', 'important')
    }

    const clockNode = topbar.querySelector('.aen-datetime .aen-clock')
    if (clockNode) {
      const current = clockNode.textContent
      const cleaned = current.replace(/(\d{1,2}:\d{2})(?::\d{2})/g, '$1')
      if (current !== cleaned) clockNode.textContent = cleaned
    }

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
      `
      document.head.appendChild(style)
    }

    installNavFix()
    return true
  }

  let tries = 0
  const timer = setInterval(() => {
    if (apply() || ++tries > 80) clearInterval(timer)
  }, 100)

  apply()
})()
