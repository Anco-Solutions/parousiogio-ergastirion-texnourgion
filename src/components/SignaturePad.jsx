import { useEffect, useRef, useState } from 'react'

export default function SignaturePad({ onComplete, disabled = false }) {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const previous = canvas.toDataURL()
      canvas.width = Math.round(rect.width * ratio)
      canvas.height = Math.round(rect.height * ratio)
      const ctx = canvas.getContext('2d')
      ctx.scale(ratio, ratio)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 2.4
      if (hasSignature && previous !== 'data:,') {
        const image = new Image()
        image.onload = () => ctx.drawImage(image, 0, 0, rect.width, rect.height)
        image.src = previous
      }
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [hasSignature])

  function point(event) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function start(event) {
    if (disabled) return
    event.preventDefault()
    canvasRef.current.setPointerCapture?.(event.pointerId)
    drawingRef.current = true
    const { x, y } = point(event)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function move(event) {
    if (!drawingRef.current || disabled) return
    event.preventDefault()
    const { x, y } = point(event)
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  function end(event) {
    if (!drawingRef.current) return
    drawingRef.current = false
    canvasRef.current.releasePointerCapture?.(event.pointerId)
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  function complete() {
    if (!hasSignature || disabled) return
    const signature = canvasRef.current.toDataURL('image/png')
    onComplete?.(signature)
  }

  return (
    <div className="signature-pad">
      <div className="signature-pad-header">
        <div>
          <strong>✍️ Ηλεκτρονική υπογραφή καθηγητή</strong>
          <span>Υπογράψτε με το δάχτυλο απευθείας στην οθόνη.</span>
        </div>
        <span className="signature-status">{hasSignature ? 'Υπογραφή καταχωρήθηκε προσωρινά' : 'Αναμονή υπογραφής'}</span>
      </div>

      <div className={`signature-canvas-wrap ${disabled ? 'disabled' : ''}`}>
        <canvas
          ref={canvasRef}
          className="signature-canvas"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          aria-label="Περιοχή ηλεκτρονικής υπογραφής"
        />
        {!hasSignature && <span className="signature-placeholder">Υπογράψτε εδώ</span>}
      </div>

      <div className="signature-actions">
        <button type="button" className="secondary-button" onClick={clear} disabled={!hasSignature || disabled}>Καθαρισμός</button>
        <button type="button" className="primary-button" onClick={complete} disabled={!hasSignature || disabled}>✓ Ολοκλήρωση υπογραφής</button>
      </div>
    </div>
  )
}
