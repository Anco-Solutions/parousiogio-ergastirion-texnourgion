const PERIODS = {
  WINTER: [
    ['A', 'Α'],
    ['D', 'Δ'],
    ['ST', 'ΣΤ'],
  ],
  SPRING: [
    ['B', 'Β'],
    ['G', 'Γ'],
    ['E', 'Ε'],
  ],
}

function setText(element, value) {
  if (element && element.textContent !== value) element.textContent = value
}

function applyPatch() {
  const eyebrow = document.querySelector('.brand-button .eyebrow')
  const brand = document.querySelector('.brand-button strong')
  const mark = document.querySelector('.brand-mark')
  const title = document.querySelector('.hero h1')
  const copy = document.querySelector('.hero-copy')

  setText(eyebrow, 'ΑΕΜ ΑΣΠΡΟΠΥΡΓΟΥ • ΣΧΟΛΗ ΜΗΧΑΝΙΚΩΝ')
  setText(brand, 'Παρουσιολόγια')
  setText(title, 'Παρουσιολόγια Εργαστηρίων – Τεχνουργείων')
  setText(copy, 'Κεντρικό περιβάλλον για σπουδαστές, ομάδες, μαθήματα, καθηγητές, πρόγραμμα και παρουσιολόγια εργαστηρίων – τεχνουργείων.')

  if (mark && !mark.querySelector('img')) {
    mark.textContent = ''
    const img = document.createElement('img')
    img.src = `${import.meta.env.BASE_URL}aem-logo.svg`
    img.alt = 'ΑΕΜ Ασπροπύργου – Σχολή Μηχανικών'
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.objectFit = 'contain'
    img.style.borderRadius = '10px'
    mark.appendChild(img)
  }

  const periodSelect = [...document.querySelectorAll('select')].find((s) => s.getAttribute('aria-label') === 'Επιλογή ακαδημαϊκής περιόδου')
  const semesterSelect = [...document.querySelectorAll('select')].find((s) => s.getAttribute('aria-label') === 'Επιλογή τρέχοντος εξαμήνου')
  if (!periodSelect || !semesterSelect) return

  const options = PERIODS[periodSelect.value] || PERIODS.WINTER
  const signature = `${periodSelect.value}:${options.map((x) => x[0]).join(',')}`
  if (semesterSelect.dataset.uiPatchSignature !== signature) {
    const current = semesterSelect.value
    semesterSelect.innerHTML = ''

    const placeholder = document.createElement('option')
    placeholder.value = ''
    placeholder.textContent = 'Επιλέξτε εξάμηνο'
    semesterSelect.appendChild(placeholder)

    for (const [code, label] of options) {
      const option = document.createElement('option')
      option.value = code
      option.textContent = label
      semesterSelect.appendChild(option)
    }

    semesterSelect.value = options.some(([code]) => code === current) ? current : ''
    semesterSelect.dataset.uiPatchSignature = signature
  }
}

let queued = false
function schedulePatch() {
  if (queued) return
  queued = true
  window.requestAnimationFrame(() => {
    queued = false
    applyPatch()
  })
}

const observer = new MutationObserver(schedulePatch)
observer.observe(document.documentElement, { childList: true, subtree: true })
window.addEventListener('change', (event) => {
  if (event.target?.matches?.('select[aria-label="Επιλογή ακαδημαϊκής περιόδου"]')) schedulePatch()
})
schedulePatch()
