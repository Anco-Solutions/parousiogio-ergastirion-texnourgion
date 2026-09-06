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
          /* The header is deliberately taller so the two text rows have air. */
          .topbar:has(.aen-datetime) {
            min-height: 240px !important;
            height: 240px !important;
            padding: 0 14px !important;
            box-sizing: border-box !important;
          }

          /* The brand occupies the full header height. */
          .brand-button {
            position: absolute !important;
            left: 14px !important;
            right: 14px !important;
            top: 0 !important;
            bottom: 0 !important;
            width: auto !important;
            max-width: none !important;
            min-height: 240px !important;
            height: 240px !important;
            margin: 0 !important;
            padding: 0 0 0 108px !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
          }

          /* EXACT vertical centering: 92px logo inside a 240px header = 74px top. */
          .brand-button .aen-logo-mark {
            position: absolute !important;
            left: 0 !important;
            top: 74px !important;
            bottom: auto !important;
            transform: none !important;
            width: 92px !important;
            height: 92px !important;
            min-width: 92px !important;
            min-height: 92px !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            z-index: 20 !important;
          }

          .brand-button > span:last-child {
            position: relative !important;
            top: 18px !important;
            min-width: 0 !important;
          }

          /* Date/time stays on the first row. */
          .aen-datetime {
            top: 28px !important;
            bottom: auto !important;
            right: 14px !important;
          }

          .sidebar {
            padding-left: 0 !important;
            padding-right: 12px !important;
          }
          .sidebar > .nav-item:first-child { margin-left: 4px !important; }
          .sidebar::before { flex-basis: 0 !important; width: 0 !important; }
        }
      `
      document.head.appendChild(style)
    } else {
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
