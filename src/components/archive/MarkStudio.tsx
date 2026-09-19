import { useEffect, useRef, useState } from "react"

type Stroke = { id: number; path: string; color: string; width: number }

const COLORS = ["#f4efe4", "#f2c318", "#e8664c", "#64b7e8", "#75c99f", "#1a2334"]

export default function MarkStudio({ onClose }: { onClose: () => void }) {
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [color, setColor] = useState(COLORS[0])
  const [width, setWidth] = useState(6)
  const drawingId = useRef<number | null>(null)
  const activePointer = useRef<number | null>(null)
  const nextId = useRef(0)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => { window.removeEventListener("keydown", onKey); previous?.focus() }
  }, [onClose])

  const point = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: Math.round((event.clientX - rect.left) / rect.width * 900), y: Math.round((event.clientY - rect.top) / rect.height * 600) }
  }
  const begin = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return
    if (activePointer.current !== null) return
    const { x, y } = point(event)
    const id = ++nextId.current
    drawingId.current = id
    activePointer.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    setStrokes((current) => [...current, { id, path: `M ${x} ${y} L ${x} ${y}`, color, width }])
  }
  const move = (event: React.PointerEvent<SVGSVGElement>) => {
    if (drawingId.current === null || activePointer.current !== event.pointerId) return
    const { x, y } = point(event)
    const id = drawingId.current
    setStrokes((current) => current.map((stroke) => stroke.id === id ? { ...stroke, path: `${stroke.path} L ${x} ${y}` } : stroke))
  }
  const end = (event: React.PointerEvent<SVGSVGElement>) => {
    if (activePointer.current !== event.pointerId) return
    drawingId.current = null
    activePointer.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const addKeyboardMark = () => {
    const x = 110 + (strokes.length % 7) * 95
    setStrokes((current) => [...current, { id: ++nextId.current, path: `M ${x} 350 L ${x + 35} 285 L ${x + 70} 330`, color, width }])
  }
  const save = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect width="900" height="600" fill="#123e67"/>${strokes.map(({ path, color: strokeColor, width: strokeWidth }) => `<path d="${path}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</svg>`
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))
    const link = document.createElement("a")
    link.href = url
    link.download = "andre-archive-mark.svg"
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const trapTab = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])'))
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }

  return <div className="mark-studio" role="dialog" aria-modal="true" aria-labelledby="mark-title" onPointerDown={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()} onKeyDown={trapTab}>
    <div className="mark-studio-head"><div><span>Andre&apos;s Archive / Playground</span><h2 id="mark-title">Make a Mark</h2><p>A little drawing surface to make something of your own. Your marks stay in this browser session unless you save them.</p></div><button ref={closeRef} type="button" onClick={onClose}>Close <span aria-hidden="true">×</span></button></div>
    <div className="mark-studio-layout">
      <div className="mark-studio-tools" aria-label="Drawing colors">{COLORS.map((item) => <button key={item} type="button" aria-label={`Use ${item} color`} aria-pressed={color === item} onClick={() => setColor(item)} style={{ background: item }} />)}</div>
      <svg viewBox="0 0 900 600" aria-label="Drawing surface" className="mark-studio-surface" onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
        {strokes.map(({ id, path, color: strokeColor, width: strokeWidth }) => <path key={id} d={path} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />)}
      </svg>
      <div className="mark-studio-actions"><label>Brush size <input type="range" min="2" max="22" value={width} onChange={(event) => setWidth(Number(event.target.value))} /></label><button type="button" onClick={addKeyboardMark}>Add mark</button><button type="button" onClick={() => setStrokes((current) => current.slice(0, -1))} disabled={!strokes.length}>Undo</button><button type="button" onClick={() => setStrokes([])} disabled={!strokes.length}>Clear</button><button type="button" onClick={save} disabled={!strokes.length}>Save SVG</button></div>
    </div>
  </div>
}
