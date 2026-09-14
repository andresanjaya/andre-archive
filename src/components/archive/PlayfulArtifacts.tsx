"use client";

import { useEffect, useRef, useState } from "react";

type InteractionProps = {
  onDiscover: () => void;
  onSound: () => void;
};

const SCRATCH_CELL_COUNT = 40;

export function ScratchCard({ onDiscover, onSound }: InteractionProps) {
  const [cleared, setCleared] = useState<Set<number>>(() => new Set());
  const announced = useRef(false);

  useEffect(() => {
    if (cleared.size >= 16 && !announced.current) {
      announced.current = true;
      onDiscover();
      onSound();
    }
  }, [cleared, onDiscover, onSound]);

  const scratchAt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.type === "pointermove" && event.buttons !== 1) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const column = Math.max(0, Math.min(7, Math.floor(((event.clientX - rect.left) / rect.width) * 8)));
    const row = Math.max(0, Math.min(4, Math.floor(((event.clientY - rect.top) / rect.height) * 5)));
    const center = row * 8 + column;
    setCleared((current) => {
      const next = new Set(current);
      [center, center - 1, center + 1, center - 8, center + 8].forEach((cell) => {
        if (cell >= 0 && cell < SCRATCH_CELL_COUNT) next.add(cell);
      });
      return next;
    });
  };

  const reveal = () => setCleared(new Set(Array.from({ length: SCRATCH_CELL_COUNT }, (_, index) => index)));

  return (
    <div
      className="scratch-card"
      role="button"
      tabIndex={0}
      aria-label="Scratch to reveal the currently obsessed with card"
      onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); scratchAt(event); }}
      onPointerMove={scratchAt}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); reveal(); } }}
    >
      <span className="scratch-kicker">Currently obsessed with</span>
      <strong>Mardy Bum</strong>
      <small>Arctic Monkeys</small>
      <div className="scratch-layer" aria-hidden="true">
        {Array.from({ length: SCRATCH_CELL_COUNT }, (_, index) => <span key={index} className={cleared.has(index) ? "is-cleared" : ""} />)}
      </div>
      <span className="scratch-hint" aria-hidden="true">scratch me</span>
    </div>
  );
}

export function PeelNote({ onDiscover, onSound }: InteractionProps) {
  const [peeled, setPeeled] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const start = useRef({ x: 0, y: 0, active: false });

  const finishPeel = () => {
    setPeeled(true);
    onDiscover();
    onSound();
  };

  return (
    <div className="peel-stage">
      <span className="peel-secret">you were supposed to do that.</span>
      <div
        className={`peel-note ${peeled ? "is-peeled" : ""}`}
        role="button"
        tabIndex={peeled ? -1 : 0}
        aria-label="Don't peel sticky note. Drag to peel it."
        style={{ transform: peeled ? "translate(190px,-150px) rotate(34deg)" : `translate(${offset.x}px,${offset.y}px) rotate(-4deg)` }}
        onPointerDown={(event) => { event.stopPropagation(); start.current = { x: event.clientX, y: event.clientY, active: true }; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={(event) => {
          if (!start.current.active || peeled) return;
          const next = { x: event.clientX - start.current.x, y: event.clientY - start.current.y };
          setOffset(next);
          if (Math.hypot(next.x, next.y) > 70) finishPeel();
        }}
        onPointerUp={() => { start.current.active = false; if (!peeled) setOffset({ x: 0, y: 0 }); }}
        onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && !peeled) { event.preventDefault(); finishPeel(); } }}
      >
        <span>don&apos;t peel</span>
        <small>seriously.</small>
      </div>
    </div>
  );
}

export function DustArtifact({ onDiscover, onSound }: InteractionProps) {
  const [cleaned, setCleaned] = useState(0);
  const announced = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (cleaned >= 0.82 && !announced.current) {
      announced.current = true;
      onDiscover();
      onSound();
    }
  }, [cleaned, onDiscover, onSound]);

  return (
    <div
      className="dust-artifact"
      role="button"
      tabIndex={0}
      aria-label="Rub the dusty archive fragment to clean it"
      onPointerDown={(event) => event.stopPropagation()}
      onPointerMove={(event) => {
        if (Math.hypot(event.clientX - last.current.x, event.clientY - last.current.y) < 7) return;
        last.current = { x: event.clientX, y: event.clientY };
        setCleaned((value) => Math.min(1, value + 0.035));
      }}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setCleaned(1); } }}
    >
      <div className="dust-content"><span>Archive fragment · 00</span><strong>First portfolio attempt</strong><small>original screenshot pending</small></div>
      <div className="dust-layer" aria-hidden="true" style={{ opacity: 1 - cleaned }}><span>rub to clean</span></div>
    </div>
  );
}
