export type MixtapeTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover?: string;
};

// Add the approved MP3 to public/archive/audio and replace the empty src below.
// Example src: "/archive/audio/21st-century-breakdown.mp3".
export const tracks: MixtapeTrack[] = [
  {
    id: 'green-day-21st-century-breakdown',
    title: '21st Century Breakdown',
    artist: 'Green Day',
    src: '',
    cover: '/archive/assets/song-green-day.jpg',
  },
];
