import {cpSync,mkdirSync,existsSync,symlinkSync} from 'node:fs';
import path from 'node:path';
const root=process.cwd(),out=path.join(root,'.studio-validation/current');mkdirSync(out,{recursive:true});
for(const name of ['src','figma_make/src','package.json','tsconfig.json','next.config.mjs','postcss.config.mjs','.eslintrc.json','next-env.d.ts']){if(existsSync(name))cpSync(name,path.join(out,name),{recursive:true})}
for(const name of ['node_modules','public']){const dest=path.join(out,name);if(!existsSync(dest))symlinkSync(path.join(root,name),dest,'junction')}
console.log('Prepared current source copy for isolated production build.');
