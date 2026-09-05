// Final visual correction pass for the AEN mobile/desktop header.
(function () {
  const ID = 'aen-final-visual-pass'

  function apply() {
    if (!document.head) return
    let style = document.getElementById(ID)
    if (!style) {
      style = document.createElement('style')
      style.id = ID
      document.head.appendChild(style)
    }
    style.textContent = `
      .aen-logo-mark,
      .brand-mark.aen-logo-mark { background:#fff !important; }
      .aen-exact-logo { object-fit:contain !important; object-position:center !important; opacity:1 !important; filter:none !important; mix-blend-mode:normal !important; background:#fff !important; }
      .topbar { isolation:isolate !important; }
      .brand-button { z-index:3 !important; }
      .aen-datetime { z-index:4 !important; }
      .topbar > div:last-child { z-index:5 !important; }

      @media (max-width:650px) {
        .topbar { height:248px !important; min-height:248px !important; box-sizing:border-box !important; padding:18px 14px 16px !important; }
        .topbar:after { bottom:-58px !important; height:112px !important; }
        .brand-button { position:absolute !important; left:14px !important; right:14px !important; top:36px !important; width:auto !important; max-width:none !important; display:grid !important; grid-template-columns:92px minmax(0,1fr) !important; align-items:center !important; gap:15px !important; padding:0 !important; }
        .aen-logo-mark { width:92px !important; height:92px !important; min-width:92px !important; min-height:92px !important; border-radius:18px !important; border:3px solid #fff !important; box-shadow:0 10px 24px rgba(0,0,0,.18) !important; }
        .brand-button > span:last-child { min-width:0 !important; overflow:visible !important; }
        .brand-button strong { display:block !important; font-size:38px !important; line-height:.98 !important; letter-spacing:-.055em !important; white-space:nowrap !important; }
        .brand-button .eyebrow { display:block !important; margin:8px 0 0 !important; max-width:none !important; font-size:9px !important; line-height:1.25 !important; letter-spacing:.075em !important; white-space:normal !important; color:#e3efff !important; }
        .aen-datetime { left:121px !important; right:14px !important; bottom:73px !important; justify-content:flex-start !important; text-align:left !important; gap:8px !important; white-space:nowrap !important; }
        .aen-clock { font-size:20px !important; letter-spacing:.02em !important; }
        .aen-date { font-size:9px !important; }
        .topbar > div:last-child { right:14px !important; top:auto !important; bottom:14px !important; }
        .topbar .secondary-button { min-height:40px !important; padding:7px 13px !important; border-radius:12px !important; font-size:14px !important; box-shadow:0 5px 14px rgba(0,0,0,.12) !important; }
        main { padding:22px 14px 42px !important; }
        .dashboard-grid { gap:12px !important; }
        .stat-card, .data-card { border-radius:20px !important; }
        .stat-card { min-height:0 !important; padding:20px !important; }
        .stat-card h3 { font-size:17px !important; }
        .stat-card .stat-value { font-size:42px !important; }
        .sidebar { overflow-x:auto !important; overscroll-behavior-x:contain !important; scrollbar-width:none !important; -webkit-overflow-scrolling:touch !important; scroll-snap-type:x proximity !important; }
        .sidebar::-webkit-scrollbar { display:none !important; }
        .nav-item { flex:0 0 auto !important; scroll-snap-align:start !important; }
      }
      @media (min-width:651px) { .aen-exact-logo { object-fit:contain !important; } }
    `
    const mark = document.querySelector('.brand-mark')
    if (mark) {
      const img = mark.querySelector('.aen-exact-logo')
      if (img) {
        img.src = `${import.meta.env.BASE_URL}aem-logo.svg?v=20260905b`
        img.style.objectFit = 'contain'
      }
    }
  }

  apply()
  const observer = new MutationObserver(() => requestAnimationFrame(apply))
  observer.observe(document.documentElement, { childList:true, subtree:true })
  window.addEventListener('resize', apply)
})()
