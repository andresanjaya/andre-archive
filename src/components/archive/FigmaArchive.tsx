'use client';

import { useEffect, useState } from 'react';
import App from '../../../figma_make/src/App';
import { fetchPublished } from '../../lib/archive/published';
import {fetchPublishedCollections,type CollectionSnapshot} from '../../lib/archive/collections';
import type {BoardSnapshot} from '../../lib/archive/model';

type ArchiveData={board:BoardSnapshot;collections:CollectionSnapshot;source:'supabase'|'fallback'};
type LoadState={status:'loading'}|{status:'ready';data:ArchiveData};

async function loadFallback():Promise<ArchiveData>{
 const [{localBoard},{default:photos},{default:puzzle}]=await Promise.all([
  import('../../data/local-board'),
  import('../../data/photo-manifest.json'),
  import('../../data/puzzle-manifest.json'),
 ]);
 return {board:localBoard,collections:{gallery:photos.map((item,index)=>({id:`fallback-photo-${index}`,asset_id:'fallback',title:item.title,caption:item.caption,alt_text:item.caption,location:'',year:item.year,sort_order:index,visible:true,src:item.src})),puzzle:puzzle.map((item,index)=>({id:`fallback-puzzle-${index}`,asset_id:'fallback',title:item.title,alt_text:item.title,sort_order:index,visible:true,src:item.src}))},source:'fallback'};
}

export default function FigmaArchive() {
 const [state,setState]=useState<LoadState>({status:'loading'});
 useEffect(()=>{const controller=new AbortController();let active=true;const fallback=async()=>{const data=await loadFallback();if(active)setState({status:'ready',data})};void Promise.all([fetchPublished(controller.signal),fetchPublishedCollections(controller.signal)]).then(([board,collections])=>{if(board&&collections){if(active)setState({status:'ready',data:{board,collections,source:'supabase'}});return}return fallback()}).catch(error=>{if(error?.name!=='AbortError')void fallback()});return()=>{active=false;controller.abort()}},[]);
 if(state.status==='loading')return <main className="archive-loading" role="status" aria-label="Loading Andre's Archive"><span>ANDRE&apos;S ARCHIVE</span><i aria-hidden="true"/></main>;
 return <App snapshot={state.data.board} collections={state.data.collections}/>;
}
