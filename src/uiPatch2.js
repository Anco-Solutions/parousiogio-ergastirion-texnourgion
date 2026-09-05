// Final visual system: approved composition with clean logo, title, clock and mobile navigation.
(function () {
  const ID = 'aen-final-visual-system'
  function apply() {
    if (!document.head) return
    let style = document.getElementById(ID)
    if (!style) { style = document.createElement('style'); style.id = ID; document.head.appendChild(style) }
    style.textContent = `
      .topbar{isolation:isolate!important;position:relative!important;overflow:hidden!important}
      .brand-button{position:absolute!important;z-index:3!important;margin:0!important}
      .brand-mark,.brand-mark.aen-logo-mark{position:relative!important;background:#fff!important;overflow:hidden!important}
      .brand-mark::before,.brand-mark::after,.aen-logo-mark::before,.aen-logo-mark::after{display:none!important;content:none!important}
      .aen-exact-logo{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important;padding:5px!important;opacity:1!important;visibility:visible!important;filter:none!important;mix-blend-mode:normal!important;background:#fff!important}
      .topbar>div:last-child{z-index:6!important}.aen-datetime{z-index:5!important}
      @media(min-width:651px){
        .topbar{height:250px!important;min-height:250px!important;box-sizing:border-box!important;padding:24px 54px!important}
        .brand-button{left:54px!important;top:28px!important;max-width:calc(100% - 340px)!important;display:flex!important;align-items:center!important;gap:24px!important}
        .aen-logo-mark{width:168px!important;height:168px!important;min-width:168px!important;min-height:168px!important;border:3px solid #fff!important;border-radius:24px!important;box-shadow:0 10px 28px rgba(0,0,0,.18)!important}
        .brand-button>span:last-child{display:flex!important;flex-direction:column!important;justify-content:center!important;min-width:0!important}
        .brand-button strong{order:1!important;font-size:clamp(42px,5vw,64px)!important;line-height:.98!important;white-space:nowrap!important;color:#fff!important}
        .brand-button .eyebrow{order:2!important;margin:10px 0 0!important;color:#dcecff!important;font-size:clamp(12px,1.25vw,16px)!important;line-height:1.25!important;letter-spacing:.11em!important;white-space:nowrap!important}
        .aen-datetime{right:54px!important;bottom:30px!important;display:flex!important;align-items:baseline!important;gap:10px!important;white-space:nowrap!important}
        .aen-clock{font-size:25px!important;line-height:1!important;font-weight:850!important}.aen-date{font-size:13px!important;color:#d9eaff!important}
        .topbar>div:last-child{right:54px!important;top:24px!important;bottom:auto!important}.topbar .secondary-button{padding:8px 14px!important;border-radius:12px!important}
      }
      @media(max-width:650px){
        .topbar{height:248px!important;min-height:248px!important;box-sizing:border-box!important;padding:0!important}
        .topbar::after{left:-10%!important;right:-10%!important;bottom:-66px!important;height:118px!important;border-top:1px solid rgba(255,255,255,.12)!important}
        .brand-button{left:14px!important;top:38px!important;right:14px!important;width:auto!important;max-width:none!important;height:96px!important;display:grid!important;grid-template-columns:92px minmax(0,1fr)!important;align-items:center!important;gap:14px!important;padding:0!important}
        .aen-logo-mark{width:92px!important;height:92px!important;min-width:92px!important;min-height:92px!important;border:3px solid #fff!important;border-radius:18px!important;box-shadow:0 9px 22px rgba(0,0,0,.18)!important}
        .brand-button>span:last-child{display:flex!important;flex-direction:column!important;justify-content:center!important;min-width:0!important}
        .brand-button strong{display:block!important;order:1!important;font-size:38px!important;line-height:.96!important;letter-spacing:-.055em!important;white-space:nowrap!important;color:#fff!important}
        .brand-button .eyebrow{display:block!important;order:2!important;margin:8px 0 0!important;max-width:100%!important;font-size:8.7px!important;line-height:1.28!important;letter-spacing:.065em!important;white-space:normal!important;color:#e4f0ff!important}
        .aen-datetime{left:121px!important;right:14px!important;bottom:58px!important;display:flex!important;align-items:baseline!important;justify-content:flex-start!important;gap:7px!important;white-space:nowrap!important;text-align:left!important}
        .aen-clock{font-size:19px!important;line-height:1!important}.aen-date{font-size:8.6px!important;line-height:1!important;color:#d9eaff!important}
        .topbar>div:last-child{left:auto!important;right:14px!important;top:auto!important;bottom:13px!important}.topbar .secondary-button{min-height:40px!important;padding:7px 14px!important;border-radius:12px!important;font-size:14px!important}
        .sidebar{width:100%!important;box-sizing:border-box!important;overflow-x:auto!important;overflow-y:hidden!important;flex-wrap:nowrap!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important}.sidebar::-webkit-scrollbar{display:none!important}.nav-item{flex:0 0 auto!important}
        main{padding:20px 14px 40px!important}.stats{gap:12px!important}.stat-card{padding:18px 20px!important;min-height:0!important}.stat-card span{font-size:15px!important}.stat-card strong{font-size:40px!important;margin-top:8px!important}
      }
    `
    const img = document.querySelector('.brand-mark .aen-exact-logo')
    if (img) { img.src = `${import.meta.env.BASE_URL}aem-logo.svg?v=20260905d`; img.style.objectFit='contain'; img.style.visibility='visible'; img.style.opacity='1' }
  }
  apply()
  const observer = new MutationObserver(() => requestAnimationFrame(apply))
  observer.observe(document.documentElement,{childList:true,subtree:true})
  window.addEventListener('resize',apply)
})()
