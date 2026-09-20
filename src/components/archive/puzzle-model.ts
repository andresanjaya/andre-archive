export const DIFFICULTIES = { Easy: 3, Medium: 4, Hard: 5 } as const;
export type Difficulty = keyof typeof DIFFICULTIES;
export const isSolved = (tiles: number[]) => tiles.every((tile, index) => tile === index);
export function shuffleTiles(size: number, random = Math.random): number[] {
  const tiles = Array.from({ length: size * size }, (_, index) => index);
  for (let index = tiles.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [tiles[index], tiles[other]] = [tiles[other], tiles[index]];
  }
  if (isSolved(tiles)) [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
  return tiles;
}
export function swapTiles(tiles: number[], first: number, second: number): number[] {
  const next = [...tiles];
  [next[first], next[second]] = [next[second], next[first]];
  return next;
}
