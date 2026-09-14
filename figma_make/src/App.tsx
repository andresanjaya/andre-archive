import { useCallback, useEffect, useRef, useState } from "react"
import { tracks } from "../../src/data/tracks"
import { DustArtifact, PeelNote, ScratchCard } from "../../src/components/archive/PlayfulArtifacts"

/* ------------------------------------------------------------------ *\
   Andre's Archive — an interactive spatial interest board.
   Deep-green cutting-mat canvas, drag-to-pan, physical artifacts
   floating around a central editorial identity card.
\* ------------------------------------------------------------------ */

const PHOTOS = [
  { src: "/archive/assets/pict-1.jpg", title: "Graduation", year: "", caption: "graduation" },
  { src: "/archive/assets/pict-2.png", title: "Kindergarten", year: "", caption: "kindergarten" },
  { src: "/archive/assets/pict-4.JPEG", title: "Archive photograph", year: "", caption: "personal reference" },
  { src: "/archive/assets/pict-5.JPG", title: "Archive photograph", year: "", caption: "personal reference" },
]

const BOARD_ASSETS = [
  { id: "book", src: "/archive/assets/book-1.jpg", alt: "The Design of Everyday Things book cover", caption: "The Design of Everyday Things", x: -875, y: -230, rotate: -7, width: 90 },
  { id: "book-two", src: "/archive/assets/book-2.jpg", alt: "Almost Adulting book cover", caption: "Almost Adulting", x: 875, y: -400, rotate: 8, width: 88 },
  { id: "book-three", src: "/archive/assets/book-3.jpg", alt: "Atomic Habits book cover", caption: "Atomic Habits", x: -1035, y: 60, rotate: -4, width: 86 },
  { id: "letterboxd", src: "/archive/assets/letterboxd.png", alt: "Letterboxd logo", caption: "Letterboxd", x: 720, y: -475, rotate: 5, width: 76 },
  { id: "movie-one", src: "/archive/assets/movie-1.jpg", alt: "Oppenheimer poster", caption: "Oppenheimer", x: 1020, y: -105, rotate: 6, width: 112 },
  { id: "movie-two", src: "/archive/assets/movie-2.jpg", alt: "Good Will Hunting poster", caption: "Good Will Hunting", x: -925, y: 145, rotate: -5, width: 108 },
  { id: "movie-three", src: "/archive/assets/movie-3.jpg", alt: "Eternal Sunshine of the Spotless Mind poster", caption: "Eternal Sunshine", x: 875, y: 400, rotate: 4, width: 114 },
  { id: "movie-four", src: "/archive/assets/movie-4.jpg", alt: "Film reference", caption: "Film reference", x: 1060, y: -375, rotate: -4, width: 110 },
  { id: "archive-logo", src: "/archive/assets/logo.svg", alt: "Andre Archive logo", caption: "Archive logo", x: -1060, y: -135, rotate: 5, width: 104 },
  { id: "pokemon-mark", src: "/archive/assets/pokemon.svg", alt: "Pokémon reference", caption: "Pokémon", x: 1015, y: 120, rotate: 6, width: 94 },
  { id: "pokemon-card", src: "/archive/assets/pokemon-card.png", alt: "Andre Sanjaya Pokémon supporter card", caption: "Pokémon card", x: -685, y: -460, rotate: -4, width: 120 },
  { id: "song-two", src: "/archive/assets/song-2.jpg", alt: "Archive music reference", caption: "Archive music", x: 410, y: 505, rotate: -5, width: 112 },
] as const

const ARTIFACT_POSITIONS = {
  pokemon: { x: -410, y: -315, rotate: -7, z: 40, width: 132 },
  marvel: { x: 555, y: -315, rotate: 5, z: 30, width: 104 },
  spiderman: { x: 665, y: 5, rotate: -5, z: 40, width: 110 },
  north: { x: -620, y: -10, rotate: -6, z: 30 },
  onFoot: { x: -515, y: 300, rotate: 5, z: 30 },
  stillness: { x: 520, y: 160, rotate: 4, z: 30 },
  cassette: { x: -135, y: 445, rotate: -3, z: 40, width: 168 },
  cinema: { x: 355, y: 445, rotate: 6, z: 40, width: 170 },
  note: { x: -880, y: -80, rotate: -3, z: 20, width: 128 },
  bali: { x: 95, y: -445, rotate: 4, z: 30, width: 120 },
  fifth: { x: -405, y: 380, rotate: -5, z: 30 },
  rams: { x: -790, y: 420, rotate: 5, z: 20, width: 84 },
  typeBook: { x: 435, y: -410, rotate: -8, z: 20, width: 80 },
  terminal: { x: 850, y: 40, rotate: 5, z: 40, width: 132 },
  hidden: { x: -845, y: 430, rotate: -4, z: 30, width: 190 },
} as const

const RANDOMIZABLE_ASSETS = [
  ...BOARD_ASSETS.map(({ id, x, y, rotate }) => ({ id, x, y, rotate })),
  { id: "pokemon", ...ARTIFACT_POSITIONS.pokemon },
  { id: "marvel", ...ARTIFACT_POSITIONS.marvel },
  { id: "pict-one", ...ARTIFACT_POSITIONS.north },
  { id: "pict-two", ...ARTIFACT_POSITIONS.onFoot },
  { id: "pict-four", ...ARTIFACT_POSITIONS.stillness },
  { id: "pict-five", ...ARTIFACT_POSITIONS.fifth },
  { id: "mixtape", ...ARTIFACT_POSITIONS.cassette },
  { id: "bali-stamp", ...ARTIFACT_POSITIONS.bali },
  { id: "figma", x: -400, y: -455, rotate: -6 },
] as const

