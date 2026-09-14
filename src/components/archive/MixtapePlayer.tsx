'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { tracks } from '@/data/tracks';

type Props = {
  open: boolean;
  onClose: () => void;
  onPlayingChange: (playing: boolean, label: string) => void;
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
};

export default function MixtapePlayer({ open, onClose, onPlayingChange }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const track = tracks[trackIndex];
  const available = Boolean(track?.src);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      closeRef.current?.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [track, volume]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (open && event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, open]);
  useEffect(() => { onPlayingChange(playing, track ? `${track.title} — ${track.artist}` : 'No track configured'); }, [onPlayingChange, playing, track]);

  const selectTrack = (nextIndex: number, shouldPlay = playing) => {
    if (!tracks.length) return;
    const normalized = (nextIndex + tracks.length) % tracks.length;
    setTrackIndex(normalized);
    setCurrentTime(0);
    requestAnimationFrame(() => { if (shouldPlay) void audioRef.current?.play(); });
  };
  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !available) return;
    if (audio.paused) {
      try { await audio.play(); } catch { setPlaying(false); }
    } else audio.pause();
  };

  return <>
    {track?.src && <audio ref={audioRef} src={track.src} preload="metadata" muted={muted} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onEnded={() => selectTrack(trackIndex + 1, true)} />}
    {open && <div className="mixtape-overlay" role="presentation" onPointerDown={(event) => event.stopPropagation()} onClick={onClose}>
      <section className="mixtape-player" role="dialog" aria-modal="true" aria-labelledby="mixtape-title" onClick={(event) => event.stopPropagation()}>
        <header><div><span>Archive audio · Side A</span><h2 id="mixtape-title">Andre&apos;s Mixtape</h2></div><button ref={closeRef} type="button" onClick={onClose} aria-label="Close mixtape player">×</button></header>
        {track ? <><div className={`player-record ${playing ? 'is-playing' : ''}`}><div className="player-vinyl" aria-hidden="true"><span /></div>{track.cover && <Image src={track.cover} alt={`${track.title} album cover`} width={142} height={142} unoptimized />}</div><div className="track-meta"><small>Track {trackIndex + 1} / {tracks.length}</small><strong>{track.title}</strong><span>{track.artist}</span></div>{!available && <div className="audio-empty"><strong>Album ready, audio pending</strong><p>Add the approved MP3 to <code>public/archive/audio</code>, then set its path in <code>src/data/tracks.ts</code>.</p></div>}<label className="progress-label">Track progress<input type="range" min="0" max={duration || 0} step="0.1" value={Math.min(currentTime, duration || 0)} disabled={!available} onChange={(event) => { const value = Number(event.target.value); if (audioRef.current) audioRef.current.currentTime = value; setCurrentTime(value); }} /></label><div className="time-row"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div></> : <div className="audio-empty"><strong>No audio added yet</strong><p>Add approved MP3 files to <code>public/archive/audio</code> and register them in <code>src/data/tracks.ts</code>.</p></div>}
        <div className="transport"><button type="button" disabled={!available} onClick={() => selectTrack(trackIndex - 1)} aria-label="Previous track">‹</button><button className="play-control" type="button" disabled={!available} onClick={togglePlayback} aria-label={playing ? 'Pause' : 'Play'}>{playing ? 'Ⅱ' : '▶'}</button><button type="button" disabled={!available} onClick={() => selectTrack(trackIndex + 1)} aria-label="Next track">›</button></div>
        <div className="volume-row"><button type="button" disabled={!available} onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Unmute' : 'Mute'}>{muted ? 'Muted' : 'Sound'}</button><label>Volume<input type="range" min="0" max="1" step="0.05" value={volume} disabled={!available} onChange={(event) => { const value = Number(event.target.value); setVolume(value); if (audioRef.current) audioRef.current.volume = value; }} /></label></div>
      </section>
    </div>}
  </>;
}
