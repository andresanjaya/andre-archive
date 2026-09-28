'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { studioClient } from '../../lib/studio/client';
import { localBoard } from '../../data/local-board';
import { validateBoard, type AssetRecord, type BoardSnapshot } from '../../lib/archive/model';
import {emptyCollections,validateCollections,type CollectionSnapshot} from '../../lib/archive/collections';
type Context = {board:BoardSnapshot;setBoard:(b:BoardSnapshot)=>void;assets:AssetRecord[];refreshAssets:()=>Promise<void>;save:()=>Promise<number>;publish:()=>Promise<void>;dirty:boolean;publishedAt:string|null;collections:CollectionSnapshot;setCollections:(value:CollectionSnapshot)=>void;collectionDirty:boolean;saveCollections:()=>Promise<number>;publishCollections:()=>Promise<void>;collectionsPublishedAt:string|null;status:string;setStatus:(s:string)=>void;busy:boolean;undo:()=>void;redo:()=>void;checkpoint:()=>void};
const StudioContext=createContext<Context|null>(null);
export function useStudio(){const value=useContext(StudioContext);if(!value)throw new Error('Studio provider missing');return value}
const clone=(b:BoardSnapshot)=>JSON.parse(JSON.stringify(b)) as BoardSnapshot;
export default function StudioProvider({children}:{children:ReactNode}){
 const client=studioClient(),router=useRouter(),path=usePathname();
 const [auth,setAuth]=useState<'loading'|'login'|'admin'|'denied'|'error'>(client?'loading':'error');
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[status,setStatus]=useState(client?'':'Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local, then restart Next.');
 const [board,setData]=useState<BoardSnapshot>(localBoard),[assets,setAssets]=useState<AssetRecord[]>([]),[version,setVersion]=useState(0),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[publishedAt,setPublishedAt]=useState<string|null>(null);
 const [collections,setCollectionData]=useState<CollectionSnapshot>(emptyCollections),[collectionVersion,setCollectionVersion]=useState(0),[collectionDirty,setCollectionDirty]=useState(false),[collectionsPublishedAt,setCollectionsPublishedAt]=useState<string|null>(null);
 const [ready,setReady]=useState(false);
 const saveLock=useRef(false);
 const history=useRef<BoardSnapshot[]>([]),future=useRef<BoardSnapshot[]>([]),current=useRef(board);current.current=board;
 const setBoard=useCallback((next:BoardSnapshot)=>{setData(next);setDirty(true)},[]);
 const collectionCurrent=useRef(collections);collectionCurrent.current=collections;
 const setCollections=useCallback((next:CollectionSnapshot)=>{setCollectionData(next);setCollectionDirty(true)},[]);
 const refreshAssets=useCallback(async()=>{if(!client)return;const {data,error}=await client.from('assets').select('*').order('created_at',{ascending:false});if(error)throw error;setAssets(data as AssetRecord[])},[client]);
 useEffect(()=>{
  if(!client)return;let live=true;let sequence=0;
  const verify=async()=>{const token=++sequence;try{
   const {data,error}=await client.auth.getUser();if(!live||token!==sequence)return;
   if(error||!data.user){setAuth('login');return}
   const check=await client.rpc('is_archive_admin');if(check.error)throw check.error;
   if(!live||token!==sequence)return;if(!check.data){setAuth('denied');return}
   setAuth('admin');
  }catch(e){if(live){setAuth('error');setStatus(e instanceof Error?e.message:'Authorization could not be verified.')}}};
  void verify();const {data:{subscription}}=client.auth.onAuthStateChange(()=>{window.setTimeout(()=>void verify(),0)});
  return()=>{live=false;subscription.unsubscribe()};
 },[client]);
 useEffect(()=>{if(auth==='admin'&&path==='/admin')router.replace('/admin/dashboard')},[auth,path,router]);
 useEffect(()=>{if(auth!=='admin'||!client)return;let live=true;void (async()=>{
  const [draft,rows,published,collectionSettings,gallery,puzzle,publishedCollections]=await Promise.all([client.from('archive_settings').select('*').eq('id',1).single(),client.from('artifacts').select('*'),client.from('published_board').select('published_at').eq('id',1).maybeSingle(),client.from('collection_settings').select('*').eq('id',1).single(),client.from('gallery_items').select('*').order('sort_order'),client.from('puzzle_items').select('*').order('sort_order'),client.from('published_collections').select('published_at').eq('id',1).maybeSingle()]);
  if(draft.error||rows.error||published.error||collectionSettings.error||gallery.error||puzzle.error||publishedCollections.error)throw draft.error||rows.error||published.error||collectionSettings.error||gallery.error||puzzle.error||publishedCollections.error;
  if(!live)return;setVersion(draft.data.version);setPublishedAt(published.data?.published_at||null);
  // Version 0 is the one-time local seed; saved empty boards stay empty.
  const next=draft.data.version===0?clone(localBoard):{artifacts:rows.data,settings:draft.data.settings} as BoardSnapshot;
  // Strip database timestamps from editable records.
  validateBoard(next);setData(next);await refreshAssets();
  const nextCollections={gallery:gallery.data,puzzle:puzzle.data} as CollectionSnapshot;validateCollections(nextCollections);if(!live)return;setCollectionData(nextCollections);setCollectionVersion(collectionSettings.data.version);setCollectionsPublishedAt(publishedCollections.data?.published_at||null);setReady(true);
 })().catch(e=>{setStatus(e.message||'Failed to load Studio');setAuth('error')});return()=>{live=false}},[auth,client,refreshAssets]);
 useEffect(()=>{const handler=(e:BeforeUnloadEvent)=>{if(dirty||collectionDirty){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler)},[dirty,collectionDirty]);
 const save=async()=>{if(!client||!ready)throw new Error('Studio is still loading');if(saveLock.current)throw new Error('A save is already in progress');saveLock.current=true;try{validateBoard(current.current);const saving=current.current;const {data,error}=await client.rpc('save_archive_draft',{board:saving,expected_version:version});if(error)throw error;setVersion(data);if(current.current===saving)setDirty(false);setStatus('Draft saved. Public archive is unchanged.');return data as number}finally{saveLock.current=false}};
 const publish=async()=>{if(!client)return;setBusy(true);try{const nextVersion=await save();const {data,error}=await client.rpc('publish_archive',{expected_version:nextVersion});if(error)throw error;setPublishedAt(data);setStatus('Published. Reload the public archive to see this revision.')}finally{setBusy(false)}};
 const saveCollections=async()=>{if(!client||!ready)throw new Error('Studio is still loading');validateCollections(collectionCurrent.current);const saving=collectionCurrent.current;const {data,error}=await client.rpc('save_archive_collections',{value:saving,expected_version:collectionVersion});if(error)throw error;setCollectionVersion(data);if(collectionCurrent.current===saving)setCollectionDirty(false);setStatus('Collection draft saved. Public Gallery and Puzzle are unchanged.');return data as number};
 const publishCollections=async()=>{if(!client)return;setBusy(true);try{const nextVersion=await saveCollections();const {data,error}=await client.rpc('publish_archive_collections',{expected_version:nextVersion});if(error)throw error;setCollectionsPublishedAt(data);setStatus('Gallery and Puzzle collections published. Reload the public archive to see this revision.')}finally{setBusy(false)}};
 const checkpoint=()=>{history.current=[...history.current.slice(-49),clone(current.current)];future.current=[]};
 const undo=()=>{const last=history.current.pop();if(last){future.current.push(clone(current.current));setBoard(last)}};
 const redo=()=>{const next=future.current.pop();if(next){history.current.push(clone(current.current));setBoard(next)}};
 const logout=async()=>{await client?.auth.signOut();setData(localBoard);setCollectionData(emptyCollections);setAssets([]);history.current=[];future.current=[];setDirty(false);setCollectionDirty(false);setReady(false);setAuth('login');router.replace('/admin')};
 if(auth!=='admin')return <main className="studio-login"><section><small>ANDRE ARCHIVE STUDIO</small><h1>{auth==='denied'?'Access denied.':'Welcome back, Andre.'}</h1><p>Sign in to manage your little corner of the internet.</p>{auth==='loading'?<p>Verifying your session…</p>:auth==='login'?<form onSubmit={async e=>{e.preventDefault();setBusy(true);setStatus('');try{const result=await client!.auth.signInWithPassword({email,password});if(result.error)throw result.error;setPassword('')}catch(e){setStatus(e instanceof Error?e.message:'Sign in failed')}finally{setBusy(false)}}}><label>Email<input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy}>Sign In</button></form>:<><p>{auth==='denied'?'This account is not on the administrator allowlist.':status}</p>{client&&<button onClick={()=>void logout()}>Sign Out / Retry</button>}</>}<p role="status">{auth==='login'?status:''}</p><Link href="/">Back to Archive</Link></section></main>;
 if(!ready)return <main className="studio-login"><p role="status">Loading your private draft…</p></main>;
 return <StudioContext.Provider value={{board,setBoard,assets,refreshAssets,save,publish,dirty,publishedAt,collections,setCollections,collectionDirty,saveCollections,publishCollections,collectionsPublishedAt,status,setStatus,busy,undo,redo,checkpoint}}><div className="studio-shell"><header className="studio-top"><Link href="/admin/dashboard">ANDRE ARCHIVE STUDIO</Link><nav>{['dashboard','board','artifacts','assets','gallery','puzzle','settings'].map(name=>{const href=`/admin/${name}`;return <Link key={name} href={href} aria-current={path===href?'page':undefined}>{name}</Link>})}</nav><span>{dirty||collectionDirty?'Unsaved changes':'Draft'}</span><button onClick={()=>void logout()}>Sign Out</button></header><div role="status" className="studio-status">{status}</div>{children}</div></StudioContext.Provider>;
}
