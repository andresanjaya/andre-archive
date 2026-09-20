import { spawn, spawnSync } from 'node:child_process';
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const syncScript = path.join(root, 'scripts', 'sync-photos.mjs');
const source = path.join(root, 'assets', 'photos');
const nextCli = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');

const initial = spawnSync(process.execPath, [syncScript], { cwd: root, stdio: 'inherit' });
if (initial.status !== 0) process.exit(initial.status ?? 1);

let timer;
let syncing = false;
let repeat = false;
const sync = () => {
  if (syncing) { repeat = true; return; }
  syncing = true;
  const child = spawn(process.execPath, [syncScript], { cwd: root, stdio: 'inherit' });
  child.on('exit', () => {
    syncing = false;
    if (repeat) { repeat = false; sync(); }
  });
};
const watcher = watch(source, () => {
  clearTimeout(timer);
  timer = setTimeout(sync, 500);
});
const puzzleScript = path.join(root, 'scripts', 'sync-puzzle.mjs');
const puzzleInitial = spawnSync(process.execPath, [puzzleScript], { cwd: root, stdio: 'inherit' });
if (puzzleInitial.status !== 0) process.exit(puzzleInitial.status ?? 1);
let puzzleTimer;
const puzzleWatcher = watch(path.join(root, 'assets/puzzle'), () => {
  clearTimeout(puzzleTimer);
  puzzleTimer = setTimeout(() => spawnSync(process.execPath, [puzzleScript], { cwd: root, stdio: 'inherit' }), 500);
});
const next = spawn(process.execPath, [nextCli, 'dev', ...process.argv.slice(2)], { cwd: root, stdio: 'inherit' });
next.on('exit', (code) => { clearTimeout(timer); clearTimeout(puzzleTimer); watcher.close(); puzzleWatcher.close(); process.exit(code ?? 0); });
