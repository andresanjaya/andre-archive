import { ArtifactRenderer } from "../../src/components/archive/ArtifactRegistry"
import type { BoardSnapshot } from "../../src/lib/archive/model"
import type { CollectionSnapshot, GalleryItem } from "../../src/lib/archive/collections"
import type { MixtapeTrack } from "../../src/data/tracks"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
const PicturePuzzle = dynamic(() => import("../../src/components/archive/PicturePuzzle"), { ssr: false })

/* ------------------------------------------------------------------ *\
   Andre's Archive — an interactive spatial interest board.
   Deep-green cutting-mat canvas, drag-to-pan, physical artifacts
   floating around a central editorial identity card.
\* ------------------------------------------------------------------ */

type Panel = "spiderman" | null

function trapDialogTab(event: React.KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "Tab") return
  const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'))
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

/* --- Artifact wrapper: absolute position from center, rotation,
       hover lift + label, keyboard focus, optional click ---------- */
function Popover({
  title,
  tag,
  accent,
  onClose,
  children,
}: {
  title: string
  tag: string
  accent: string
  onClose: () => void
  children: React.ReactNode
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => previous?.focus()
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#050b18]/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-[340px] max-w-[90vw] overflow-hidden rounded-xl bg-[#101216] text-white shadow-2xl ring-1 ring-white/10"
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ background: accent }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/90">
            {tag}
          </span>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="grid h-6 w-6 place-items-center rounded-full bg-black/25 text-white/90 transition hover:bg-black/45"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">
          <h3 className="font-serif text-2xl leading-tight">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  )
}

function PhotoGallery({ photos, onOpen, onClose, lightMode }: { photos:GalleryItem[];onOpen: (index: number) => void; onClose: () => void; lightMode: boolean }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector(".gallery-carousel")) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => { window.removeEventListener("keydown", onKey); previous?.focus() }
  }, [onClose])

  return <div className={`photo-gallery ${lightMode ? "is-light" : ""}`} role="dialog" aria-modal="true" aria-label="Photos" onPointerDown={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()} onKeyDown={trapDialogTab}>
    <button ref={closeRef} className="photo-gallery-close" type="button" onClick={onClose} aria-label="Close photos">×</button>
    <div className="photo-gallery-grid">
      {photos.map((photo, index) => <button key={photo.id} type="button" onClick={() => onOpen(index)} aria-label={`View ${photo.title}`}>
        <img src={photo.src} alt={photo.alt_text||photo.caption||photo.title} loading="lazy" decoding="async" />
      </button>)}
    </div>
  </div>
}

function GalleryCarousel({ photos, index, onChange, onClose, lightMode }: { photos:GalleryItem[];index: number; onChange: (index: number) => void; onClose: () => void; lightMode: boolean }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const startX = useRef<number | null>(null)
  const count = photos.length
  const previous = (index - 1 + count) % count
  const next = (index + 1) % count
  useEffect(() => {
    const lastFocus = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowLeft") onChange(previous)
      if (event.key === "ArrowRight") onChange(next)
    }
    window.addEventListener("keydown", onKey)
    return () => { window.removeEventListener("keydown", onKey); lastFocus?.focus() }
  }, [index, onChange, onClose, previous, next])
  if (!count) return null
  return <div className={`gallery-carousel ${lightMode ? "is-light" : ""}`} role="dialog" aria-modal="true" aria-label={`Photo ${index + 1} of ${count}`} onPointerDown={(event) => { event.stopPropagation(); startX.current = event.clientX }} onPointerUp={(event) => { if (startX.current === null) return; const delta = event.clientX - startX.current; startX.current = null; if (Math.abs(delta) > 45) onChange(delta > 0 ? previous : next) }} onPointerCancel={() => { startX.current = null }} onWheel={(event) => event.stopPropagation()} onKeyDown={trapDialogTab}>
    <button ref={closeRef} className="gallery-carousel-close" type="button" onClick={onClose} aria-label="Close photo carousel">×</button>
    <div className="gallery-carousel-track">
      {[previous, index, next].map((photoIndex, position) => <div key={`${photoIndex}-${position}`} className={`gallery-carousel-slide ${position === 1 ? "is-current" : ""}`}><img src={photos[photoIndex].src} alt={position === 1 ? photos[photoIndex].alt_text||photos[photoIndex].title : ""} decoding="async" />{position===1&&<div className="gallery-carousel-meta"><strong>{photos[photoIndex].title}</strong>{photos[photoIndex].caption&&<span>{photos[photoIndex].caption}</span>}<small>{[photos[photoIndex].location,photos[photoIndex].year].filter(Boolean).join(' · ')}</small></div>}</div>)}
    </div>
    <button className="gallery-carousel-prev" type="button" onClick={() => onChange(previous)} aria-label="Previous photo">←</button>
    <button className="gallery-carousel-next" type="button" onClick={() => onChange(next)} aria-label="Next photo">→</button>
  </div>
}

