/* Runtime clock only. Layout is entirely static in stableHeader.css. */
(() => {
  const pad = (n) => String(n).padStart(2, '0')

  function updateDateTime() {
    const topbar = document.querySelector('.topbar')
    if (!topbar) return false

    let box = topbar.querySelector('.aen-datetime')
    if (!box) {
      box = document.createElement('div')
      box.className = 'aen-datetime'
      box.innerHTML = '<strong class="aen-clock"></strong><span class="aen-date"></span>'
      topbar.appendChild(box)
    }

    const now = new Date()
    const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}`
    const date = new Intl.DateTimeFormat('el-GR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    }).format(now)

    const clockEl = box.querySelector('.aen-clock')
    const dateEl = box.querySelector('.aen-date')
    if (clockEl && clockEl.textContent !== clock) clockEl.textContent = clock
    if (dateEl && dateEl.textContent !== date) dateEl.textContent = date
    return true
  }

  updateDateTime()
  const timer = setInterval(updateDateTime, 30000)
  const observer = new MutationObserver(() => updateDateTime())
  observer.observe(document.documentElement, { childList: true, subtree: true })

  window.addEventListener('beforeunload', () => {
    clearInterval(timer)
    observer.disconnect()
  }, { once: true })
})()
