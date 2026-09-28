import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
await mkdir('.studio-validation',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
let version=0,board=null,published=null,collectionVersion=0,collections={gallery:[],puzzle:[]},publishedCollections=null,authorized=true;
let assets=[];const storage=new Map();
const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'andre@example.test',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()};
const token=['eyJhbGciOiJIUzI1NiJ9',Buffer.from(JSON.stringify({sub:user.id,role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'test-only'].join('.');
await page.route('http://127.0.0.1:54321/**',async route=>{
 const req=route.request(),url=new URL(req.url());let data=null,status=200;
 if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'}});return}
 if(url.pathname.endsWith('/token'))data={access_token:token,refresh_token:'test-refresh',expires_in:3600,token_type:'bearer',user};
 else if(url.pathname.endsWith('/user')){if(req.headers().authorization?.includes(token))data=user;else{status=401;data={message:'Not signed in'}}}
 else if(url.pathname.endsWith('/logout'))data={};
 else if(url.pathname.endsWith('/is_archive_admin'))data=authorized;
 else if(url.pathname.endsWith('/archive_settings'))data={id:1,version,settings:board?.settings};
 else if(url.pathname.endsWith('/artifacts'))data=board?.artifacts||[];
 else if(url.pathname.endsWith('/collection_settings'))data={id:1,version:collectionVersion};
 else if(url.pathname.endsWith('/gallery_items'))data=collections.gallery;
 else if(url.pathname.endsWith('/puzzle_items'))data=collections.puzzle;
 else if(url.pathname.startsWith('/storage/v1/object/sign/')){
  const key=url.pathname.replace('/storage/v1/object/sign/','');
  data={signedURL:`/object/sign/${key}?token=test`};
 }
 else if(url.pathname.startsWith('/storage/v1/object/')){
  const key=url.pathname.replace('/storage/v1/object/','');
  if(req.method()==='POST'){
   const raw=req.postDataBuffer();const start=raw?.indexOf(Buffer.from('RIFF'))??-1;assert.ok(start>=0,'Image was genuinely encoded as WebP');const size=raw.readUInt32LE(start+4)+8;storage.set(key,raw.subarray(start,start+size));data={Key:key};
  } else if(req.method()==='DELETE'){
   for(const name of req.postDataJSON().prefixes||[])storage.delete(`${key}/${name}`);data=[];
  } else {
   const blob=storage.get(key);if(!blob){status=404;data={message:'Object not found'}}else {await route.fulfill({status:200,contentType:'image/webp',headers:{'access-control-allow-origin':'*'},body:blob});return}
  }
 }
 else if(url.pathname.endsWith('/assets')){
  const id=url.searchParams.get('id')?.replace('eq.','');
  const source=url.searchParams.get('source_path')?.replace('eq.','');
  if(req.method()==='POST'){
   const payload=req.postDataJSON();const value={...(Array.isArray(payload)?payload[0]:payload),approved:false,created_at:new Date().toISOString()};assets.push(value);data=[value];
  } else if(req.method()==='PATCH'){
   assets=assets.map(a=>a.id===id?{...a,...req.postDataJSON()}:a);data=[];
  } else if(req.method()==='DELETE'){
   assets=assets.filter(a=>a.id!==id);data=[];
  } else data=source?(assets.some(a=>a.source_path===source)?[assets.find(a=>a.source_path===source)]:[]):assets;
 }
 else if(url.pathname.endsWith('/published_board'))data=url.searchParams.get('select')==='snapshot'?(published?[{snapshot:published}]:[]):published?{published_at:new Date().toISOString()}:null;
 else if(url.pathname.endsWith('/published_collections'))data=url.searchParams.get('select')==='snapshot'?(publishedCollections?[{snapshot:publishedCollections}]:[]):publishedCollections?{published_at:new Date().toISOString()}:null;
 else if(url.pathname.endsWith('/save_archive_draft')){const body=req.postDataJSON();assert.equal(body.expected_version,version);board=body.board;data=++version}
 else if(url.pathname.endsWith('/publish_archive')){published=structuredClone(board);data=new Date().toISOString()}
 else if(url.pathname.endsWith('/save_archive_collections')){const body=req.postDataJSON();assert.equal(body.expected_version,collectionVersion);collections=body.value;data=++collectionVersion}
 else if(url.pathname.endsWith('/publish_archive_collections')){publishedCollections=structuredClone(collections);data=new Date().toISOString()}
 else {status=404;data={message:'Unmocked endpoint'}}
 await route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(data)});
});
await page.goto('http://localhost:3006/');await page.getByRole('heading',{name:'Andre Sanjaya'}).waitFor();
await page.waitForTimeout(1500);
assert.equal(await page.locator('.record-artifact').count(),7);assert.equal(await page.locator('.book-artifact').count(),4);assert.equal(await page.locator('.projector-poster').count(),9);
const book=page.locator('.book-artifact-group').first();await book.scrollIntoViewIfNeeded();await book.hover({force:true});await page.waitForTimeout(400);
assert.notEqual(await book.locator('.book-artifact').evaluate(e=>getComputedStyle(e).transform),'none');
// Assert source changes and stale play promise protection without depending on an audio output device.
await page.evaluate(()=>{window.__played=[];HTMLMediaElement.prototype.play=function(){window.__played.push(this.src);return Promise.resolve()};HTMLMediaElement.prototype.pause=function(){}});
for(const title of ['Mardy Bum','Good Riddance','Mardy Bum'])await page.getByRole('button',{name:new RegExp(title)}).first().evaluate(e=>e.click());
const played=await page.evaluate(()=>window.__played);assert.ok(played.at(-1).endsWith('song-1.mp3'));assert.ok(played.at(-2).endsWith('song-2.mp3'));
await page.goto('http://localhost:3006/admin/board');await page.getByRole('heading',{name:'Welcome back, Andre.'}).waitFor();assert.equal(await page.locator('.studio-canvas').count(),0);
await page.getByLabel('Email',{exact:true}).fill('andre@example.test');await page.getByLabel('Password',{exact:true}).fill('test-password');await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.locator('.studio-canvas').waitFor();
await page.waitForTimeout(2000);
await page.getByRole('button',{name:'Select Graduation photograph',exact:true}).click({force:true});
const x=page.getByLabel('x',{exact:true});await x.fill('-400');assert.equal(await x.inputValue(),'-400');
await page.getByRole('button',{name:'Save Draft',exact:true}).click();await page.getByRole('status').filter({hasText:'Draft saved'}).waitFor();assert.equal(board.artifacts.find(a=>a.key==='pict-one').x,-400);assert.equal(published,null);
const select=page.getByRole('button',{name:'Select Graduation photograph',exact:true}),box=await select.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+40,box.y+box.height/2+20,{steps:5});await page.mouse.up();assert.equal(await x.inputValue(),'-300');
await page.getByLabel('Locked',{exact:true}).check();const before=await x.inputValue();await select.click({force:true});await page.keyboard.press('ArrowRight');assert.equal(await x.inputValue(),before);await page.getByLabel('Locked',{exact:true}).uncheck();
await page.getByRole('button',{name:'Preview',exact:true}).click();assert.equal(await page.locator('.studio-preview .record-artifact').count(),7);
await page.waitForTimeout(1500);
await page.getByRole('button',{name:'Back to Edit',exact:true}).click();page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Publish',exact:true}).click();await page.getByRole('status').filter({hasText:'Published.'}).waitFor();assert.equal(published.artifacts.find(a=>a.key==='pict-one').x,-300);
await page.goto('http://localhost:3006/admin/assets');await page.getByRole('heading',{name:'Assets'}).waitFor();
const uploadImage=await readFile('public/archive/assets/book-1.jpg');
await page.getByLabel('Upload media').setInputFiles({name:'test-photo.jpg',mimeType:'image/jpeg',buffer:uploadImage});
await page.getByRole('status').filter({hasText:'Uploaded privately'}).waitFor();assert.equal(assets.length,1);assert.equal(assets[0].mime_type,'image/webp');assert.ok(storage.has(`archive-drafts/${assets[0].storage_path}`));
const card=page.locator('.studio-asset').first();assert.equal(await card.getByLabel('Name').inputValue(),'test-photo.jpg');await card.getByLabel('Name').fill('CMS test image');await card.getByRole('button',{name:'Save metadata'}).click();await page.getByRole('status').filter({hasText:'Metadata saved'}).waitFor();assert.equal(assets[0].name,'CMS test image');
	page.once('dialog',d=>d.accept());await card.getByRole('button',{name:'Approve public access'}).click();await page.getByRole('status').filter({hasText:'approved for public'}).waitFor();assert.equal(assets[0].approved,true);assert.ok(storage.has(`archive-public/${assets[0].storage_path}`));
	await card.getByLabel('Category').selectOption('book');await card.getByRole('button',{name:'Save metadata'}).click();await page.getByRole('status').filter({hasText:'Metadata saved'}).waitFor();assert.equal(assets[0].category,'book');await page.goto('http://localhost:3006/admin/board');await page.locator('.studio-canvas').waitFor();await page.locator('.studio-layers').getByRole('button',{name:'Assets',exact:true}).click();await page.getByTitle('Add CMS test image').click();assert.equal(await page.locator('.studio-inspector h2').textContent(),'book');assert.equal(await page.locator('.studio-inspector select').nth(1).inputValue(),'book-3d');await page.getByRole('button',{name:'Delete',exact:true}).click();
	await page.goto('http://localhost:3006/admin/gallery');await page.getByRole('heading',{name:'Gallery'}).waitFor();await page.getByLabel('Approved asset for gallery').selectOption(assets[0].id);await page.getByRole('button',{name:'Add asset'}).click();await page.getByLabel('Caption').fill('Gallery CMS caption');await page.getByRole('button',{name:'Save Draft'}).click();await page.getByRole('status').filter({hasText:'Collection draft saved'}).waitFor();assert.equal(collections.gallery.length,1);await page.getByRole('button',{name:'Preview'}).click();assert.equal(await page.locator('.studio-collection-preview figure').count(),1);page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Publish Collections'}).click();await page.getByRole('status').filter({hasText:'collections published'}).waitFor();assert.equal(publishedCollections.gallery[0].caption,'Gallery CMS caption');
