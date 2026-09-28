'use client';
/* eslint-disable @next/next/no-img-element -- Static export uses optimized, explicitly managed image variants. */
import dynamic from 'next/dynamic';
import {useEffect,useRef,useState,type ReactNode,type ComponentType,type CSSProperties} from 'react';
import { Artifact, IdentityCard, Polaroid, ProjectorPoster, Sticker } from './ArtifactPrimitives';
import { definitions, type ArtifactRecord, type ArtifactType } from '../../lib/archive/model';
import type { MixtapeTrack } from '../../data/tracks';
const TinyPixel = dynamic(()=>import('./TinyPixelCanvas'),{ssr:false});
export type ArtifactRuntime = {
 lightMode?:boolean; activeTrackId:string|null; audioPlaying:boolean; curiosityFound:boolean;
 discover:(id:string)=>void; disturb:(id:string)=>void;
 playMicroSound:(kind:'camera'|'card'|'projector'|'ui'|'mechanical')=>void;
 playTrack:(track:MixtapeTrack)=>void; openPuzzle:()=>void;
};
type Props={artifact:ArtifactRecord;runtime:ArtifactRuntime;edit?:boolean};
function Identity({artifact:a,runtime:r}:Props){return <IdentityCard lightMode={r.lightMode} image={a.content.image} intro={a.content.intro}/>}
function Book({artifact:a}:Props){return <div className="book-artifact-scene" style={{'--book-color':a.content.color||'#353f53'} as CSSProperties}><div className="book-artifact"><span className="book-artifact-back" aria-hidden="true"/><span className="book-artifact-pages" aria-hidden="true"/><span className="book-artifact-front"><img src={a.content.image} alt={a.content.alt||a.name} loading="lazy" decoding="async"/></span></div></div>}
function Cinema({artifact:a}:Props){return <ProjectorPoster src={a.content.image} alt={a.content.alt||a.name}/>}
function Photo({artifact:a}:Props){return <Polaroid src={a.content.image} caption={a.content.caption||a.name} fit={a.content.fit==='contain'?'contain':'cover'} focus={a.content.focus||'center'}/>}
function Music({artifact:a,runtime:r}:Props){const open=r.activeTrackId===a.content.trackId;return <div className={`record-artifact ${open?'is-open':''} ${open&&r.audioPlaying?'is-playing':''}`}><div className="vinyl-record" aria-hidden="true"><span/></div><div className="record-sleeve"><img src={a.content.image} alt={a.name}/></div></div>}
function Pokemon({artifact:a}:Props){return <img src={a.content.image} alt={a.name} className={a.content.variant==='card'?'board-image-pokemon-card':'pokemon-asset'}/>}
function Marvel({artifact:a}:Props){return <div className="marvel-logo-wrap"><img src={a.content.image} alt={a.name} className="marvel-asset"/></div>}
function Stamp({artifact:a}:Props){return <div className="bali-stamp-wrap"><img src={a.content.image} alt={a.name} className="bali-stamp"/></div>}
function Decoration({artifact:a}:Props){return <img src={a.content.image} alt={a.content.alt||a.name} loading="lazy" decoding="async" className="board-image-asset"/>}
function Secret({artifact:a}:Props){return <aside className="hidden-artifact"><span>+1 hidden artifact</span><strong>{a.content.title}</strong><p>{a.content.description}</p></aside>}
function Pixel(){return <TinyPixel/>}
function StickerBody(props:Props){const a=props.artifact;return <Sticker id={a.content.discovery||a.key} x={0} y={0} rotate={a.rotate} imageSrc={a.content.image} label={a.name} movable={!props.edit} onClick={()=>act(props)} onDisturb={()=>props.runtime.disturb(`${a.key}-drag`)}/>}
export const ArtifactComponentRegistry: Record<ArtifactType, typeof definitions[ArtifactType] & {Component:ComponentType<Props>}> = {
 identity:{...definitions.identity,Component:Identity},book:{...definitions.book,Component:Book},cinema:{...definitions.cinema,Component:Cinema},polaroid:{...definitions.polaroid,Component:Photo},music:{...definitions.music,Component:Music},sticker:{...definitions.sticker,Component:StickerBody},pokemon:{...definitions.pokemon,Component:Pokemon},marvel:{...definitions.marvel,Component:Marvel},stamp:{...definitions.stamp,Component:Stamp},decoration:{...definitions.decoration,Component:Decoration},secret:{...definitions.secret,Component:Secret},'tiny-pixel':{...definitions['tiny-pixel'],Component:Pixel},puzzle:{...definitions.puzzle,Component:Decoration},
};
function act({artifact:a,runtime:r}:Props){
 if(a.action==='none')return;
 r.disturb(a.key);
 if(a.action==='play-music')r.playTrack({id:a.content.trackId||a.id,title:a.content.title||a.name,artist:a.content.artist||'',src:a.content.audio,cover:a.content.image});
 else if(a.action==='open-puzzle')r.openPuzzle();
 else if(a.action!=='disturb'){if(a.action==='discover')r.discover(a.content.discovery||a.key);r.playMicroSound(a.type==='cinema'||a.content.sound==='projector'?'projector':a.type==='polaroid'?'camera':a.content.sound==='ui'?'ui':'card')}
}
function SizedContent({artifact:a,natural,style,children}:{artifact:ArtifactRecord;natural:number|null;style:CSSProperties;children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null),[measured,setMeasured]=useState(0);
 useEffect(()=>{if(!a.height||!natural||!ref.current)return;const node=ref.current;const measure=()=>setMeasured(node.offsetHeight);measure();const observer=new ResizeObserver(measure);observer.observe(node);return()=>observer.disconnect()},[a.height,natural]);
 const ratio=natural?a.width/natural:1;
 return <div className="cms-sized-content" style={{...style,height:a.height?a.height/ratio:undefined}}><div ref={ref} style={a.height&&natural&&measured?{transform:`scaleY(${a.height/ratio/measured})`,transformOrigin:'top'}:undefined}>{children}</div></div>;
}
export function ArtifactRenderer(props:Props){
 const {artifact:a,runtime:r,edit}=props;
 const entry=ArtifactComponentRegistry[a.type];
 if(!entry||!a.visible||(a.type==='secret'&&!r.curiosityFound&&!edit))return null;
 const Component=entry.Component;
 const cls=`cms-artifact cms-type-${a.type} ${a.animation==='none'?'cms-no-hover':''} ${edit?'cms-edit-artifact':''}`;
 const natural=a.type==='identity'?500:a.type==='polaroid'?205:a.type==='music'?200:a.type==='sticker'?(a.content.discovery==='charizard'?120:78):null;
 const style={'--cms-duration':`${a.config.duration||500}ms`,'--cms-lift':`${a.config.lift??8}px`,'--cms-height':a.height?`${a.height}px`:undefined,width:natural||undefined,zoom:natural?a.width/natural:undefined} as CSSProperties;
 if(a.type==='identity'||a.type==='sticker')return <div className={`${cls} archive-entrance absolute`} style={{left:`calc(50% + ${a.x}px)`,top:`calc(50% + ${a.y}px)`,transform:`translate(-50%,-50%) ${a.type==='identity'?`rotate(${a.rotate}deg)`:''}`,zIndex:a.z,width:a.width}}><SizedContent artifact={a} natural={natural} style={style}><Component {...props}/></SizedContent></div>;
 return <Artifact x={a.x} y={a.y} rotate={a.rotate} z={a.z} width={a.width} label={a.name} className={`${cls} ${a.type==='book'?'book-artifact-group':a.type==='cinema'?'projector-poster-group':a.type==='music'?'cursor-music':a.type==='pokemon'?'cursor-pokemon':''}`} onOpen={!edit&&a.action!=='none'?()=>act(props):undefined}><SizedContent artifact={a} natural={natural} style={style}><Component {...props}/></SizedContent></Artifact>;
}
