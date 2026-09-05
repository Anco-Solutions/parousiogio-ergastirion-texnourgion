(() => {
  const pad = (n) => String(n).padStart(2, '0')

  function fixClock() {
    document.querySelectorAll('.aen-clock').forEach((el) => {
      const now = new Date()
      const value = `${pad(now.getHours())}:${pad(now.getMinutes())}`
      if (el.textContent !== value) el.textContent = value
    })
  }

  function fixLayout() {
    const sidebar = document.querySelector('.sidebar')
    if (sidebar) {
      sidebar.style.setProperty('padding-left', '0px', 'important')
      sidebar.style.setProperty('padding-right', '12px', 'important')
      sidebar.style.setProperty('gap', '4px', 'important')
    }

    let style = document.getElementById('aen-live-fix-style')
    if (!style) {
      style = document.createElement('style')
      style.id = 'aen-live-fix-style'
      style.textContent = `
        .topbar:has(.aen-datetime) { padding-bottom: 40px !important; }
        .sidebar::before { flex-basis: 4px !important; }
        @media (max-width: 650px) {
          /* Give the two header rows more deliberate breathing room. */
          .topbar:has(.aen-datetime) {
            min-height: 240px !important;
            padding-bottom: 36px !important;
          }

          /* Keep the AEN logo larger than either text row and centered
             vertically in the full header, rather than aligned to the top. */
          .brand-button {
            position: relative !important;
            align-items: center !important;
            min-height: 100% !important;
            padding-left: 108px !important;
            box-sizing: border-box !important;
          }
          .aen-logo-mark {
            position: absolute !important;
            left: 0 !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            width: 92px !important;
            height: 92px !important;
            min-width: 92px !important;
            min-height: 92px !important;
          }

          .sidebar {
            padding-left: 0 !important;
            padding-right: 12px !important;
          }
          /* About 1 mm of breathing room from the left screen edge. */
          .sidebar > .nav-item:first-child {
            margin-left: 4px !important;
          }
          .sidebar::before { flex-basis: 0 !important; width: 0 !important; }
        }
      `
      document.head.appendChild(style)
    }
  }

  function fix() {
    fixClock()
    fixLayout()
  }

  fix()
  setTimeout(fix, 100)
  setTimeout(fix, 500)
  setInterval(fix, 1000)

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData' || mutation.type === 'childList') {
        if (mutation.target?.closest?.('.aen-clock') || mutation.target?.querySelector?.('.aen-clock')) {
          fixClock()
          break
        }
      }
    }
  })

  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true })
})()