await page.goto('http://localhost:3006/admin/puzzle');await page.getByRole('heading',{name:'Puzzle'}).waitFor();await page.getByLabel('Approved asset for puzzle').selectOption(assets[0].id);await page.getByRole('button',{name:'Add asset'}).click();await page.getByRole('button',{name:'Save Draft'}).click();await page.getByRole('status').filter({hasText:'Collection draft saved'}).waitFor();page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Publish Collections'}).click();await page.getByRole('status').filter({hasText:'collections published'}).waitFor();assert.equal(publishedCollections.puzzle.length,1);
await page.getByRole('button',{name:'Remove'}).click();await page.getByRole('button',{name:'Save Draft'}).click();await page.getByRole('status').filter({hasText:'Collection draft saved'}).waitFor();await page.goto('http://localhost:3006/admin/gallery');await page.getByRole('button',{name:'Remove'}).click();page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Publish Collections'}).click();await page.getByRole('status').filter({hasText:'collections published'}).waitFor();assert.equal(publishedCollections.gallery.length,0);assert.equal(publishedCollections.puzzle.length,0);
await page.goto('http://localhost:3006/admin/assets');await page.getByRole('heading',{name:'Assets'}).waitFor();
page.once('dialog',d=>d.accept());await card.getByRole('button',{name:'Delete unused asset'}).click();await page.getByRole('status').filter({hasText:'Unused asset deleted'}).waitFor();assert.equal(assets.length,0);
const svgImage=await readFile('public/archive/assets/logo.svg');await page.getByLabel('Upload media').setInputFiles({name:'logo.svg',mimeType:'image/svg+xml',buffer:svgImage});await page.getByRole('status').filter({hasText:'Uploaded privately'}).waitFor();assert.equal(assets.length,1);assert.equal(assets[0].mime_type,'image/webp');assert.ok(storage.has(`archive-drafts/${assets[0].storage_path}`));
page.once('dialog',d=>d.accept());await page.locator('.studio-asset').first().getByRole('button',{name:'Delete unused asset'}).click();await page.getByRole('status').filter({hasText:'Unused asset deleted'}).waitFor();assert.equal(assets.length,0);
await page.getByRole('button',{name:'Sign Out',exact:true}).click();await page.getByRole('heading',{name:'Welcome back, Andre.'}).waitFor();
authorized=false;await page.getByLabel('Email',{exact:true}).fill('visitor@example.test');await page.getByLabel('Password',{exact:true}).fill('test-password');await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.getByRole('heading',{name:'Access denied.'}).waitFor();
assert.deepEqual(errors,[]);await writeFile('.studio-validation/browser-result.json',JSON.stringify({passed:true,backend:'mocked Supabase HTTP; real RLS tested separately with PostgreSQL',played,assetWorkflow:true,collectionWorkflow:true,svgRasterization:true},null,2));
await browser.close();console.log('PASS: real browser public render, book geometry, track switching, private admin gate, board draft/preview/publish, optimized asset workflow, and Gallery/Puzzle collection draft/preview/publish UI (mocked backend).');