function MobileArchive({ snapshot, photos, cinemaOpen, onCinema, onMixtape }: { snapshot:BoardSnapshot;photos:GalleryItem[];cinemaOpen: boolean; onCinema: () => void; onMixtape: () => void }) {
  const visible=snapshot.artifacts.filter(item=>item.visible),pokemon=visible.find(item=>item.type==='pokemon'&&item.content.variant==='logo'),album=visible.find(item=>item.type==='music'),portrait=photos[0],references=visible.filter(item=>item.type==='sticker'||item.type==='marvel'||item.type==='stamp').slice(0,3)
  return <main className="mobile-archive" onPointerDown={(event) => event.stopPropagation()}>
    <header className="mobile-identity">
      <span>Andre&apos;s Archive · Bali, Indonesia</span>
      <h2>Andre Sanjaya</h2>
      <p>Product · UI/UX Designer</p>
      <p className="mobile-intro">An editorial collection of visual references, technology, film, music, and the things that keep me curious.</p>
    </header>
    <section aria-labelledby="mobile-objects"><div className="mobile-section-title"><span>01</span><h2 id="mobile-objects">Selected objects</h2></div>
      <div className="mobile-object-grid">
        {pokemon&&<div className="mobile-object pokemon-mobile"><img src={pokemon.content.image} alt={pokemon.name}/><span>{pokemon.name} · personal reference</span></div>}
        {album&&<button type="button" className="mobile-object mobile-album" onClick={onMixtape}><img src={album.content.image} alt={`${album.content.title} by ${album.content.artist} album cover`}/><span><strong>Andre&apos;s Mixtape</strong><small>{album.content.title} · {album.content.artist}</small></span></button>}
        <button type="button" className="mobile-object" onClick={onCinema} aria-expanded={cinemaOpen}><strong>Cinema</strong><span>{cinemaOpen ? "Spider-Man: Into the Spider-Verse" : "Films I keep thinking about"}</span></button>
      </div>
    </section>
    {portrait&&<section aria-labelledby="mobile-photos"><div className="mobile-section-title"><span>02</span><h2 id="mobile-photos">Contact sheet</h2></div><div className="mobile-photo"><img src={portrait.src} alt={portrait.alt_text||portrait.title}/><span>{portrait.title}</span></div></section>}
    <section aria-labelledby="mobile-references"><div className="mobile-section-title"><span>03</span><h2 id="mobile-references">Personal references</h2></div><div className="mobile-reference-row">{references.map(item=><img key={item.id} src={item.content.image} alt={item.name}/>)}</div></section>
  </main>
}

function LocalClock() {
  const [time, setTime] = useState("--:--:--")
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()))
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [])
  return <time aria-label={`Your local time ${time}`}>{time}</time>
}

