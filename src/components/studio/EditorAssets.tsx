'use client';
/* eslint-disable @next/next/no-img-element -- Optimized Storage thumbnails only. */
import {useEffect,useState} from 'react';
import {useStudio} from './StudioProvider';
import {assetPreview,isAudioAsset,publicAssetUrl} from '../../lib/studio/assets';
import {createArtifactFromAsset,type ArtifactRecord,type AssetRecord} from '../../lib/archive/model';
function Thumbnail({asset,onAdd}:{asset:AssetRecord;onAdd:(a:ArtifactRecord)=>void}){const [src,setSrc]=useState('');useEffect(()=>{let live=true;void assetPreview(asset).then(url=>{if(live)setSrc(url)}).catch(()=>{});return()=>{live=false}},[asset]);return <button title={`Add ${asset.name}`} onClick={()=>onAdd(createArtifactFromAsset(asset,undefined,publicAssetUrl(asset.storage_path)))}><img src={src||undefined} alt={asset.alt_text} loading="lazy"/><span>{asset.name}</span></button>}
export default function EditorAssets({onAdd}:{onAdd:(a:ArtifactRecord)=>void}){const {assets}=useStudio(),[search,setSearch]=useState(''),[limit,setLimit]=useState(24);const filtered=assets.filter(a=>!isAudioAsset(a)&&a.name.toLowerCase().includes(search.toLowerCase()));return <div className="studio-editor-assets"><input aria-label="Find an asset" placeholder="Find an asset" value={search} onChange={e=>setSearch(e.target.value)}/>{filtered.slice(0,limit).map(a=><Thumbnail key={a.id} asset={a} onAdd={onAdd}/>)}{filtered.length>limit&&<button onClick={()=>setLimit(n=>n+24)}>More</button>}</div>}
