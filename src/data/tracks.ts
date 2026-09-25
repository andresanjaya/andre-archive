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
  {
    id: 'green-day-good-riddance',
    title: 'Good Riddance',
    artist: 'Green Day',
    src: '/archive/audio/song-2.mp3',
    cover: '/archive/assets/song-2.jpg',
  },
  {
    id: 'song-three',
    title: 'Gemilang',
    artist: 'Perunggu',
    src: '/archive/audio/song-3.mp3',
    cover: '/archive/assets/song-3.jpg',
  },
  {
    id: 'malcolm-todd-earrings',
    title: 'Earrings',
    artist: 'Malcolm Todd',
    src: '/archive/audio/song-4.mp3',
    cover: '/archive/assets/song-4.jpg',
  },
  {
    id: 'oasis-wonderwall',
    title: 'Wonderwall',
    artist: 'Oasis',
    src: '/archive/audio/song-5.mp3',
    cover: '/archive/assets/song-5.jpg',
  },
  {
    id: 'frank-ocean-white-ferrari',
    title: 'White Ferrari',
    artist: 'Frank Ocean',
    src: '/archive/audio/song-6.mp3',
    cover: '/archive/assets/song-6.jpg',
  },
  {
    id: 'radiohead-high-and-dry',
    title: 'High and Dry',
    artist: 'Radiohead',
    src: '/archive/audio/song-7.mp3',
    cover: '/archive/assets/song-7.jpg',
  },
];
