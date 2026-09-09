import { PaddleOCR } from '@paddleocr/paddleocr-js'

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

let paddlePromise = null

async function getPaddleOcr() {
  if (!paddlePromise) {
    paddlePromise = PaddleOCR.create({
      textDetectionModelName: 'PP-OCRv5_mobile_det',
      textRecognitionModelName: 'el_PP-OCRv5_mobile_rec',
      worker: true,
      textDetectionBatchSize: 2,
      textRecognitionBatchSize: 4,
      ortOptions: {
        backend: 'wasm',
        wasmPaths: 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/',
        numThreads: 2,
        simd: true
      }
    }).catch((error) => {
      paddlePromise = null
      throw error
    })
  }
  return paddlePromise
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

function extractNumber(text) {
  const tokens = String(text || '').match(/[0-9ΟOΙIΖZΕEΑASΣGΓΤTΒBqQ]{3,8}/g) || []
  for (const token of tokens) {
    const n = registryToken(token)
    if (n.length >= 4 && n.length <= 6) return n
  }
  return null
}

function extractPaddleText(result) {
  return (result?.items || [])
    .slice()
    .sort((a, b) => {
      const ay = Math.min(...(a.poly || []).map((p) => p[1] ?? 0))
      const by = Math.min(...(b.poly || []).map((p) => p[1] ?? 0))
      return ay - by
    })
    .map((item) => normalize(item.text))
    .filter(Boolean)
}

async function recognizePaddle(ocr, blob, threshold = 0.30) {
  const [result] = await ocr.predict(blob, {
    textDetBoxThresh: 0.20,
    textDetThresh: 0.20,
    textRecScoreThresh: threshold,
    textDetLimitSideLen: 1800,
    textDetLimitType: 'max'
  })
  return result
}

export async function parseOcrColumns(file) {
  const ocr = await getPaddleOcr()
  const bitmap = await createImageBitmap(file)
  try {
    const bands = detectRowBands(bitmap)
    const splitRatio = Math.max(0.12, Math.min(0.34, findLikelySplit(bitmap)))
    const splitX = Math.round(bitmap.width * splitRatio)
    const results = []

    if (bands.length >= 3) {
      for (const band of bands) {
        const rowHeight = band.bottom - band.top
        if (rowHeight < 12) continue
        const padY = Math.max(2, rowHeight * 0.08)
        const top = Math.max(0, band.top + padY)
        const bottom = Math.min(bitmap.height, band.bottom - padY)
        const numberScale = Math.min(4, 2600 / Math.max(1, splitX))
        const nameScale = Math.min(3.5, 3000 / Math.max(1, bitmap.width - splitX))
        const numberCanvas = cleanTableStrip(imageFromBitmap(bitmap, 0, top, splitX, bottom - top, numberScale))
        const nameCanvas = cleanTableStrip(imageFromBitmap(bitmap, splitX + Math.round(bitmap.width * 0.008), top, bitmap.width - splitX, bottom - top, nameScale))
        const numberResult = await recognizePaddle(ocr, await canvasBlob(numberCanvas), 0.20)
        const number = extractNumber(extractPaddleText(numberResult).join(' '))
        if (!number) continue

        const nameResult = await recognizePaddle(ocr, await canvasBlob(nameCanvas), 0.35)
        const fullName = extractPaddleText(nameResult)
          .join(' ')
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

    // Fallback: run PaddleOCR on the two complete columns when row rules are not detectable.
    const numberCanvas = cleanTableStrip(imageFromBitmap(bitmap, 0, 0, splitX, bitmap.height, Math.min(3.5, 2600 / Math.max(1, splitX))))
    const nameCanvas = cleanTableStrip(imageFromBitmap(bitmap, splitX + Math.round(bitmap.width * 0.008), 0, bitmap.width - splitX, bitmap.height, Math.min(3, 3000 / Math.max(1, bitmap.width - splitX))))
    const numberResult = await recognizePaddle(ocr, await canvasBlob(numberCanvas), 0.20)
    const nameResult = await recognizePaddle(ocr, await canvasBlob(nameCanvas), 0.35)
    const numbers = extractPaddleText(numberResult).map(extractNumber).filter(Boolean)
    const names = extractPaddleText(nameResult)
    const fallback = []
    const count = Math.min(numbers.length, names.length)
    for (let i = 0; i < count; i += 1) {
      const fullName = names[i]
      const parts = fullName.split(/\s+/).filter(Boolean)
      if (parts.length >= 2) fallback.push({ registryNumber: numbers[i], fullName, lastName: parts[0], firstName: parts.slice(1).join(' ') })
    }
    return fallback
  } finally {
    bitmap.close?.()
  }
}
