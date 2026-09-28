const fs=require('node:fs'),crypto=require('node:crypto'),ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,filename);
const {localBoard}=require('../src/data/local-board.ts');
const photos=require('../src/data/photo-manifest.json'),puzzles=require('../src/data/puzzle-manifest.json');
const rows=new Map();
function add(src,usage){if(!src)return;if(!rows.has(src)){const file=fs.readFileSync('public'+decodeURIComponent(src));rows.set(src,{source_path:src,bytes:file.length,sha256:crypto.createHash('sha256').update(file).digest('hex'),uses:[],migration:/\.(png|jpe?g|webp)$/i.test(src)?'optimized private upload; explicit public approval':'retain local (audio or SVG); no arbitrary format upload'})}rows.get(src).uses.push(usage)}
for(const a of localBoard.artifacts){add(a.content.image,`board:${a.key}`);add(a.content.audio,`audio:${a.key}`)}
photos.forEach(a=>add(a.src,'photos'));puzzles.forEach(a=>add(a.src,'puzzle'));
fs.writeFileSync('docs/studio-asset-manifest.json',JSON.stringify([...rows.values()],null,2)+'\n');console.log(`Recorded ${rows.size} referenced files, deduplicated by source path. No uploads performed.`);
