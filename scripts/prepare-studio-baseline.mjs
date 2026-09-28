import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync,existsSync,symlinkSync} from 'node:fs';
import path from 'node:path';
const root=process.cwd(),out=path.join(root,'.studio-validation/baseline');mkdirSync(out,{recursive:true});
const files=execFileSync('git',['ls-files','src','figma_make/src','package.json','tsconfig.json','next.config.mjs','postcss.config.mjs','.eslintrc.json','next-env.d.ts'],{encoding:'utf8'}).trim().split('\n');
for(const file of files){const target=path.join(out,file);mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,execFileSync('git',['show',`HEAD:${file}`]));}
for(const name of ['node_modules','public']){const dest=path.join(out,name);if(!existsSync(dest))symlinkSync(path.join(root,name),dest,'junction');}
console.log('Prepared HEAD baseline under .studio-validation/baseline. No worktree files overwritten.');
