"use client";
/* eslint-disable @next/next/no-img-element -- Existing static-export artwork; optimized variants are supplied by Studio. */
import { useRef, useState } from "react"
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

export function Artifact({
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
  const noHover = className.includes("cms-no-hover") || className.includes("cms-edit-artifact")
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
          if (isBook || isProjectorPoster || noHover) return
          e.currentTarget.style.transform = `rotate(${rotate * 0.35}deg) translateY(calc(-1 * var(--cms-lift, 8px))) scale(1.04)`
          e.currentTarget.style.filter =
            "drop-shadow(0 30px 40px rgba(6,20,48,0.55))"
        }}
        onMouseLeave={(e) => {
          if (isBook || isProjectorPoster || noHover) return
          e.currentTarget.style.transform = `rotate(${rotate}deg)`
          e.currentTarget.style.filter =
            "drop-shadow(0 18px 24px rgba(6,20,48,0.45))"
        }}
        onFocus={(e) => {
          if (isBook || isProjectorPoster || noHover) return
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

export function ProjectorPoster({ src, alt }: { src: string; alt: string }) {
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
export function Polaroid({ src, caption, fit = "cover", focus = "center" }: { src?: string; caption: string; fit?: "cover" | "contain"; focus?: string }) {
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
export function Sticker({
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

export function IdentityCard({lightMode=false, image, intro}: {lightMode?: boolean; image?: string; intro?: string}) { return (
          <div className={`identity-card ${lightMode ? "is-light" : "is-dark"}`}>
            <header className="identity-header">
              <img src={image || "/archive/assets/profile.jpg"} alt="Portrait of Andre Sanjaya" decoding="async" />
              <div><h1 style={{ fontSize: "24px" }}>Andre Sanjaya</h1><p>UI/UX Designer</p></div>
            </header>
            <section className="identity-about" aria-label="About Andre">
              <p>{intro || <>Welcome to my little corner of the internet. I&apos;m Andre, a UI/UX Designer from Bali, Indonesia. This is a collection of things I love, things I&apos;ve made, and random little discoveries that somehow found their way into my world.<br /><br />From movies, music, photography, and everything in between, this is where my interests come together without needing to make perfect sense.<br /><br />Look around, move things, click on something unexpected, and stay curious. You never know what you might find.</>}</p>
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
) }
