export const artifactTypes = ['identity', 'book', 'cinema', 'polaroid', 'music', 'sticker', 'pokemon', 'marvel', 'stamp', 'decoration', 'secret', 'tiny-pixel', 'puzzle'] as const;
export type ArtifactType = typeof artifactTypes[number];
export type Animation = 'lift' | 'book-3d' | 'projector' | 'none';
export type Action = 'none' | 'disturb' | 'discover' | 'sound' | 'play-music' | 'open-puzzle';
export type ArtifactRecord = {
  id: string; key: string; name: string; type: ArtifactType; asset_id: string | null;
  content: Record<string, string>; x: number; y: number; width: number; height: number | null;
  rotate: number; z: number; visible: boolean; locked: boolean;
  animation: Animation; action: Action; config: { duration?: number; lift?: number };
};
export type BoardSettings = { background: string; grid: boolean; entrance: boolean; initialX: number; initialY: number };
export type BoardSnapshot = { artifacts: ArtifactRecord[]; settings: BoardSettings };
export type AssetRecord = { id: string; name: string; category: string; storage_path: string; thumbnail_path: string | null; mime_type: string; file_size: number; width: number | null; height: number | null; alt_text: string; approved: boolean; source_path: string | null; created_at: string };
type ArtifactDefinition = { fields: string[]; animations: Animation[]; actions: Action[]; width: number; layer: number; editor: boolean; defaultContent?: Record<string,string>; defaultConfig?: {duration?: number; lift?: number} };
export const defaultSettings: BoardSettings = { background: '#1f6b50', grid: true, entrance: true, initialX: 0, initialY: 0 };
export const definitions: Record<ArtifactType, ArtifactDefinition> = {
  identity: {fields:['image','intro'], animations:['none'],actions:['none'],width:500,layer:50,editor:true,defaultContent:{}},
  book: {fields:['image','alt','color'],animations:['book-3d','none'],actions:['disturb','none','sound'],width:108,layer:30,editor:true,defaultContent:{color:'#353f53'}},
  cinema: {fields:['image','alt'],animations:['projector','none'],actions:['sound','none'],width:134,layer:30,editor:true},
  polaroid: {fields:['image','caption','year','location','fit','focus'],animations:['lift','none'],actions:['none','sound'],width:205,layer:30,editor:true},
  music: {fields:['image','trackId','title','artist','audio'],animations:['lift','none'],actions:['play-music','none'],width:200,layer:40,editor:true,defaultContent:{trackId:'',title:'',artist:'',audio:''},defaultConfig:{lift:8,duration:500}},
  sticker: {fields:['image','discovery','sound'],animations:['none','lift'],actions:['discover','none','sound'],width:78,layer:20,editor:true},
  pokemon: {fields:['image','variant','discovery'],animations:['lift','none'],actions:['discover','sound','none'],width:156,layer:40,editor:true},
  marvel: {fields:['image'],animations:['lift','none'],actions:['none'],width:125,layer:30,editor:true},
  stamp: {fields:['image'],animations:['lift','none'],actions:['none'],width:144,layer:30,editor:true},
  decoration: {fields:['image','alt','sound'],animations:['lift','none'],actions:['none','sound','disturb'],width:125,layer:30,editor:true},
  secret: {fields:['title','description'],animations:['lift','none'],actions:['none'],width:190,layer:30,editor:true},
  'tiny-pixel': {fields:[],animations:['none'],actions:['none'],width:100,layer:46,editor:true},
  puzzle: {fields:['image'],animations:['lift','none'],actions:['open-puzzle','none'],width:160,layer:30,editor:true},
};
export function safeMedia(value: unknown): value is string { return typeof value === 'string' && (value.startsWith('/archive/') || /^https:\/\//i.test(value)); }
export function validateBoard(board: BoardSnapshot): void {
  if (!board || !Array.isArray(board.artifacts) || board.artifacts.length > 300) throw new Error('Board must contain at most 300 artifacts.');
  const ids = new Set<string>(), keys = new Set<string>();
  for (const a of board.artifacts) {
    const d = definitions[a.type];
    if (!d || !a.id || !a.key || ids.has(a.id) || keys.has(a.key)) throw new Error('Invalid or duplicate artifact identity.');
    ids.add(a.id); keys.add(a.key);
    if (!d.animations.includes(a.animation) || !d.actions.includes(a.action)) throw new Error(`Unsupported interaction: ${a.name}`);
    if (![a.x,a.y,a.width,a.rotate,a.z].every(Number.isFinite) || a.width < 24 || a.width > 2000 || Math.abs(a.x)>10000 || Math.abs(a.y)>10000 || Math.abs(a.rotate)>360 || a.z<0 || a.z>1000 || (a.height !== null && (!Number.isFinite(a.height)||a.height<24||a.height>2000))) throw new Error(`Invalid layout: ${a.name}`);
    if (typeof a.visible !== 'boolean' || typeof a.locked !== 'boolean' || !a.content || Object.keys(a.content).some(k=>!d.fields.includes(k)) || Object.values(a.content).some(v=>typeof v!=='string'||v.length>10000)) throw new Error(`Invalid content: ${a.name}`);
    for (const field of ['image','audio']) if (a.content[field] && !safeMedia(a.content[field])) throw new Error('Media must use a local archive path or HTTPS.');
    if (!a.config || Object.keys(a.config).some(k=>!['duration','lift'].includes(k)) || (a.config.duration !== undefined && (!Number.isFinite(a.config.duration)||a.config.duration<100||a.config.duration>2000)) || (a.config.lift !== undefined && (!Number.isFinite(a.config.lift)||a.config.lift<0||a.config.lift>30))) throw new Error('Invalid animation parameters.');
  }
  const s=board.settings;
  if (!s || !/^#[a-f\d]{6}$/i.test(s.background) || typeof s.grid!=='boolean' || typeof s.entrance!=='boolean' || ![s.initialX,s.initialY].every(v=>Number.isFinite(v)&&Math.abs(v)<=10000)) throw new Error('Invalid board settings.');
}
export const assetCategoryDefaultArtifactType: Record<string,ArtifactType> = {photography:'polaroid',sticker:'sticker',pokemon:'pokemon',marvel:'marvel',music:'music',cinema:'cinema',book:'book',decoration:'decoration',puzzle:'puzzle'};
export function newArtifact(type: ArtifactType): ArtifactRecord {
  const d=definitions[type], id=crypto.randomUUID();
  return {id,key:id,name:`New ${type}`,type,asset_id:null,content:{...(d.defaultContent||{})},x:0,y:0,width:d.width,height:null,rotate:0,z:d.layer,visible:true,locked:false,animation:d.animations[0],action:d.actions[0],config:{...(d.defaultConfig||{})}};
}
export function createArtifactFromAsset(asset: AssetRecord, requestedType?: ArtifactType, mediaUrl?: string): ArtifactRecord {
  const type=requestedType||assetCategoryDefaultArtifactType[asset.category]||'decoration';
  const artifact=newArtifact(type);
  const image=mediaUrl||'';
  const content: Record<string,string>={...artifact.content,image};
  if (type==='book'||type==='cinema'||type==='decoration') content.alt=asset.alt_text||asset.name;
  if (type==='music') { content.trackId=asset.id; content.title=asset.name.replace(/\.[^.]+$/,''); content.artist=''; content.audio=''; }
  return {...artifact,name:asset.name,asset_id:asset.id,content};
}
export function convertArtifactType(artifact: ArtifactRecord, nextType: ArtifactType): ArtifactRecord {
  if (artifact.type===nextType) return artifact;
  const next=newArtifact(nextType), shared={image:artifact.content.image,alt:artifact.content.alt};
  const content={...next.content,...Object.fromEntries(Object.entries(shared).filter(([,value])=>typeof value==='string'&&value))};
  if (nextType==='music') { content.trackId=artifact.content.trackId||artifact.id; content.title=artifact.content.title||artifact.name; content.artist=artifact.content.artist||''; content.audio=artifact.content.audio||''; }
  return {...next,id:artifact.id,key:artifact.key,name:artifact.name,asset_id:artifact.asset_id,x:artifact.x,y:artifact.y,width:artifact.width,height:artifact.height,rotate:artifact.rotate,z:artifact.z,visible:artifact.visible,locked:artifact.locked,content};
}
