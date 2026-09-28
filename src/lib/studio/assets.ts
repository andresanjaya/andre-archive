import type { AssetRecord } from '../archive/model';
import { studioClient } from './client';
export const assetCategories=['photography','book','card','sticker','pokemon','marvel','music','cinema','puzzle','decoration','other'];
export function publicAssetUrl(path:string){return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/archive-public/${path}`}
export function isAudioAsset(asset:AssetRecord){return asset.mime_type==='audio/mpeg'}
async function variant(bitmap:ImageBitmap, max:number){
 const ratio=Math.min(1,max/Math.max(bitmap.width,bitmap.height)); const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);
 const context=canvas.getContext('2d');if(!context)throw new Error('Image conversion unavailable');context.drawImage(bitmap,0,0,canvas.width,canvas.height);
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Image encoding failed')),'image/webp',.84));
 if(blob.type!=='image/webp')throw new Error('This browser cannot encode WebP. Use a current browser.');return {blob,width:canvas.width,height:canvas.height};
}
async function decodeImage(file:File):Promise<ImageBitmap>{
 try{return await createImageBitmap(file)}catch(error){
  if(file.type!=='image/svg+xml')throw error;
  const objectUrl=URL.createObjectURL(file);
  try{
   const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const element=new Image();element.onload=()=>resolve(element);element.onerror=()=>reject(new Error('The SVG image could not be decoded.'));element.src=objectUrl});
   const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
   const context=canvas.getContext('2d');if(!context)throw new Error('Image conversion unavailable');context.drawImage(image,0,0);
   return await createImageBitmap(canvas);
  }finally{URL.revokeObjectURL(objectUrl)}
 }
}
export async function uploadAsset(file:File, category='other', sourcePath:string|null=null):Promise<AssetRecord>{
 const c=studioClient();if(!c)throw new Error('Supabase is not configured');
 if(!['image/png','image/jpeg','image/webp','image/svg+xml','audio/mpeg'].includes(file.type)||file.size>20*1024*1024)throw new Error('Use a PNG, JPEG, WebP, SVG, or MP3 file under 20 MB. Images are converted to WebP; MP3 files retain their original format.');
 if(sourcePath){const existing=await c.from('assets').select('*').eq('source_path',sourcePath).maybeSingle();if(existing.error)throw existing.error;if(existing.data)return existing.data as AssetRecord}
 if(file.type==='audio/mpeg'){
  const id=crypto.randomUUID(),path=`${id}/audio.mp3`;
  const {error:uploadError}=await c.storage.from('archive-drafts').upload(path,file,{contentType:'audio/mpeg',upsert:false});
  if(uploadError)throw uploadError;
  try{
   const {data,error}=await c.from('assets').insert({id,name:file.name,category:category==='other'?'music':category,source_path:sourcePath,storage_path:path,thumbnail_path:null,mime_type:'audio/mpeg',file_size:file.size,width:null,height:null,alt_text:file.name.replace(/\.[^.]+$/,'')}).select().single();
   if(error)throw error;return data as AssetRecord;
  }catch(error){await c.storage.from('archive-drafts').remove([path]);throw error}
 }
 const bitmap=await decodeImage(file);let main,thumb;
 try {if(bitmap.width*bitmap.height>50000000)throw new Error('Image exceeds 50 megapixels');main=await variant(bitmap,category==='photography'?1600:1200);thumb=await variant(bitmap,240)}finally{bitmap.close()}
 const id=crypto.randomUUID(),path=`${id}/image.webp`,thumbnail=`${id}/thumb.webp`;
 const uploaded:string[]=[];
 try{
  for(const [name,blob] of [[path,main.blob],[thumbnail,thumb.blob]] as const){const {error}=await c.storage.from('archive-drafts').upload(name,blob,{contentType:'image/webp',upsert:false});if(error)throw error;uploaded.push(name)}
  const {data,error}=await c.from('assets').insert({id,name:file.name,category,source_path:sourcePath,storage_path:path,thumbnail_path:thumbnail,mime_type:'image/webp',file_size:main.blob.size,width:main.width,height:main.height,alt_text:file.name.replace(/\.[^.]+$/,'')}).select().single();if(error)throw error;return data as AssetRecord;
 }catch(e){if(uploaded.length)await c.storage.from('archive-drafts').remove(uploaded);throw e}
}
export async function approveAsset(asset:AssetRecord){
 const c=studioClient()!;
 for(const path of [asset.storage_path,asset.thumbnail_path].filter((path):path is string=>Boolean(path))){
  const {data,error}=await c.storage.from('archive-drafts').download(path);if(error)throw error;
  const upload=await c.storage.from('archive-public').upload(path,data,{contentType:asset.mime_type,upsert:false});
  if(upload.error && !/already exists|Duplicate/i.test(upload.error.message))throw upload.error;
 }
 const {error}=await c.from('assets').update({approved:true}).eq('id',asset.id);if(error)throw error;
}
export async function deleteAsset(asset:AssetRecord){
 const c=studioClient()!;
 // FK and publication trigger enforce references at the database, including other tabs.
 const {error}=await c.from('assets').delete().eq('id',asset.id);if(error)throw error;
 const paths=[asset.storage_path,asset.thumbnail_path].filter((path):path is string=>Boolean(path));
 for(const bucket of ['archive-drafts','archive-public']){const result=await c.storage.from(bucket).remove(paths);if(result.error)throw new Error(`Metadata removed; storage cleanup failed: ${result.error.message}`)}
}
export async function assetPreview(asset:AssetRecord, thumbnail=true){
 const path=thumbnail&&asset.thumbnail_path?asset.thumbnail_path:asset.storage_path;
 if(asset.approved)return publicAssetUrl(path);
 const {data,error}=await studioClient()!.storage.from('archive-drafts').createSignedUrl(path,3600);if(error)throw error;return data.signedUrl;
}
