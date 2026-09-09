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
  }).filter((word) => textIsUseful(word.text) && Number.isFinite(word.x) && Number.isFinite(word.y) && Number.isFinite(word.x1) && Number.isFinite(word.y1))
  usable.sort((a, b) => a.cy - b.cy || a.x - b.x)
  const rows = []
  for (const word of usable) {
    let row = rows.find((candidate) => Math.abs(candidate.cy - word.cy) <= Math.max(12, Math.min(candidate.h, word.h) * 0.75))
    if (!row) { row = { cy: word.cy, h: word.h, words: [] }; rows.push(row) }
    row.words.push(word)
    row.cy = row.words.reduce((sum, item) => sum + item.cy, 0) / row.words.length
    row.h = Math.max(row.h, word.h)
  }
  return rows.sort((a, b) => a.cy - b.cy).map((row) => ({ cy: row.cy, text: row.words.sort((a, b) => a.x - b.x).map((word) => word.text).join(' ') }))
}

function textIsUseful(text) {
  return Boolean(text && text.trim())
}

function detectVerticalSplit(bitmap) {
  const probe = document.createElement('canvas')
  probe.width = Math.min(900, bitmap.width)
  probe.height = Math.min(1600, bitmap.height)
  const ctx = probe.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(bitmap, 0, 0, probe.width, probe.height)
  const data = ctx.getImageData(0, 0, probe.width, probe.height).data
  const scores = new Array(probe.width).fill(0)
  for (let x = 0; x < probe.width; x += 1) {
    let dark = 0
    for (let y = 0; y < probe.height; y += 3) {
      const i = (y * probe.width + x) * 4
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      if (lum < 110) dark += 1
    }
    scores[x] = dark
  }
  const minX = Math.round(probe.width * 0.08)
  const maxX = Math.round(probe.width * 0.45)
  let bestX = Math.round(probe.width * 0.20)
  let bestScore = -1
  for (let x = minX; x <= maxX; x += 1) {
    const score = (scores[x - 1] || 0) + scores[x] + (scores[x + 1] || 0)
    if (score > bestScore) { bestScore = score; bestX = x }
  }
  return Math.round((bestX / probe.width) * bitmap.width)
}

function detectHorizontalLines(bitmap) {
  const probe = document.createElement('canvas')
  const scale = Math.min(1, 1200 / bitmap.width)
  probe.width = Math.max(1, Math.round(bitmap.width * scale))
  probe.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = probe.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(bitmap, 0, 0, probe.width, probe.height)
  const data = ctx.getImageData(0, 0, probe.width, probe.height).data
  const scores = new Array(probe.height).fill(0)
  for (let y = 0; y < probe.height; y += 1) {
    let dark = 0
    let longestRun = 0
    let run = 0
    for (let x = 0; x < probe.width; x += 1) {
      const i = (y * probe.width + x) * 4
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      if (lum < 125) {
        dark += 1
        run += 1
        longestRun = Math.max(longestRun, run)
      } else {
        run = 0
      }
    }
    scores[y] = dark / probe.width + Math.min(0.5, longestRun / probe.width)
  }
  const candidates = []
  for (let y = 1; y < probe.height - 1; y += 1) {
    if (scores[y] > 0.55 && scores[y] >= scores[y - 1] && scores[y] >= scores[y + 1]) candidates.push(y)
  }
  const grouped = []
  for (const y of candidates) {
    const last = grouped[grouped.length - 1]
    if (last && y - last[last.length - 1] <= 4) last.push(y)
    else grouped.push([y])
  }
  return grouped.map((group) => {
    const center = group[Math.floor(group.length / 2)]
    return Math.round(center / scale)
  })
}

async function makeCleanImage(bitmap, fromX, toX, fromY = 0, toY = bitmap.height) {
  const sourceWidth = Math.max(1, toX - fromX)
  const sourceHeight = Math.max(1, toY - fromY)
  const scale = Math.min(3.5, 2800 / sourceWidth)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(sourceWidth * scale))
  canvas.height = Math.max(1, Math.round(sourceHeight * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(bitmap, fromX, fromY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const d = image.data
  for (let i = 0; i < d.length; i += 4) {
    const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114
    const v = Math.max(0, Math.min(255, (gray - 128) * 2.0 + 128))
    d[i] = v; d[i + 1] = v; d[i + 2] = v
  }
  ctx.putImageData(image, 0, 0)
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('OCR image failed')), 'image/jpeg', 0.97))
}

