// Final visual system: clean institutional header, exact AEN logo and collision-free mobile layout.
(function () {
  const ID = 'aen-final-visual-system'

  function apply() {
    if (!document.head) return
    let style = document.getElementById(ID)
    if (!style) { style = document.createElement('style'); style.id = ID; document.head.appendChild(style) }
    style.textContent = `
      .topbar{isolation:isolate!important;position:relative!important;overflow:hidden!important}
      .brand-button{position:absolute!important;z-index:3!important;margin:0!important}
      .brand-mark,.brand-mark.aen-logo-mark{position:absolute!important;background:#fff!important;overflow:hidden!important}
      .brand-mark::before,.brand-mark::after,.aen-logo-mark::before,.aen-logo-mark::after{display:none!important;content:none!important}
      .aen-exact-logo{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important;padding:0!important;opacity:1!important;visibility:visible!important;filter:none!important;mix-blend-mode:normal!important;background:#fff!important}
      .brand-button>span:last-child{position:absolute!important;min-width:0!important}
      .brand-button strong{display:block!important;color:#fff!important;font-weight:900!important;white-space:nowrap!important}
      .brand-button .eyebrow{display:block!important;color:#dcecff!important;font-weight:800!important;white-space:nowrap!important}
      .topbar>div:last-child{z-index:7!important}
      .aen-datetime{z-index:6!important;position:absolute!important;display:flex!important;align-items:baseline!important;white-space:nowrap!important;color:#fff!important;pointer-events:none!important}
      .aen-clock{font-weight:850!important;font-variant-numeric:tabular-nums!important}
      .aen-date{color:#d9eaff!important;font-weight:650!important;text-transform:capitalize!important}

      @media(min-width:901px){
        .topbar{height:220px!important;min-height:220px!important;padding:0!important;box-sizing:border-box!important}
        .brand-button{inset:0!important;width:100%!important;height:100%!important}
        .aen-logo-mark{left:54px!important;top:24px!important;width:122px!important;height:122px!important;min-width:122px!important;min-height:122px!important;border:3px solid #fff!important;border-radius:22px!important;box-shadow:0 10px 28px rgba(0,0,0,.18)!important}
        .brand-button>span:last-child{left:195px!important;right:195px!important;top:72px!important;text-align:center!important}
        .brand-button strong{font-size:clamp(44px,4.7vw,62px)!important;line-height:.98!important;letter-spacing:-.045em!important}
        .brand-button .eyebrow{margin-top:9px!important;font-size:14px!important;letter-spacing:.13em!important}
        .aen-datetime{right:54px!important;top:28px!important;gap:10px!important}
        .aen-clock{font-size:24px!important}.aen-date{font-size:13px!important}
        .topbar>div:last-child{right:54px!important;bottom:24px!important;top:auto!important;position:absolute!important}
        .topbar .secondary-button{padding:8px 14px!important;border-radius:12px!important}
      }

      @media(min-width:651px) and (max-width:900px){
        .topbar{height:205px!important;min-height:205px!important;padding:0!important;box-sizing:border-box!important}
        .brand-button{inset:0!important;width:100%!important;height:100%!important}
        .aen-logo-mark{left:24px!important;top:22px!important;width:104px!important;height:104px!important;min-width:104px!important;min-height:104px!important;border:3px solid #fff!important;border-radius:19px!important;box-shadow:0 9px 24px rgba(0,0,0,.18)!important}
        .brand-button>span:last-child{left:145px!important;right:145px!important;top:67px!important;text-align:center!important}
        .brand-button strong{font-size:clamp(36px,6vw,50px)!important;line-height:1!important;letter-spacing:-.045em!important}
        .brand-button .eyebrow{margin-top:8px!important;font-size:10px!important;letter-spacing:.09em!important;white-space:normal!important}
        .aen-datetime{right:24px!important;top:24px!important;gap:8px!important}.aen-clock{font-size:20px!important}.aen-date{font-size:10px!important}
        .topbar>div:last-child{right:24px!important;bottom:18px!important;top:auto!important;position:absolute!important}
      }

      @media(max-width:650px){
        .topbar{height:184px!important;min-height:184px!important;padding:0!important;box-sizing:border-box!important}
        .topbar::after{left:-12%!important;right:-12%!important;bottom:-70px!important;height:112px!important;border-top:1px solid rgba(255,255,255,.12)!important}
        .brand-button{inset:0!important;width:100%!important;height:100%!important;padding:0!important}
        .aen-logo-mark{left:15px!important;top:22px!important;width:76px!important;height:76px!important;min-width:76px!important;min-height:76px!important;border:3px solid #fff!important;border-radius:15px!important;box-shadow:0 8px 20px rgba(0,0,0,.18)!important}
        .brand-button>span:last-child{left:103px!important;right:12px!important;top:77px!important;text-align:center!important}
        .brand-button strong{font-size:31px!important;line-height:.98!important;letter-spacing:-.055em!important}
        .brand-button .eyebrow{margin-top:8px!important;font-size:7.8px!important;line-height:1.25!important;letter-spacing:.055em!important;white-space:nowrap!important}
        .aen-datetime{left:103px!important;right:12px!important;top:30px!important;justify-content:center!important;gap:6px!important}
        .aen-clock{font-size:16px!important;line-height:1!important}.aen-date{font-size:8.2px!important;line-height:1!important}
        .topbar>div:last-child{left:auto!important;right:14px!important;top:auto!important;bottom:11px!important;position:absolute!important}
        .topbar .secondary-button{min-height:37px!important;padding:6px 13px!important;border-radius:11px!important;font-size:13px!important}
        .sidebar{width:100%!important;box-sizing:border-box!important;overflow-x:auto!important;overflow-y:hidden!important;flex-wrap:nowrap!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important}
        .sidebar::-webkit-scrollbar{display:none!important}.nav-item{flex:0 0 auto!important}
        main{padding:18px 14px 40px!important}.stats{gap:12px!important}.stat-card{padding:18px 20px!important;min-height:0!important}.stat-card span{font-size:15px!important}.stat-card strong{font-size:40px!important;margin-top:8px!important}
      }
    `
    const img = document.querySelector('.brand-mark .aen-exact-logo')
    if (img) {
      img.src = `${import.meta.env.BASE_URL}aem-logo.svg?v=20260905e`
      img.style.objectFit = 'contain'
      img.style.visibility = 'visible'
      img.style.opacity = '1'
    }
  }

  apply()
  const observer = new MutationObserver(() => requestAnimationFrame(apply))
  observer.observe(document.documentElement,{childList:true,subtree:true})
  window.addEventListener('resize',apply)
})()
