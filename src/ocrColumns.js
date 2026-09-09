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

function imageFromBitmap(bitmap, x, y, width, height, scale = 1) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(bitmap, x, y, width, height, 0, 0, canvas.width, canvas.height)
  return canvas
}

function cleanTableStrip(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const d = image.data
  const rowDark = new Uint32Array(canvas.height)
  const colDark = new Uint32Array(canvas.width)

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const i = (y * canvas.width + x) * 4
      const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114
      if (gray < 150) { rowDark[y] += 1; colDark[x] += 1 }
      const v = Math.max(0, Math.min(255, (gray - 128) * 2.0 + 128))
      d[i] = v; d[i + 1] = v; d[i + 2] = v
    }
  }

  // Remove only long straight table rules. Character strokes are shorter and remain.
  for (let y = 0; y < canvas.height; y += 1) {
    if (rowDark[y] > canvas.width * 0.55) {
      for (let yy = Math.max(0, y - 2); yy <= Math.min(canvas.height - 1, y + 2); yy += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const i = (yy * canvas.width + x) * 4
          d[i] = 255; d[i + 1] = 255; d[i + 2] = 255
        }
      }
    }
  }
  for (let x = 0; x < canvas.width; x += 1) {
    if (colDark[x] > canvas.height * 0.72) {
      for (let xx = Math.max(0, x - 2); xx <= Math.min(canvas.width - 1, x + 2); xx += 1) {
        for (let y = 0; y < canvas.height; y += 1) {
          const i = (y * canvas.width + xx) * 4
          d[i] = 255; d[i + 1] = 255; d[i + 2] = 255
        }
      }
    }
  }
  ctx.putImageData(image, 0, 0)
  return canvas
}

async function canvasBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('OCR image failed')), 'image/jpeg', 0.98))
}

function horizontalProjection(bitmap) {
  const probe = imageFromBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, Math.min(1, 1800 / bitmap.width))
  const ctx = probe.getContext('2d', { willReadFrequently: true })
  const data = ctx.getImageData(0, 0, probe.width, probe.height).data
  const scores = new Array(probe.height).fill(0)
  for (let y = 0; y < probe.height; y += 1) {
    let dark = 0
    for (let x = 0; x < probe.width; x += 2) {
      const i = (y * probe.width + x) * 4
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      if (lum < 115) dark += 1
    }
    scores[y] = dark
  }
  return { scores, scale: probe.height / bitmap.height }
}

function detectRowBands(bitmap) {
  const { scores, scale } = horizontalProjection(bitmap)
  const widthProbe = Math.max(1, Math.round(bitmap.width * Math.min(1, 1800 / bitmap.width)))
  const strong = scores.map((score) => score > widthProbe * 0.52)
  const runs = []
  let start = -1
  for (let y = 0; y < strong.length; y += 1) {
    if (strong[y] && start < 0) start = y
    if ((!strong[y] || y === strong.length - 1) && start >= 0) {
      const end = strong[y] ? y : y - 1
      if (end - start >= 1) runs.push({ start, end })
      start = -1
    }
  }

  // Table rules delimit rows. Convert gaps between rules to row bands.
  const lines = runs.map((r) => ({ y: (r.start + r.end) / 2 / scale, thickness: (r.end - r.start + 1) / scale }))
  const bands = []
  for (let i = 0; i + 1 < lines.length; i += 1) {
    const top = lines[i].y
    const bottom = lines[i + 1].y
    const h = bottom - top
    if (h >= 18 && h <= bitmap.height * 0.12) bands.push({ top: top + lines[i].thickness * 0.6, bottom: bottom - lines[i + 1].thickness * 0.6 })
  }
  return bands
}

function findLikelySplit(bitmap) {
  const canvas = imageFromBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, Math.min(1, 1400 / bitmap.width))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  let best = Math.round(canvas.width * 0.20), bestScore = -1
  const min = Math.round(canvas.width * 0.10), max = Math.round(canvas.width * 0.40)
  for (let x = min; x <= max; x += 1) {
    let dark = 0
    for (let y = 0; y < canvas.height; y += 3) {
      const i = (y * canvas.width + x) * 4
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      if (lum < 100) dark += 1
    }
    if (dark > bestScore) { bestScore = dark; best = x }
  }
  return best / canvas.width
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
    let row = rows.find((candidate) => Math.abs(candidate.cy - word.cy) <= Math.max(10, Math.min(candidate.h, word.h) * 0.8))
    if (!row) { row = { cy: word.cy, h: word.h, words: [] }; rows.push(row) }
    row.words.push(word)
    row.cy = row.words.reduce((sum, item) => sum + item.cy, 0) / row.words.length
    row.h = Math.max(row.h, word.h)
  }
  return rows.sort((a, b) => a.cy - b.cy).map((row) => ({ cy: row.cy, text: row.words.sort((a, b) => a.x - b.x).map((word) => word.text).join(' ') }))
}

async function recognize(worker, blob, parameters) {
  await worker.setParameters(parameters)
  return worker.recognize(blob)
}