type Panel = "spiderman" | "photo" | null

const SOCIAL_DESTINATIONS = [
  { icon: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/andresanjaya/" },
  { icon: "instagram", label: "Instagram", href: "https://www.instagram.com/skinnydookie" },
  { icon: "github", label: "GitHub", href: "https://github.com/andresanjaya" },
  { icon: "mail", label: "Mail", href: "mailto:andresanjaya2506@gmail.com" },
] as const

function SocialIcon({ name }: { name: "linkedin" | "instagram" | "github" | "mail" }) {
  const common = { viewBox: "0 0 24 24", width: 18, height: 18, fill: "none", stroke: "currentColor", strokeWidth: 1.9, "aria-hidden": true as const }
  if (name === "linkedin") return <svg {...common}><path fill="currentColor" stroke="none" d="M5.15 3.4a2.15 2.15 0 1 1 0 4.3 2.15 2.15 0 0 1 0-4.3ZM3.3 8.6H7v12H3.3v-12Zm6 0h3.55v1.64h.05c.5-.94 1.7-1.93 3.5-1.93 3.75 0 4.45 2.47 4.45 5.68v6.61h-3.7v-5.86c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1v5.96H9.3v-12Z" /></svg>
  if (name === "instagram") return <svg {...common}><rect x="3.3" y="3.3" width="17.4" height="17.4" rx="4.4" /><circle cx="12" cy="12" r="4" /><path d="M17.7 6.8h.01" strokeWidth="2.7" strokeLinecap="round" /></svg>
  if (name === "github") return <svg {...common}><path fill="currentColor" stroke="none" d="M12 2.6a9.5 9.5 0 0 0-3 18.51c.48.09.65-.2.65-.46v-1.67c-2.64.57-3.2-1.12-3.2-1.12-.43-1.1-1.06-1.39-1.06-1.39-.87-.6.07-.59.07-.59.96.07 1.47.99 1.47.99.85 1.47 2.24 1.04 2.78.8.09-.62.34-1.04.61-1.28-2.1-.24-4.31-1.05-4.31-4.68 0-1.03.37-1.88.98-2.54-.1-.24-.42-1.2.09-2.5 0 0 .8-.26 2.61.97A9.1 9.1 0 0 1 12 6.88c.81 0 1.62.11 2.38.32 1.82-1.23 2.61-.97 2.61-.97.51 1.3.19 2.26.1 2.5.6.66.97 1.5.97 2.54 0 3.64-2.21 4.43-4.32 4.67.34.3.64.88.64 1.78v2.64c0 .26.17.56.66.46A9.5 9.5 0 0 0 12 2.6Z" /></svg>
  return <svg {...common}><rect x="3.2" y="5.1" width="17.6" height="13.8" rx="2" /><path d="m4.1 6.4 7.9 6.3 7.9-6.3" /></svg>
}

/* --- Artifact wrapper: absolute position from center, rotation,
       hover lift + label, keyboard focus, optional click ---------- */
function Artifact({
  x,
  y,
  rotate = 0,
  z = 1,
  label,
  onOpen,
  width,
  children,
  className = "",
}: {
  x: number
  y: number
  rotate?: number
  z?: number
  label?: string
  onOpen?: () => void
  width?: number
  children: React.ReactNode
  className?: string
}) {
  const interactive = Boolean(onOpen)
  return (
    <div
      className="group absolute transition-[left,top] duration-500 ease-out"
      data-artifact={label || "passive artifact"}
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: "translate(-50%, -50%)",
        zIndex: z,
        width: width ? `${width}px` : undefined,
      }}
    >
      <div
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={label}
        onPointerDown={interactive ? (e) => e.stopPropagation() : undefined}
        onClick={
          onOpen
            ? (e) => {
                e.stopPropagation()
                onOpen()
              }
            : undefined
        }
        onKeyDown={
          onOpen
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onOpen()
                }
              }
            : undefined
        }
        className={`relative transition-[transform,filter] duration-300 ease-out will-change-transform ${
          interactive ? "cursor-pointer" : ""
        } outline-none ${className}`}
        style={{
          transform: `rotate(${rotate}deg)`,
          filter: "drop-shadow(0 18px 24px rgba(6,20,48,0.45))",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = `rotate(${rotate * 0.35}deg) translateY(-8px) scale(1.04)`
          e.currentTarget.style.filter =
            "drop-shadow(0 30px 40px rgba(6,20,48,0.55))"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = `rotate(${rotate}deg)`
          e.currentTarget.style.filter =
            "drop-shadow(0 18px 24px rgba(6,20,48,0.45))"
        }}
        onFocus={(e) => {
          e.currentTarget.style.transform = `rotate(0deg) translateY(-8px) scale(1.04)`
        }}
        onBlur={(e) => {
          e.currentTarget.style.transform = `rotate(${rotate}deg)`
        }}
      >
        {children}
        {label && (
          <span className="pointer-events-none absolute left-1/2 -bottom-7 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0b1220] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/90 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

function Pin({ color = "#e23b34", className = "" }: { color?: string; className?: string }) {
  return (
    <span
      className={`absolute h-3.5 w-3.5 rounded-full ${className}`}
      style={{
        background: `radial-gradient(circle at 35% 30%, #fff9, ${color} 55%, #0006)`,
        boxShadow: "0 3px 5px rgba(0,0,0,0.4)",
      }}
    />
  )
}

function Tape({ className = "", rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <span
      className={`absolute h-6 w-16 ${className}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        background:
          "repeating-linear-gradient(45deg, rgba(240,235,220,0.55), rgba(240,235,220,0.55) 4px, rgba(220,214,196,0.55) 4px, rgba(220,214,196,0.55) 8px)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
      }}
    />
  )
}

/* --- Polaroid ---------------------------------------------------- */
function Polaroid({ src, caption, fit = "cover", focus = "center" }: { src?: string; caption: string; fit?: "cover" | "contain"; focus?: string }) {
  return (
    <div className="relative w-[180px] bg-[#fbf9f2] p-2.5 pb-9">
      <Tape className="-top-2 left-1/2 -translate-x-1/2 opacity-80" rotate={-4} />
      <div className="h-[150px] w-full overflow-hidden bg-[#d8d1c2]">
        {src ? <img src={src} alt={caption} className="h-full w-full" style={{ objectFit: fit, objectPosition: focus }} /> : <div className="photo-pending"><span>Photo pending</span><small>approved archive asset</small></div>}
      </div>
      <p className="absolute bottom-2 left-3 font-serif text-[15px] italic text-[#2a2a2a]">
        {caption}
      </p>
      <span className="polaroid-meta">Archive reference</span>
    </div>
  )
}

/* --- Contextual popover panel ------------------------------------ */
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

function PhotoViewer({ index, onChange, onClose }: { index: number; onChange: (index: number) => void; onClose: () => void }) {
  const photo = PHOTOS[index]
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowLeft") onChange((index - 1 + PHOTOS.length) % PHOTOS.length)
      if (event.key === "ArrowRight") onChange((index + 1) % PHOTOS.length)
    }
    window.addEventListener("keydown", onKey)
    return () => { window.removeEventListener("keydown", onKey); previous?.focus() }
  }, [index, onChange, onClose])

  return <div className="photo-viewer" role="presentation" onClick={onClose} onPointerDown={(event) => event.stopPropagation()}>
    <section role="dialog" aria-modal="true" aria-labelledby="photo-title" onClick={(event) => event.stopPropagation()}>
      <header><span>Contact sheet · {String(index + 1).padStart(2, "0")}</span><button ref={closeRef} type="button" onClick={onClose} aria-label="Close photo viewer">×</button></header>
      <div className="photo-stage">
        {photo.src ? <img src={photo.src} alt={photo.caption} /> : <div className="photo-missing"><span>Archive photograph pending</span><small>Add Andre&apos;s approved image for this record.</small></div>}
      </div>
      <footer><div><h2 id="photo-title">{photo.title}</h2><p>{[photo.year, photo.caption].filter(Boolean).join(" · ")}</p></div><div className="photo-controls"><button type="button" onClick={() => onChange((index - 1 + PHOTOS.length) % PHOTOS.length)} aria-label="Previous photograph">←</button><button type="button" onClick={() => onChange((index + 1) % PHOTOS.length)} aria-label="Next photograph">→</button></div></footer>
    </section>
  </div>
}

function MobileArchive({ cinemaOpen, onCinema, onPhoto, onMixtape }: { cinemaOpen: boolean; onCinema: () => void; onPhoto: () => void; onMixtape: () => void }) {
  return <main className="mobile-archive" onPointerDown={(event) => event.stopPropagation()}>
    <header className="mobile-identity">
      <span>Andre&apos;s Archive · Bali, Indonesia</span>
      <h1>Andre Sanjaya</h1>
      <p>Product · UI/UX Designer</p>
      <p className="mobile-intro">An editorial collection of visual references, technology, film, music, and the things that keep me curious.</p>
    </header>
    <section aria-labelledby="mobile-objects"><div className="mobile-section-title"><span>01</span><h2 id="mobile-objects">Selected objects</h2></div>
      <div className="mobile-object-grid">
        <div className="mobile-object pokemon-mobile"><img src="/archive/assets/pokemon.png" alt="Pokémon personal reference" /><span>Pokémon · personal reference</span></div>
        <button type="button" className="mobile-object mobile-album" onClick={onMixtape}><img src="/archive/assets/song-1.jpg" alt="Mardy Bum by Arctic Monkeys album cover" /><span><strong>Andre&apos;s Mixtape</strong><small>Mardy Bum · Arctic Monkeys</small></span></button>
        <button type="button" className="mobile-object" onClick={onCinema} aria-expanded={cinemaOpen}><strong>Cinema</strong><span>{cinemaOpen ? "Spider-Man: Into the Spider-Verse" : "Films I keep thinking about"}</span></button>
      </div>
    </section>
    <section aria-labelledby="mobile-photos"><div className="mobile-section-title"><span>02</span><h2 id="mobile-photos">Contact sheet</h2></div><button type="button" className="mobile-photo" onClick={onPhoto}><img src={PHOTOS[0].src} alt="Graduation portrait" /><span>Graduation</span></button></section>
    <section aria-labelledby="mobile-references"><div className="mobile-section-title"><span>03</span><h2 id="mobile-references">Personal references</h2></div><div className="mobile-reference-row"><img src="/archive/assets/figma-sticker.jpg" alt="Figma sticker" /><img src="/archive/assets/marvel.png" alt="Marvel reference" /><img src="/archive/assets/bali-postcard.png" alt="Bali postcard" /></div></section>
  </main>
}

export default function App() {
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [panel, setPanel] = useState<Panel>(null)
  const [cinemaOpen, setCinemaOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [albumSelected, setAlbumSelected] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [nowPlaying, setNowPlaying] = useState("")
  const [discoveries, setDiscoveries] = useState<string[]>([])
  const [disturbed, setDisturbed] = useState<string[]>([])
  const [soundOn, setSoundOn] = useState(false)
  const [assetLayout, setAssetLayout] = useState<Record<string, { x: number; y: number; rotate: number }>>(() => Object.fromEntries(RANDOMIZABLE_ASSETS.map((asset) => [asset.id, { x: asset.x, y: asset.y, rotate: asset.rotate }])))
  const audioRef = useRef<HTMLAudioElement>(null)
  const soundContextRef = useRef<AudioContext | null>(null)
  const track = tracks[0]
  const drag = useRef<{ active: boolean; moved: boolean; sx: number; sy: number; ox: number; oy: number }>({
    active: false,
    moved: false,
    sx: 0,
    sy: 0,
    ox: 0,
    oy: 0,
  })
  const [grabbing, setGrabbing] = useState(false)
  const curiosityFound = ["figma", "pokemon"].every((id) => discoveries.includes(id))
  const disturb = useCallback((id: string) => setDisturbed((current) => current.includes(id) ? current : [...current, id]), [])
  const discover = useCallback((id: string) => {
    setDiscoveries((current) => current.includes(id) ? current : [...current, id])
    disturb(id)
  }, [disturb])
  const playMicroSound = useCallback((kind: "camera" | "card" | "projector" | "ui" | "mechanical") => {
    if (!soundOn) return
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
  }, [soundOn])
  const toggleAlbumPlayback = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !track?.src) return
    playMicroSound("mechanical")
    disturb("mixtape")
    if (albumSelected) {
      audio.pause()
      audio.currentTime = 0
      setAlbumSelected(false)
      setAudioPlaying(false)
      return
    }
    setAlbumSelected(true)
    try { await audio.play() } catch { setAudioPlaying(false) }
  }, [albumSelected, disturb, playMicroSound, track?.src])
  const randomizeArchive = useCallback(() => {
    const slots = RANDOMIZABLE_ASSETS.map((asset) => assetLayout[asset.id] ?? { x: asset.x, y: asset.y, rotate: asset.rotate })
    for (let index = slots.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[slots[index], slots[swapIndex]] = [slots[swapIndex], slots[index]]
    }
    setAssetLayout(Object.fromEntries(RANDOMIZABLE_ASSETS.map((asset, index) => [asset.id, { ...slots[index], rotate: Math.round(Math.random() * 16 - 8) }])))
    disturb("randomize")
    playMicroSound("ui")
  }, [assetLayout, disturb, playMicroSound])

  const layoutFor = <T extends { x: number; y: number; rotate: number },>(id: string, fallback: T) => ({ ...fallback, ...assetLayout[id] })

  useEffect(() => {
    if (curiosityFound) disturb("secret-curiosity")
  }, [curiosityFound, disturb])

  const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v))

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      drag.current = { active: true, moved: false, sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y }
      e.currentTarget.setPointerCapture(e.pointerId)
      setGrabbing(true)
    },
    [pan],
  )

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.sx
    const dy = e.clientY - drag.current.sy
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.current.moved = true
    setPan({ x: clamp(drag.current.ox + dx, 640), y: clamp(drag.current.oy + dy, 460) })
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (drag.current.moved) disturb("board-pan")
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    drag.current.active = false
    setGrabbing(false)
  }, [disturb])

  return (
    <div
      className="relative h-screen w-screen overflow-hidden select-none archive-spatial touch-none"
      style={{
        cursor: grabbing ? "grabbing" : "grab",
        backgroundColor: "#1f6b50",
        backgroundImage: "linear-gradient(115deg, rgba(255,255,255,0.025), transparent 45%, rgba(5,35,26,0.05))",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={(e) => {
        const horizontalDelta = e.deltaX || (e.shiftKey ? e.deltaY : 0)
        if (horizontalDelta) {
          e.preventDefault()
          setPan((current) => ({ x: clamp(current.x - horizontalDelta, 640), y: current.y }))
        }
      }}
    >
      {/* Cutting-mat grid — major, minor, and diagonal guides */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid) 1px, transparent 1px),
            linear-gradient(var(--grid-fine) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-fine) 1px, transparent 1px),
            repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 26px)`,
          backgroundSize: "104px 104px, 104px 104px, 26px 26px, 26px 26px, 100% 100%",
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />
      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 260px rgba(4,35,25,0.55)" }}
      />

      {track?.src && <audio ref={audioRef} src={track.src} preload="metadata" onPlay={() => { setAudioPlaying(true); setNowPlaying(`${track.title} — ${track.artist}`) }} onPause={() => setAudioPlaying(false)} onEnded={() => { setAudioPlaying(false); setAlbumSelected(false) }} />}
      <MobileArchive cinemaOpen={cinemaOpen} onCinema={() => { setCinemaOpen((value) => !value); disturb("cinema"); playMicroSound("projector") }} onPhoto={() => { setPhotoIndex(0); setPanel("photo"); disturb("camera"); playMicroSound("camera") }} onMixtape={() => void toggleAlbumPlayback()} />

      {/* ---- The board plane (everything pans together) ---- */}
      <div
        className="archive-plane absolute inset-0"
        style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(.78)`, transformOrigin: "center" }}
      >
        {/* ===== Central identity card ===== */}
        <div
          className="absolute"
          data-identity-card
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 50 }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="identity-card">
            <header className="identity-header">
              <img src="/archive/assets/pict-3.jpg" alt="Portrait of Andre Sanjaya" />
              <div><h1>Andre Sanjaya</h1><p>UI/UX Designer</p></div>
            </header>
            <section className="identity-about" aria-label="About Andre">
              <p>I&apos;m Andre Sanjaya, a Product and UI UX Designer from Bali. I enjoy designing digital experiences, collecting visual references, exploring technology, and turning curiosity into interactive ideas.</p>
              <div className="identity-socials" aria-label="Social destinations">
                {SOCIAL_DESTINATIONS.map(({ icon, label, href }) => <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}><SocialIcon name={icon} />{label}</a>)}
              </div>
            </section>
            <section className="identity-experience" aria-labelledby="experience-title">
              <h2 id="experience-title">Experience <span aria-hidden="true">↓</span></h2>
              <ul>
                {[
                  ["UI/UX Designer", "Sanata System · Full-time · 3 yrs", "Sep 2023 — Present"],
                  ["System Implementor", "Sanata System · Full-time · 2 yrs 11 mos", "Dec 2022 — Nov 2023"],
                  ["Mobile Application Developer", "Sanata System · Full-time · 3 mos", "Jan 2021 — Mar 2021"],
                ].map(([role, meta, period]) => <li key={role}><div><strong>{role}</strong><p>{meta}</p></div><time>{period}</time></li>)}
              </ul>
            </section>
          </div>
          {/* crop marks */}
          {[
            "-top-3 -left-3 border-t border-l",
            "-top-3 -right-3 border-t border-r",
            "-bottom-3 -left-3 border-b border-l",
            "-bottom-3 -right-3 border-b border-r",
          ].map((c) => (
            <span key={c} className={`absolute h-4 w-4 border-white/40 ${c}`} />
          ))}
        </div>

        {/* ===== POKÉMON — upper-left collectible ===== */}
        <Artifact {...layoutFor("pokemon", ARTIFACT_POSITIONS.pokemon)} label="Pokémon" className="cursor-pokemon" onOpen={() => { discover("pokemon"); playMicroSound("card") }}>
          <img src="/archive/assets/pokemon.png" alt="Pokémon personal reference" className="pokemon-asset" />
        </Artifact>

        {/* ===== MARVEL — upper-right ticket/comic ===== */}
        <Artifact {...layoutFor("marvel", ARTIFACT_POSITIONS.marvel)} label="Marvel">
          <div className="marvel-logo-wrap">
              <img src="/archive/assets/marvel.png" alt="Marvel" className="marvel-asset" />
            <div className="relative hidden px-3 py-4">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "radial-gradient(#111 1.2px, transparent 1.2px)", backgroundSize: "6px 6px" }} />
              <p className="relative font-serif text-[15px] font-bold leading-tight text-white">
                Worlds, Heroes<br />& Imagination
              </p>
              <p className="relative mt-2 font-mono text-[8px] uppercase tracking-widest text-white/85">
                Row C · Seat 12
              </p>
            </div>
            <div className="hidden border-t border-dashed border-black/30 bg-[#c9302b] px-3 py-1.5">
              <span className="font-mono text-[8px] tracking-widest text-white/90">■ ■■ ■ ■■■ ■ ■■</span>
            </div>
          </div>
        </Artifact>

        {/* ===== SPIDER-MAN — right, web card ===== */}
        <Artifact {...ARTIFACT_POSITIONS.spiderman} label="Spider-Man">
          <div className="hidden relative overflow-hidden rounded-lg bg-[#0d1836] p-3 ring-1 ring-black/30">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-25">
              {[15, 30, 45].map((r) => (
                <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="#e23b34" strokeWidth="0.7" />
              ))}
              {[0, 20, 40, 60, 80].map((a) => (
                <line key={a} x1="0" y1="0" x2={70 * Math.cos((a * Math.PI) / 180)} y2={70 * Math.sin((a * Math.PI) / 180)} stroke="#e23b34" strokeWidth="0.7" />
              ))}
            </svg>
            <div className="relative">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e23b34]">
                <div className="h-8 w-8" style={{ background: "#0d1836", clipPath: "polygon(50% 0, 62% 40%, 100% 50%, 62% 60%, 50% 100%, 38% 60%, 0 50%, 38% 40%)" }} />
              </div>
              <p className="mt-2 text-center font-serif text-[13px] font-bold text-white">Friendly</p>
              <p className="text-center font-mono text-[8px] uppercase tracking-[0.2em] text-[#e23b34]">Neighborhood</p>
            </div>
          </div>
          <img src="/archive/assets/spiderman.webp" alt="Spider-Man reference" className="board-image-asset" />
        </Artifact>

        {/* ===== Polaroids ===== */}
        <Artifact {...layoutFor("pict-one", ARTIFACT_POSITIONS.north)} label="Open graduation photograph" className="cursor-camera" onOpen={() => { setPhotoIndex(0); setPanel("photo"); disturb("photo-graduation"); playMicroSound("camera") }}>
          <Polaroid src={PHOTOS[0].src} caption={PHOTOS[0].caption} />
        </Artifact>
        <Artifact {...layoutFor("pict-two", ARTIFACT_POSITIONS.onFoot)} label="Open kindergarten photograph" className="cursor-camera" onOpen={() => { setPhotoIndex(1); setPanel("photo"); disturb("photo-kindergarten"); playMicroSound("camera") }}>
          <Polaroid src={PHOTOS[1].src} caption={PHOTOS[1].caption} fit="contain" focus="center" />
        </Artifact>
        <Artifact {...layoutFor("pict-four", ARTIFACT_POSITIONS.stillness)} label="Open childhood artwork" className="cursor-camera" onOpen={() => { setPhotoIndex(2); setPanel("photo"); disturb("photo-pokemon-day"); playMicroSound("camera") }}>
          <Polaroid src={PHOTOS[2].src} caption={PHOTOS[2].caption} />
        </Artifact>

        {/* ===== Photography contact sheet (lower-left) ===== */}
        <Artifact {...layoutFor("pict-five", ARTIFACT_POSITIONS.fifth)} label="Open archive photograph" className="cursor-camera" onOpen={() => { setPhotoIndex(3); setPanel("photo"); disturb("photo-five"); playMicroSound("camera") }}>
          <Polaroid src={PHOTOS[3].src} caption={PHOTOS[3].caption} />
        </Artifact>

        {/* ===== Album and vinyl (lower-center) ===== */}
        <Artifact {...layoutFor("mixtape", ARTIFACT_POSITIONS.cassette)} label={albumSelected ? "Stop Andre's Mixtape" : "Play Andre's Mixtape"} className="cursor-music" onOpen={() => void toggleAlbumPlayback()}>
          <div className={`record-artifact ${albumSelected ? "is-open" : ""} ${audioPlaying ? "is-playing" : ""}`}>
            <div className="vinyl-record" aria-hidden="true"><span /></div>
            <div className="record-sleeve"><img src="/archive/assets/song-1.jpg" alt="Mardy Bum by Arctic Monkeys album cover" /></div>
            <span className="record-caption">Andre&apos;s mixtape · Side A</span>
          </div>
        </Artifact>

        {/* ===== Movie ticket (lower-right) ===== */}
        <Artifact {...ARTIFACT_POSITIONS.cinema} label="Open cinema references" className="cursor-cinema" onOpen={() => { setCinemaOpen((value) => !value); disturb("cinema"); playMicroSound("projector") }}>
          <div className="overflow-hidden rounded-sm bg-[#f4efe4]">
            <div className="bg-[#16181d] px-3 py-2">
              <p className="font-serif text-[13px] font-bold text-[#f2c318]">CINEMA</p>
            </div>
            <div className="px-3 py-2.5">
              <p className="font-serif text-[13px] leading-tight text-[#16181d]">Late show, aisle seat</p>
              <p className="mt-1 font-mono text-[9px] tracking-widest text-[#16181d]/60">20:45 · SCREEN 4 · ROW J</p>
            </div>
            <div className="border-t border-dashed border-[#16181d]/25 px-3 py-1">
              <span className="font-mono text-[9px] tracking-[0.3em] text-[#16181d]/70">||| || |||| | ||</span>
            </div>
          </div>
          {cinemaOpen && <div className="ticket-panel"><span>Now screening</span><strong>Films I keep thinking about</strong><p>01 · Oppenheimer<br />02 · Good Will Hunting<br />03 · Eternal Sunshine of the Spotless Mind</p></div>}
        </Artifact>

        {/* ===== Note paper "hey" (left) ===== */}
        <Artifact {...ARTIFACT_POSITIONS.note}>
          <div className="relative bg-[#e9dfc4] p-4" style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>
            <Pin color="#e23b34" className="left-1/2 top-2 -translate-x-1/2" />
            <p className="font-serif text-3xl italic text-[#2e6be6]">hey.</p>
            <p className="mt-1 font-mono text-[9px] text-[#5a5442]">drag the mat around →</p>
          </div>
        </Artifact>

        {/* ===== Bali fragment / stamp (top) ===== */}
        <Artifact {...layoutFor("bali-stamp", ARTIFACT_POSITIONS.bali)} label="Bali stamp">
          <div className="bali-stamp-wrap"
            style={{ filter: "drop-shadow(0 0 0 #fff)",
              WebkitMaskImage: "radial-gradient(circle at 4px 4px, transparent 3px, #000 3px)",
              WebkitMaskSize: "8px 8px" }}>
            <div className="overflow-hidden">
              <img src="/archive/assets/bali-postcard.png" alt="Bali postage stamp" className="bali-stamp" />
              <p className="mt-1 text-center font-serif text-[11px] font-bold text-[#16181d]">BALI · IDN</p>
            </div>
          </div>
        </Artifact>

        {/* ===== Sticker cluster: tech identity ===== */}
        <Sticker id="figma" x={assetLayout.figma?.x ?? -400} y={assetLayout.figma?.y ?? -455} rotate={assetLayout.figma?.rotate ?? -6} imageSrc="/archive/assets/figma-sticker.jpg" label="figma" movable onClick={() => { discover("figma"); playMicroSound("ui") }} onDisturb={() => disturb("figma-drag")} />
        <Sticker id="typescript" x={720} y={-245} rotate={-8} bg="#3178c6" text="TS" mono movable />
        <Sticker id="next" x={650} y={-165} rotate={6} bg="#0a0a0a" text="▲ Next" movable />
        <Sticker id="react" x={-390} y={455} rotate={-6} bg="#20232a" text="⚛ React" color="#61dafb" movable />
        <Sticker id="make" x={90} y={590} rotate={5} bg="#f2c318" text="M↓X" color="#16181d" />
        <Sticker id="dot" x={680} y={300} rotate={-4} bg="#e23b34" text="●" color="#fff" />

        {/* ===== Playful archive interactions ===== */}
        <Artifact x={-1035} y={425} rotate={-3} z={36} width={190} label="Scratch card">
          <ScratchCard onDiscover={() => disturb("scratch-card")} onSound={() => playMicroSound("card")} />
        </Artifact>
        <Artifact x={1020} y={235} rotate={4} z={37} width={150} label="Don't peel">
          <PeelNote onDiscover={() => disturb("peeled-note")} onSound={() => playMicroSound("mechanical")} />
        </Artifact>
        <Artifact x={-1020} y={-410} rotate={3} z={28} width={190} label="Dusty archive fragment">
          <DustArtifact onDiscover={() => disturb("desktop-archaeology")} onSound={() => playMicroSound("camera")} />
        </Artifact>

        {/* ===== User-supplied archive assets ===== */}
        {BOARD_ASSETS.map((asset) => {
          const layout = assetLayout[asset.id] ?? asset
          const isMovie = asset.id.startsWith("movie") || asset.id === "letterboxd"
          const isPokemonCard = asset.id === "pokemon-card"
          return <Artifact key={asset.id} x={layout.x} y={layout.y} rotate={layout.rotate} z={30} width={asset.width} label={asset.caption} className={isMovie ? "cursor-cinema" : isPokemonCard ? "cursor-pokemon" : ""} onOpen={() => { disturb(asset.id); if (isMovie) playMicroSound("projector"); else if (isPokemonCard) playMicroSound("card") }}>
            <img src={asset.src} alt={asset.alt} className="board-image-asset" />
          </Artifact>
        })}

        {/* ===== Books (lower-left cluster) ===== */}
        <Artifact {...ARTIFACT_POSITIONS.rams}>
          <div className="h-28 w-full rounded-sm bg-[#e05a17] px-2 py-3 ring-1 ring-black/20">
            <p className="font-serif text-[12px] font-bold leading-tight text-white">dieter<br />rams</p>
            <p className="mt-8 font-mono text-[7px] tracking-widest text-white/80">LESS · BUT BETTER</p>
          </div>
        </Artifact>
        <Artifact {...ARTIFACT_POSITIONS.typeBook}>
          <div className="h-24 w-full rounded-sm bg-[#111] px-2 py-3 ring-1 ring-white/10">
            <p className="font-serif text-[11px] font-bold leading-tight text-[#f2c318]">The Shape<br />of Type</p>
          </div>
        </Artifact>

        {/* ===== Terminal artifact (far right) ===== */}
        <Artifact {...ARTIFACT_POSITIONS.terminal}>
          <div className="overflow-hidden rounded-md bg-[#0b0e12] ring-1 ring-white/10">
            <div className="flex gap-1 bg-[#15181e] px-2 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#e23b34]" />
              <span className="h-2 w-2 rounded-full bg-[#f2c318]" />
              <span className="h-2 w-2 rounded-full bg-[#3fb27f]" />
            </div>
            <pre className="px-2.5 py-2 font-mono text-[8px] leading-relaxed text-[#7fd18f]">$ whoami
{"> "}andre
$ ls interests/
pokemon marvel
film music type
$ _</pre>
          </div>
        </Artifact>
        {curiosityFound && <Artifact {...ARTIFACT_POSITIONS.hidden}>
          <aside className="hidden-artifact"><span>+1 hidden artifact</span><strong>Curiosity &gt; category</strong><p>Good ideas rarely stay inside one folder.</p></aside>
        </Artifact>}
      </div>

      {curiosityFound && <div className="curiosity-toast" role="status">you found the things that keep me curious.</div>}

      {/* ===== Floating bottom navigation ===== */}
      <nav
        className="fixed bottom-5 left-1/2 z-[90] -translate-x-1/2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 rounded-full bg-[#0b1220]/85 px-2 py-1.5 shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
          {[
            ["Home", "⌂", true],
            ["About", "◈", false],
            ["Interests", "✦", false],
            ["Photos", "❒", false],
            ["Music", "♪", false],
          ].map(([label, icon, active]) => (
            <button
              key={label as string}
              onClick={() => { if (label === "Music") void toggleAlbumPlayback(); else if (label === "Photos") { setPhotoIndex(0); setPanel("photo") } else setPan({ x: 0, y: 0 }) }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] transition ${
                active
                  ? "bg-white/12 text-white"
                  : "text-white/55 hover:text-white hover:bg-white/6"
              }`}
            >
              <span className="text-[13px]">{icon}</span>
              {active && <span className="tracking-wide">{label}</span>}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-white/12" />
          <button
            type="button"
            aria-label={soundOn ? "Turn archive sounds off" : "Turn archive sounds on"}
            aria-pressed={soundOn}
            onClick={() => setSoundOn((value) => !value)}
            className={`sound-toggle h-8 rounded-full px-3 font-mono text-[9px] transition ${soundOn ? "is-on" : ""}`}
          >
            Sound {soundOn ? "on" : "off"}
          </button>
          <button
            type="button"
            aria-label="Randomize archive asset positions"
            onClick={randomizeArchive}
            className="grid h-8 w-8 place-items-center rounded-full text-white/55 transition hover:bg-white/6 hover:text-white"
          >
            ↝
          </button>
          <button
            aria-label="Open Andre's Mixtape"
            onClick={() => void toggleAlbumPlayback()}
            className="grid h-8 w-8 place-items-center rounded-full text-white/55 transition hover:bg-white/6 hover:text-white"
          >
            ♫
          </button>
        </div>
      </nav>

      {/* corner meta */}
      <div className="pointer-events-none fixed left-5 top-4 z-[90] font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
        Andre&apos;s Archive
      </div>
      <div className="curiosity-counter" role="status" aria-live="polite">
        {disturbed.length} / ?? artifacts disturbed
      </div>
      <div className="coordinate-readout" aria-label={`Board position x ${Math.round(pan.x)}, y ${Math.round(pan.y)}`}>
        <span>x {Math.round(pan.x)}</span><span>y {Math.round(pan.y)}</span>
      </div>

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
      {panel === "photo" && <PhotoViewer index={photoIndex} onChange={setPhotoIndex} onClose={() => setPanel(null)} />}
      {albumSelected && <div className="album-toast" role="status" aria-live="polite" onPointerDown={(event) => event.stopPropagation()}>
        <span className={audioPlaying ? "album-toast-dot is-playing" : "album-toast-dot"} aria-hidden="true" />
        <div><strong>{audioPlaying ? "Now playing" : "Mixtape paused"}</strong><p>{nowPlaying || `${track.title} — ${track.artist}`}</p></div>
        <button type="button" onClick={() => void toggleAlbumPlayback()} aria-label="Stop mixtape">Stop</button>
      </div>}
    </div>
  )
}

/* --- Small die-cut sticker ------------------------------------- */
function Sticker({
  id,
  x,
  y,
  rotate,
  bg,
  text,
  color = "#fff",
  mono,
  imageSrc,
  label,
  movable = false,
  onClick,
  onDisturb,
}: {
  id: string
  x: number
  y: number
  rotate: number
  bg?: string
  text?: string
  color?: string
  mono?: boolean
  imageSrc?: string
  label?: string
  movable?: boolean
  onClick?: () => void
  onDisturb?: () => void
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [moving, setMoving] = useState(false)
  const pointer = useRef({ id: -1, startX: 0, startY: 0, originX: 0, originY: 0, moved: false })

  const start = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (!movable) return
    pointer.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, originX: offset.x, originY: offset.y, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
    setMoving(true)
  }
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!movable || pointer.current.id !== event.pointerId) return
    const dx = event.clientX - pointer.current.startX
    const dy = event.clientY - pointer.current.startY
    if (Math.hypot(dx, dy) >= 6) pointer.current.moved = true
    if (pointer.current.moved) setOffset({ x: pointer.current.originX + dx, y: pointer.current.originY + dy })
  }
  const end = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointer.current.id !== event.pointerId) return
    event.stopPropagation()
    const wasMoved = pointer.current.moved
    pointer.current.id = -1
    setMoving(false)
    if (wasMoved) onDisturb?.()
    else onClick?.()
  }

  return (
    <div className="absolute transition-[left,top] duration-500 ease-out" style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: "translate(-50%, -50%)", zIndex: moving ? 60 : 20 }}>
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={label || (onClick ? `Open ${id} sticker` : undefined)}
        onKeyDown={(event) => { if (onClick && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onClick() } }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        className={`archive-sticker sticker-${id} ${moving ? "is-moving" : ""} ${movable ? "is-movable" : ""} ${imageSrc ? "image-sticker" : "rounded-md px-3 py-2 ring-2 ring-white/70"} ${mono ? "font-mono" : "font-sans"} text-[13px] font-bold`}
        style={{ background: bg, color, transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${rotate}deg)` }}
      >
        {imageSrc ? <img src={imageSrc} alt="" draggable={false} /> : text}
        {label && <span className="sticker-tooltip">{label}</span>}
      </div>
    </div>
  )
}
