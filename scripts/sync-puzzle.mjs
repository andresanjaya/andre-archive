import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'assets/puzzle');
const target = path.join(root, 'public/archive/puzzle');
await mkdir(source, { recursive: true });
await mkdir(target, { recursive: true });
const files = (await readdir(source, { withFileTypes: true }))
  .filter(file => file.isFile() && /\.(jpe?g|png|webp|avif|gif)$/i.test(file.name))
  .map(file => file.name).sort((a, b) => a.localeCompare(b));
for (const file of files) await copyFile(path.join(source, file), path.join(target, file));
await writeFile(path.join(root, 'src/data/puzzle-manifest.json'), JSON.stringify(files.map(file => ({ src: `/archive/puzzle/${encodeURIComponent(file)}`, title: path.parse(file).name })), null, 2) + '\n');
console.log(`Synced ${files.length} puzzle images.`);
