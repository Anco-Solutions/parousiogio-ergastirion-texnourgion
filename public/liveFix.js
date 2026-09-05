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
          .topbar:has(.aen-datetime) { min-height: 220px !important; padding-bottom: 36px !important; }
          .sidebar { padding-left: 0 !important; padding-right: 12px !important; }
          .sidebar::before { flex-basis: 4px !important; }
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
