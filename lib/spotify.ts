// Spotify Web API client library
// Handles authentication, token management, and API calls

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

// Scopes needed for our stats app
export const SPOTIFY_SCOPES = [
  "user-top-read",           // Top tracks & artists
  "user-read-recently-played", // Recently played (for heatmap)
  "user-read-private",        // User profile
  "user-library-read",        // Saved tracks
  "user-read-email",          // Email for profile
].join(" ");

export type TimeRange = "short_term" | "medium_term" | "long_term";

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  short_term: "Last 4 Weeks",
  medium_term: "Last 6 Months",
  long_term: "All Time",
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string; height: number; width: number }[];
  followers: { total: number };
  country: string;
  product: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string; height: number; width: number }[];
  popularity: number;
  followers: { total: number };
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; height: number; width: number }[];
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: { spotify: string };
}

export interface SpotifyAudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  liveness: number;
  tempo: number;
  loudness: number;
}

export interface RecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

// ─── Auth Helpers ────────────────────────────────────────────────────────────

export function getSpotifyAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    scope: SPOTIFY_SCOPES,
    state,
    show_dialog: "true",
  });

  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  return response.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }>;
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  return response.json() as Promise<{
    access_token: string;
    expires_in: number;
    token_type: string;
    refresh_token?: string;
  }>;
}

// ─── API Client ──────────────────────────────────────────────────────────────

