// Final header correction: date/time at the top, title directly below, compact header, isolated Admin.
(function () {
  const ID = 'aen-final-visual-system'
  function apply() {
    if (!document.head) return
    let style = document.getElementById(ID)
    if (!style) { style = document.createElement('style'); style.id = ID; document.head.appendChild(style) }
    style.textContent = `
      .topbar{isolation:isolate!important;position:relative!important;overflow:hidden!important}
      .brand-button{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;display:block!important;z-index:3!important}
      .brand-mark,.brand-mark.aen-logo-mark{position:absolute!important;background:#fff!important;overflow:hidden!important;padding:0!important}
      .brand-mark::before,.brand-mark::after,.aen-logo-mark::before,.aen-logo-mark::after{display:none!important;content:none!important}
      .aen-exact-logo{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important;padding:0!important;margin:0!important;opacity:1!important;visibility:visible!important;filter:none!important;mix-blend-mode:normal!important;background:#fff!important;border:0!important}
      .brand-button>span:last-child{position:absolute!important;min-width:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center!important}
      .brand-button strong{display:block!important;color:#fff!important;font-weight:900!important;white-space:nowrap!important}
      .brand-button .eyebrow{display:block!important;color:#dcecff!important;font-weight:800!important;white-space:nowrap!important;text-transform:none!important}
      .aen-datetime{position:absolute!important;z-index:8!important;display:flex!important;flex-direction:row!important;align-items:baseline!important;white-space:nowrap!important;color:#fff!important;pointer-events:none!important;bottom:auto!important}
      .aen-date{order:1!important;color:#d9eaff!important;font-weight:700!important;text-transform:capitalize!important}
      .aen-clock{order:2!important;color:#fff!important;font-weight:850!important;font-variant-numeric:tabular-nums!important}
      .topbar > div:not(.aen-datetime){position:absolute!important;z-index:9!important;right:0!important;top:auto!important;display:flex!important;align-items:center!important}

      @media(min-width:901px){
        .topbar{height:190px!important;min-height:190px!important;padding:0!important;box-sizing:border-box!important}
        .aen-logo-mark{left:34px!important;top:18px!important;width:105px!important;height:105px!important;min-width:105px!important;min-height:105px!important;border:3px solid #fff!important;border-radius:20px!important;box-shadow:0 8px 24px rgba(0,0,0,.18)!important}
        .brand-button>span:last-child{left:150px!important;right:150px!important;top:62px!important}
        .brand-button strong{font-size:52px!important;line-height:.98!important;letter-spacing:-.045em!important}
        .brand-button .eyebrow{margin-top:8px!important;font-size:13px!important;letter-spacing:.12em!important}
        .aen-datetime{right:34px!important;top:17px!important;gap:9px!important}.aen-date{font-size:12px!important}.aen-clock{font-size:22px!important}
        .topbar > div:not(.aen-datetime){right:34px!important;bottom:18px!important}
      }

      @media(min-width:651px) and (max-width:900px){
        .topbar{height:180px!important;min-height:180px!important;padding:0!important;box-sizing:border-box!important}
        .aen-logo-mark{left:22px!important;top:16px!important;width:88px!important;height:88px!important;min-width:88px!important;min-height:88px!important;border:3px solid #fff!important;border-radius:17px!important}
        .brand-button>span:last-child{left:125px!important;right:125px!important;top:55px!important}
        .brand-button strong{font-size:42px!important;line-height:1!important;letter-spacing:-.045em!important}.brand-button .eyebrow{margin-top:7px!important;font-size:10px!important;letter-spacing:.08em!important}
        .aen-datetime{left:125px!important;right:18px!important;top:15px!important;justify-content:center!important;gap:7px!important}.aen-date{font-size:10px!important}.aen-clock{font-size:19px!important}
        .topbar > div:not(.aen-datetime){right:18px!important;bottom:13px!important}
      }

      @media(max-width:650px){
        .topbar{height:165px!important;min-height:165px!important;padding:0!important;box-sizing:border-box!important}
        .topbar::after{left:-12%!important;right:-12%!important;bottom:-72px!important;height:105px!important;border-top:1px solid rgba(255,255,255,.12)!important}
        .aen-logo-mark{left:12px!important;top:11px!important;width:58px!important;height:58px!important;min-width:58px!important;min-height:58px!important;border:3px solid #fff!important;border-radius:13px!important;box-shadow:0 7px 18px rgba(0,0,0,.18)!important}
        .brand-button>span:last-child{left:74px!important;right:8px!important;top:67px!important}
        .brand-button strong{font-size:29px!important;line-height:1!important;letter-spacing:-.055em!important}
        .brand-button .eyebrow{margin-top:6px!important;font-size:7.4px!important;line-height:1.2!important;letter-spacing:.045em!important;white-space:nowrap!important}
        .aen-datetime{left:76px!important;right:8px!important;top:14px!important;justify-content:center!important;gap:5px!important;text-align:center!important}
        .aen-date{font-size:8px!important;line-height:1!important}.aen-clock{font-size:16px!important;line-height:1!important;letter-spacing:.015em!important}
        .topbar > div:not(.aen-datetime){right:10px!important;bottom:8px!important;top:auto!important;position:absolute!important}
        .topbar .secondary-button{min-height:34px!important;padding:5px 11px!important;border-radius:10px!important;font-size:12px!important}
        .sidebar{width:100%!important;box-sizing:border-box!important;overflow-x:auto!important;overflow-y:hidden!important;flex-wrap:nowrap!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important}.sidebar::-webkit-scrollbar{display:none!important}.nav-item{flex:0 0 auto!important}
        main{padding:18px 14px 40px!important}.stats{gap:12px!important}.stat-card{padding:18px 20px!important;min-height:0!important}.stat-card span{font-size:15px!important}.stat-card strong{font-size:40px!important;margin-top:8px!important}
      }
    `
    const img = document.querySelector('.brand-mark .aen-exact-logo')
    if (img) {
      img.src = `${import.meta.env.BASE_URL}aem-logo.svg?v=20260905g`
      img.style.objectFit = 'contain'
      img.style.objectPosition = 'center'
      img.style.visibility = 'visible'
      img.style.opacity = '1'
    }
  }
  apply()
  const observer = new MutationObserver(() => requestAnimationFrame(apply))
  observer.observe(document.documentElement,{childList:true,subtree:true})
  window.addEventListener('resize',apply)
})()
