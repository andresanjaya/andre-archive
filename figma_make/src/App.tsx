import { useCallback, useEffect, useRef, useState } from "react"
import { tracks } from "../../src/data/tracks"
import dynamic from "next/dynamic"
const PicturePuzzle = dynamic(() => import("../../src/components/archive/PicturePuzzle"), { ssr: false })
import syncedPhotos from "../../src/data/photo-manifest.json"

/* ------------------------------------------------------------------ *\
   Andre's Archive — an interactive spatial interest board.
   Deep-green cutting-mat canvas, drag-to-pan, physical artifacts
   floating around a central editorial identity card.
\* ------------------------------------------------------------------ */

const PHOTOS = [
  { src: "/archive/assets/pict-1.jpg", title: "Graduation", year: "2026", caption: "graduation" },
  { src: "/archive/assets/pict-2.png", title: "Kindergarten", year: "", caption: "kindergarten" },
  { src: "/archive/assets/pict-4.jpeg", title: "Personal Reference", year: "", caption: "personal reference" },
  { src: "/archive/assets/profile2.png", title: "Andre Sanjaya", year: "", caption: "andre sanjaya" },
]
const GALLERY_PHOTOS = syncedPhotos

const BOARD_ASSETS = [
  { id: "book", src: "/archive/assets/book-1.jpg", alt: "The Design of Everyday Things book cover", caption: "The Design of Everyday Things", width: 108 },
  { id: "book-two", src: "/archive/assets/book-2.jpg", alt: "Almost Adulting book cover", caption: "Almost Adulting", width: 106 },
  { id: "book-three", src: "/archive/assets/book-3.jpg", alt: "Atomic Habits book cover", caption: "Atomic Habits", width: 103 },
  { id: "book-four", src: "/archive/assets/book-4.jpg", alt: "Detective Conan volume 24 book cover", caption: "Detective Conan Vol. 24", width: 105 },
  { id: "letterboxd", src: "/archive/assets/letterboxd.png", alt: "Letterboxd logo", caption: "Letterboxd", width: 92 },
  { id: "movie-one", src: "/archive/assets/movie-1.jpg", alt: "Oppenheimer poster", caption: "Oppenheimer", width: 134 },
  { id: "movie-two", src: "/archive/assets/movie-2.jpg", alt: "Good Will Hunting poster", caption: "Good Will Hunting", width: 130 },
  { id: "movie-three", src: "/archive/assets/movie-3.jpg", alt: "Eternal Sunshine of the Spotless Mind poster", caption: "Eternal Sunshine", width: 137 },
  { id: "movie-four", src: "/archive/assets/movie-4.jpg", alt: "Forrest Gump", caption: "Forrest Gump", width: 132 },
  { id: "series-one", src: "/archive/assets/series-1.jpg", alt: "Breaking Bad", caption: "Breaking Bad", width: 128 },
  { id: "series-two", src: "/archive/assets/series-2.jpg", alt: "Dark", caption: "Dark", width: 128 },
  { id: "series-three", src: "/archive/assets/series-3.jpg", alt: "Loki", caption: "Loki", width: 128 },
  { id: "series-four", src: "/archive/assets/series-4.jpg", alt: "Avatar: The Last Airbender", caption: "Avatar: The Last Airbender", width: 128 },
  { id: "series-five", src: "/archive/assets/series-5.jpg", alt: "Better Call Saul", caption: "Better Call Saul", width: 128 },
  { id: "archive-logo", src: "/archive/assets/logo.svg", alt: "Andre Archive logo", caption: "Archive logo", width: 125 },
] as const