async function recognizeWithParameters(worker, blob, parameters) {
  if (worker.setParameters) await worker.setParameters(parameters)
  return worker.recognize(blob)
}

function extractRegistry(result) {
  const words = result?.data?.words || []
  const text = normalize(words.map((word) => word?.text || '').join(' '))
  const direct = text.match(/\d{4,6}/g) || []
  for (const token of direct) {
    const n = registryToken(token)
    if (n.length >= 4 && n.length <= 6) return n
  }
  const fallback = registryToken(text)
  return fallback.length >= 4 && fallback.length <= 6 ? fallback : ''
}

function extractName(result) {
  const text = normalize(result?.data?.text || '')
  return text.replace(/\s+/g, ' ').trim()
}

function splitName(fullName) {
  const parts = normalize(fullName).split(/\s+/).filter(Boolean)
  if (parts.length < 2) return null
  return { lastName: parts[0], firstName: parts.slice(1).join(' '), fullName: parts.join(' ') }
}

export async function parseOcrColumns(file, worker) {
  const bitmap = await createImageBitmap(file)
  try {
    const width = bitmap.width
    const height = bitmap.height
    const split = detectVerticalSplit(bitmap)
    const safeSplit = Math.max(Math.round(width * 0.12), Math.min(Math.round(width * 0.34), split))
    const gap = Math.max(3, Math.round(width * 0.006))
    const horizontalLines = detectHorizontalLines(bitmap)

    // The straightened form has a horizontal rule at each student row.
    // OCR each band independently so table rules cannot merge neighboring names.
    const usableLines = horizontalLines.filter((y) => y > height * 0.08 && y < height * 0.98)
    const bands = []
    for (let i = 0; i < usableLines.length - 1; i += 1) {
      const top = usableLines[i]
      const bottom = usableLines[i + 1]
      if (bottom - top >= Math.max(28, height * 0.008)) bands.push({ top, bottom })
    }

    if (bands.length >= 3) {
      const results = []
      for (const band of bands) {
        const padY = Math.max(3, Math.round((band.bottom - band.top) * 0.10))
        const fromY = band.top + padY
        const toY = band.bottom - padY
        if (toY <= fromY) continue

        const numberBlob = await makeCleanImage(bitmap, 0, Math.max(1, safeSplit - gap), fromY, toY)
        const nameBlob = await makeCleanImage(bitmap, Math.min(width - 1, safeSplit + gap), width, fromY, toY)

        const numberResult = await recognizeWithParameters(worker, numberBlob, {
          tessedit_pageseg_mode: '7',
          tessedit_char_whitelist: '0123456789',
          preserve_interword_spaces: '1'
        })
        const registryNumber = extractRegistry(numberResult)
        if (!registryNumber) continue

        const nameResult = await recognizeWithParameters(worker, nameBlob, {
          tessedit_pageseg_mode: '7',
          tessedit_char_whitelist: '',
          preserve_interword_spaces: '1'
        })
        const fullName = extractName(nameResult)
        const parsedName = splitName(fullName)
        if (!parsedName) continue

        if (!results.some((item) => item.registryNumber === registryNumber)) {
          results.push({ registryNumber, ...parsedName })
        }
      }
      if (results.length) return results
    }

    // Safe fallback for forms where the table rules are too faint to detect.
    const numberBlob = await makeCleanImage(bitmap, 0, Math.max(1, safeSplit - gap))
    const nameBlob = await makeCleanImage(bitmap, Math.min(width - 1, safeSplit + gap), width)
    const numberResult = await recognizeWithParameters(worker, numberBlob, {
      tessedit_pageseg_mode: '6',
      tessedit_char_whitelist: '0123456789',
      preserve_interword_spaces: '1'
    })
    const numberRows = rowsFromWords(numberResult.data.words || [])
    const numbers = []
    for (const row of numberRows) {
      const matches = row.text.match(/\d{3,8}/g) || []
      for (const token of matches) {
        const n = registryToken(token)
        if (n.length >= 4 && n.length <= 6) { numbers.push({ cy: row.cy, registryNumber: n }); break }
      }
    }
    const nameResult = await recognizeWithParameters(worker, nameBlob, {
      tessedit_pageseg_mode: '6',
      tessedit_char_whitelist: '',
      preserve_interword_spaces: '1'
    })
    const names = rowsFromWords(nameResult.data.words || [])
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
      const parsedName = splitName(best.fullName)
      if (!parsedName) continue
      used.add(best)
      results.push({ registryNumber: number.registryNumber, ...parsedName })
    }
    return results
  } finally {
    bitmap.close?.()
  }
}
