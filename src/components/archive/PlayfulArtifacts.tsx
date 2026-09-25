"use client";

import { useEffect, useRef, useState } from "react";

type InteractionProps = {
  onDiscover: () => void;
  onSound: () => void;
};

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