async function spotifyFetch<T>(
  endpoint: string,
  accessToken: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${SPOTIFY_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value)
    );
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Spotify API error (${response.status}): ${error}`);
  }

  return response.json() as Promise<T>;
}

// ─── API Methods ─────────────────────────────────────────────────────────────

export async function getUserProfile(accessToken: string): Promise<SpotifyUser> {
  return spotifyFetch<SpotifyUser>("/me", accessToken);
}

export async function getTopTracks(
  accessToken: string,
  timeRange: TimeRange = "medium_term",
  limit: number = 50
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{ items: SpotifyTrack[] }>(
    "/me/top/tracks",
    accessToken,
    { time_range: timeRange, limit: limit.toString() }
  );
  return data.items;
}

export async function getTopArtists(
  accessToken: string,
  timeRange: TimeRange = "medium_term",
  limit: number = 50
): Promise<SpotifyArtist[]> {
  const data = await spotifyFetch<{ items: SpotifyArtist[] }>(
    "/me/top/artists",
    accessToken,
    { time_range: timeRange, limit: limit.toString() }
  );
  return data.items || [];
}

export async function getRecentlyPlayed(
  accessToken: string,
  limit: number = 50
): Promise<RecentlyPlayedItem[]> {
  const data = await spotifyFetch<{ items: RecentlyPlayedItem[] }>(
    "/me/player/recently-played",
    accessToken,
    { limit: limit.toString() }
  );
  return data.items;
}

export async function getAudioFeatures(
  accessToken: string,
  trackIds: string[]
): Promise<SpotifyAudioFeatures[]> {
  // Spotify allows max 100 IDs per request
  const chunks: string[][] = [];
  for (let i = 0; i < trackIds.length; i += 100) {
    chunks.push(trackIds.slice(i, i + 100));
  }

  const results: SpotifyAudioFeatures[] = [];
  for (const chunk of chunks) {
    const data = await spotifyFetch<{ audio_features: (SpotifyAudioFeatures | null)[] }>(
      "/audio-features",
      accessToken,
      { ids: chunk.join(",") }
    );
    results.push(...data.audio_features.filter((f): f is SpotifyAudioFeatures => f !== null));
  }

  return results;
}

// ─── Derived Analytics ───────────────────────────────────────────────────────

export function calculateGenreDistribution(
  artists: SpotifyArtist[],
  tracks?: SpotifyTrack[]
): { genre: string; count: number; percentage: number }[] {
  const safeArtists = Array.isArray(artists) ? artists : [];
  const genreCounts: Record<string, number> = {};
  
  // Try artist genres first
  safeArtists.forEach((artist) => {
    (artist.genres || []).forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

  // If no genres found from artists, infer from track/artist names
  if (Object.keys(genreCounts).length === 0 && tracks && tracks.length > 0) {
    const inferredGenres = inferGenresFromTracks(tracks, safeArtists);
    inferredGenres.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  }

  const total = Object.values(genreCounts).reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  return Object.entries(genreCounts)
    .map(([genre, count]) => ({
      genre,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

// Genre inference from track names and artist names when Spotify API doesn't provide genres
function inferGenresFromTracks(tracks: SpotifyTrack[], artists: SpotifyArtist[]): string[] {
  const genres: string[] = [];
  // Use both top artist names AND artist names embedded in tracks
  const topArtistNames = artists.map(a => a.name.toLowerCase());
  const trackArtistNames = tracks.flatMap(t => (t.artists || []).map(a => a.name.toLowerCase()));
  const allArtistNames = [...new Set([...topArtistNames, ...trackArtistNames])];
  const allTrackNames = tracks.map(t => (t.name || "").toLowerCase());
  const allAlbumNames = tracks.map(t => t.album?.name?.toLowerCase() || "");
  const combined = [...allArtistNames, ...allTrackNames, ...allAlbumNames].join(" ");

  // Genre keyword mapping — maps patterns in artist/track names to genre labels
  const genreRules: [RegExp, string][] = [
    // Pop
    [/taylor swift|ariana grande|dua lipa|sabrina carpenter|billie eilish|olivia rodrigo|selena gomez|justin bieber|ed sheeran|shawn mendes|charlie puth|benson boone|gracie abrams|chappell roan/, "pop"],
    // Hip-Hop / Rap
    [/drake|kendrick|kanye|travis scott|21 savage|metro boomin|future|lil|j\. cole|eminem|post malone|juice wrld|xxxtentacion|nf\b|youngboy/, "hip hop"],
    [/rap|trap|drill/, "rap"],
    // R&B
    [/the weeknd|sza|frank ocean|daniel caesar|khalid|h\.e\.r\.|bryson tiller|brent faiyaz|summer walker|6lack/, "r&b"],
    // Rock
    [/arctic monkeys|imagine dragons|linkin park|green day|nirvana|foo fighters|queen|acdc|metallica|guns n|led zeppelin|pink floyd|radiohead|coldplay/, "rock"],
    [/indie|arctic|tame impala|glass animals|wallows|the neighbourhood|mac demarco/, "indie"],
    // Electronic
    [/martin garrix|avicii|marshmello|deadmau5|skrillex|zedd|alan walker|kygo|tiesto|david guetta|calvin harris|the chainsmokers/, "electronic"],
    [/edm|dubstep|house music|trance/, "electronic"],
    // K-Pop
    [/bts\b|blackpink|stray kids|enhypen|twice|aespa|itzy|nct|seventeen|txt\b|ateez|le sserafim|ive\b|newjeans/, "k-pop"],
    // Latin
    [/bad bunny|j balvin|ozuna|daddy yankee|shakira|rosalia|maluma|karol g|rauw alejandro|peso pluma|feid/, "latin"],
    [/reggaeton|bachata|salsa/, "latin"],
    // Country
    [/morgan wallen|luke combs|chris stapleton|zach bryan|hardy|jason aldean|luke bryan/, "country"],
    // Classical / Jazz
    [/beethoven|mozart|chopin|debussy|tchaikovsky|vivaldi|bach\b/, "classical"],
    [/miles davis|john coltrane|louis armstrong|ella fitzgerald|norah jones/, "jazz"],
    // Bollywood / Indian
    [/arijit|pritam|shreya ghoshal|atif aslam|a\.r\. rahman|vishal|neha kakkar|badshah|honey singh|ap dhillon|diljit|bollywood|desi|bhangra/, "bollywood"],
    [/punjabi|hindi|tamil|telugu/, "indian"],
    // Alt / Indie
    [/lorde|phoebe bridgers|mitski|boygenius|japanese breakfast|beabadoobee|clairo|faye webster/, "indie pop"],
    // Metal
    [/slipknot|bring me the horizon|a day to remember|avenged sevenfold|five finger death punch/, "metal"],
    // Soul / Funk
    [/stevie wonder|marvin gaye|aretha franklin|james brown|earth wind|doja cat/, "soul"],
    // Folk
    [/mumford|fleet foxes|bon iver|iron \u0026 wine|jose gonzalez|vance joy|hozier/, "folk"],
    // Ambient / Chill
    [/lo-?fi|chill|ambient|sleep|meditation|study/, "lo-fi"],
    // Anime
    [/anime|openin|naruto|one piece|attack on titan|jujutsu/, "anime"],
    // Art pop / Experimental
    [/kate bush|bjork|fka twigs|st\. vincent|aurora|lana del rey|florence|weyes blood|soap\u0026skin|soap&skin/, "art pop"],
    // French pop
    [/indila|stromae|edith piaf|zaz\b|aya nakamura|angele/, "french pop"],
    // Film / Soundtrack
    [/soundtrack|score|hans zimmer|ennio|original motion|theme from/, "soundtrack"],
    // Retro / Vintage
    [/patience \u0026 prudence|patience & prudence|doris day|frank sinatra|dean martin|nat king|ella fitzgerald|oldies/, "retro"],
  ];

  // Score each genre
  for (const [pattern, genre] of genreRules) {
    if (pattern.test(combined)) {
      // Add multiple times based on how many artists/tracks match
      const matchCount = allArtistNames.filter(n => pattern.test(n)).length
        + allTrackNames.filter(n => pattern.test(n)).length * 0.5;
      for (let i = 0; i < Math.max(1, Math.round(matchCount)); i++) {
        genres.push(genre);
      }
    }
  }

  // Always produce at least some results based on popularity
  if (genres.length === 0) {
    const avgPopularity = tracks.reduce((sum, t) => sum + (t.popularity || 0), 0) / (tracks.length || 1);
    if (avgPopularity > 70) { genres.push("pop", "pop", "mainstream"); }
    else if (avgPopularity > 50) { genres.push("pop", "indie pop"); }
    else if (avgPopularity > 30) { genres.push("indie", "alternative", "underground"); }
    else { genres.push("underground", "niche", "experimental"); }
  }

  return genres;
}

export function calculateGenreDiversity(artists: SpotifyArtist[]): number {
  const genres = calculateGenreDistribution(artists);
  if (genres.length === 0) return 0;

  // Shannon entropy normalized to 0-100
  const total = genres.reduce((sum, g) => sum + g.count, 0);
  const entropy = genres.reduce((sum, g) => {
    const p = g.count / total;
    return sum - (p > 0 ? p * Math.log2(p) : 0);
  }, 0);

  const maxEntropy = Math.log2(genres.length);
  return maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 100) : 0;
}

export function calculateMoodScore(
  features: SpotifyAudioFeatures[],
  genresFallback?: string[]
): {
  overall: number;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  label: string;
} {
  if (features.length === 0) {
    // Estimate mood from genres if audio features unavailable
    return estimateMoodFromGenres(genresFallback || []);
  }

  const avg = (key: keyof SpotifyAudioFeatures) =>
    Math.round(
      (features.reduce((sum, f) => sum + (f[key] as number), 0) / features.length) * 100
    );

  const valence = avg("valence");
  const energy = avg("energy");
  const danceability = avg("danceability");
  const acousticness = avg("acousticness");
  const instrumentalness = avg("instrumentalness");
  const overall = Math.round((valence * 0.4 + energy * 0.3 + danceability * 0.3));

  // Determine mood label
  let label: string;
  if (valence > 65 && energy > 65) label = "Euphoric";
  else if (valence > 65 && energy <= 65) label = "Chill & Happy";
  else if (valence <= 35 && energy > 65) label = "Intense";
  else if (valence <= 35 && energy <= 35) label = "Melancholic";
  else if (energy > 70) label = "Energetic";
  else if (acousticness > 60) label = "Acoustic Soul";
  else if (danceability > 70) label = "Groovy";
  else label = "Balanced";

  return { overall, danceability, energy, valence, acousticness, instrumentalness, label };
}

export function buildListeningHeatmap(
  recentlyPlayed: RecentlyPlayedItem[]
): number[][] {
  // 7 days x 24 hours grid
  const heatmap: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0)
  );

  recentlyPlayed.forEach((item) => {
    const date = new Date(item.played_at);
    const day = date.getDay(); // 0 = Sunday
    const hour = date.getHours();
    heatmap[day][hour]++;
  });

  return heatmap;
}

function estimateMoodFromGenres(genres: string[]): {
  overall: number;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  label: string;
} {
  if (genres.length === 0) {
    return {
      overall: 50, danceability: 50, energy: 50, valence: 50,
      acousticness: 30, instrumentalness: 10, label: "Balanced",
    };
  }

  const all = genres.map(g => g.toLowerCase()).join(" ");

  // Heuristic scoring based on genre keywords
  let danceability = 50, energy = 50, valence = 50, acousticness = 30, instrumentalness = 10;

  // High energy genres
  if (/metal|punk|hardcore|thrash|death|grindcore/.test(all)) { energy += 30; valence -= 15; }
  if (/edm|electronic|techno|house|trance|dubstep|drum and bass|dnb/.test(all)) { energy += 25; danceability += 25; }
  if (/rock|alternative|grunge|indie rock/.test(all)) { energy += 15; }

  // Dance genres
  if (/pop|dance|disco|funk|latin|reggaeton|salsa/.test(all)) { danceability += 20; valence += 15; }
  if (/hip hop|rap|trap/.test(all)) { danceability += 15; energy += 10; }
  if (/r&b|soul|neo soul/.test(all)) { danceability += 10; valence += 10; }

  // Happy/positive genres
  if (/pop|k-pop|j-pop|sunshine|happy/.test(all)) { valence += 20; }
  if (/reggae|ska|tropical/.test(all)) { valence += 15; acousticness += 10; }

  // Sad/mellow genres
  if (/sad|emo|shoegaze|slowcore|doom/.test(all)) { valence -= 20; energy -= 10; }
  if (/ambient|chill|lo-fi|lofi|downtempo/.test(all)) { energy -= 20; acousticness += 15; valence -= 5; }

  // Acoustic genres
  if (/acoustic|folk|singer-songwriter|country|bluegrass/.test(all)) { acousticness += 30; energy -= 10; }
  if (/classical|piano|orchestra|chamber/.test(all)) { acousticness += 25; instrumentalness += 30; energy -= 15; }
  if (/jazz|bossa nova|smooth jazz/.test(all)) { acousticness += 20; instrumentalness += 15; }

  // Instrumental genres
  if (/instrumental|post-rock|soundtrack|score|new age/.test(all)) { instrumentalness += 25; }

  // Bollywood / Indian
  if (/bollywood|desi|indian|filmi|bhangra/.test(all)) { danceability += 15; valence += 10; energy += 10; }

  // Clamp values
  const clamp = (v: number) => Math.max(5, Math.min(95, v));
  danceability = clamp(danceability);
  energy = clamp(energy);
  valence = clamp(valence);
  acousticness = clamp(acousticness);
  instrumentalness = clamp(instrumentalness);

  const overall = Math.round(valence * 0.4 + energy * 0.3 + danceability * 0.3);

  let label: string;
  if (valence > 65 && energy > 65) label = "Euphoric";
  else if (valence > 65 && energy <= 65) label = "Chill & Happy";
  else if (valence <= 35 && energy > 65) label = "Intense";
  else if (valence <= 35 && energy <= 35) label = "Melancholic";
  else if (energy > 70) label = "Energetic";
  else if (acousticness > 60) label = "Acoustic Soul";
  else if (danceability > 70) label = "Groovy";
  else label = "Balanced";

  return { overall, danceability, energy, valence, acousticness, instrumentalness, label };
}

export function getPersonalityType(
  genreDiversity: number,
  moodLabel: string,
  heatmap: number[][],
  topArtists: SpotifyArtist[]
): { type: string; description: string; emoji: string } {
  // Check listening time patterns
  const nightHours = heatmap.reduce(
    (sum, day) => sum + day.slice(22, 24).reduce((a, b) => a + b, 0) + day.slice(0, 5).reduce((a, b) => a + b, 0),
    0
  );
  const morningHours = heatmap.reduce(
    (sum, day) => sum + day.slice(5, 10).reduce((a, b) => a + b, 0),
    0
  );
  const totalListens = heatmap.reduce(
    (sum, day) => sum + day.reduce((a, b) => a + b, 0),
    0
  );

  if (genreDiversity > 75) {
    return {
      type: "The Explorer",
      description: "You're always discovering new sounds and genres. Your taste knows no boundaries.",
      emoji: "🌍",
    };
  }

  if (genreDiversity < 30 && topArtists.length > 0) {
    return {
      type: "The Loyalist",
      description: "You know what you love and you stick with it. Deep appreciation for your favorite artists.",
      emoji: "💎",
    };
  }

  if (totalListens > 0 && nightHours / totalListens > 0.4) {
    return {
      type: "The Night Owl",
      description: "The night is your soundtrack. You come alive when the world goes quiet.",
      emoji: "🦉",
    };
  }

  if (totalListens > 0 && morningHours / totalListens > 0.4) {
    return {
      type: "The Early Bird",
      description: "Music fuels your mornings. You start every day with the perfect playlist.",
      emoji: "🌅",
    };
  }

  if (moodLabel === "Euphoric" || moodLabel === "Energetic") {
    return {
      type: "The Hype Machine",
      description: "High energy is your default. You live for the drops, the builds, and the bass.",
      emoji: "⚡",
    };
  }

  if (moodLabel === "Melancholic" || moodLabel === "Acoustic Soul") {
    return {
      type: "The Deep Feeler",
      description: "Music is therapy. You're drawn to emotional depth and raw, honest sounds.",
      emoji: "🎭",
    };
  }

  if (moodLabel === "Groovy") {
    return {
      type: "The Groove Master",
      description: "If it's got a beat, you're moving. Rhythm is in your DNA.",
      emoji: "🕺",
    };
  }

  return {
    type: "The Eclectic",
    description: "A little bit of everything — your taste defies easy categorization.",
    emoji: "🎵",
  };
}
