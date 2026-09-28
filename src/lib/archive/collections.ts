export type GalleryItem = {
 id:string;asset_id:string;title:string;caption:string;alt_text:string;location:string;year:string;sort_order:number;visible:boolean;
 storage_path?:string;src?:string;
};
export type PuzzleItem = {id:string;asset_id:string;title:string;alt_text:string;sort_order:number;visible:boolean;storage_path?:string;src?:string};
export type CollectionSnapshot = {gallery:GalleryItem[];puzzle:PuzzleItem[]};

export const emptyCollections:CollectionSnapshot={gallery:[],puzzle:[]};
const publicAssetUrl=(path:string)=>`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/archive-public/${path}`;
export function hydrateCollections(snapshot:CollectionSnapshot):CollectionSnapshot{
 const hydrate=<T extends {storage_path?:string;src?:string}>(item:T):T=>({...item,src:item.storage_path?publicAssetUrl(item.storage_path):item.src});
 return {gallery:(snapshot.gallery||[]).filter(item=>item.visible).sort((a,b)=>a.sort_order-b.sort_order).map(hydrate),puzzle:(snapshot.puzzle||[]).filter(item=>item.visible).sort((a,b)=>a.sort_order-b.sort_order).map(hydrate)};
}
export function validateCollections(value:CollectionSnapshot){
 if(!value||!Array.isArray(value.gallery)||!Array.isArray(value.puzzle)||value.gallery.length>200||value.puzzle.length>100)throw new Error('Invalid collection snapshot.');
 const ids=new Set<string>();
 for(const [kind,items] of [['gallery',value.gallery],['puzzle',value.puzzle]] as const)for(const item of items){
  if(!item.id||!item.asset_id||ids.has(`${kind}:${item.id}`)||!Number.isInteger(item.sort_order)||typeof item.visible!=='boolean')throw new Error(`Invalid ${kind} item.`);
  ids.add(`${kind}:${item.id}`);
  if(typeof item.title!=='string'||typeof item.alt_text!=='string'||item.title.length>1000||item.alt_text.length>1000)throw new Error(`Invalid ${kind} metadata.`);
  if(kind==='gallery'){const gallery=item as GalleryItem;if([gallery.caption,gallery.location,gallery.year].some(field=>typeof field!=='string'||field.length>1000))throw new Error('Invalid gallery metadata.');}
 }
}
export async function fetchPublishedCollections(signal:AbortSignal):Promise<CollectionSnapshot|null>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)return null;
 const response=await fetch(`${url}/rest/v1/published_collections?id=eq.1&select=snapshot`,{headers:{apikey:key},signal,cache:'no-store'});if(!response.ok)throw new Error('Published collections unavailable');
 const rows=await response.json(),snapshot=rows[0]?.snapshot as CollectionSnapshot|undefined;if(!snapshot)return null;validateCollections(snapshot);return hydrateCollections(snapshot);
}
