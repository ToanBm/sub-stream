export type Video = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  youtubeId: string;
  duration: string;
  year: number;
  rating: string;
  genre: string[];
  category: 'movie' | 'series';
};

export const videos: Video[] = [
  {
    id: 'vietnam-4k',
    title: 'Vietnam in 4K - The Timeless Charm',
    subtitle: 'Exploring Southeast Asia\'s Hidden Gems',
    description:
      'From the emerald waters of Ha Long Bay to the vibrant streets of Hanoi and the ancient town of Hoi An, experience Vietnam like never before. Discover breathtaking landscapes, lush rice terraces, and a rich cultural heritage in stunning cinematic 4K.',
    thumbnail: 'https://img.youtube.com/vi/k8m0SaGQ_1c/maxresdefault.jpg',
    youtubeId: 'k8m0SaGQ_1c',
    duration: '1h 12m',
    year: 2024,
    rating: 'G',
    genre: ['Documentary', 'Travel'],
    category: 'movie',
  },
  {
    id: 'serbia-4k',
    title: 'Serbia in 4K - Europe\'s Unseen Heart',
    subtitle: 'A Journey Through History and Nature',
    description:
      'Uncover the hidden wonders of Serbia. From the medieval fortresses along the Danube to the majestic Balkan mountains and the vibrant energy of Belgrade, witness a unique blend of East and West in ultra-high definition.',
    thumbnail: 'https://img.youtube.com/vi/j0oYoVh5C8E/maxresdefault.jpg',
    youtubeId: 'j0oYoVh5C8E',
    duration: '1h 05m',
    year: 2024,
    rating: 'G',
    genre: ['Documentary', 'Nature'],
    category: 'movie',
  },
  {
    id: 'siberia-4k',
    title: 'Siberia Russia in 4K - The Frozen Frontier',
    subtitle: 'Vast Wilderness and Untouched Beauty',
    description:
      'Venture into the heart of the Russian wilderness. Explore the deep blue crystal ice of Lake Baikal and the endless snow-covered taiga forest in this mesmerizing look at one of Earth\'s most remote and beautiful regions.',
    thumbnail: 'https://img.youtube.com/vi/IoyA63wsoSQ/maxresdefault.jpg',
    youtubeId: 'IoyA63wsoSQ',
    duration: '58m',
    year: 2024,
    rating: 'G',
    genre: ['Documentary', 'Wilderness'],
    category: 'movie',
  },
  {
    id: 'slovenia-4k',
    title: 'Slovenia in 4K - The Green Heart of Europe',
    subtitle: 'Lakes, Alps and Fairy Tale Towns',
    description:
      'Witness the stunning natural beauty of Slovenia. From the turquoise waters of Lake Bled and its iconic island church to the dramatic peaks of the Julian Alps, see why this small nation is a nature lover\'s ultimate paradise.',
    thumbnail: 'https://img.youtube.com/vi/dtv0jAc52j4/maxresdefault.jpg',
    youtubeId: 'dtv0jAc52j4',
    duration: '1h 15m',
    year: 2024,
    rating: 'G',
    genre: ['Documentary', 'Nature'],
    category: 'movie',
  },
  {
    id: 'poland-4k',
    title: 'Poland in 4K - A Legacy of Resilience',
    subtitle: 'Season 1: Historic Landscapes',
    description:
      'Travel through the historic royal streets of Krakow and the modern skyline of Warsaw. Discover Poland\'s diverse landscapes, from the sandy Baltic coast to the rugged Tatra mountains, in breathtaking cinematic quality.',
    thumbnail: 'https://img.youtube.com/vi/Ugi9AcEMzbk/maxresdefault.jpg',
    youtubeId: 'Ugi9AcEMzbk',
    duration: '6 Episodes',
    year: 2025,
    rating: 'TV-G',
    genre: ['Series', 'Culture'],
    category: 'series',
  },
  {
    id: 'bulgaria-4k',
    title: 'Bulgaria in 4K - Ancient Souls & Wild Peaks',
    subtitle: 'Season 1: Balkan Secrets',
    description:
      'Discover the ancient history and natural wonders of Bulgaria. Explore the spiritual Rila Monastery, the jagged Balkan mountains, and the golden sands of the Black Sea coast in this epic visual journey.',
    thumbnail: 'https://img.youtube.com/vi/jN3nuFzUhig/maxresdefault.jpg',
    youtubeId: 'jN3nuFzUhig',
    duration: '8 Episodes',
    year: 2025,
    rating: 'TV-G',
    genre: ['Series', 'Travel'],
    category: 'series',
  },
  {
    id: 'romania-4k',
    title: 'Romania in 4K - The Land of Legends',
    subtitle: 'Season 1: Carpathian Tales',
    description:
      'Step into the mythical landscapes of Romania. From the legendary gothic castles of Transylvania to the wild beauty of the Carpathian mountains and the pristine wilderness of the Danube Delta.',
    thumbnail: 'https://img.youtube.com/vi/IK8EDXB5jVc/maxresdefault.jpg',
    youtubeId: 'IK8EDXB5jVc',
    duration: '5 Episodes',
    year: 2025,
    rating: 'TV-G',
    genre: ['Series', 'History'],
    category: 'series',
  },
  {
    id: 'alaska-wildlife',
    title: 'Wild Alaska - The Last Frontier',
    subtitle: 'Majestic Creatures of the North',
    description:
      'Experience the raw beauty of Alaska. From grizzly bears fishing in salmon-rich rivers to bald eagles soaring over icy fjords, witness the ultimate struggle for survival in 8K resolution.',
    thumbnail: 'https://img.youtube.com/vi/CHSnz0bCaUk/hqdefault.jpg',
    youtubeId: 'CHSnz0bCaUk',
    duration: '1h 45m',
    year: 2024,
    rating: 'G',
    genre: ['Nature', 'Wildlife'],
    category: 'movie',
  },
  {
    id: 'amazon-animals',
    title: 'Amazon Jungle - The Green Labyrinth',
    subtitle: 'Hidden Life of the Rainforest',
    description:
      'Dive deep into the most biodiverse place on Earth. Discover jaguars, exotic birds, and rare reptiles in the heart of the Amazon. A breathtaking 8K journey through the world\'s largest tropical forest.',
    thumbnail: 'https://img.youtube.com/vi/T9mAbKqBT5Q/hqdefault.jpg',
    youtubeId: 'T9mAbKqBT5Q',
    duration: '2h 10m',
    year: 2024,
    rating: 'G',
    genre: ['Nature', 'Documentary'],
    category: 'movie',
  },
  {
    id: 'underwater-wonders',
    title: 'Ocean Depths - The Blue World',
    subtitle: 'Season 1: Coral Reef Kingdoms',
    description:
      'Explore the vibrant world beneath the waves. From majestic sea turtles to curious dolphins and the intricate life of coral reefs, experience the ocean\'s hidden wonders in 4K.',
    thumbnail: 'https://img.youtube.com/vi/B6CZ1dgc0Ac/hqdefault.jpg',
    youtubeId: 'B6CZ1dgc0Ac',
    duration: '10 Episodes',
    year: 2025,
    rating: 'TV-G',
    genre: ['Series', 'Nature'],
    category: 'series',
  },
  {
    id: 'africa-safari',
    title: 'Africa - The Great Migration',
    subtitle: 'Season 2: Plains of the Savanna',
    description:
      'Follow the epic journey of millions of wildebeests and zebras. Witness the power of the African lion and the grace of the cheetah in this stunning 4K wildlife series.',
    thumbnail: 'https://img.youtube.com/vi/a-zqWrQU9qs/hqdefault.jpg',
    youtubeId: 'a-zqWrQU9qs',
    duration: '12 Episodes',
    year: 2025,
    rating: 'TV-G',
    genre: ['Series', 'Wildlife'],
    category: 'series',
  },
  {
    id: 'nature-symphony',
    title: 'Nature\'s Symphony - A Visual Demo',
    subtitle: 'The Best of Earth in Ultra HD',
    description:
      'A masterfully curated collection of Earth\'s most beautiful animal and nature scenes. Designed to test the limits of display technology, witness nature in its purest form.',
    thumbnail: 'https://img.youtube.com/vi/9UeIfTsE2HQ/maxresdefault.jpg',
    youtubeId: '9UeIfTsE2HQ',
    duration: '45m',
    year: 2024,
    rating: 'G',
    genre: ['Nature', 'Cinematic'],
    category: 'movie',
  },
];

export const getVideosByCategory = (category: 'movie' | 'series') =>
  videos.filter((v) => v.category === category);

export const getRelatedVideos = (currentId: string) =>
  videos.filter((v) => v.id !== currentId).slice(0, 4);
