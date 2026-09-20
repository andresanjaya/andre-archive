import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react"

const SIDE = 16
const CELL = 16
const STORAGE_KEY = "andre-archive-tiny-pixels-v1"
const COLORS = ["", "#1d2833", "#f3ede2", "#e7be4a", "#e87055", "#4da3cc", "#5b9975", "#9d75af"] as const
type Tool = "pencil" | "eraser"
type Point = { x: number; y: number }

function decode(value: string | null) {
  if (!value || !/^[0-7]{256}$/.test(value)) return new Uint8Array(SIDE * SIDE)
  return Uint8Array.from(value, (digit) => Number(digit))
}

export default function TinyPixelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pixelsRef = useRef(new Uint8Array(SIDE * SIDE))
  const pointerRef = useRef<{ id: number; last: Point | null } | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [tool, setTool] = useState<Tool>("pencil")
  const [color, setColor] = useState(3)
  const [ready, setReady] = useState(false)

  const draw = useCallback((showGrid: boolean) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return
    context.fillStyle = "#eee9d9"
    context.fillRect(0, 0, canvas.width, canvas.height)
    for (let index = 0; index < pixelsRef.current.length; index += 1) {
      const value = pixelsRef.current[index]
      if (!value) continue
      context.fillStyle = COLORS[value]
      context.fillRect((index % SIDE) * CELL, Math.floor(index / SIDE) * CELL, CELL, CELL)
    }
    if (showGrid) {
      context.strokeStyle = "rgba(33,56,47,.16)"
      context.lineWidth = 1
      context.beginPath()
      for (let index = 0; index <= SIDE; index += 1) {
        const position = index * CELL + .5
        context.moveTo(position, 0); context.lineTo(position, SIDE * CELL)
        context.moveTo(0, position); context.lineTo(SIDE * CELL, position)
      }
      context.stroke()
    }
  }, [])
  useEffect(() => {
    try { pixelsRef.current = decode(window.localStorage.getItem(STORAGE_KEY)) } catch { pixelsRef.current = decode(null) }
    setReady(true)
  }, [])
  useEffect(() => { if (ready) draw(expanded) }, [draw, expanded, ready])
  const persist = () => {
    try { window.localStorage.setItem(STORAGE_KEY, Array.from(pixelsRef.current).join("")) } catch { /* Storage may be unavailable; drawing still works this session. */ }
  }
  const pointAt = (event: PointerEvent<HTMLCanvasElement>): Point | null => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left) / rect.width * SIDE)
    const y = Math.floor((event.clientY - rect.top) / rect.height * SIDE)
    return x >= 0 && x < SIDE && y >= 0 && y < SIDE ? { x, y } : null
  }
  const paintLine = (start: Point, end: Point) => {
    let x = start.x; let y = start.y
    const dx = Math.abs(end.x - x); const dy = Math.abs(end.y - y)
    const sx = x < end.x ? 1 : -1; const sy = y < end.y ? 1 : -1
    let error = dx - dy
    while (true) {
      pixelsRef.current[y * SIDE + x] = tool === "eraser" ? 0 : color
      if (x === end.x && y === end.y) break
      const twice = 2 * error
      if (twice > -dy) { error -= dy; x += sx }
      if (twice < dx) { error += dx; y += sy }
    }
    draw(true)
  }
  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    event.stopPropagation()
    if (event.pointerType === "mouse" && event.button !== 0) return
    if (!expanded) { setExpanded(true); return }
    const point = pointAt(event)
    if (!point) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointerRef.current = { id: event.pointerId, last: point }
    paintLine(point, point)
  }
  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    event.stopPropagation()
    const pointer = pointerRef.current
    if (!pointer || pointer.id !== event.pointerId) return
    const point = pointAt(event)
    if (point && pointer.last) paintLine(pointer.last, point)
    pointer.last = point
  }
  const finish = (event: PointerEvent<HTMLCanvasElement>) => {
    event.stopPropagation()
    if (pointerRef.current?.id !== event.pointerId) return
    pointerRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    persist()
  }
  const clear = () => { pixelsRef.current.fill(0); draw(expanded); persist() }
  const download = () => {
    const output = document.createElement("canvas")
    output.width = SIDE * CELL; output.height = SIDE * CELL
    const context = output.getContext("2d")
    if (!context) return
    context.fillStyle = "#eee9d9"; context.fillRect(0, 0, output.width, output.height)
    for (let index = 0; index < pixelsRef.current.length; index += 1) {
      const value = pixelsRef.current[index]
      if (!value) continue
      context.fillStyle = COLORS[value]
      context.fillRect((index % SIDE) * CELL, Math.floor(index / SIDE) * CELL, CELL, CELL)
    }
    const link = document.createElement("a")
    link.download = "andre-archive-pixel-art.png"
    link.href = output.toDataURL("image/png")
    link.click()
  }

  return <section className={`tiny-pixel ${expanded ? "is-expanded" : ""}`} aria-label="Tiny Pixel Canvas" onPointerDown={(event) => event.stopPropagation()} onPointerMove={(event) => event.stopPropagation()} onPointerUp={(event) => event.stopPropagation()} onPointerCancel={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()}>
    <span className="tiny-pixel-tape" aria-hidden="true" />
    {expanded && <header><strong>TINY PIXEL CANVAS</strong><button type="button" onClick={() => { persist(); setExpanded(false) }} aria-label="Minimize pixel canvas">×</button></header>}
    <canvas ref={canvasRef} width={SIDE * CELL} height={SIDE * CELL} tabIndex={expanded ? 0 : -1} role="img" aria-label={expanded ? "16 by 16 drawing grid. Drag a finger or pointer to paint." : "Your saved pixel artwork"} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} />
    {expanded ? <div className="tiny-pixel-controls">
      <div className="tiny-pixel-tools"><button type="button" aria-pressed={tool === "pencil"} onClick={() => setTool("pencil")}>Pencil</button><button type="button" aria-pressed={tool === "eraser"} onClick={() => setTool("eraser")}>Eraser</button></div>
      <div className="tiny-pixel-colors" aria-label="Pixel colors">{COLORS.slice(1).map((value, index) => <button key={value} type="button" aria-label={`Color ${index + 1}`} aria-pressed={tool === "pencil" && color === index + 1} style={{ backgroundColor: value }} onClick={() => { setColor(index + 1); setTool("pencil") }} />)}</div>
      <div className="tiny-pixel-actions"><button type="button" onClick={clear}>Clear</button><button type="button" onClick={download}>PNG ↓</button></div>
    </div> : <button className="tiny-pixel-open" type="button" onClick={() => setExpanded(true)} aria-label="Open Tiny Pixel Canvas">PIXEL / 16 × 16</button>}
  </section>
}