function extractNumber(text) {
  const tokens = String(text || '').match(/[0-9ΟOΙIΖZΕEΑASΣGΓΤTΒBqQ]{4,8}/g) || []
  for (const token of tokens) {
    const n = registryToken(token)
    if (n.length >= 4 && n.length <= 6) return n
  }
  return null
}

export async function parseOcrColumns(file, worker) {
  const bitmap = await createImageBitmap(file)
  try {
    const bands = detectRowBands(bitmap)
    const splitRatio = Math.max(0.12, Math.min(0.34, findLikelySplit(bitmap)))
    const splitX = Math.round(bitmap.width * splitRatio)
    const results = []

    // Primary path: each physical table row gets its own OCR call. This prevents
    // neighbouring rows and table rules from being interpreted as one sentence.
    if (bands.length >= 3) {
      for (const band of bands) {
        const rowHeight = band.bottom - band.top
        if (rowHeight < 12) continue
        const padY = Math.max(2, rowHeight * 0.08)
        const top = Math.max(0, band.top + padY)
        const bottom = Math.min(bitmap.height, band.bottom - padY)
        const numberCanvas = cleanTableStrip(imageFromBitmap(bitmap, 0, top, splitX, bottom - top, Math.min(4, 2600 / Math.max(1, splitX))))
        const nameCanvas = cleanTableStrip(imageFromBitmap(bitmap, splitX + Math.round(bitmap.width * 0.008), top, bitmap.width - splitX, bottom - top, Math.min(3.5, 3000 / Math.max(1, bitmap.width - splitX))))
        const numberBlob = await canvasBlob(numberCanvas)
        const nameBlob = await canvasBlob(nameCanvas)

        const numberResult = await recognize(worker, numberBlob, {
          tessedit_pageseg_mode: '7',
          tessedit_char_whitelist: '0123456789',
          preserve_interword_spaces: '1'
        })
        const number = extractNumber(numberResult.data?.text || '')
        if (!number) continue

        const nameResult = await recognize(worker, nameBlob, {
          tessedit_pageseg_mode: '7',
          tessedit_char_whitelist: '',
          preserve_interword_spaces: '1'
        })
        const fullName = normalize(nameResult.data?.text || '')
          .replace(/[^A-Za-zΑ-ΩΆΈΉΊΌΎΏα-ωάέήίόύώ\-\s]/gu, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        if (!fullName) continue
        const parts = fullName.split(/\s+/).filter(Boolean)
        if (parts.length < 2) continue
        results.push({ registryNumber: number, fullName, lastName: parts[0], firstName: parts.slice(1).join(' ') })
      }
      const unique = []
      const seen = new Set()
      for (const row of results) {
        if (!seen.has(row.registryNumber)) { seen.add(row.registryNumber); unique.push(row) }
      }
      if (unique.length) return unique
    }

    // Fallback if horizontal rules could not be detected: the previous two-column
    // OCR path still gives us a useful result on forms without clear table rules.
    const numberCanvas = cleanTableStrip(imageFromBitmap(bitmap, 0, 0, splitX, bitmap.height, Math.min(3.5, 2600 / Math.max(1, splitX))))
    const nameCanvas = cleanTableStrip(imageFromBitmap(bitmap, splitX + Math.round(bitmap.width * 0.008), 0, bitmap.width - splitX, bitmap.height, Math.min(3, 3000 / Math.max(1, bitmap.width - splitX))))
    const numberResult = await recognize(worker, await canvasBlob(numberCanvas), { tessedit_pageseg_mode: '6', tessedit_char_whitelist: '0123456789', preserve_interword_spaces: '1' })
    const nameResult = await recognize(worker, await canvasBlob(nameCanvas), { tessedit_pageseg_mode: '6', tessedit_char_whitelist: '', preserve_interword_spaces: '1' })
    const numbers = rowsFromWords(numberResult.data?.words || []).map((r) => ({ cy: r.cy, registryNumber: extractNumber(r.text) })).filter((r) => r.registryNumber)
    const names = rowsFromWords(nameResult.data?.words || []).map((r) => ({ cy: r.cy, fullName: normalize(r.text) })).filter((r) => /[A-Za-zΑ-ΩΆΈΉΊΌΎΏα-ωάέήίόύώ]{2,}/u.test(r.fullName))
    const fallback = []
    for (const number of numbers) {
      const best = names.reduce((acc, row) => !acc || Math.abs(row.cy - number.cy) < Math.abs(acc.cy - number.cy) ? row : acc, null)
      if (!best || Math.abs(best.cy - number.cy) > 140) continue
      const parts = best.fullName.split(/\s+/).filter(Boolean)
      if (parts.length >= 2) fallback.push({ registryNumber: number.registryNumber, fullName: best.fullName, lastName: parts[0], firstName: parts.slice(1).join(' ') })
    }
    const uniqueFallback = []
    const seenFallback = new Set()
    for (const row of fallback) if (!seenFallback.has(row.registryNumber)) { seenFallback.add(row.registryNumber); uniqueFallback.push(row) }
    return uniqueFallback
  } finally {
    bitmap.close?.()
  }
}
