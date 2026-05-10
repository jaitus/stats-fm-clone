// Demo data for when Spotify API is unavailable
// Provides realistic mock data so all dashboard tabs render properly

import type { SpotifyUser, SpotifyArtist, SpotifyTrack, SpotifyAudioFeatures, RecentlyPlayedItem } from "./spotify";

const img = (seed: string) => `https://picsum.photos/seed/${seed}/300/300`;

export const DEMO_PROFILE: SpotifyUser = {
  id: "demo_user",
  display_name: "Demo User",
  email: "demo@statsfm.app",
  images: [{ url: img("profile"), height: 300, width: 300 }],
  followers: { total: 247 },
  country: "IN",
  product: "premium",
};

const artistData: [string, string[], number][] = [
  ["Sabrina Carpenter", ["pop", "dance pop"], 88],
  ["The Weeknd", ["canadian pop", "r&b", "pop"], 95],
  ["Lil Nas X", ["pop rap", "hip hop", "lgbtq+ hip hop"], 85],
  ["Arctic Monkeys", ["indie rock", "rock", "alternative rock"], 87],
  ["Dua Lipa", ["pop", "dance pop", "uk pop"], 90],
  ["Tame Impala", ["psychedelic rock", "indie rock", "neo-psychedelia"], 82],
  ["Billie Eilish", ["pop", "electropop", "art pop"], 92],
  ["Kendrick Lamar", ["hip hop", "west coast rap", "conscious hip hop"], 91],
  ["Indila", ["french pop", "chanson"], 72],
  ["Kate Bush", ["art pop", "art rock", "new wave"], 76],
  ["Taylor Swift", ["pop", "country pop"], 98],
  ["Bad Bunny", ["reggaeton", "latin trap", "latin"], 94],
  ["Radiohead", ["alternative rock", "art rock", "experimental"], 80],
  ["SZA", ["r&b", "neo soul", "pop"], 89],
  ["Frank Ocean", ["r&b", "alternative r&b", "neo soul"], 83],
  ["Daft Punk", ["electronic", "french house", "electro"], 79],
  ["Arijit Singh", ["bollywood", "filmi", "indian pop"], 86],
  ["Hozier", ["folk", "indie folk", "soul"], 81],
  ["Glass Animals", ["indie pop", "psychedelic pop", "electronica"], 78],
  ["Lana Del Rey", ["art pop", "dream pop", "indie pop"], 84],
  ["Tyler, The Creator", ["hip hop", "alternative hip hop", "neo soul"], 88],
  ["Doja Cat", ["pop", "rap", "r&b"], 90],
  ["Mac DeMarco", ["indie rock", "lo-fi", "slacker rock"], 71],
  ["Stromae", ["french pop", "electronic", "hip hop"], 73],
  ["AP Dhillon", ["punjabi", "desi hip hop", "indian pop"], 77],
];

export const DEMO_ARTISTS: SpotifyArtist[] = artistData.map(([name, genres, popularity], i) => ({
  id: `artist_${i}`,
  name,
  genres,
  images: [{ url: img(`artist-${i}`), height: 300, width: 300 }],
  popularity,
  followers: { total: Math.floor(1000000 + Math.random() * 50000000) },
  external_urls: { spotify: `https://open.spotify.com/artist/demo${i}` },
}));

