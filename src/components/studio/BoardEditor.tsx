'use client';
import {useEffect,useMemo,useRef,useState,type PointerEvent} from 'react';
import dynamic from 'next/dynamic';
import {ArtifactRenderer,type ArtifactRuntime} from '../archive/ArtifactRegistry';
import {type ArtifactRecord} from '../../lib/archive/model';
import {assetPreview} from '../../lib/studio/assets';
import ArtifactInspector,{AddArtifact} from './ArtifactInspector';
import {useStudio} from './StudioProvider';
import EditorAssets from './EditorAssets';
const Preview=dynamic(()=>import('../../../figma_make/src/App'),{ssr:false});
const idle:ArtifactRuntime={activeTrackId:null,audioPlaying:false,curiosityFound:true,discover:()=>{},disturb:()=>{},playMicroSound:()=>{},playTrack:()=>{},openPuzzle:()=>{}};
export default function BoardEditor(){
 const studio=useStudio(),{board,setBoard,checkpoint,assets,setStatus}=studio;
 const [selected,setSelected]=useState<string|null>(null),[preview,setPreview]=useState(false),[zoom,setZoom]=useState(.4),[pan,setPan]=useState({x:0,y:0}),[snap,setSnap]=useState(false),[urls,setUrls]=useState<Record<string,string>>({}),[saving,setSaving]=useState(false);
 const viewport=useRef<HTMLDivElement>(null),latest=useRef(board);latest.current=board;
 const gesture=useRef<{id:number;mode:'move'|'resize'|'rotate'|'pan';sx:number;sy:number;artifact?:ArtifactRecord;pan:{x:number;y:number};center?:{x:number;y:number}}|null>(null);
 const artifact=board.artifacts.find(a=>a.id===selected);
 const [showAssets,setShowAssets]=useState(false);
 useEffect(()=>{let live=true;void Promise.all(assets.map(async a=>[a.id,await assetPreview(a,false)] as const)).then(pairs=>{if(live)setUrls(Object.fromEntries(pairs))}).catch(e=>setStatus(e.message));return()=>{live=false}},[assets,setStatus]); // URLs refreshed when assets change, not on drag.
 const displayBoard=useMemo(()=>({...board,artifacts:board.artifacts.map(a=>{
  if(a.type==='card')return {...a,content:{...a.content,front_image:urls[a.content.front_asset_id]||a.content.front_image,back_image:urls[a.content.back_asset_id]||a.content.back_image}};
  return a.asset_id&&urls[a.asset_id]?{...a,content:{...a.content,image:urls[a.asset_id]}}:a;
 })}),[board,urls]);
 const update=(a:ArtifactRecord)=>setBoard({...latest.current,artifacts:latest.current.artifacts.map(item=>item.id===a.id?a:item)});
 const add=(a:ArtifactRecord)=>{checkpoint();setBoard({...board,artifacts:[...board.artifacts,a]});setSelected(a.id)};
 const duplicate=()=>{if(!artifact)return;add({...artifact,id:crypto.randomUUID(),key:crypto.randomUUID(),name:artifact.name+' copy',x:artifact.x+24,y:artifact.y+24})};
 const remove=()=>{if(!artifact||artifact.locked)return;checkpoint();setBoard({...board,artifacts:board.artifacts.filter(a=>a.id!==artifact.id)});setSelected(null)};
 const start=(e:PointerEvent,mode:'move'|'resize'|'rotate'|'pan',a?:ArtifactRecord)=>{
  if(e.button!==0&&e.button!==1)return;e.preventDefault();e.stopPropagation();if(a){setSelected(a.id);if(a.locked)return;checkpoint()}
  const rect=viewport.current!.getBoundingClientRect();gesture.current={id:e.pointerId,mode,sx:e.clientX,sy:e.clientY,artifact:a,pan,center:a?{x:rect.left+rect.width/2+pan.x+a.x*zoom,y:rect.top+rect.height/2+pan.y+a.y*zoom}:undefined};e.currentTarget.setPointerCapture(e.pointerId);
 };
 const move=(e:PointerEvent)=>{const g=gesture.current;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.sx,dy=e.clientY-g.sy;if(g.mode==='pan'){setPan({x:g.pan.x+dx,y:g.pan.y+dy});return}const a=g.artifact!;const round=(v:number)=>snap?Math.round(v/10)*10:Math.round(v);if(g.mode==='move')update({...a,x:round(a.x+dx/zoom),y:round(a.y+dy/zoom)});if(g.mode==='resize')update({...a,width:Math.max(24,Math.min(2000,round(a.width+dx/zoom))),height:a.height?Math.max(24,Math.min(2000,round(a.height+dy/zoom))):null});if(g.mode==='rotate')update({...a,rotate:Math.round(Math.atan2(e.clientY-g.center!.y,e.clientX-g.center!.x)*180/Math.PI+90)})};
 const end=(e:PointerEvent)=>{if(gesture.current?.id===e.pointerId){gesture.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}};
 return <main className="studio-editor" onKeyDown={e=>{if((e.target as HTMLElement).closest('input,textarea,select')||preview)return;if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();e.shiftKey?studio.redo():studio.undo();return}if(e.key==='Delete'){remove();return}if(artifact&&!artifact.locked&&e.key.startsWith('Arrow')){e.preventDefault();checkpoint();const n=e.shiftKey?10:1;update({...artifact,x:artifact.x+(e.key==='ArrowRight'?n:e.key==='ArrowLeft'?-n:0),y:artifact.y+(e.key==='ArrowDown'?n:e.key==='ArrowUp'?-n:0)})}}}>
  <div className="studio-toolbar"><button disabled={saving||studio.busy} onClick={async()=>{setSaving(true);try{await studio.save()}catch(e){studio.setStatus((e as Error).message)}finally{setSaving(false)}}}>Save Draft</button><button aria-pressed={preview} onClick={()=>setPreview(!preview)}>{preview?'Back to Edit':'Preview'}</button><button disabled={saving||studio.busy} onClick={()=>{if(window.confirm('Publish this complete draft to the public archive?'))void studio.publish().catch(e=>studio.setStatus(e.message))}}>Publish</button><span className="studio-divider"/><button onClick={studio.undo}>Undo</button><button onClick={studio.redo}>Redo</button><label><input type="checkbox" checked={snap} onChange={e=>setSnap(e.target.checked)}/>Snap 10px</label><label>Zoom<input aria-label="Zoom" type="range" min={.15} max={1.5} step={.05} value={zoom} onChange={e=>setZoom(Number(e.target.value))}/>{Math.round(zoom*100)}%</label><button onClick={()=>{setPan({x:0,y:0});setZoom(.4)}}>Origin</button></div>
  <div className="studio-edit-layout" hidden={preview}>
   <aside className="studio-layers"><h2><button aria-pressed={!showAssets} onClick={()=>setShowAssets(false)}>Layers</button> <button aria-pressed={showAssets} onClick={()=>setShowAssets(true)}>Assets</button></h2>{showAssets?<EditorAssets onAdd={add}/>:<><AddArtifact onAdd={add}/>{[...board.artifacts].sort((a,b)=>b.z-a.z).map(a=><div key={a.id} className={a.id===selected?'is-selected':''}><button onClick={()=>setSelected(a.id)}>{a.name}</button><button aria-label={`${a.visible?'Hide':'Show'} ${a.name}`} onClick={()=>{checkpoint();update({...a,visible:!a.visible})}}>{a.visible?'◉':'○'}</button><button aria-label={`${a.locked?'Unlock':'Lock'} ${a.name}`} onClick={()=>{checkpoint();update({...a,locked:!a.locked})}}>{a.locked?'L':'–'}</button></div>)}</>}</aside>
   <div ref={viewport} className="studio-canvas" data-grid={board.settings.grid} tabIndex={0} aria-label="Board editor. Drag empty mat to pan; select objects to move." style={{backgroundColor:board.settings.background,backgroundPosition:`${pan.x}px ${pan.y}px`,backgroundSize:`${26*zoom}px ${26*zoom}px`}} onPointerDown={e=>start(e,'pan')} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onWheel={e=>{if(e.ctrlKey){setZoom(z=>Math.max(.15,Math.min(1.5,z-e.deltaY*.001)))}else setPan(p=>({x:p.x-e.deltaX,y:p.y-e.deltaY}))}}>
    <div className={`studio-world ${board.settings.grid?'with-grid':''}`} style={{transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`}}>
     {displayBoard.artifacts.map(a=><div key={a.id} className="studio-object" style={{position:'absolute',left:a.x,top:a.y,zIndex:a.z,width:a.width,minHeight:a.height||32,transform:'translateX(-50%)'}}><div className="studio-object-render" ref={node=>node?.setAttribute('inert','')}><ArtifactRenderer artifact={{...a,x:0,y:0}} runtime={idle} edit/></div>{a.visible&&<button className={`studio-selection ${selected===a.id?'is-selected':''}`} style={{width:a.width,height:a.height||estimatedHeight(a),transform:`translate(-50%,-50%) rotate(${a.rotate}deg)`}} aria-label={`Select ${a.name}`} onPointerDown={e=>start(e,'move',a)}/>}</div>)}
     {artifact&&artifact.visible&&!artifact.locked&&<div className="studio-handles" style={{left:artifact.x,top:artifact.y,zIndex:1001}}><button aria-label="Resize selected artifact" title="Resize" style={{left:artifact.width/2,top:(artifact.height||estimatedHeight(artifact))/2}} onPointerDown={e=>start(e,'resize',artifact)}>↘</button><button aria-label="Rotate selected artifact" title="Rotate" style={{left:0,top:-(artifact.height||estimatedHeight(artifact))/2-38}} onPointerDown={e=>start(e,'rotate',artifact)}>↻</button></div>}
    </div>
   </div>
   {artifact?<ArtifactInspector artifact={artifact} onChange={update} onDuplicate={duplicate} onDelete={remove}/>:<aside className="studio-inspector"><h2>Properties</h2><p>Select an artifact to edit. Arrow keys nudge 1px; Shift + Arrow nudges 10px.</p><p>Drag the mat to pan. Use the zoom slider to explore.</p></aside>}
  </div>
  <div className="studio-preview" hidden={!preview}><Preview snapshot={displayBoard} collections={studio.collections}/></div>
 </main>;
}
function estimatedHeight(a:ArtifactRecord){return a.width*(a.type==='identity'?1.23:a.type==='polaroid'?1.34:a.type==='card'?2048/1292:['book','cinema'].includes(a.type)?1.48:1)}
