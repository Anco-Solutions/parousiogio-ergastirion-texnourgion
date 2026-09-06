/* Dedicated header clock. It does not change layout or move elements. */
(() => {
  const pad = (value) => String(value).padStart(2, '0')

  function renderClock() {
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
    box.querySelector('.aen-clock').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`
    box.querySelector('.aen-date').textContent = new Intl.DateTimeFormat('el-GR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    }).format(now)
  }

  renderClock()
  const timer = setInterval(renderClock, 30000)
  const observer = new MutationObserver(renderClock)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  window.addEventListener('beforeunload', () => {
    clearInterval(timer)
    observer.disconnect()
  }, { once: true })
})()