// Single source of truth for the default board composition.
// Change x, y, or rotate here to manually arrange any named artifact.
const ARTIFACT_POSITIONS = {
  bookDesignEverydayThings: { x: -875, y: -150, rotate: 15, z: 30 },
  bookAlmostAdulting: { x: 875, y: -400, rotate: 8, z: 30 },
  bookAtomicHabits: { x: -1100, y: 60, rotate: -4, z: 30 },
  bookDetectiveConan: { x: 570, y: -530, rotate: -8, z: 30 },
  letterboxdLogo: { x: 680, y: -300, rotate: 5, z: 30 },
  filmOppenheimer: { x: 300, y: 570, rotate: 4, z: 30 },
  filmGoodWillHunting: { x: -820, y: 145, rotate: -15, z: 30 },
  filmEternalSunshine: { x: 800, y: -105, rotate: -5, z: 30 },
  filmForrestGump: { x:-500, y: 700, rotate: -4, z: 30 },
  seriesOne: { x: -320, y: -560, rotate: -15, z: 30 },
  seriesTwo: { x: 50, y: 600, rotate: -7, z: 30 },
  seriesThree: { x: 240, y: -560, rotate: 15, z: 30 },
  seriesFour: { x: -1250, y: -320, rotate: -15, z: 30 },
  seriesFive: {  x: 1050, y: -105, rotate: 7, z: 30 },
  archiveLogo: { x: -1060, y: -135, rotate: 5, z: 30 },
  pokemonLogo: { x: -720, y: -320, rotate: -7, z: 40, width: 156 },
  pokemonCard: { x: -700, y: -520, rotate: 5, z: 40, width: 150 },
  marvelLogo: { x: 400, y: -400, rotate: 5, z: 30, width: 125 },
  spiderManReference: { x: 850, y: 100, rotate: -5, z: 40, width: 132 },
  photoGraduation: { x: -480, y: -150, rotate: 10, z: 30 },
  photoKindergarten: { x: -480, y: 220, rotate: -10, z: 30 },
  photoPersonalReference: { x: 470, y: -150, rotate: -15, z: 30 },
  albumMardyBum: { x: -720, y: 470, rotate: 15, z: 40, width: 200 },
  stampBali: { x: -1000, y: -445, rotate: 4, z: 30, width: 144 },
  photoPikachu: { x: 480, y: 250, rotate: 12, z: 30 },
  albumGoodRiddance: { x: -20, y: -560, rotate: 15, z: 40, width: 200 },
  albumGemilang: { x: 800, y: 300, rotate: -10, z: 40, width: 200 },
  albumEarrings: { x: -220, y: 600, rotate: -4, z: 40, width: 200 },
  albumWonderwall: { x: -1350, y: 50, rotate: 7, z: 40, width: 200 },
  albumWhiteFerrari: { x: -1050, y: 380, rotate: -6, z: 40, width: 200 },
  albumHighAndDry: { x: 700, y: 700, rotate: 5, z: 40, width: 200 },
  stickerFigma: { x: -450, y: -380, rotate: -6, z: 20 },
  stickerCharizard: { x: 1080, y: -380, rotate: 8, z: 35, width: 120 },
  curiositySecret: { x: -845, y: 430, rotate: -4, z: 30, width: 190 },
} as const

const BOARD_ASSET_POSITION_KEYS = {
  book: "bookDesignEverydayThings", "book-two": "bookAlmostAdulting", "book-three": "bookAtomicHabits", "book-four": "bookDetectiveConan", letterboxd: "letterboxdLogo",
  "movie-one": "filmOppenheimer", "movie-two": "filmGoodWillHunting", "movie-three": "filmEternalSunshine", "movie-four": "filmForrestGump", "series-one": "seriesOne", "series-two": "seriesTwo", "series-three": "seriesThree", "series-four": "seriesFour", "series-five": "seriesFive", "archive-logo": "archiveLogo",
} as const

const RANDOMIZABLE_ASSETS = [
  ...BOARD_ASSETS.map(({ id }) => ({ id, ...ARTIFACT_POSITIONS[BOARD_ASSET_POSITION_KEYS[id]] })),
  { id: "pokemon", ...ARTIFACT_POSITIONS.pokemonLogo },
  { id: "marvel", ...ARTIFACT_POSITIONS.marvelLogo },
  { id: "pokemon-card", ...ARTIFACT_POSITIONS.pokemonCard },
  { id: "pict-one", ...ARTIFACT_POSITIONS.photoGraduation },
  { id: "pict-two", ...ARTIFACT_POSITIONS.photoKindergarten },
  { id: "pict-four", ...ARTIFACT_POSITIONS.photoPersonalReference },
  { id: "pict-five", ...ARTIFACT_POSITIONS.photoPikachu },
  { id: "mixtape", ...ARTIFACT_POSITIONS.albumMardyBum },
  { id: "song-two", ...ARTIFACT_POSITIONS.albumGoodRiddance },
  { id: "song-three", ...ARTIFACT_POSITIONS.albumGemilang },
  { id: "song-four", ...ARTIFACT_POSITIONS.albumEarrings },
  { id: "song-five", ...ARTIFACT_POSITIONS.albumWonderwall },
  { id: "song-six", ...ARTIFACT_POSITIONS.albumWhiteFerrari },
  { id: "song-seven", ...ARTIFACT_POSITIONS.albumHighAndDry },
  { id: "bali-stamp", ...ARTIFACT_POSITIONS.stampBali },
  { id: "figma", ...ARTIFACT_POSITIONS.stickerFigma },
  { id: "charizard", ...ARTIFACT_POSITIONS.stickerCharizard },
] as const