export default function App({ snapshot,collections }: { snapshot: BoardSnapshot;collections: CollectionSnapshot }) {
  const [panel, setPanel] = useState<Panel>(null)
  const [cinemaOpen, setCinemaOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryPhotoOpen, setGalleryPhotoOpen] = useState(false)
  const [puzzleOpen, setPuzzleOpen] = useState(false)
  const closeGallery = useCallback(() => { setGalleryOpen(false); setGalleryPhotoOpen(false) }, [])
  const closePuzzle = useCallback(() => setPuzzleOpen(false), [])
  const closePhoto = useCallback(() => setGalleryPhotoOpen(false), [])
  const [albumSelected, setAlbumSelected] = useState(false)
  const archiveTracks=useMemo<MixtapeTrack[]>(()=>snapshot.artifacts.filter(item=>item.visible&&item.type==='music').map(item=>({id:item.content.trackId||item.id,title:item.content.title||item.name,artist:item.content.artist||'',src:item.content.audio,cover:item.content.image})),[snapshot.artifacts])
  const galleryPhotos=collections.gallery.filter(item=>item.visible&&item.src),puzzleImages=collections.puzzle.filter(item=>item.visible&&item.src).map(item=>({src:item.src!,title:item.title,alt_text:item.alt_text}))
  const selectedTrack = useRef<MixtapeTrack|undefined>(archiveTracks[0])
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [nowPlaying, setNowPlaying] = useState("")
  const [discoveries, setDiscoveries] = useState<string[]>([])
  const [disturbed, setDisturbed] = useState<string[]>([])
  const [audioMuted, setAudioMuted] = useState(false)
  const [lightMode, setLightMode] = useState(false)
  const [assetLayout, setAssetLayout] = useState<Record<string, { x: number; y: number; rotate: number }>>({})
  const audioRef = useRef<HTMLAudioElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const plane = planeRef.current;
    if (puzzleOpen) plane?.setAttribute("inert", "");
    else plane?.removeAttribute("inert");
    return () => plane?.removeAttribute("inert");
  }, [puzzleOpen]);
  const xReadoutRef = useRef<HTMLSpanElement>(null)
  const yReadoutRef = useRef<HTMLSpanElement>(null)
  const activeTrackRef = useRef<string | null>(null)
  const playbackRequest = useRef(0)
  const soundContextRef = useRef<AudioContext | null>(null)
  const track = selectedTrack.current
  useEffect(()=>{if(!selectedTrack.current||!archiveTracks.some(item=>item.id===selectedTrack.current?.id))selectedTrack.current=archiveTracks[0]},[archiveTracks])
  const BOARD_ARTIFACT_COUNT = snapshot.artifacts.filter((item) => item.visible).length
  const drag = useRef<{ active: boolean; pointerId: number; moved: boolean; sx: number; sy: number; ox: number; oy: number }>({
    active: false,
    pointerId: -1,
    moved: false,
    sx: 0,
    sy: 0,
    ox: 0,
    oy: 0,
  })
  const panFrame = useRef<number | null>(null)
  const momentumFrame = useRef<number | null>(null)
  const momentumLastFrame = useRef(0)
  const pendingPan = useRef({ x: 0, y: 0 })
  const panVelocity = useRef({ x: 0, y: 0 })
  const lastPointer = useRef({ x: 0, y: 0, time: 0 })
  const curiosityFound = ["figma", "pokemon"].every((id) => discoveries.includes(id))
  const disturb = useCallback((id: string) => setDisturbed((current) => current.includes(id) ? current : [...current, id]), [])
  const discover = useCallback((id: string) => {
    setDiscoveries((current) => current.includes(id) ? current : [...current, id])
    disturb(id)
  }, [disturb])
  const playMicroSound = useCallback((kind: "camera" | "card" | "projector" | "ui" | "mechanical") => {
    if (audioMuted) return
    const context = soundContextRef.current ?? new AudioContext()
    soundContextRef.current = context
    void context.resume()
    const gain = context.createGain()
    const oscillator = context.createOscillator()
    const frequencies = { camera: 145, card: 260, projector: 72, ui: 620, mechanical: 115 }
    const durations = { camera: .055, card: .08, projector: .14, ui: .045, mechanical: .075 }
    oscillator.type = kind === "ui" ? "sine" : kind === "projector" ? "sawtooth" : "square"
    oscillator.frequency.setValueAtTime(frequencies[kind], context.currentTime)
    if (kind === "card" || kind === "mechanical") oscillator.frequency.exponentialRampToValueAtTime(frequencies[kind] * .58, context.currentTime + durations[kind])
    gain.gain.setValueAtTime(.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(kind === "projector" ? .035 : .06, context.currentTime + .008)
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + durations[kind])
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + durations[kind])
  }, [audioMuted])
  const playTrack = useCallback(async (nextTrack: MixtapeTrack) => {
    const audio = audioRef.current
    if (!audio || !nextTrack?.src) return
    playMicroSound("mechanical")
    disturb(nextTrack.id === archiveTracks[0]?.id ? "mixtape" : `song-${archiveTracks.findIndex((item) => item.id === nextTrack.id) + 1}`)
    const request = ++playbackRequest.current
    if (activeTrackRef.current === nextTrack.id) {
      audio.pause()
      audio.currentTime = 0
      activeTrackRef.current = null
      setActiveTrackId(null)
      setAudioPlaying(false)
      setAlbumSelected(false)
      return
    }

    audio.pause()
    audio.currentTime = 0
    audio.removeAttribute("src")
    audio.load()
    activeTrackRef.current = nextTrack.id
    setActiveTrackId(nextTrack.id)
    selectedTrack.current = nextTrack
    setAlbumSelected(true)
    setAudioPlaying(false)
    setNowPlaying(`${nextTrack.title} — ${nextTrack.artist}`)
    audio.muted = audioMuted
    audio.src = nextTrack.src
    audio.load()
    try {
      await audio.play()
      if (request === playbackRequest.current && activeTrackRef.current === nextTrack.id) setAudioPlaying(true)
    } catch {
      if (request !== playbackRequest.current) return
      activeTrackRef.current = null
      setActiveTrackId(null)
      setAudioPlaying(false)
      setAlbumSelected(false)
    }
  }, [archiveTracks, audioMuted, disturb, playMicroSound])
  const toggleAlbumPlayback = useCallback((nextTrackId?: string) => {
    const nextTrack = nextTrackId ? archiveTracks.find((item) => item.id === nextTrackId) : selectedTrack.current
    if (nextTrack) void playTrack(nextTrack)
  }, [archiveTracks, playTrack])
  const randomizeArchive = useCallback(() => {
    const candidates = snapshot.artifacts.filter((asset) => asset.visible && !asset.locked && asset.type !== "identity")
    const slots = candidates.map((asset) => assetLayout[asset.key] ?? { x: asset.x, y: asset.y, rotate: asset.rotate })
    for (let index = slots.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[slots[index], slots[swapIndex]] = [slots[swapIndex], slots[index]]
    }
    setAssetLayout(Object.fromEntries(candidates.map((asset, index) => [asset.key, { ...slots[index], rotate: Math.round(Math.random() * 16 - 8) }])))
    disturb("randomize")
    playMicroSound("ui")
  }, [assetLayout, snapshot.artifacts, disturb, playMicroSound])

  const isMobileBoard = () => window.matchMedia("(max-width: 767px)").matches
  const centerNativeBoard = (behavior: ScrollBehavior = "auto") => {
    const board = boardRef.current
    if (!board) return
    board.scrollTo({ left: (board.scrollWidth - board.clientWidth) / 2, top: (board.scrollHeight - board.clientHeight) / 2, behavior })
  }
  const applyPan = (position: { x: number; y: number }) => {
    pendingPan.current = position
    if (planeRef.current) planeRef.current.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) scale(var(--board-scale, .78))`
    if (gridRef.current) gridRef.current.style.backgroundPosition = `${position.x}px ${position.y}px`
    if (xReadoutRef.current) xReadoutRef.current.textContent = `x ${Math.round(position.x)}`
    if (yReadoutRef.current) yReadoutRef.current.textContent = `y ${Math.round(position.y)}`
  }
  const resetHomePosition = () => {
    stopMomentum()
    if (isMobileBoard()) {
      centerNativeBoard(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth")
      return
    }
    applyPan({ x: snapshot.settings.initialX, y: snapshot.settings.initialY })
  }

  useEffect(() => {
    if (isMobileBoard()) {
      const board = boardRef.current
      if (board) board.scrollTo({ left: (board.scrollWidth - board.clientWidth) / 2 - snapshot.settings.initialX, top: (board.scrollHeight - board.clientHeight) / 2 - snapshot.settings.initialY })
    } else applyPan({x:snapshot.settings.initialX,y:snapshot.settings.initialY})
  }, [snapshot.settings.initialX, snapshot.settings.initialY])

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)")
    let frame: number | null = null
    const syncBoardMode = () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        if (mobile.matches) centerNativeBoard()
        else { boardRef.current?.scrollTo(0, 0); applyPan({ x: 0, y: 0 }) }
      })
    }
    syncBoardMode()
    mobile.addEventListener("change", syncBoardMode)
    return () => { if (frame !== null) window.cancelAnimationFrame(frame); mobile.removeEventListener("change", syncBoardMode) }
  }, [])

  useEffect(() => {
    if (curiosityFound) disturb("secret-curiosity")
  }, [curiosityFound, disturb])

  const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v))

  const stopMomentum = () => {
    if (momentumFrame.current !== null) {
      window.cancelAnimationFrame(momentumFrame.current)
      momentumFrame.current = null
    }
    momentumLastFrame.current = 0
    panVelocity.current = { x: 0, y: 0 }
  }

  const continueMomentum = (now: number) => {
    const velocity = panVelocity.current
    const frameRatio = Math.min((now - (momentumLastFrame.current || now - 16.67)) / 16.67, 2)
    momentumLastFrame.current = now
    const friction = Math.pow(0.92, frameRatio)
    velocity.x *= friction
    velocity.y *= friction
    if (Math.abs(velocity.x) < 0.1 && Math.abs(velocity.y) < 0.1) {
      momentumFrame.current = null
      return
    }

    const next = {
      x: clamp(pendingPan.current.x + velocity.x * frameRatio, 640),
      y: clamp(pendingPan.current.y + velocity.y * frameRatio, 460),
    }
    if (next.x === pendingPan.current.x) velocity.x = 0
    if (next.y === pendingPan.current.y) velocity.y = 0
    applyPan(next)
    momentumFrame.current = window.requestAnimationFrame(continueMomentum)
  }

  const startMomentum = () => {
    if (momentumFrame.current !== null) window.cancelAnimationFrame(momentumFrame.current)
    if (Math.abs(panVelocity.current.x) < 0.35 && Math.abs(panVelocity.current.y) < 0.35) return
    momentumLastFrame.current = 0
    momentumFrame.current = window.requestAnimationFrame(continueMomentum)
  }

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isMobileBoard()) return
      if (!e.isPrimary) return
      if (e.pointerType === "mouse" && e.button !== 0) return
      stopMomentum()
      if (e.target instanceof Element && e.target.closest("button, a, input, textarea, select")) return
      drag.current = { active: true, pointerId: e.pointerId, moved: false, sx: e.clientX, sy: e.clientY, ox: pendingPan.current.x, oy: pendingPan.current.y }
      lastPointer.current = { x: e.clientX, y: e.clientY, time: performance.now() }
    },
    [],
  )

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (isMobileBoard()) return
    if (!drag.current.active || drag.current.pointerId !== e.pointerId) return
    const dx = e.clientX - drag.current.sx
    const dy = e.clientY - drag.current.sy
    const now = performance.now()
    const elapsed = Math.max(1, now - lastPointer.current.time)
    const sample = {
      x: Math.max(-35, Math.min(35, (e.clientX - lastPointer.current.x) / elapsed * 16.67)),
      y: Math.max(-35, Math.min(35, (e.clientY - lastPointer.current.y) / elapsed * 16.67)),
    }
    panVelocity.current = {
      x: panVelocity.current.x * .35 + sample.x * .65,
      y: panVelocity.current.y * .35 + sample.y * .65,
    }
    lastPointer.current = { x: e.clientX, y: e.clientY, time: now }
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      if (!drag.current.moved) e.currentTarget.setPointerCapture(e.pointerId)
      drag.current.moved = true
    }
    if (!drag.current.moved) return
    const position = { x: clamp(drag.current.ox + dx, 640), y: clamp(drag.current.oy + dy, 460) }
    pendingPan.current = position
    if (panFrame.current === null) {
      panFrame.current = window.requestAnimationFrame(() => {
        applyPan(pendingPan.current)
        panFrame.current = null
      })
    }
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (isMobileBoard()) return
    if (!drag.current.active || drag.current.pointerId !== e.pointerId) return
    if (drag.current.moved) disturb("board-pan")
    const shouldStartMomentum = drag.current.moved && e.type === "pointerup" && performance.now() - lastPointer.current.time < 100 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    drag.current.active = false
    drag.current.pointerId = -1
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    if (shouldStartMomentum) startMomentum()
    else stopMomentum()
  }, [disturb])

  return (
    <div
      ref={boardRef}
      className="relative h-screen w-screen overflow-hidden select-none archive-spatial"
      style={{
        cursor: "default",
        touchAction: puzzleOpen ? "auto" : undefined,
        backgroundColor: snapshot.settings.background,
        backgroundImage: "linear-gradient(115deg, rgba(255,255,255,0.025), transparent 45%, rgba(5,35,26,0.05))",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onLostPointerCapture={onPointerUp}
      onScroll={(event) => {
        if (!isMobileBoard()) return
        const board = event.currentTarget
        if (xReadoutRef.current) xReadoutRef.current.textContent = `x ${Math.round((board.scrollWidth - board.clientWidth) / 2 - board.scrollLeft)}`
        if (yReadoutRef.current) yReadoutRef.current.textContent = `y ${Math.round((board.scrollHeight - board.clientHeight) / 2 - board.scrollTop)}`
      }}
      onWheel={(e) => {
        if (isMobileBoard()) return
        e.preventDefault()
        stopMomentum()
        const position = {
          x: clamp(pendingPan.current.x - (e.deltaX || (e.shiftKey ? e.deltaY : 0)), 640),
          y: clamp(pendingPan.current.y - (e.shiftKey ? 0 : e.deltaY), 460),
        }
        applyPan(position)
      }}
    >
      {/* Cutting-mat grid — major, minor, and diagonal guides */}
      <div
        ref={gridRef}
        className="archive-grid pointer-events-none absolute inset-0"
        style={{
          display: snapshot.settings.grid ? undefined : "none",
          backgroundImage: `
            linear-gradient(var(--grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid) 1px, transparent 1px),
            linear-gradient(var(--grid-fine) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-fine) 1px, transparent 1px),
            repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 26px)`,
          backgroundSize: "104px 104px, 104px 104px, 26px 26px, 26px 26px, 100% 100%",
          backgroundPosition: "0 0",
        }}
      />
      {/* vignette */}
      <div
        className="archive-vignette pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 260px rgba(4,35,25,0.55)" }}
      />

      <audio ref={audioRef} preload="metadata" onEnded={() => { activeTrackRef.current = null; setAudioPlaying(false); setAlbumSelected(false); setActiveTrackId(null) }} />
      <MobileArchive snapshot={snapshot} photos={galleryPhotos} cinemaOpen={cinemaOpen} onCinema={() => { setCinemaOpen((value) => !value); disturb("cinema"); playMicroSound("projector") }} onMixtape={() => void toggleAlbumPlayback()} />

      {/* ---- The board plane (everything pans together) ---- */}
      <div
        ref={planeRef}
        className={`archive-plane absolute inset-0 ${snapshot.settings.entrance ? "" : "cms-no-entrance"}`}
        style={{ transform: "translate3d(0, 0, 0) scale(var(--board-scale, .78))", transformOrigin: "center" }}
      >
        {snapshot.artifacts.map((artifact) => <ArtifactRenderer key={artifact.id} artifact={{ ...artifact, ...(assetLayout[artifact.key] || {}) }} runtime={{ lightMode, activeTrackId, audioPlaying, curiosityFound, discover, disturb, playMicroSound, playTrack, openPuzzle: () => setPuzzleOpen(true) }} />)}
      </div>

      {curiosityFound && <div className="curiosity-toast" role="status">you found the things that keep me curious.</div>}

      {/* ===== Floating bottom navigation ===== */}
      <nav
        className="fixed bottom-5 left-1/2 z-[90] -translate-x-1/2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 rounded-full bg-[#0b1220]/85 px-2 py-1.5 shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
          {[
            ["Home", !galleryOpen && !puzzleOpen],
            ["Photos", galleryOpen],
            ["Mini Games", puzzleOpen],
          ].map(([label, active]) => (
            <button
              key={label as string}
              type="button"
              title={label as string}
              data-tooltip={label as string}
              aria-label={label as string}
              aria-current={active ? "page" : undefined}
              onClick={() => {
                if (label === "Home") { closeGallery(); closePuzzle(); setPanel(null); resetHomePosition() }
                else if (label === "Mini Games") { closeGallery(); setPuzzleOpen(true) }
                else if (label === "Photos") { closePuzzle(); setGalleryOpen(true) }
              }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] transition ${
                active
                  ? "bg-white/12 text-white"
                  : "text-white/55 hover:text-white hover:bg-white/6"
              }`}
            >
              <span className="grid h-4 w-4 place-items-center" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {label === "Home" && <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" /><path d="M9 21v-7h6v7" /></>}
                  {label === "Photos" && <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m4 17 5-5 3.5 3.5 2.5-2.5 5 5" /></>}
                  {label === "Mini Games" && <path d="M9 3H4v6a3 3 0 1 1 0 6v6h6a3 3 0 1 1 6 0h5v-6a3 3 0 1 0 0-6V3h-6a3 3 0 1 0-6 0Z" />}
                </svg>
              </span>
              {active && <span className="tracking-wide">{label}</span>}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-white/12" />
          <button
            type="button"
            title={audioMuted ? "Unmute audio" : "Mute audio"}
            aria-label={audioMuted ? "Unmute audio" : "Mute audio"}
            aria-pressed={audioMuted}
            onClick={() => { const nextMuted = !audioMuted; setAudioMuted(nextMuted); if (audioRef.current) audioRef.current.muted = nextMuted }}
            className="sound-toggle grid h-8 w-8 place-items-center rounded-full text-white/55 transition hover:bg-white/6 hover:text-white"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" />{audioMuted ? <path d="m17 9 4 6m0-6-4 6" strokeLinecap="round" /> : <path d="M16 9.5a4 4 0 0 1 0 5" strokeLinecap="round" />}</svg>
          </button>
          <button
            type="button"
            title="Shuffle archive assets"
            data-tooltip="Shuffle"
            aria-label="Shuffle archive asset positions"
            onClick={randomizeArchive}
            className="grid h-8 w-8 place-items-center rounded-full text-white/55 transition hover:bg-white/6 hover:text-white"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" /><circle cx="9" cy="15" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" /></svg>
          </button>
          <button
            type="button"
            title={lightMode ? "Dark card" : "Light card"}
            data-tooltip={lightMode ? "Dark card" : "Light card"}
            aria-label={lightMode ? "Use dark identity card" : "Use light identity card"}
            aria-pressed={lightMode}
            onClick={() => setLightMode((value) => !value)}
            className="grid h-8 w-8 place-items-center rounded-full text-white/55 transition hover:bg-white/6 hover:text-white"
          >
            {lightMode ? "☾" : "☼"}
          </button>
          <button
            type="button"
            title="Open Andre's Mixtape"
            data-tooltip="Music"
            aria-label="Open Andre's Mixtape"
            onClick={() => void toggleAlbumPlayback()}
            className="grid h-8 w-8 place-items-center rounded-full text-white/55 transition hover:bg-white/6 hover:text-white"
          >
            ♫
          </button>
        </div>
      </nav>

      {/* corner meta */}
      {!galleryOpen && !puzzleOpen && <div className="pointer-events-none fixed left-5 top-4 z-[90] font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
        Andre&apos;s Archive
      </div>}
      {!galleryOpen && !puzzleOpen && <div className="curiosity-counter" role="status" aria-live="polite">
        {disturbed.length} / {BOARD_ARTIFACT_COUNT} artifacts disturbed
      </div>}
      {!galleryOpen && !puzzleOpen && <div className="coordinate-readout" aria-label="Board position and local time">
        <span ref={xReadoutRef}>x 0</span><span ref={yReadoutRef}>y 0</span>
        <LocalClock />
      </div>}

      {/* ===== Popovers ===== */}
      {false && (
        <Popover title="Worlds worth believing in." tag="Inspiration · Marvel" accent="#e23b34" onClose={() => setPanel(null)}>
          <ul className="mt-3 space-y-2 text-[13px] text-white/75">
            {["Character", "World-building", "Visual storytelling", "Technology & imagination"].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e23b34]" />
                {x}
              </li>
            ))}
          </ul>
        </Popover>
      )}
      {panel === "spiderman" && (
        <Popover title="With great design…" tag="Personal · Spider-Man" accent="#2e6be6" onClose={() => setPanel(null)}>
          <p className="mt-2 text-[13px] leading-relaxed text-white/75">
            Spider-Man is the everyday hero — improvising, falling, swinging back up. It&apos;s
            the reminder that being responsible and being playful aren&apos;t opposites.
          </p>
        </Popover>
      )}
      {galleryOpen && galleryPhotoOpen && <GalleryCarousel photos={galleryPhotos} index={photoIndex} onChange={setPhotoIndex} onClose={closePhoto} lightMode={lightMode} />}
      {galleryOpen && <PhotoGallery photos={galleryPhotos} onOpen={(index) => { setPhotoIndex(index); setGalleryPhotoOpen(true) }} onClose={closeGallery} lightMode={lightMode} />}
      {puzzleOpen && <PicturePuzzle images={puzzleImages} onClose={closePuzzle} lightMode={lightMode} />}
      {albumSelected && <div className="album-toast" role="status" aria-live="polite" onPointerDown={(event) => event.stopPropagation()}>
        <span className={audioPlaying ? "album-toast-dot is-playing" : "album-toast-dot"} aria-hidden="true" />
        <div><strong>{audioPlaying ? "Now playing" : "Mixtape paused"}</strong><p>{nowPlaying || (track?`${track.title} — ${track.artist}`:'No published track')}</p></div>
        <button type="button" onClick={() => void toggleAlbumPlayback()} aria-label="Stop mixtape">Stop</button>
      </div>}
    </div>
  )
}

/* --- Small die-cut sticker ------------------------------------- */
