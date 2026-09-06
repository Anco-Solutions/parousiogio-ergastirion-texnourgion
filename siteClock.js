(() => {
  const BASE = 'aen-datetime'

  function ensureClock() {
    const topbar = document.querySelector('.topbar')
    if (!topbar) return false

    let wrap = topbar.querySelector(`.${BASE}`)
    if (!wrap) {
      wrap = document.createElement('div')
      wrap.className = BASE
      wrap.setAttribute('aria-label', 'Ημερομηνία και ώρα')
      wrap.innerHTML = '<span class="aen-date"></span><span class="aen-clock"></span>'
      topbar.appendChild(wrap)
    }

    const date = wrap.querySelector('.aen-date')
    const clock = wrap.querySelector('.aen-clock')
    const now = new Date()
    const dateText = new Intl.DateTimeFormat('el-GR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(now)

    date.textContent = dateText.charAt(0).toUpperCase() + dateText.slice(1)
    clock.textContent = new Intl.DateTimeFormat('el-GR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now)
    return true
  }

  function start() {
    if (!ensureClock()) {
      const observer = new MutationObserver(() => {
        if (ensureClock()) observer.disconnect()
      })
      observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true })
    }
    window.setInterval(ensureClock, 1000)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
  else start()
})()
