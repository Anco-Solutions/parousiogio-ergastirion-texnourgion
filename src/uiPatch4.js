// Authoritative final header logo positioning.
// Runs after the other UI patches and uses inline !important so older
// header styles cannot pull the logo toward the top or bottom.
(function () {
  const apply = () => {
    const topbar = document.querySelector('.topbar')
    if (!topbar) return

    const mark = topbar.querySelector('.aen-logo-mark, .brand-mark')
    if (!mark) return

    const mobile = window.matchMedia('(max-width:650px)').matches
    const tablet = window.matchMedia('(max-width:900px)').matches
    const left = mobile ? '10px' : (tablet ? '12px' : '16px')
    const size = mobile ? '92px' : (tablet ? '92px' : '78px')

    // Do not change X. Only center the logo vertically in the full header.
    mark.style.setProperty('position', 'absolute', 'important')
    mark.style.setProperty('left', left, 'important')
    mark.style.setProperty('top', '50%', 'important')
    mark.style.setProperty('transform', 'translateY(-50%)', 'important')
    mark.style.setProperty('width', size, 'important')
    mark.style.setProperty('height', size, 'important')
    mark.style.setProperty('min-width', size, 'important')
    mark.style.setProperty('min-height', size, 'important')
    mark.style.setProperty('margin', '0', 'important')
    mark.style.setProperty('padding', '0', 'important')
    mark.style.setProperty('box-sizing', 'border-box', 'important')

    const logo = mark.querySelector('.aen-exact-logo, img')
    if (logo) {
      logo.style.setProperty('position', 'static', 'important')
      logo.style.setProperty('display', 'block', 'important')
      logo.style.setProperty('width', '100%', 'important')
      logo.style.setProperty('height', '100%', 'important')
      logo.style.setProperty('object-fit', 'contain', 'important')
      logo.style.setProperty('object-position', 'center', 'important')
      logo.style.setProperty('transform', 'none', 'important')
      logo.style.setProperty('margin', '0', 'important')
    }
  }

  apply()
  const timer = setInterval(apply, 250)
  window.addEventListener('resize', apply, { passive: true })
  window.addEventListener('orientationchange', () => setTimeout(apply, 100), { passive: true })
  const observer = new MutationObserver(apply)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  setTimeout(() => clearInterval(timer), 20000)
})()
