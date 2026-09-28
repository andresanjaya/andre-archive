export const PHOTOS = [
  { src: "/archive/assets/pict-1.jpg", title: "Graduation", year: "2026", caption: "graduation" },
  { src: "/archive/assets/pict-2.png", title: "Kindergarten", year: "", caption: "kindergarten" },
  { src: "/archive/assets/pict-4.jpeg", title: "Personal Reference", year: "", caption: "personal reference" },
  { src: "/archive/assets/profile2.png", title: "Andre Sanjaya", year: "", caption: "andre sanjaya" },
]


export const BOARD_ASSETS = [
  { id: "book", src: "/archive/assets/book-1.jpg", alt: "The Design of Everyday Things book cover", caption: "The Design of Everyday Things", width: 108 },
  { id: "book-two", src: "/archive/assets/book-2.jpg", alt: "Almost Adulting book cover", caption: "Almost Adulting", width: 106 },
  { id: "book-three", src: "/archive/assets/book-3.jpg", alt: "Atomic Habits book cover", caption: "Atomic Habits", width: 103 },
  { id: "book-four", src: "/archive/assets/book-4.jpg", alt: "Detective Conan volume 24 book cover", caption: "Detective Conan Vol. 24", width: 105 },
  { id: "letterboxd", src: "/archive/assets/letterboxd.png", alt: "Letterboxd logo", caption: "Letterboxd", width: 92 },
  { id: "movie-one", src: "/archive/assets/movie-1.jpg", alt: "Oppenheimer poster", caption: "Oppenheimer", width: 134 },
  { id: "movie-two", src: "/archive/assets/movie-2.jpg", alt: "Good Will Hunting poster", caption: "Good Will Hunting", width: 130 },
  { id: "movie-three", src: "/archive/assets/movie-3.jpg", alt: "Eternal Sunshine of the Spotless Mind poster", caption: "Eternal Sunshine", width: 137 },
  { id: "movie-four", src: "/archive/assets/movie-4.jpg", alt: "Forrest Gump", caption: "Forrest Gump", width: 132 },
  { id: "series-one", src: "/archive/assets/series-1.jpg", alt: "Breaking Bad", caption: "Breaking Bad", width: 128 },
  { id: "series-two", src: "/archive/assets/series-2.jpg", alt: "Dark", caption: "Dark", width: 128 },
  { id: "series-three", src: "/archive/assets/series-3.jpg", alt: "Loki", caption: "Loki", width: 128 },
  { id: "series-four", src: "/archive/assets/series-4.jpg", alt: "Avatar: The Last Airbender", caption: "Avatar: The Last Airbender", width: 128 },
  { id: "series-five", src: "/archive/assets/series-5.jpg", alt: "Better Call Saul", caption: "Better Call Saul", width: 128 },
  { id: "archive-logo", src: "/archive/assets/logo.svg", alt: "Andre Archive logo", caption: "Archive logo", width: 125 },
] as const

