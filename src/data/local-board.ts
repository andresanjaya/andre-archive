import { ARTIFACT_POSITIONS as P, BOARD_ASSETS, BOARD_ASSET_POSITION_KEYS } from './board-layout';
import { tracks } from './tracks';
import { defaultSettings, definitions, type ArtifactRecord, type ArtifactType, type BoardSnapshot } from '../lib/archive/model';
function record(key: string, name: string, type: ArtifactType, p: {x:number;y:number;rotate:number;z:number;width?:number}, content: Record<string,string>): ArtifactRecord {
 const d=definitions[type]; return {id:key,key,name,type,asset_id:null,content,x:p.x,y:p.y,rotate:p.rotate,z:p.z,width:p.width||d.width,height:null,visible:true,locked:false,animation:d.animations[0],action:d.actions[0],config:{}};
}
export const localBoard: BoardSnapshot = { settings: defaultSettings, artifacts: [
 record('identity','Andre Sanjaya','identity',{x:0,y:0,rotate:0,z:50},{image:'/archive/assets/profile.jpg'}),
 ...BOARD_ASSETS.map(a=>{const result=record(a.id,a.caption,a.id.startsWith('book')?'book':/^(movie|series)/.test(a.id)?'cinema':'decoration',{...P[BOARD_ASSET_POSITION_KEYS[a.id]],width:a.width},{image:a.src,alt:a.alt,...(a.id.startsWith('book')?{color:({'book':'#d6af24','book-two':'#cc922c','book-three':'#e7e2cd','book-four':'#b84e32'} as Record<string,string>)[a.id]}:{})});if(a.id==='letterboxd'){result.action='sound';result.content.sound='projector'}else if(a.id==='archive-logo')result.action='disturb';return result}),
 record('pokemon','Pokémon','pokemon',P.pokemonLogo,{image:'/archive/assets/pokemon.png',variant:'logo',discovery:'pokemon'}),
 {...record('pokemon-card','Pokemon card','pokemon',P.pokemonCard,{image:'/archive/assets/pokemon-card.png',variant:'card'}),action:'sound'},
 record('marvel','Marvel','marvel',P.marvelLogo,{image:'/archive/assets/marvel.png'}),
 record('spiderman','Spider-Man','decoration',P.spiderManReference,{image:'/archive/assets/spiderman.png'}),
 record('pict-one','Graduation photograph','polaroid',P.photoGraduation,{image:'/archive/assets/pict-1.jpg',caption:'graduation'}),
 record('pict-two','Kindergarten photograph','polaroid',P.photoKindergarten,{image:'/archive/assets/pict-2.png',caption:'kindergarten',fit:'contain',focus:'center'}),
 record('pict-four','Personal Reference','polaroid',P.photoPersonalReference,{image:'/archive/assets/pict-4.jpeg',caption:'personal reference'}),
 record('pict-five','Andre Sanjaya','polaroid',P.photoPikachu,{image:'/archive/assets/profile2.png',caption:'andre sanjaya'}),
 ...tracks.map((t,i)=>record(['mixtape','song-two','song-three','song-four','song-five','song-six','song-seven'][i],`${t.title} · ${t.artist}`,'music',[P.albumMardyBum,P.albumGoodRiddance,P.albumGemilang,P.albumEarrings,P.albumWonderwall,P.albumWhiteFerrari,P.albumHighAndDry][i],{image:t.cover||'',trackId:t.id,title:t.title,artist:t.artist,audio:t.src})),
 record('bali-stamp','Bali stamp','stamp',P.stampBali,{image:'/archive/assets/bali-postcard.png'}),
 record('figma','figma','sticker',{...P.stickerFigma,width:78},{image:'/archive/assets/figma-sticker.png',discovery:'figma',sound:'ui'}),
 record('charizard','charizard','sticker',{...P.stickerCharizard,width:120,z:20},{image:'/archive/assets/charizard.png',discovery:'charizard',sound:'card'}),
 record('secret','Curiosity secret','secret',P.curiositySecret,{title:'Curiosity > category',description:'Good ideas rarely stay inside one folder.'}),
]};
