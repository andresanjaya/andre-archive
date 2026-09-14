'use client';

import { KeyboardEvent, MouseEvent, PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { archiveRecords, ArchiveRecord, ArchiveType, boardLayout } from '@/data/archive';

const BOARD_WIDTH = 1450;
const BOARD_HEIGHT = 1050;
const DRAG_THRESHOLD = 6;

const indexFilters: { value: 'all' | ArchiveType; label: string }[] = [
  { value: 'all', label: 'All' }, { value: 'case-file', label: 'Case Files' }, { value: 'field-note', label: 'Field Notes' },
  { value: 'experiment', label: 'Experiments' }, { value: 'photography', label: 'Photography' }, { value: 'culture', label: 'Culture' }, { value: 'timeline', label: 'Timeline' },
];
const typeLabels: Record<ArchiveType, string> = { 'case-file': 'Case File', 'field-note': 'Field Note', experiment: 'Experiment', photography: 'Photography', culture: 'Culture', timeline: 'Timeline' };
type IndexSort = 'featured' | 'newest' | 'oldest' | 'az';
type IndexState = { query: string; type: 'all' | ArchiveType; sort: IndexSort };
type UtilityView = 'about' | 'resume' | 'contact' | 'index';
const defaultIndexState: IndexState = { query: '', type: 'all', sort: 'featured' };

function getRecord(id: string) { return archiveRecords.find((record) => record.id === id); }
function readIndexState(): IndexState {
  if (typeof window === 'undefined') return defaultIndexState;
  const params = new URLSearchParams(window.location.search);
  const rawType = params.get('type');
  const type = indexFilters.some((filter) => filter.value === rawType) ? rawType as IndexState['type'] : 'all';
  const rawSort = params.get('sort');
  const sort = ['featured', 'newest', 'oldest', 'az'].includes(rawSort ?? '') ? rawSort as IndexSort : 'featured';
  return { query: params.get('q') ?? '', type, sort };
}
function writeIndexUrl(state: IndexState, view?: 'index' | 'record', record?: string, mode: 'push' | 'replace' = 'replace') {
  const params = new URLSearchParams();
  if (view) params.set('view', view);
  if (record) params.set('record', record);
  if (state.query) params.set('q', state.query);
  if (state.type !== 'all') params.set('type', state.type);
  if (state.sort !== 'featured') params.set('sort', state.sort);
  window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', `${window.location.pathname}${params.size ? `?${params.toString()}` : ''}`);
}

export default function ArchiveFoundation() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const resultRefs = useRef(new Map<string, HTMLButtonElement>());
  const pointerRef = useRef<{ id: number; x: number; y: number; panX: number; panY: number; dragging: boolean } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeRecord, setActiveRecord] = useState<ArchiveRecord | null>(null);
  const [utilityView, setUtilityView] = useState<UtilityView | null>(null);
  const [indexState, setIndexState] = useState<IndexState>(readIndexState);
  const [recordFromIndex, setRecordFromIndex] = useState(false);
  const [focusIndexId, setFocusIndexId] = useState<string | null>(null);

  const clampPan = (x: number, y: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return { x, y };
    return { x: Math.max(Math.min(0, viewport.clientWidth - BOARD_WIDTH), Math.min(0, x)), y: Math.max(Math.min(0, viewport.clientHeight - BOARD_HEIGHT), Math.min(0, y)) };
  };
  const resetPan = () => setPan(clampPan(0, 0));

  useEffect(() => {
    const onResize = () => setPan((current) => clampPan(current.x, current.y));
    window.addEventListener('resize', onResize); onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeRecord || utilityView) { if (!dialog.open) dialog.showModal(); } else if (dialog.open) dialog.close();
  }, [activeRecord, utilityView]);
  useEffect(() => {
    if (utilityView === 'index' && !activeRecord && focusIndexId) {
      requestAnimationFrame(() => {
        resultRefs.current.get(focusIndexId)?.focus();
        setFocusIndexId(null);
      });
    }
  }, [activeRecord, focusIndexId, utilityView]);
  useEffect(() => {
    const restoreFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setIndexState(readIndexState());
      const record = getRecord(params.get('record') ?? '');
      if (record) { setUtilityView(null); setActiveRecord(record); setRecordFromIndex(params.get('view') === 'record'); }
      else if (params.get('view') === 'index') { setActiveRecord(null); setUtilityView('index'); setRecordFromIndex(false); }
      else { setActiveRecord(null); setUtilityView(null); setRecordFromIndex(false); }
    };
    window.addEventListener('popstate', restoreFromUrl);
    return () => window.removeEventListener('popstate', restoreFromUrl);
  }, []);

  const openRecord = (record: ArchiveRecord, trigger: HTMLElement, fromIndex = false) => {
    triggerRef.current = trigger; setUtilityView(null); setActiveRecord(record); setRecordFromIndex(fromIndex);
    if (fromIndex) { setFocusIndexId(record.id); writeIndexUrl(indexState, 'record', record.id, 'push'); }
  };
  const openIndex = (trigger: HTMLElement, filter: IndexState['type'] = 'all') => {
    triggerRef.current = trigger;
    const nextState = { ...indexState, type: filter };
    setIndexState(nextState); setActiveRecord(null); setUtilityView('index'); setRecordFromIndex(false);
    writeIndexUrl(nextState, 'index', undefined, 'push');
  };
  const openUtility = (view: Exclude<UtilityView, 'index'>, trigger: HTMLElement) => { triggerRef.current = trigger; setActiveRecord(null); setUtilityView(view); setRecordFromIndex(false); };
  const closeSheet = () => {
    if (activeRecord && recordFromIndex) { window.history.back(); return; }
    if (utilityView === 'index') { window.history.back(); return; }
    setActiveRecord(null); setUtilityView(null); setRecordFromIndex(false); requestAnimationFrame(() => triggerRef.current?.focus());
  };
  const updateIndexState = (nextState: IndexState) => { setIndexState(nextState); writeIndexUrl(nextState, 'index'); };
  const filteredRecords = useMemo(() => {
    const query = indexState.query.trim().toLocaleLowerCase();
    const matching = archiveRecords.filter((record) => {
      const searchable = [record.title, record.summary, record.year ?? '', record.type, typeLabels[record.type], ...record.themes].join(' ').toLocaleLowerCase();
      return (indexState.type === 'all' || record.type === indexState.type) && (!query || searchable.includes(query));
    });
    return [...matching].sort((left, right) => {
      if (indexState.sort === 'az') return left.title.localeCompare(right.title);
      if (indexState.sort === 'featured') return Number(Boolean(right.featured)) - Number(Boolean(left.featured)) || left.title.localeCompare(right.title);
      const leftYear = Number(left.year ?? Number.POSITIVE_INFINITY); const rightYear = Number(right.year ?? Number.POSITIVE_INFINITY);
      return (indexState.sort === 'newest' ? rightYear - leftYear : leftYear - rightYear) || left.title.localeCompare(right.title);
    });
  }, [indexState]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => { if (!window.matchMedia('(max-width: 1023px)').matches) pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y, dragging: false }; };
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current; if (!pointer || pointer.id !== event.pointerId) return;
    const deltaX = event.clientX - pointer.x; const deltaY = event.clientY - pointer.y;
    if (!pointer.dragging && Math.hypot(deltaX, deltaY) > DRAG_THRESHOLD) { pointer.dragging = true; event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.dataset.dragging = 'true'; }
    if (pointer.dragging) setPan(clampPan(pointer.panX + deltaX, pointer.panY + deltaY));
  };
  const endPan = (event: PointerEvent<HTMLDivElement>) => { if (pointerRef.current?.id === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); event.currentTarget.dataset.dragging = 'false'; window.setTimeout(() => { pointerRef.current = null; }, 0); };
  const artifactClick = (event: MouseEvent<HTMLButtonElement>, record: ArchiveRecord) => { if (!pointerRef.current?.dragging) openRecord(record, event.currentTarget); };
  const artifactKeyDown = (event: KeyboardEvent<HTMLButtonElement>, record: ArchiveRecord) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openRecord(record, event.currentTarget); } };
  const viewTitle = activeRecord?.title ?? { index: 'Archive Index', about: 'About', resume: 'Resume', contact: 'Contact' }[utilityView ?? 'index'];

  return <main>
    <a className="skip-link" href="#archive-board">Skip to archive board</a>
    <header className="site-nav" aria-label="Primary navigation">
      <button type="button" onClick={resetPan}>Home</button><button type="button" onClick={(event) => openIndex(event.currentTarget, 'case-file')}>Work</button><button type="button" onClick={resetPan}>Archive</button><button type="button" onClick={(event) => openUtility('about', event.currentTarget)}>About</button><button type="button" onClick={(event) => openUtility('resume', event.currentTarget)}>Resume</button><button type="button" onClick={(event) => openUtility('contact', event.currentTarget)}>Contact</button><button className="index-button" type="button" onClick={(event) => openIndex(event.currentTarget)}>Index</button>
    </header>
    <section id="archive-board" ref={viewportRef} className="archive-viewport" aria-label="Andre’s Archive discovery board" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={endPan} onPointerCancel={endPan}>
      <div className="desktop-guidance" aria-hidden="true">Drag the mat to explore</div><div className="archive-board" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
        <section className="identity-artifact" aria-label="Andre’s Archive identity"><p className="eyebrow">A spatial editorial archive</p><h1>Andre’s<br />Archive</h1><p>Andre Sanjaya</p><p className="identity-meta">Product and UI UX Designer<br />Bali, Indonesia</p></section>
        {boardLayout.map((placement) => { const record = getRecord(placement.id); if (!record) return null; return <button className={`artifact ${record.type} ${record.featured ? 'featured' : ''}`} key={record.id} type="button" style={{ left: placement.x, top: placement.y, width: placement.width, minHeight: placement.height, transform: `rotate(${placement.rotation}deg)` }} onClick={(event) => artifactClick(event, record)} onKeyDown={(event) => artifactKeyDown(event, record)}><span className="artifact-label">{record.label}</span><span className="artifact-type">{typeLabels[record.type]}</span><strong>{record.title}</strong><span className="artifact-summary">{record.summary}</span><span className="artifact-action">{record.type === 'case-file' ? 'View Case File' : 'Read Field Note'} <span aria-hidden="true">↗</span></span></button>; })}
        <button className="index-artifact" type="button" onClick={(event) => openIndex(event.currentTarget)}><span className="artifact-label">Direct navigation</span><strong>Index</strong><span>{archiveRecords.length} foundation records</span></button>
      </div>
    </section>
    <section className="mobile-feed" aria-label="Andre’s Archive editorial feed"><div className="mobile-intro"><p className="eyebrow">A spatial editorial archive</p><h1>Andre’s Archive</h1><p>Andre Sanjaya · Product and UI UX Designer · Bali, Indonesia</p></div><button className="mobile-index-action" type="button" onClick={(event) => openIndex(event.currentTarget)}>Open Index</button><div className="feed-section-label">Featured Case Files</div>{archiveRecords.map((record) => <button key={record.id} className="feed-record" type="button" onClick={(event) => openRecord(record, event.currentTarget)}><span className="artifact-label">{record.label}</span><strong>{record.title}</strong><span>{record.summary}</span><span className="artifact-action">{record.type === 'case-file' ? 'View Case File' : 'Read Field Note'} ↗</span></button>)}</section>
    <dialog ref={dialogRef} className="editorial-sheet" aria-labelledby="sheet-title" onCancel={(event) => { event.preventDefault(); closeSheet(); }}><article><header className="sheet-header"><div><p className="eyebrow">{activeRecord?.label ?? 'Archive utility'}</p><h2 id="sheet-title" tabIndex={-1}>{viewTitle}</h2></div><button className="close-button" type="button" onClick={closeSheet} aria-label="Close reading sheet">Close</button></header>
      {activeRecord ? <><p className="sheet-summary">{activeRecord.summary}</p><p className="placeholder-note">Foundation placeholder — this record contains no unverified evidence or client material.</p><div className="sheet-body">{activeRecord.sections?.map((section) => <section key={section.heading}><h3>{section.heading}</h3><p>{section.copy}</p></section>)}</div></> : utilityView === 'index' ? <section className="archive-index" aria-label="Archive Index"><p className="sheet-summary">Search the currently published foundation records. More collections will appear here only when approved content is ready.</p><div className="index-controls"><label htmlFor="index-search">Search records</label><input id="index-search" type="search" value={indexState.query} onChange={(event) => updateIndexState({ ...indexState, query: event.target.value })} placeholder="Title, description, year, theme, type" /><div className="filter-group" aria-label="Filter archive records">{indexFilters.map((filter) => <button key={filter.value} className={indexState.type === filter.value ? 'is-active' : ''} type="button" aria-pressed={indexState.type === filter.value} onClick={() => updateIndexState({ ...indexState, type: filter.value })}>{filter.label}</button>)}</div><label htmlFor="index-sort">Sort records</label><select id="index-sort" value={indexState.sort} onChange={(event) => updateIndexState({ ...indexState, sort: event.target.value as IndexSort })}><option value="featured">Featured</option><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="az">A to Z</option></select><button className="clear-filters" type="button" onClick={() => updateIndexState(defaultIndexState)}>Clear filters</button></div><p className="result-count" role="status" aria-live="polite">{filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}</p><div className="index-results">{filteredRecords.length ? filteredRecords.map((record) => <button key={record.id} type="button" ref={(node) => { if (node) resultRefs.current.set(record.id, node); else resultRefs.current.delete(record.id); }} onClick={(event) => openRecord(record, event.currentTarget, true)}><span>{typeLabels[record.type]}</span><strong>{record.title}</strong>{record.year && <small>{record.year}</small>}<p>{record.summary}</p><em>Related collection: {record.relatedCollection ?? 'Not yet linked'}</em></button>) : <div className="empty-state"><h3>No records match these filters.</h3><p>Try another search term or clear filters to view all current archive records.</p><button type="button" onClick={() => updateIndexState(defaultIndexState)}>Clear filters</button></div>}</div></section> : <p className="sheet-summary">This utility destination is intentionally a placeholder until approved public content is supplied.</p>}
      <footer className="sheet-footer"><button type="button" onClick={closeSheet}>Back to Archive</button>{utilityView !== 'index' && <button type="button" onClick={(event) => openIndex(event.currentTarget)}>Open Index</button>}</footer>
    </article></dialog>
  </main>;
}
