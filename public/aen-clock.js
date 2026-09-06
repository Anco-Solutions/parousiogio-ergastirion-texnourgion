(() => {
  const pad = (value) => String(value).padStart(2, '0')
  function render() {
    const topbar = document.querySelector('.topbar')
    if (!topbar) return false
    let box = topbar.querySelector('.aen-datetime')
    if (!box) {
      box = document.createElement('div')
      box.className = 'aen-datetime'
      box.setAttribute('aria-label', 'Ημερομηνία και ώρα')
      box.innerHTML = '<span class="aen-date"></span><span class="aen-clock"></span>'
      topbar.appendChild(box)
    }
    const now = new Date()
    box.querySelector('.aen-date').textContent = new Intl.DateTimeFormat('el-GR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(now)
    box.querySelector('.aen-clock').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`
    return true
  }
  const startup = setInterval(() => { if (render()) clearInterval(startup) }, 100)
  setInterval(render, 30000)
})()
