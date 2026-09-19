import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'assets', 'photos');
const destination = path.join(root, 'public', 'archive', 'photos');
const manifestPath = path.join(root, 'src', 'data', 'photo-manifest.json');
const supported = /\.(avif|jpe?g|png|webp)$/i;

await mkdir(source, { recursive: true });
await mkdir(destination, { recursive: true });

const files = (await readdir(source, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && supported.test(entry.name))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

const oldManifest = JSON.parse(await readFile(manifestPath, 'utf8').catch(() => '[]'));
const oldFiles = new Set(oldManifest.map((item) => path.basename(decodeURIComponent(item.src))));
for (const file of oldFiles) {
  if (!files.includes(file) && supported.test(file)) await rm(path.join(destination, file), { force: true });
}

for (const file of files) await copyFile(path.join(source, file), path.join(destination, file));

const manifest = files.map((file) => {
  const title = path.parse(file).name.replace(/[-_]+/g, ' ').trim();
  return { src: `/archive/photos/${encodeURIComponent(file)}`, title, year: '', caption: title };
});
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Synced ${manifest.length} photo${manifest.length === 1 ? '' : 's'} from assets/photos.`);