// Single source of truth for the default board composition.
// Change x, y, or rotate here to manually arrange any named artifact.
export const ARTIFACT_POSITIONS = {
  bookDesignEverydayThings: { x: -875, y: -150, rotate: 15, z: 30 },
  bookAlmostAdulting: { x: 875, y: -400, rotate: 8, z: 30 },
  bookAtomicHabits: { x: -1100, y: 60, rotate: -4, z: 30 },
  bookDetectiveConan: { x: 570, y: -530, rotate: -8, z: 30 },
  letterboxdLogo: { x: 680, y: -300, rotate: 5, z: 30 },
  filmOppenheimer: { x: 300, y: 570, rotate: 4, z: 30 },
  filmGoodWillHunting: { x: -820, y: 145, rotate: -15, z: 30 },
  filmEternalSunshine: { x: 800, y: -105, rotate: -5, z: 30 },
  filmForrestGump: { x:-500, y: 700, rotate: -4, z: 30 },
  seriesOne: { x: -320, y: -560, rotate: -15, z: 30 },
  seriesTwo: { x: 50, y: 600, rotate: -7, z: 30 },
  seriesThree: { x: 240, y: -560, rotate: 15, z: 30 },
  seriesFour: { x: -1250, y: -320, rotate: -15, z: 30 },
  seriesFive: {  x: 1050, y: -105, rotate: 7, z: 30 },
  archiveLogo: { x: -1060, y: -135, rotate: 5, z: 30 },
  pokemonLogo: { x: -720, y: -320, rotate: -7, z: 40, width: 156 },
  pokemonCard: { x: -700, y: -520, rotate: 5, z: 40, width: 150 },
  marvelLogo: { x: 400, y: -400, rotate: 5, z: 30, width: 125 },
  spiderManReference: { x: 850, y: 100, rotate: -5, z: 40, width: 132 },
  photoGraduation: { x: -480, y: -150, rotate: 10, z: 30 },
  photoKindergarten: { x: -480, y: 220, rotate: -10, z: 30 },
  photoPersonalReference: { x: 470, y: -150, rotate: -15, z: 30 },
  albumMardyBum: { x: -720, y: 470, rotate: 15, z: 40, width: 200 },
  stampBali: { x: -1000, y: -445, rotate: 4, z: 30, width: 144 },
  photoPikachu: { x: 480, y: 250, rotate: 12, z: 30 },
  albumGoodRiddance: { x: -20, y: -560, rotate: 15, z: 40, width: 200 },
  albumGemilang: { x: 800, y: 300, rotate: -10, z: 40, width: 200 },
  albumEarrings: { x: -220, y: 600, rotate: -4, z: 40, width: 200 },
  albumWonderwall: { x: -1350, y: 50, rotate: 7, z: 40, width: 200 },
  albumWhiteFerrari: { x: -1050, y: 380, rotate: -6, z: 40, width: 200 },
  albumHighAndDry: { x: 700, y: 700, rotate: 5, z: 40, width: 200 },
  stickerFigma: { x: -450, y: -380, rotate: -6, z: 20 },
  stickerCharizard: { x: 1080, y: -380, rotate: 8, z: 35, width: 120 },
  curiositySecret: { x: -845, y: 430, rotate: -4, z: 30, width: 190 },
} as const

export const BOARD_ASSET_POSITION_KEYS = {
  book: "bookDesignEverydayThings", "book-two": "bookAlmostAdulting", "book-three": "bookAtomicHabits", "book-four": "bookDetectiveConan", letterboxd: "letterboxdLogo",
  "movie-one": "filmOppenheimer", "movie-two": "filmGoodWillHunting", "movie-three": "filmEternalSunshine", "movie-four": "filmForrestGump", "series-one": "seriesOne", "series-two": "seriesTwo", "series-three": "seriesThree", "series-four": "seriesFour", "series-five": "seriesFive", "archive-logo": "archiveLogo",
} as const

export const RANDOMIZABLE_ASSETS = [
  ...BOARD_ASSETS.map(({ id }) => ({ id, ...ARTIFACT_POSITIONS[BOARD_ASSET_POSITION_KEYS[id]] })),
  { id: "pokemon", ...ARTIFACT_POSITIONS.pokemonLogo },
  { id: "marvel", ...ARTIFACT_POSITIONS.marvelLogo },
  { id: "pokemon-card", ...ARTIFACT_POSITIONS.pokemonCard },
  { id: "pict-one", ...ARTIFACT_POSITIONS.photoGraduation },
  { id: "pict-two", ...ARTIFACT_POSITIONS.photoKindergarten },
  { id: "pict-four", ...ARTIFACT_POSITIONS.photoPersonalReference },
  { id: "pict-five", ...ARTIFACT_POSITIONS.photoPikachu },
  { id: "mixtape", ...ARTIFACT_POSITIONS.albumMardyBum },
  { id: "song-two", ...ARTIFACT_POSITIONS.albumGoodRiddance },
  { id: "song-three", ...ARTIFACT_POSITIONS.albumGemilang },
  { id: "song-four", ...ARTIFACT_POSITIONS.albumEarrings },
  { id: "song-five", ...ARTIFACT_POSITIONS.albumWonderwall },
  { id: "song-six", ...ARTIFACT_POSITIONS.albumWhiteFerrari },
  { id: "song-seven", ...ARTIFACT_POSITIONS.albumHighAndDry },
  { id: "bali-stamp", ...ARTIFACT_POSITIONS.stampBali },
  { id: "figma", ...ARTIFACT_POSITIONS.stickerFigma },
  { id: "charizard", ...ARTIFACT_POSITIONS.stickerCharizard },
] as const

