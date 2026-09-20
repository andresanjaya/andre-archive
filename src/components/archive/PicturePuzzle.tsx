"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import manifest from '../../data/puzzle-manifest.json';
const images: { src: string; title: string }[] = manifest;
import { DIFFICULTIES, Difficulty, isSolved, shuffleTiles, swapTiles } from './puzzle-model';

export default function PicturePuzzle({ onClose, lightMode }: { onClose: () => void; lightMode: boolean }) {
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [imageIndex, setImageIndex] = useState(0);
  const [tiles, setTiles] = useState(() => shuffleTiles(3));
  const initial = useRef(tiles);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const started = useRef(0);
  const [preview, setPreview] = useState(false);
  const [loaded, setLoaded] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [ratio, setRatio] = useState(1);
  const [dragged, setDragged] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const gesture = useRef<{ id: number; tile: number; x: number; y: number; moved: boolean } | null>(null);
  const dragPreview = useRef<HTMLSpanElement>(null);
  const ignoreClick = useRef(false);
  const firstDifficultyButton = useRef<HTMLButtonElement>(null);
  const size = DIFFICULTIES[difficulty];
  const source = images[imageIndex]?.src;
  const ready = !!source && source === loaded;
  const solved = isSolved(tiles);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    firstDifficultyButton.current?.focus();
    return () => previous?.focus();
  }, []);
  useEffect(() => {
    if (!source) return;
    let active = true;
    setFailed(false);
    const image = new window.Image();
    image.onload = () => { if (active) { setRatio(image.naturalWidth / image.naturalHeight); setLoaded(source); } };
    image.onerror = () => { if (active) setFailed(true); };
    image.src = source;
    return () => { active = false; };
  }, [source]);
  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => setSeconds(Math.floor((Date.now() - started.current) / 1000)), 250);
    return () => window.clearInterval(interval);
  }, [running]);

  const restart = (next = shuffleTiles(size)) => {
    initial.current = [...next];
    setTiles(next); setMoves(0); setSeconds(0); setRunning(false); setSelected(null); setPreview(false);
    gesture.current = null; setDragged(null); setTarget(null);
  };
  const newImage = () => {
    if (images.length > 1) setImageIndex(index => (index + 1 + Math.floor(Math.random() * (images.length - 1))) % images.length);
    restart();
  };
  const swap = (first: number, second: number) => {
    if (first === second || solved || !ready || preview) return;
    const next = swapTiles(tiles, first, second);
    if (!running) { started.current = Date.now(); setRunning(true); }
    setTiles(next); setMoves(count => count + 1); setSelected(null);
    if (isSolved(next)) { setSeconds(Math.floor((Date.now() - started.current) / 1000)); setRunning(false); }
  };
  const select = (index: number) => {
    if (selected === index) setSelected(null);
    else if (selected === null) setSelected(index);
    else swap(selected, index);
  };
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  return <section className={`picture-puzzle ${lightMode ? 'is-light' : ''}`} aria-label="Andre's puzzle" onPointerDown={event => event.stopPropagation()} onWheel={event => event.stopPropagation()} onKeyDown={event => {
    event.stopPropagation();
    if (event.key === 'Escape') { if (preview) setPreview(false); else onClose(); }
  }}>
    <div className="puzzle-content">
      {!source ? <p>Add images to assets/puzzle to begin.</p> : <>
        <div className="puzzle-stage" style={{ width: `min(100%, 680px, ${74 * ratio}svh)`, aspectRatio: ratio, ['--stage-width-mobile' as string]: `${45 * ratio}svh` }}>
          {!ready ? <p role="status">{failed ? 'This image could not be loaded. Try New Image.' : 'Loading picture…'}</p> : <div className={`puzzle-grid ${solved ? 'is-solved' : ''}`} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }} onPointerMove={event => {
            const current = gesture.current;
            if (!current || current.id !== event.pointerId) return;
            if (Math.hypot(event.clientX - current.x, event.clientY - current.y) > 6) current.moved = true;
            if (!current.moved) return;
            setDragged(current.tile);
            if (dragPreview.current) {
              const bounds = event.currentTarget.getBoundingClientRect();
              Object.assign(dragPreview.current.style, { left: `${event.clientX}px`, top: `${event.clientY}px`, width: `${bounds.width / size}px`, height: `${bounds.height / size}px` });
            }
            const hit = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLButtonElement>('[data-puzzle-slot]');
            setTarget(hit && event.currentTarget.contains(hit) ? Number(hit.dataset.puzzleSlot) : null);
          }} onPointerUp={event => {
            const current = gesture.current;
            if (!current || current.id !== event.pointerId) return;
            if (current.moved) {
              ignoreClick.current = true;
              const hit = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLButtonElement>('[data-puzzle-slot]');
              if (hit && event.currentTarget.contains(hit)) swap(current.tile, Number(hit.dataset.puzzleSlot));
            }
            gesture.current = null; setDragged(null); setTarget(null);
          }} onPointerCancel={() => { gesture.current = null; setDragged(null); setTarget(null); }}>
            {tiles.map((tile, index) => <button key={index} type="button" data-puzzle-slot={index} disabled={solved || preview} aria-label={`Position ${index + 1}, picture piece ${tile + 1}`} aria-pressed={selected === index} className={`${selected === index ? 'is-selected' : ''} ${dragged === index ? 'is-dragged' : ''} ${target === index ? 'is-target' : ''}`} style={{ backgroundImage: `url("${source}")`, backgroundSize: `${size * 100}% ${size * 100}%`, backgroundPosition: `${tile % size * 100 / (size - 1)}% ${Math.floor(tile / size) * 100 / (size - 1)}%` }} onPointerDown={event => {
              if (!event.isPrimary || event.button !== 0) return;
              ignoreClick.current = false;
              gesture.current = { id: event.pointerId, tile: index, x: event.clientX, y: event.clientY, moved: false };
              event.currentTarget.setPointerCapture(event.pointerId);
            }} onClick={() => { if (ignoreClick.current) { ignoreClick.current = false; return; } select(index); }} />)}
          </div>}
          {preview && ready && <Image className="puzzle-preview" src={source} alt="Completed puzzle reference" fill unoptimized sizes="520px" />}
        </div>
        <span ref={dragPreview} className="puzzle-drag-preview" aria-hidden="true" style={{ display: dragged === null ? 'none' : 'block', backgroundImage: `url("${source}")`, backgroundSize: `${size * 100}% ${size * 100}%`, backgroundPosition: dragged === null ? '' : `${tiles[dragged] % size * 100 / (size - 1)}% ${Math.floor(tiles[dragged] / size) * 100 / (size - 1)}%` }} />
        <aside className="puzzle-sidebar" aria-label="Puzzle controls">
          <div className="puzzle-controls puzzle-difficulty" aria-label="Difficulty">{(Object.keys(DIFFICULTIES) as Difficulty[]).map((level, index) => <button ref={index === 0 ? firstDifficultyButton : undefined} key={level} aria-pressed={difficulty === level} onClick={() => { setDifficulty(level); restart(shuffleTiles(DIFFICULTIES[level])); }}>{level}</button>)}</div>
          <p className="puzzle-stats"><span>{difficulty} · {size} × {size}</span><span>{moves} moves</span><time>{time}</time></p>
          <div className="puzzle-controls puzzle-actions"><button onClick={() => restart()}>Shuffle</button><button onClick={newImage} disabled={images.length < 2}>New Image</button><button onClick={() => setPreview(value => !value)} aria-pressed={preview} disabled={!ready}>{preview ? 'Close Preview' : 'Preview'}</button><button onClick={() => restart([...initial.current])}>Reset</button></div>
          <p className="puzzle-hint">Drag a piece or tap two pieces to swap. Use Tab and Enter with a keyboard.</p>
          <div className="puzzle-result" role="status">{solved && <><h2>Everything falls into place.</h2><p>{difficulty} · {time} · {moves} moves</p><div className="puzzle-controls"><button onClick={() => restart()}>Play Again</button><button onClick={newImage} disabled={images.length < 2}>New Image</button></div></>}</div>
        </aside>
      </>}
    </div>
  </section>;
}
