export type MixtapeTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover?: string;
};

// This local audio is intentionally served as a static, approved archive asset.
export const tracks: MixtapeTrack[] = [
  {
    id: 'arctic-monkeys-mardy-bum',
    title: 'Mardy Bum',
    artist: 'Arctic Monkeys',
    src: '/archive/audio/song-1.mp3',
    cover: '/archive/assets/song-1.jpg',
  },
];