type Panel = "spiderman" | null

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
  entranceDelay,
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
  entranceDelay?: number
}) {
  const interactive = Boolean(onOpen)
  const isBook = className.includes("book-artifact-group")
  const isProjectorPoster = className.includes("projector-poster-group")
  const computedEntranceDelay = entranceDelay ?? (120 + (Math.abs(Math.round(x + y)) % 8) * 70)
  return (
    <div
      className="archive-entrance group absolute transition-[left,top] duration-500 ease-out"
      data-artifact={label || "passive artifact"}
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: "translate(-50%, -50%)",
        zIndex: z,
        width: width ? `${width}px` : undefined,
        ["--entrance-delay" as string]: `${computedEntranceDelay}ms`,
      }}
    >
      <div
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={label}
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
        className={`relative transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          interactive ? "cursor-pointer" : ""
        } outline-none ${className}`}
        style={{
          transform: `rotate(${rotate}deg)`,
          filter: isBook || isProjectorPoster ? "none" : "drop-shadow(0 18px 24px rgba(6,20,48,0.45))",
        }}
        onMouseEnter={(e) => {
          if (isBook || isProjectorPoster) return
          e.currentTarget.style.transform = `rotate(${rotate * 0.35}deg) translateY(-8px) scale(1.04)`
          e.currentTarget.style.filter =
            "drop-shadow(0 30px 40px rgba(6,20,48,0.55))"
        }}
        onMouseLeave={(e) => {
          if (isBook || isProjectorPoster) return
          e.currentTarget.style.transform = `rotate(${rotate}deg)`
          e.currentTarget.style.filter =
            "drop-shadow(0 18px 24px rgba(6,20,48,0.45))"
        }}
        onFocus={(e) => {
          if (isBook || isProjectorPoster) return
          e.currentTarget.style.transform = `rotate(0deg) translateY(-8px) scale(1.04)`
        }}
        onBlur={(e) => {
          if (isProjectorPoster) return
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

function ProjectorPoster({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="projector-poster">
      <div className="projector-poster-content">
        <img src={src} alt={alt} loading="lazy" decoding="async" className="board-image-asset projector-poster-image" />
        <span className="projector-light-sweep" aria-hidden="true" />
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
    <div className="relative w-[205px] rounded-[7px] bg-[#fbf9f2] p-2.5 pb-9">
      <Tape className="-top-2 left-1/2 -translate-x-1/2 opacity-80" rotate={-4} />
      <div className="h-[230px] w-full overflow-hidden rounded-[4px] bg-[#d8d1c2]">
        {src ? <img src={src} alt={caption} loading="lazy" decoding="async" className="h-full w-full" style={{ objectFit: fit, objectPosition: focus }} /> : <div className="photo-pending"><span>Photo pending</span><small>approved archive asset</small></div>}
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

function PhotoGallery({ onOpen, onClose, lightMode }: { onOpen: (index: number) => void; onClose: () => void; lightMode: boolean }) {
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
      {GALLERY_PHOTOS.map((photo, index) => <button key={photo.src} type="button" onClick={() => onOpen(index)} aria-label={`View ${photo.title}`}>
        <img src={photo.src} alt={photo.caption} loading="lazy" decoding="async" />
      </button>)}
    </div>
  </div>
}

function GalleryCarousel({ index, onChange, onClose, lightMode }: { index: number; onChange: (index: number) => void; onClose: () => void; lightMode: boolean }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const startX = useRef<number | null>(null)
  const count = GALLERY_PHOTOS.length
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
      {[previous, index, next].map((photoIndex, position) => <div key={`${photoIndex}-${position}`} className={`gallery-carousel-slide ${position === 1 ? "is-current" : ""}`}><img src={GALLERY_PHOTOS[photoIndex].src} alt={position === 1 ? `Photo ${index + 1}` : ""} decoding="async" /></div>)}
    </div>
    <button className="gallery-carousel-prev" type="button" onClick={() => onChange(previous)} aria-label="Previous photo">←</button>
    <button className="gallery-carousel-next" type="button" onClick={() => onChange(next)} aria-label="Next photo">→</button>
  </div>
}

function MobileArchive({ cinemaOpen, onCinema, onMixtape }: { cinemaOpen: boolean; onCinema: () => void; onMixtape: () => void }) {
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
    <section aria-labelledby="mobile-photos"><div className="mobile-section-title"><span>02</span><h2 id="mobile-photos">Contact sheet</h2></div><div className="mobile-photo"><img src={PHOTOS[0].src} alt="Graduation portrait" /><span>Graduation</span></div></section>
    <section aria-labelledby="mobile-references"><div className="mobile-section-title"><span>03</span><h2 id="mobile-references">Personal references</h2></div><div className="mobile-reference-row"><img src="/archive/assets/figma-sticker.png" alt="Figma sticker" /><img src="/archive/assets/marvel.png" alt="Marvel reference" /><img src="/archive/assets/bali-postcard.png" alt="Bali postcard" /></div></section>
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

export default function App() {
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
  const [trackIndex, setTrackIndex] = useState(0)
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [nowPlaying, setNowPlaying] = useState("")
  const [discoveries, setDiscoveries] = useState<string[]>([])
  const [disturbed, setDisturbed] = useState<string[]>([])
  const [audioMuted, setAudioMuted] = useState(false)
  const [lightMode, setLightMode] = useState(false)
  const [assetLayout, setAssetLayout] = useState<Record<string, { x: number; y: number; rotate: number }>>(() => Object.fromEntries(RANDOMIZABLE_ASSETS.map((asset) => [asset.id, { x: asset.x, y: asset.y, rotate: asset.rotate }])))
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
  const track = tracks[trackIndex]
  const BOARD_ARTIFACT_COUNT = BOARD_ASSETS.length + 26
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
  const playTrack = useCallback(async (nextTrack: typeof tracks[number]) => {
    const audio = audioRef.current
    if (!audio || !nextTrack?.src) return
    playMicroSound("mechanical")
    disturb(nextTrack.id === tracks[0].id ? "mixtape" : `song-${tracks.findIndex((item) => item.id === nextTrack.id) + 1}`)
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
    setTrackIndex(tracks.findIndex((item) => item.id === nextTrack.id))
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
  }, [audioMuted, disturb, playMicroSound])
  const toggleAlbumPlayback = useCallback((nextTrackId?: string) => {
    const nextTrack = nextTrackId ? tracks.find((item) => item.id === nextTrackId) : tracks[trackIndex]
    if (nextTrack) void playTrack(nextTrack)
  }, [playTrack, trackIndex])
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
    applyPan({ x: 0, y: 0 })
  }

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
        backgroundColor: "#1f6b50",
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
      <MobileArchive cinemaOpen={cinemaOpen} onCinema={() => { setCinemaOpen((value) => !value); disturb("cinema"); playMicroSound("projector") }} onMixtape={() => void toggleAlbumPlayback()} />

      {/* ---- The board plane (everything pans together) ---- */}
      <div
        ref={planeRef}
        className="archive-plane absolute inset-0"
        style={{ transform: "translate3d(0, 0, 0) scale(var(--board-scale, .78))", transformOrigin: "center" }}
      >
        {/* ===== Central identity card ===== */}
        <div
          className="archive-entrance absolute"
          data-identity-card
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 50 }}
        >
          <div className={`identity-card ${lightMode ? "is-light" : "is-dark"}`}>
            <header className="identity-header">
              <img src="/archive/assets/profile.jpg" alt="Portrait of Andre Sanjaya" decoding="async" />
              <div><h1>Andre Sanjaya</h1><p>UI/UX Designer</p></div>
            </header>
            <section className="identity-about" aria-label="About Andre">
              <p>Welcome to my little corner of the internet. I&apos;m Andre, a UI/UX Designer from Bali, Indonesia. This is a collection of things I love, things I&apos;ve made, and random little discoveries that somehow found their way into my world.<br /><br />From movies, music, photography, and everything in between, this is where my interests come together without needing to make perfect sense.<br /><br />Look around, move things, click on something unexpected, and stay curious. You never know what you might find.</p>
              <div className="identity-socials" aria-label="Social destinations">
                {SOCIAL_DESTINATIONS.map(({ icon, label, href }) => <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}><SocialIcon name={icon} />{label}</a>)}
              </div>
            </section>
            <section className="identity-experience" aria-label="Experience">
              <ul>
                {[
                  ["UI/UX Designer", "Sanata System · Full-time · 3 yrs", "Sep 2023 — Present"],
                  ["System Implementor", "Sanata System · Full-time · 2 yrs 11 mos", "Dec 2022 — Nov 2023"],
                  ["Mobile Application Developer", "Blue Lake · Internship · 3 mos", "Jan 2021 — Mar 2021"],
                ].map(([role, meta, period]) => <li key={role}><div><strong>{role}</strong><p>{meta}</p></div><time>{period}</time></li>)}
              </ul>
            </section>
          </div>
        </div>

        {/* ===== POKÉMON — upper-left collectible ===== */}
        <Artifact {...layoutFor("pokemon", ARTIFACT_POSITIONS.pokemonLogo)} label="Pokémon" className="cursor-pokemon" onOpen={() => { discover("pokemon"); playMicroSound("card") }}>
          <img src="/archive/assets/pokemon.png" alt="Pokémon personal reference" className="pokemon-asset" />
        </Artifact>

        <Artifact {...layoutFor("pokemon-card", ARTIFACT_POSITIONS.pokemonCard)} label="Pokemon card" className="cursor-pokemon" onOpen={() => { disturb("pokemon-card"); playMicroSound("card") }}>
          <img src="/archive/assets/pokemon-card.png" alt="Pokemon trading card" className="board-image-pokemon-card" />
        </Artifact>

        <Artifact {...layoutFor("song-three", ARTIFACT_POSITIONS.albumGemilang)} z={40} width={200} label="Gemilang · Perunggu" className="cursor-music" onOpen={() => void toggleAlbumPlayback("song-three")}>
          <div className={`record-artifact ${activeTrackId === tracks[2].id ? "is-open" : ""} ${activeTrackId === tracks[2].id && audioPlaying ? "is-playing" : ""}`}>
            <div className="vinyl-record" aria-hidden="true"><span /></div>
            <div className="record-sleeve"><img src="/archive/assets/song-3.jpg" alt="Dalam Dinamika album cover" /></div>
          </div>
        </Artifact>

        {/* ===== MARVEL — upper-right ticket/comic ===== */}
        <Artifact {...layoutFor("marvel", ARTIFACT_POSITIONS.marvelLogo)} label="Marvel">
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
        <Artifact {...ARTIFACT_POSITIONS.spiderManReference} label="Spider-Man">
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
            </div>
          </div>
          <img src="/archive/assets/spiderman.png" alt="Spider-Man reference" className="board-image-asset" />
        </Artifact>


        {/* ===== Polaroids ===== */}
        <Artifact {...layoutFor("pict-one", ARTIFACT_POSITIONS.photoGraduation)} label="Graduation photograph">
          <Polaroid src={PHOTOS[0].src} caption={PHOTOS[0].caption} />
        </Artifact>
        <Artifact {...layoutFor("pict-two", ARTIFACT_POSITIONS.photoKindergarten)} label="Kindergarten photograph">
          <Polaroid src={PHOTOS[1].src} caption={PHOTOS[1].caption} fit="contain" focus="center" />
        </Artifact>
        <Artifact {...layoutFor("pict-four", ARTIFACT_POSITIONS.photoPersonalReference)} label="Personal Reference">
          <Polaroid src={PHOTOS[2].src} caption={PHOTOS[2].caption} />
        </Artifact>

        {/* ===== Photography contact sheet (lower-left) ===== */}
        <Artifact {...layoutFor("pict-five", ARTIFACT_POSITIONS.photoPikachu)} label="Andre Sanjaya">
          <Polaroid src={PHOTOS[3].src} caption={PHOTOS[3].caption} />
        </Artifact>

        {/* ===== Album and vinyl (lower-center) ===== */}
        <Artifact {...layoutFor("mixtape", ARTIFACT_POSITIONS.albumMardyBum)} label="Mardy Bum · Arctic Monkeys" className="cursor-music" onOpen={() => void toggleAlbumPlayback("arctic-monkeys-mardy-bum")}>
          <div className={`record-artifact ${activeTrackId === tracks[0].id ? "is-open" : ""} ${activeTrackId === tracks[0].id && audioPlaying ? "is-playing" : ""}`}>
            <div className="vinyl-record" aria-hidden="true"><span /></div>
            <div className="record-sleeve"><img src="/archive/assets/song-1.jpg" alt="Mardy Bum by Arctic Monkeys album cover" /></div>
          </div>
        </Artifact>

        <Artifact {...layoutFor("song-two", ARTIFACT_POSITIONS.albumGoodRiddance)} z={40} width={200} label="Good Riddance · Green Day" className="cursor-music" onOpen={() => void toggleAlbumPlayback("green-day-good-riddance")}>
          <div className={`record-artifact ${activeTrackId === tracks[1].id ? "is-open" : ""} ${activeTrackId === tracks[1].id && audioPlaying ? "is-playing" : ""}`}>
            <div className="vinyl-record" aria-hidden="true"><span /></div>
            <div className="record-sleeve"><img src="/archive/assets/song-2.jpg" alt="Good Riddance album cover" /></div>
          </div>
        </Artifact>

        <Artifact {...layoutFor("song-four", ARTIFACT_POSITIONS.albumEarrings)} z={40} width={200} label="Earrings - Malcolm Todd" className="cursor-music" onOpen={() => void toggleAlbumPlayback("malcolm-todd-earrings")}>
          <div className={`record-artifact ${activeTrackId === tracks[3].id ? "is-open" : ""} ${activeTrackId === tracks[3].id && audioPlaying ? "is-playing" : ""}`}>
            <div className="vinyl-record" aria-hidden="true"><span /></div>
            <div className="record-sleeve"><img src="/archive/assets/song-4.jpg" alt="Earrings by Malcolm Todd album cover" /></div>
          </div>
        </Artifact>

        <Artifact {...layoutFor("song-five", ARTIFACT_POSITIONS.albumWonderwall)} z={40} width={200} label="Wonderwall · Oasis" className="cursor-music" onOpen={() => void toggleAlbumPlayback("oasis-wonderwall")}>
          <div className={`record-artifact ${activeTrackId === tracks[4].id ? "is-open" : ""} ${activeTrackId === tracks[4].id && audioPlaying ? "is-playing" : ""}`}>
            <div className="vinyl-record" aria-hidden="true"><span /></div>
            <div className="record-sleeve"><img src="/archive/assets/song-5.jpg" alt="Wonderwall by Oasis album cover" /></div>
          </div>
        </Artifact>

        <Artifact {...layoutFor("song-six", ARTIFACT_POSITIONS.albumWhiteFerrari)} z={40} width={200} label="White Ferrari · Frank Ocean" className="cursor-music" onOpen={() => void toggleAlbumPlayback("frank-ocean-white-ferrari")}>
          <div className={`record-artifact ${activeTrackId === tracks[5].id ? "is-open" : ""} ${activeTrackId === tracks[5].id && audioPlaying ? "is-playing" : ""}`}>
            <div className="vinyl-record" aria-hidden="true"><span /></div>
            <div className="record-sleeve"><img src="/archive/assets/song-6.jpg" alt="White Ferrari by Frank Ocean album cover" /></div>
          </div>
        </Artifact>

        <Artifact {...layoutFor("song-seven", ARTIFACT_POSITIONS.albumHighAndDry)} z={40} width={200} label="High and Dry · Radiohead" className="cursor-music" onOpen={() => void toggleAlbumPlayback("radiohead-high-and-dry")}>
          <div className={`record-artifact ${activeTrackId === tracks[6].id ? "is-open" : ""} ${activeTrackId === tracks[6].id && audioPlaying ? "is-playing" : ""}`}>
            <div className="vinyl-record" aria-hidden="true"><span /></div>
            <div className="record-sleeve"><img src="/archive/assets/song-7.jpg" alt="High and Dry by Radiohead album cover" /></div>
          </div>
        </Artifact>

        {/* ===== Bali fragment / stamp (top) ===== */}
        <Artifact {...layoutFor("bali-stamp", ARTIFACT_POSITIONS.stampBali)} label="Bali stamp">
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
        <Sticker id="figma" x={assetLayout.figma?.x ?? ARTIFACT_POSITIONS.stickerFigma.x} y={assetLayout.figma?.y ?? ARTIFACT_POSITIONS.stickerFigma.y} rotate={assetLayout.figma?.rotate ?? ARTIFACT_POSITIONS.stickerFigma.rotate} imageSrc="/archive/assets/figma-sticker.png" label="figma" movable onClick={() => { discover("figma"); playMicroSound("ui") }} onDisturb={() => disturb("figma-drag")} />
        <Sticker id="charizard" x={assetLayout.charizard?.x ?? ARTIFACT_POSITIONS.stickerCharizard.x} y={assetLayout.charizard?.y ?? ARTIFACT_POSITIONS.stickerCharizard.y} rotate={assetLayout.charizard?.rotate ?? ARTIFACT_POSITIONS.stickerCharizard.rotate} imageSrc="/archive/assets/charizard.png" label="charizard" movable onClick={() => { discover("charizard"); playMicroSound("card") }} onDisturb={() => disturb("charizard-drag")} />

        {/* ===== User-supplied archive assets ===== */}
        {BOARD_ASSETS.map((asset) => {
          const positionKey = BOARD_ASSET_POSITION_KEYS[asset.id]
          const layout = assetLayout[asset.id] ?? ARTIFACT_POSITIONS[positionKey]
          const isMovie = asset.id.startsWith("movie") || asset.id.startsWith("series") || asset.id === "letterboxd"
          const isProjectorPoster = /\/(?:movies?|series)-/i.test(asset.src)
          const isBook = asset.id.startsWith("book")
          return <Artifact key={asset.id} x={layout.x} y={layout.y} rotate={layout.rotate} z={30} width={asset.width} label={asset.caption} className={`${isMovie ? "cursor-cinema" : ""} ${isBook ? "book-artifact-group" : ""} ${isProjectorPoster ? "projector-poster-group" : ""}`} onOpen={() => { disturb(asset.id); if (isMovie) playMicroSound("projector") }}>
            {isBook ? <div className="book-artifact-scene"><div className="book-artifact"><span className="book-artifact-back" aria-hidden="true" /><span className="book-artifact-pages" aria-hidden="true" /><span className="book-artifact-front"><img src={asset.src} alt={asset.alt} loading="lazy" decoding="async" /></span></div></div> : isProjectorPoster ? <ProjectorPoster src={asset.src} alt={asset.alt} /> : <img src={asset.src} alt={asset.alt} loading="lazy" decoding="async" className="board-image-asset" />}
          </Artifact>
        })}
{curiosityFound && <Artifact {...ARTIFACT_POSITIONS.curiositySecret}>
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
      {galleryOpen && galleryPhotoOpen && <GalleryCarousel index={photoIndex} onChange={setPhotoIndex} onClose={closePhoto} lightMode={lightMode} />}
      {galleryOpen && <PhotoGallery onOpen={(index) => { setPhotoIndex(index); setGalleryPhotoOpen(true) }} onClose={closeGallery} lightMode={lightMode} />}
      {puzzleOpen && <PicturePuzzle onClose={closePuzzle} lightMode={lightMode} />}
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
    <div className="archive-entrance absolute transition-[left,top] duration-500 ease-out" style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: "translate(-50%, -50%)", zIndex: moving ? 60 : 20, ["--entrance-delay" as string]: `${120 + (Math.abs(Math.round(x + y)) % 8) * 70}ms` }}>
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
