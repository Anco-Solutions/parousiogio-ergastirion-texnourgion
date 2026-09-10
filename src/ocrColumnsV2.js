import { PaddleOcrService } from 'paddleocr'
import * as ort from 'onnxruntime-web'

const DET_URL = 'https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det_onnx/resolve/main/inference.onnx'
// Keep the recognition model and dictionary from the same export family.
const REC_URL = 'https://media.githubusercontent.com/media/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main/recognition/multi/el/v5/el_PP-OCRv5_mobile_rec_infer.onnx'
const DICT_URL = 'https://raw.githubusercontent.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models/main/recognition/multi/el/v5/ppocrv5_el_dict.txt'

let servicePromise = null
let modelPromise = null

const normalize = (value) => String(value || '').replace(/[|¦]/g, ' ').replace(/\s+/g, ' ').trim()

function registryToken(token) {
  return String(token || '').toUpperCase()
    .replace(/[ΟO]/g, '0').replace(/[ΙIÎ]/g, '1').replace(/[ΖZ]/g, '2')
    .replace(/[ΕE]/g, '3').replace(/[ΑA]/g, '4').replace(/[SΣ]/g, '5')
    .replace(/[GΓ]/g, '6').replace(/[ΤT]/g, '7').replace(/[ΒB]/g, '8')
    .replace(/[qQ]/g, '9').replace(/\D/g, '')
}

function extractNumber(text) {
  const tokens = String(text || '').match(/[0-9ΟOΙIΖZΕEΑASΣGΓΤTΒBqQ]{3,8}/g) || []
  for (const token of tokens) {
    const n = registryToken(token)
    if (n.length >= 4 && n.length <= 6) return n
  }
  return null
}

async function fetchBuffer(url) {
  const response = await fetch(url, { mode: 'cors', cache: 'force-cache' })
  if (!response.ok) throw new Error(`OCR model download failed (${response.status})`)
  return response.arrayBuffer()
}

async function fetchText(url) {
  const response = await fetch(url, { mode: 'cors', cache: 'force-cache' })
  if (!response.ok) throw new Error(`OCR dictionary download failed (${response.status})`)
  return response.text()
}

async function getService() {
  if (!servicePromise) {
    servicePromise = (modelPromise || (modelPromise = Promise.all([fetchBuffer(DET_URL), fetchBuffer(REC_URL), fetchText(DICT_URL)])))
      .then(([detModel, recModel, dictText]) => PaddleOcrService.createInstance({
        ort,
        modelPreset: 'PP-OCRv5_mobile',
        detection: { modelBuffer: detModel },
        recognition: {
          modelBuffer: recModel,
          charactersDictionary: dictText.trim().split(/\r?\n/).filter(Boolean)
        }
      }))
      .catch((error) => { servicePromise = null; throw error })
  }
  return servicePromise
}

function canvasFromBitmap(bitmap) {
  const scale = Math.min(1, 2800 / bitmap.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas
}

function canvasPixels(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  return { width: canvas.width, height: canvas.height, data: new Uint8Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data) }
}

function centerOfBox(box) {
  if (Array.isArray(box)) {
    const points = box.flatMap((point) => Array.isArray(point) ? point : [])
    if (points.length >= 8) {
      const xs = []; const ys = []
      for (let i = 0; i < points.length; i += 2) { xs.push(Number(points[i])); ys.push(Number(points[i + 1])) }
      return { x: xs.reduce((a, b) => a + b, 0) / xs.length, y: ys.reduce((a, b) => a + b, 0) / ys.length, h: Math.max(1, Math.max(...ys) - Math.min(...ys)) }
    }
  }
  return { x: Number(box?.x || 0) + Number(box?.width || 0) / 2, y: Number(box?.y || 0) + Number(box?.height || 0) / 2, h: Math.max(1, Number(box?.height || 1)) }
}

function groupRows(items) {
  const ordered = items.slice().sort((a, b) => a.cy - b.cy || a.cx - b.cx)
  const heights = ordered.map((item) => item.h).filter((value) => Number.isFinite(value)).sort((a, b) => a - b)
  const medianHeight = heights.length ? heights[Math.floor(heights.length / 2)] : 20
  const tolerance = Math.max(10, medianHeight * 0.8)
  const rows = []
  for (const item of ordered) {
    let best = null
    let bestDistance = Infinity
    for (const row of rows) {
      const distance = Math.abs(row.cy - item.cy)
      if (distance <= tolerance && distance < bestDistance) { best = row; bestDistance = distance }
    }
    if (!best) { best = { cy: item.cy, items: [] }; rows.push(best) }
    best.items.push(item)
    best.cy = best.items.reduce((sum, current) => sum + current.cy, 0) / best.items.length
  }
  return rows.sort((a, b) => a.cy - b.cy)
}

function parseDetectedRows(items) {
  const rows = groupRows(items)
  const results = []
  const seen = new Set()
  for (const row of rows) {
    const cells = row.items.slice().sort((a, b) => a.cx - b.cx)
    let numberIndex = -1
    let registryNumber = ''
    for (let i = 0; i < cells.length; i += 1) {
      const candidate = extractNumber(cells[i].text)
      if (candidate) { numberIndex = i; registryNumber = candidate; break }
    }
    if (numberIndex < 0 || seen.has(registryNumber)) continue
    const nameWords = cells.slice(numberIndex + 1)
      .map((cell) => normalize(cell.text))
      .filter((text) => /[Α-Ωα-ωΆ-Ώά-ώ]/u.test(text))
      .filter((text) => !/^(?:ΑΜ|ΟΝΟΜΑΤΕΠΩΝΥΜΟ|ΕΠΩΝΥΜΟ|ΟΝΟΜΑ)$/iu.test(text))
    if (nameWords.length < 2) continue
    const fullName = nameWords.join(' ').replace(/\s+/g, ' ').trim()
    const parts = fullName.split(/\s+/).filter(Boolean)
    if (parts.length < 2) continue
    seen.add(registryNumber)
    results.push({ registryNumber, fullName, lastName: parts[0], firstName: parts.slice(1).join(' ') })
  }
  return results
}

export async function parseOcrColumnsV2(file) {
  const ocr = await getService()
  const bitmap = await createImageBitmap(file)
  try {
    const canvas = canvasFromBitmap(bitmap)
    const detected = []
    await ocr.recognize(canvasPixels(canvas), {
      detection: {
        textPixelThreshold: 0.18,
        boxScoreThreshold: 0.15,
        unclipRatio: 1.5,
        limitType: 'max',
        maxSideLimit: 2800
      },
      ordering: { sortByReadingOrder: true },
      onProgress(event) {
        if (event?.type === 'rec' && event?.stage === 'item' && event?.result?.text && event?.box) {
          const center = centerOfBox(event.box)
          detected.push({ text: normalize(event.result.text), cx: center.x, cy: center.y, h: center.h })
        }
      }
    })
    const rows = parseDetectedRows(detected)
    if (rows.length) return rows

    const fallbackText = detected.map((item) => item.text).join(' ')
    const number = extractNumber(fallbackText)
    if (!number) return []
    const names = detected.filter((item) => /[Α-Ωα-ωΆ-Ώά-ώ]/u.test(item.text)).map((item) => item.text).filter(Boolean)
    if (!names.length) return []
    const fullName = normalize(names.join(' '))
    const parts = fullName.split(/\s+/).filter(Boolean)
    if (parts.length < 2) return []
    return [{ registryNumber: number, fullName, lastName: parts[0], firstName: parts.slice(1).join(' ') }]
  } finally {
    bitmap.close?.()
  }
}
