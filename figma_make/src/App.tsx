import { useCallback, useEffect, useRef, useState } from "react"
import { tracks } from "../../src/data/tracks"

/* ------------------------------------------------------------------ *\
   Andre's Archive — an interactive spatial interest board.
   Deep-green cutting-mat canvas, drag-to-pan, physical artifacts
   floating around a central editorial identity card.
\* ------------------------------------------------------------------ */

const PHOTOS = [
  { src: "/archive/assets/profile-photo.jpg", title: "Graduation", year: "", caption: "graduation" },
  { src: "/archive/assets/pics1.jpg", title: "Window sketch", year: "", caption: "drawing from memory" },
  { src: "/archive/assets/pics2.jpg", title: "Outside the lines", year: "", caption: "outside the lines" },
]

const BOARD_ASSETS = [
  { id: "oppenheimer", src: "/archive/assets/movie-oppenheimer.jpg", alt: "Oppenheimer poster", caption: "Oppenheimer", x: 1030, y: -365, rotate: 6, width: 118 },
  { id: "good-will-hunting", src: "/archive/assets/movie-good-will-hunting.jpg", alt: "Good Will Hunting poster", caption: "Good Will Hunting", x: -960, y: 90, rotate: -5, width: 112 },
  { id: "eternal-sunshine", src: "/archive/assets/movie-eternal-sunshine.jpg", alt: "Eternal Sunshine of the Spotless Mind poster", caption: "Eternal Sunshine", x: 870, y: 410, rotate: 4, width: 118 },
] as const

const ARTIFACT_POSITIONS = {
  pokemon: { x: -570, y: -325, rotate: -7, z: 40, width: 132 },
  marvel: { x: 540, y: -315, rotate: 9, z: 40, width: 140 },
  spiderman: { x: 665, y: 15, rotate: -5, z: 40, width: 128 },
  north: { x: -535, y: -30, rotate: -6, z: 30 },
  onFoot: { x: -535, y: 250, rotate: 5, z: 30 },
  stillness: { x: 525, y: 155, rotate: 4, z: 30 },
  contactSheet: { x: -720, y: 260, rotate: -4, z: 30, width: 150 },
  cassette: { x: -135, y: 445, rotate: -3, z: 40, width: 168 },
  cinema: { x: 355, y: 445, rotate: 6, z: 40, width: 170 },
  note: { x: -825, y: -95, rotate: -3, z: 20, width: 128 },
  bali: { x: 95, y: -445, rotate: 4, z: 30, width: 120 },
  japan: { x: 420, y: -470, rotate: 7, z: 20, width: 70 },
  rams: { x: -765, y: 70, rotate: 5, z: 20, width: 84 },
  typeBook: { x: -720, y: -315, rotate: -8, z: 20, width: 80 },
  terminal: { x: 850, y: 40, rotate: 5, z: 40, width: 132 },
  hidden: { x: -845, y: 430, rotate: -4, z: 30, width: 190 },
} as const