const trackData: [string, string, string, number, number][] = [
  ["Espresso", "Sabrina Carpenter", "Short n' Sweet", 214000, 92],
  ["Blinding Lights", "The Weeknd", "After Hours", 200000, 95],
  ["MONTERO", "Lil Nas X", "MONTERO", 137000, 88],
  ["505", "Arctic Monkeys", "Favourite Worst Nightmare", 254000, 86],
  ["Levitating", "Dua Lipa", "Future Nostalgia", 203000, 91],
  ["The Less I Know The Better", "Tame Impala", "Currents", 216000, 87],
  ["lovely", "Billie Eilish", "WHEN WE ALL FALL ASLEEP", 200000, 90],
  ["HUMBLE.", "Kendrick Lamar", "DAMN.", 177000, 89],
  ["Love Story", "Indila", "Mini World", 316000, 74],
  ["Running Up That Hill", "Kate Bush", "Hounds Of Love", 298000, 85],
  ["Anti-Hero", "Taylor Swift", "Midnights", 200000, 93],
  ["Dakiti", "Bad Bunny", "El Último Tour Del Mundo", 205000, 88],
  ["Creep", "Radiohead", "Pablo Honey", 235000, 82],
  ["Kill Bill", "SZA", "SOS", 194000, 90],
  ["Nights", "Frank Ocean", "Blonde", 304000, 84],
  ["Get Lucky", "Daft Punk", "Random Access Memories", 369000, 86],
  ["Tum Hi Ho", "Arijit Singh", "Aashiqui 2", 264000, 83],
  ["Take Me to Church", "Hozier", "Hozier", 241000, 88],
  ["Heat Waves", "Glass Animals", "Dreamland", 238000, 91],
  ["Summertime Sadness", "Lana Del Rey", "Born to Die", 265000, 87],
  ["See You Again", "Tyler, The Creator", "Flower Boy", 181000, 85],
  ["Say So", "Doja Cat", "Hot Pink", 234000, 89],
  ["Chamber of Reflection", "Mac DeMarco", "Salad Days", 215000, 73],
  ["Papaoutai", "Stromae", "Racine carrée", 234000, 78],
  ["Excuses", "AP Dhillon", "Hidden Gems", 199000, 79],
  ["Starboy", "The Weeknd", "Starboy", 230000, 93],
  ["Cruel Summer", "Taylor Swift", "Lover", 178000, 92],
  ["Tere Vaaste", "Arijit Singh", "Zara Hatke Zara Bachke", 247000, 81],
  ["Electric Feel", "MGMT", "Oracular Spectacular", 229000, 80],
  ["Do I Wanna Know?", "Arctic Monkeys", "AM", 272000, 88],
  ["Bohemian Rhapsody", "Queen", "A Night at the Opera", 354000, 84],
  ["Redbone", "Childish Gambino", "Awaken, My Love!", 327000, 82],
  ["Sweater Weather", "The Neighbourhood", "I Love You.", 240000, 89],
  ["Somebody That I Used To Know", "Gotye", "Making Mirrors", 244000, 83],
  ["Feel Good Inc.", "Gorillaz", "Demon Days", 222000, 86],
  ["Ivy", "Frank Ocean", "Blonde", 247000, 81],
  ["Naina", "Arijit Singh", "Dangal", 291000, 78],
  ["Brown Munde", "AP Dhillon", "Hidden Gems", 211000, 80],
  ["Lose Yourself", "Eminem", "8 Mile Soundtrack", 326000, 87],
  ["bad guy", "Billie Eilish", "WHEN WE ALL FALL ASLEEP", 194000, 91],
  ["Dil Ibaadat", "KK", "Tum Mile", 337000, 76],
  ["Drivers License", "Olivia Rodrigo", "SOUR", 244000, 90],
  ["Sunflower", "Post Malone", "Spider-Man: Into the Spider-Verse", 158000, 92],
  ["Shape of You", "Ed Sheeran", "÷", 233000, 94],
  ["Tera Ban Jaunga", "Akhil Sachdeva", "Kabir Singh", 252000, 77],
  ["Senorita", "Shawn Mendes", "Shawn Mendes", 191000, 88],
  ["Chaleya", "Arijit Singh", "Jawan", 258000, 82],
  ["Someone Like You", "Adele", "21", 285000, 85],
  ["Watermelon Sugar", "Harry Styles", "Fine Line", 174000, 90],
  ["Let Her Go", "Passenger", "All the Little Lights", 253000, 84],
];

export const DEMO_TRACKS: SpotifyTrack[] = trackData.map(([name, artist, album, duration, popularity], i) => ({
  id: `track_${i}`,
  name,
  artists: [{ id: `artist_t${i}`, name: artist }],
  album: {
    id: `album_${i}`,
    name: album,
    images: [{ url: img(`album-${i}`), height: 300, width: 300 }],
    release_date: `202${Math.floor(Math.random() * 5)}-0${1 + Math.floor(Math.random() * 9)}-15`,
  },
  duration_ms: duration,
  popularity,
  preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  external_urls: { spotify: `https://open.spotify.com/track/demo${i}` },
}));

export const DEMO_AUDIO_FEATURES: SpotifyAudioFeatures[] = DEMO_TRACKS.map((t, i) => ({
  id: t.id,
  danceability: 0.4 + Math.random() * 0.5,
  energy: 0.3 + Math.random() * 0.6,
  valence: 0.2 + Math.random() * 0.6,
  acousticness: 0.05 + Math.random() * 0.5,
  instrumentalness: Math.random() * 0.3,
  speechiness: 0.03 + Math.random() * 0.2,
  liveness: 0.05 + Math.random() * 0.3,
  tempo: 80 + Math.random() * 80,
  loudness: -12 + Math.random() * 8,
}));

// Generate recently played from the last 7 days
export const DEMO_RECENTLY_PLAYED: RecentlyPlayedItem[] = Array.from({ length: 50 }, (_, i) => {
  const hoursAgo = Math.floor(Math.random() * 168); // last 7 days
  const played = new Date(Date.now() - hoursAgo * 3600000);
  return {
    track: DEMO_TRACKS[i % DEMO_TRACKS.length],
    played_at: played.toISOString(),
  };
}).sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime());
