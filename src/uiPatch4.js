// Authoritative final header logo positioning + two tiny title-spacing refinements.
// Everything else stays on the known-good header geometry.
(function () {
  const apply = () => {
    const topbar = document.querySelector('.topbar')
    if (!topbar) return

    const mark = topbar.querySelector('.aen-logo-mark, .brand-mark')
    if (!mark) return

    const brandButton = topbar.querySelector('.brand-button')
    const topbarRect = topbar.getBoundingClientRect()

    // Capture the logo's existing X position before removing the brand button
    // as its positioning context. This guarantees that X does not move.
    if (!mark.dataset.preservedHeaderLeft) {
      const currentRect = mark.getBoundingClientRect()
      const preservedLeft = Math.round(currentRect.left - topbarRect.left)
      mark.dataset.preservedHeaderLeft = `${preservedLeft}px`
    }

    // Make the full header the containing block for the absolute logo.
    topbar.style.setProperty('position', 'relative', 'important')
    if (brandButton) {
      brandButton.style.setProperty('position', 'static', 'important')
    }

    const mobile = window.matchMedia('(max-width:650px)').matches
    const tablet = window.matchMedia('(max-width:900px)').matches
    const size = mobile ? '92px' : (tablet ? '92px' : '78px')

    mark.style.setProperty('position', 'absolute', 'important')
    mark.style.setProperty('left', mark.dataset.preservedHeaderLeft, 'important')
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

    // ONLY requested title adjustment: center the title block in the space
    // between the logo and the right edge, instead of letting it crowd the logo.
    const titleLane = topbar.querySelector('.brand-button > span:last-child')
    if (titleLane) {
      const logoRight = (parseFloat(mark.dataset.preservedHeaderLeft) || 0) + (mobile ? 92 : 92)
      titleLane.style.setProperty('position', 'absolute', 'important')
      titleLane.style.setProperty('left', mobile ? `${logoRight + 1}px` : '108px', 'important')
      titleLane.style.setProperty('right', mobile ? '8px' : '108px', 'important')
      titleLane.style.setProperty('top', mobile ? '56px' : '38px', 'important')
      titleLane.style.setProperty('width', 'auto', 'important')
      titleLane.style.setProperty('max-width', 'none', 'important')
      titleLane.style.setProperty('transform', 'none', 'important')
      titleLane.style.setProperty('display', 'flex', 'important')
      titleLane.style.setProperty('align-items', 'center', 'important')
      titleLane.style.setProperty('justify-content', 'center', 'important')
      titleLane.style.setProperty('text-align', 'center', 'important')
    }
  }

  apply()
  const timer = setInterval(apply, 250)
  window.addEventListener('resize', apply, { passive: true })
  window.addEventListener('orientationchange', () => setTimeout(apply, 100), { passive: true })

  const observer = new MutationObserver(apply)
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  })

  window.addEventListener('beforeunload', () => clearInterval(timer), { once: true })
})()
