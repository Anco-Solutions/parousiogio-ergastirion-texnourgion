function normalize(value) {
  return String(value || '').replace(/[|¦]/g, ' ').replace(/\s+/g, ' ').trim()
}

function registryToken(token) {
  return String(token || '').toUpperCase()
    .replace(/[ΟO]/g, '0').replace(/[ΙIÎ]/g, '1').replace(/[ΖZ]/g, '2')
    .replace(/[ΕE]/g, '3').replace(/[ΑA]/g, '4').replace(/[SΣ]/g, '5')
    .replace(/[GΓ]/g, '6').replace(/[ΤT]/g, '7').replace(/[ΒB]/g, '8')
    .replace(/[qQ]/g, '9').replace(/\D/g, '')
}

function rowsFromWords(words) {
  const usable = (words || []).map((word) => {
    const text = normalize(word?.text || '')
    const b = word?.bbox || {}
    const x = Number(b.x0), y = Number(b.y0), x1 = Number(b.x1), y1 = Number(b.y1)
    return { text, x, y, x1, y1, cy: (y + y1) / 2, h: Math.max(1, y1 - y) }
  }).filter((word) => word.text && Number.isFinite(word.x) && Number.isFinite(word.y) && Number.isFinite(word.x1) && Number.isFinite(word.y1))
  usable.sort((a, b) => a.cy - b.cy || a.x - b.x)
  const rows = []
  for (const word of usable) {
    let row = rows.find((candidate) => Math.abs(candidate.cy - word.cy) <= Math.max(14, Math.min(candidate.h, word.h) * 0.8))
    if (!row) { row = { cy: word.cy, h: word.h, words: [] }; rows.push(row) }
    row.words.push(word)
    row.cy = row.words.reduce((sum, item) => sum + item.cy, 0) / row.words.length
    row.h = Math.max(row.h, word.h)
  }
  return rows.sort((a, b) => a.cy - b.cy).map((row) => ({ cy: row.cy, text: row.words.sort((a, b) => a.x - b.x).map((word) => word.text).join(' ') }))
}

function detectVerticalSplit(bitmap) {
  const probe = document.createElement('canvas')
  probe.width = Math.min(700, bitmap.width)
  probe.height = Math.min(1400, bitmap.height)
  const ctx = probe.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(bitmap, 0, 0, probe.width, probe.height)
  const data = ctx.getImageData(0, 0, probe.width, probe.height).data
  const scores = new Array(probe.width).fill(0)
  for (let x = 0; x < probe.width; x += 1) {
    let dark = 0
    for (let y = 0; y < probe.height; y += 2) {
      const i = (y * probe.width + x) * 4
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      if (lum < 125) dark += 1
    }
    scores[x] = dark
  }
  let bestX = Math.round(probe.width * 0.18)
  let bestScore = -1
  const minX = Math.round(probe.width * 0.08)
  const maxX = Math.round(probe.width * 0.45)
  for (let x = minX; x <= maxX; x += 1) {
    const score = (scores[x - 1] || 0) + scores[x] + (scores[x + 1] || 0)
    if (score > bestScore) { bestScore = score; bestX = x }
  }
  return Math.round((bestX / probe.width) * bitmap.width)
}

export async function parseOcrColumns(file, worker) {
  const bitmap = await createImageBitmap(file)
  try {
    const width = bitmap.width
    const height = bitmap.height
    const detectedSplit = detectVerticalSplit(bitmap)
    const split = Math.max(Math.round(width * 0.12), Math.min(Math.round(width * 0.32), detectedSplit))

    const makeColumn = async (fromX, toX) => {
      const sourceWidth = Math.max(1, toX - fromX)
      const scale = Math.min(3.5, 2600 / sourceWidth)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(sourceWidth * scale))
      canvas.height = Math.max(1, Math.round(height * scale))
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(bitmap, fromX, 0, sourceWidth, height, 0, 0, canvas.width, canvas.height)
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = image.data
      for (let i = 0; i < d.length; i += 4) {
        const y = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114
        const v = Math.max(0, Math.min(255, ((y - 128) * 1.9) + 128))
        d[i] = v; d[i + 1] = v; d[i + 2] = v
      }
      ctx.putImageData(image, 0, 0)
      return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('OCR column image failed')), 'image/jpeg', 0.97))
    }

    const leftEdge = Math.max(0, split - Math.round(width * 0.008))
    const rightEdge = Math.min(width, split + Math.round(width * 0.008))
    const numberResult = await worker.recognize(await makeColumn(0, leftEdge), { tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' })
    const nameResult = await worker.recognize(await makeColumn(rightEdge, width), { tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' })
    const numberRows = rowsFromWords(numberResult.data.words || [])
    const nameRows = rowsFromWords(nameResult.data.words || [])

    const numbers = []
    for (const row of numberRows) {
      const matches = row.text.match(/[0-9ΟOIΙΖZΕEAΑSΣGΓΤTΒBqQ]{3,8}/g) || []
      for (const token of matches) {
        const n = registryToken(token)
        if (n.length >= 4 && n.length <= 6) { numbers.push({ cy: row.cy, registryNumber: n }); break }
      }
    }

    const names = nameRows
      .map((row) => ({ cy: row.cy, fullName: normalize(row.text) }))
      .filter((row) => /[A-ZΑ-ΩΆΈΉΊΌΎΏα-ωάέήίόύώ]{2,}/u.test(row.fullName))

    const results = []
    const used = new Set()
    for (const number of numbers) {
      let best = null
      let distanceBest = Infinity
      for (const row of names) {
        const distance = Math.abs(row.cy - number.cy)
        if (distance < distanceBest && distance <= 120 && !used.has(row)) { best = row; distanceBest = distance }
      }
      if (!best || results.some((item) => item.registryNumber === number.registryNumber)) continue
      const parts = best.fullName.split(/\s+/).filter(Boolean)
      if (parts.length < 2) continue
      used.add(best)
      results.push({ registryNumber: number.registryNumber, fullName: best.fullName, lastName: parts[0], firstName: parts.slice(1).join(' ') })
    }
    return results
  } finally {
    bitmap.close?.()
  }
}