type Panel = "marvel" | "spiderman" | "photo" | null

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
      className="group absolute"
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
function Polaroid({ src, caption }: { src?: string; caption: string }) {
  return (
    <div className="relative w-[180px] bg-[#fbf9f2] p-2.5 pb-9">
      <Tape className="-top-2 left-1/2 -translate-x-1/2 opacity-80" rotate={-4} />
      <div className="h-[150px] w-full overflow-hidden bg-[#d8d1c2]">
        {src ? <img src={src} alt={caption} className="h-full w-full object-cover" /> : <div className="photo-pending"><span>Photo pending</span><small>approved archive asset</small></div>}
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
        <button type="button" className="mobile-object mobile-album" onClick={onMixtape}><img src="/archive/assets/song-green-day.jpg" alt="21st Century Breakdown album cover" /><span><strong>Andre&apos;s Mixtape</strong><small>Open the record player</small></span></button>
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
  const [pokemonFlipped, setPokemonFlipped] = useState(false)
  const [cinemaOpen, setCinemaOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [albumSelected, setAlbumSelected] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [nowPlaying, setNowPlaying] = useState("")
  const [discoveries, setDiscoveries] = useState<string[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)
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
  const discover = useCallback((id: string) => setDiscoveries((current) => current.includes(id) ? current : [...current, id]), [])
  const toggleAlbumPlayback = useCallback(async () => {
    setAlbumSelected(true)
    const audio = audioRef.current
    if (!audio || !track?.src) return
    if (audio.paused) {
      try { await audio.play() } catch { setAudioPlaying(false) }
    } else audio.pause()
  }, [track?.src])

  const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v))

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      drag.current = { active: true, moved: false, sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y }
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

  const onPointerUp = useCallback(() => {
    drag.current.active = false
    setGrabbing(false)
  }, [])

  return (
    <div
      className="relative h-screen w-screen overflow-hidden select-none archive-spatial"
      style={{
        cursor: grabbing ? "grabbing" : "grab",
        backgroundColor: "#1f6b50",
        backgroundImage: "linear-gradient(115deg, rgba(255,255,255,0.025), transparent 45%, rgba(5,35,26,0.05))",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
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

      {track?.src && <audio ref={audioRef} src={track.src} preload="metadata" onPlay={() => { setAudioPlaying(true); setNowPlaying(`${track.title} — ${track.artist}`) }} onPause={() => setAudioPlaying(false)} onEnded={() => setAudioPlaying(false)} />}
      <MobileArchive cinemaOpen={cinemaOpen} onCinema={() => setCinemaOpen((value) => !value)} onPhoto={() => { setPhotoIndex(0); setPanel("photo") }} onMixtape={() => void toggleAlbumPlayback()} />

      {/* ---- The board plane (everything pans together) ---- */}
      <div
        className="archive-plane absolute inset-0"
        style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0)` }}
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
              <img src="/archive/assets/profile-illustration.jpg" alt="Illustrated portrait of Andre Sanjaya" />
              <div><h1>Andre Sanjaya</h1><p>UI/UX Designer</p></div>
            </header>
            <section className="identity-about" aria-label="About Andre">
              <p>I&apos;m Andre Sanjaya, a Product and UI UX Designer from Bali. I enjoy designing digital experiences, collecting visual references, exploring technology, and turning curiosity into interactive ideas.</p>
              <div className="identity-socials" aria-label="Social destinations awaiting approved links">
                {[['in', 'LinkedIn'], ['◎', 'Instagram'], ['⌘', 'GitHub'], ['✉', 'Mail']].map(([icon, label]) => <span key={label}><b aria-hidden="true">{icon}</b>{label}</span>)}
              </div>
            </section>
            <section className="identity-experience" aria-labelledby="experience-title">
              <h2 id="experience-title">Experience <span aria-hidden="true">↓</span></h2>
              <ul>
                {[
                  ["UI/UX Designer", "Sanata System · Full-time · 3 yrs", "Sep 2023 — Present"],
                  ["System Implementor", "Sanata System · Full-time · 2 yrs 11 mos", "Sep 2023 — Present"],
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
        <Artifact {...ARTIFACT_POSITIONS.pokemon} label="Flip Pokemon inspiration card" onOpen={() => { setPokemonFlipped((value) => !value); discover("pokemon") }}>
          <div className={`collectible-card ${pokemonFlipped ? "is-flipped" : ""}`}>
           <div className="collectible-face collectible-front rounded-xl bg-gradient-to-b from-[#f2c318] to-[#e0a500] p-2 ring-1 ring-black/20">
            <div className="rounded-lg bg-[#1a1c22] p-2">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-[8px] uppercase tracking-widest text-[#f2c318]">No. 025</span>
                <span className="font-mono text-[8px] text-white/50">HP 60</span>
              </div>
              <div className="grid h-[92px] place-items-center overflow-hidden rounded-md bg-white">
                <img src="/archive/assets/pokemon.png" alt="Pokemon personal reference" className="h-full w-full object-contain" />
              </div>
              <p className="mt-1.5 font-serif text-[11px] text-white">Collector&apos;s Card</p>
            </div>
           </div>
           <div className="collectible-face collectible-back rounded-xl bg-[#171a20] p-3 text-white ring-1 ring-[#f2c318]/70">
            <span className="font-mono text-[8px] uppercase tracking-widest text-[#f2c318]">Current obsession</span>
            <strong className="mt-2 block font-serif text-lg">Pokémon</strong>
            <p className="mt-2 text-[9px] leading-relaxed text-white/75">I still love how a tiny world, a few creatures, and a sense of discovery can become unforgettable.</p>
            <dl className="mt-3 font-mono text-[7px] uppercase tracking-wider text-white/55"><dt>Type</dt><dd className="text-white/85">Personal reference</dd><dt className="mt-2">Found</dt><dd className="text-white/85">Childhood → now</dd></dl>
           </div>
          </div>
        </Artifact>

        {/* ===== MARVEL — upper-right ticket/comic ===== */}
        <Artifact {...ARTIFACT_POSITIONS.marvel} label="Marvel" onOpen={() => { setPanel("marvel"); discover("marvel") }}>
          <div className="overflow-hidden rounded-md bg-[#e23b34] ring-1 ring-black/25">
            <div className="flex items-center justify-between bg-[#111] px-2.5 py-1.5">
              <img src="/archive/assets/marvel.png" alt="Marvel" className="h-6 w-6 object-contain" />
              <span className="font-mono text-[8px] text-white/60">ADMIT ONE</span>
            </div>
            <div className="relative px-3 py-4">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "radial-gradient(#111 1.2px, transparent 1.2px)", backgroundSize: "6px 6px" }} />
              <p className="relative font-serif text-[15px] font-bold leading-tight text-white">
                Worlds, Heroes<br />& Imagination
              </p>
              <p className="relative mt-2 font-mono text-[8px] uppercase tracking-widest text-white/85">
                Row C · Seat 12
              </p>
            </div>
            <div className="border-t border-dashed border-black/30 bg-[#c9302b] px-3 py-1.5">
              <span className="font-mono text-[8px] tracking-widest text-white/90">■ ■■ ■ ■■■ ■ ■■</span>
            </div>
          </div>
        </Artifact>

        {/* ===== SPIDER-MAN — right, web card ===== */}
        <Artifact {...ARTIFACT_POSITIONS.spiderman} label="Spider-Man" onOpen={() => setPanel("spiderman")}>
          <div className="relative overflow-hidden rounded-lg bg-[#0d1836] p-3 ring-1 ring-black/30">
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
                <div className="h-8 w-8" style={{
                  background: "#0d1836",
                  clipPath: "polygon(50% 0, 62% 40%, 100% 50%, 62% 60%, 50% 100%, 38% 60%, 0 50%, 38% 40%)",
                }} />
              </div>
              <p className="mt-2 text-center font-serif text-[13px] font-bold text-white">Friendly</p>
              <p className="text-center font-mono text-[8px] uppercase tracking-[0.2em] text-[#e23b34]">Neighborhood</p>
            </div>
          </div>
        </Artifact>

        {/* ===== Polaroids ===== */}
        <Artifact {...ARTIFACT_POSITIONS.north} label="Open graduation photograph" onOpen={() => { setPhotoIndex(0); setPanel("photo") }}>
          <Polaroid src={PHOTOS[0].src} caption={PHOTOS[0].caption} />
        </Artifact>
        <Artifact {...ARTIFACT_POSITIONS.onFoot} label="Open window sketch" onOpen={() => { setPhotoIndex(1); setPanel("photo") }}>
          <Polaroid src={PHOTOS[1].src} caption={PHOTOS[1].caption} />
        </Artifact>
        <Artifact {...ARTIFACT_POSITIONS.stillness} label="Open childhood artwork" onOpen={() => { setPhotoIndex(2); setPanel("photo") }}>
          <Polaroid src={PHOTOS[2].src} caption={PHOTOS[2].caption} />
        </Artifact>

        {/* ===== Photography contact sheet (lower-left) ===== */}
        <Artifact {...ARTIFACT_POSITIONS.contactSheet} label="Contact sheet">
          <div className="bg-[#0a0a0a] p-2">
            <div className="grid grid-cols-3 gap-1">
              {[PHOTOS[0].src, PHOTOS[1].src, "/archive/assets/bali-postcard.png", PHOTOS[2].src, PHOTOS[1].src, PHOTOS[0].src].map((s, i) => (
                <div key={i} className="aspect-square overflow-hidden bg-[#111]">
                  {s ? <img src={s} alt="" className="h-full w-full object-cover opacity-90 grayscale" /> : <span className="block h-full w-full bg-[linear-gradient(135deg,#252525,#111)]" />}
                </div>
              ))}
            </div>
            <p className="mt-1.5 font-mono text-[8px] tracking-widest text-[#f2c318]">FILM 400 · 36EXP</p>
          </div>
        </Artifact>

        {/* ===== Album and vinyl (lower-center) ===== */}
        <Artifact {...ARTIFACT_POSITIONS.cassette} label="Open Andre's Mixtape" onOpen={() => setPlayerOpen(true)}>
          <div className={`record-artifact ${playerOpen ? "is-open" : ""} ${audioPlaying ? "is-playing" : ""}`}>
            <div className="vinyl-record" aria-hidden="true"><span /></div>
            <div className="record-sleeve"><img src="/archive/assets/song-green-day.jpg" alt="Green Day 21st Century Breakdown album cover" /></div>
            <span className="record-caption">Andre&apos;s mixtape · Side A</span>
          </div>
        </Artifact>

        {/* ===== Movie ticket (lower-right) ===== */}
        <Artifact {...ARTIFACT_POSITIONS.cinema} label="Open cinema references" onOpen={() => setCinemaOpen((value) => !value)}>
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
        <Artifact {...ARTIFACT_POSITIONS.bali} label="Bali">
          <div className="bg-[#f4efe4] p-1.5"
            style={{ filter: "drop-shadow(0 0 0 #fff)",
              WebkitMaskImage: "radial-gradient(circle at 4px 4px, transparent 3px, #000 3px)",
              WebkitMaskSize: "8px 8px" }}>
            <div className="overflow-hidden">
              <img src="/archive/assets/bali-postcard.png" alt="Bali postcard" className="h-20 w-full object-cover" />
              <p className="mt-1 text-center font-serif text-[11px] font-bold text-[#16181d]">BALI · IDN</p>
            </div>
          </div>
        </Artifact>

        {/* ===== Sticker cluster: tech identity ===== */}
        <Sticker id="figma" x={-400} y={-455} rotate={-6} imageSrc="/archive/assets/figma-sticker.jpg" label="Figma sticker" movable onClick={() => discover("figma")} />
        <Sticker id="typescript" x={720} y={-245} rotate={-8} bg="#3178c6" text="TS" mono movable />
        <Sticker id="next" x={650} y={-165} rotate={6} bg="#0a0a0a" text="▲ Next" movable />
        <Sticker id="react" x={-390} y={455} rotate={-6} bg="#20232a" text="⚛ React" color="#61dafb" movable />
        <Sticker id="make" x={90} y={590} rotate={5} bg="#f2c318" text="M↓X" color="#16181d" />
        <Sticker id="dot" x={680} y={300} rotate={-4} bg="#e23b34" text="●" color="#fff" />

        {/* ===== User-supplied archive assets ===== */}
        {BOARD_ASSETS.map((asset) => <Artifact key={asset.id} x={asset.x} y={asset.y} rotate={asset.rotate} z={30} width={asset.width} label={asset.caption}>
          <figure className={`board-image-artifact board-image-${asset.id}`}>
            <img src={asset.src} alt={asset.alt} />
            <figcaption>{asset.caption}</figcaption>
          </figure>
        </Artifact>)}

        {/* ===== Japan flag sticker (upper-right corner) ===== */}
        <Artifact {...ARTIFACT_POSITIONS.japan}>
          <div className="grid h-12 w-16 place-items-center rounded-sm bg-white ring-1 ring-black/15">
            <span className="h-6 w-6 rounded-full bg-[#e23b34]" />
          </div>
        </Artifact>

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
              onClick={() => { if (label === "Music") setPlayerOpen(true); else if (label === "Photos") { setPhotoIndex(0); setPanel("photo") } else setPan({ x: 0, y: 0 }) }}
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
            aria-label="Toggle theme"
            className="grid h-8 w-8 place-items-center rounded-full text-white/55 transition hover:bg-white/6 hover:text-white"
          >
            ◑
          </button>
          <button
            aria-label="Open Andre's Mixtape"
            onClick={() => setPlayerOpen(true)}
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
      <div className="pointer-events-none fixed right-5 top-4 z-[90] font-mono text-[10px] tracking-[0.14em] text-white/45">
        origin 0,0 · drag to pan
      </div>

      {/* ===== Popovers ===== */}
      {panel === "marvel" && (
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
      <MixtapePlayer open={playerOpen} onClose={() => setPlayerOpen(false)} onPlayingChange={onPlaybackChange} />
      {audioPlaying && <button type="button" className="now-playing" onPointerDown={(event) => event.stopPropagation()} onClick={() => setPlayerOpen(true)}>♪ {nowPlaying}</button>}
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
    if (!wasMoved) onClick?.()
  }

  return (
    <div className="absolute" style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: "translate(-50%, -50%)", zIndex: moving ? 60 : 20 }}>
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={label || (onClick ? `Open ${id} sticker` : undefined)}
        onKeyDown={(event) => { if (onClick && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onClick() } }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        className={`archive-sticker ${moving ? "is-moving" : ""} ${movable ? "is-movable" : ""} ${imageSrc ? "image-sticker" : "rounded-md px-3 py-2 ring-2 ring-white/70"} ${mono ? "font-mono" : "font-sans"} text-[13px] font-bold`}
        style={{ background: bg, color, transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${rotate}deg)` }}
      >
        {imageSrc ? <img src={imageSrc} alt="" draggable={false} /> : text}
      </div>
    </div>
  )
}
