# stats.fm Clone — Spotify Listening Analytics Dashboard

A premium, real-time Spotify analytics dashboard that visualizes your listening patterns, genre preferences, mood profile, and musical personality. Built with Next.js 16, TypeScript, and the Spotify Web API.

![Dashboard Preview](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Spotify](https://img.shields.io/badge/Spotify-API-1DB954?logo=spotify)

## 🎬 Demo Walkthrough

> **[Watch the Loom demo →](#)** _(link to be added)_

## ✨ Features

### Core Dashboard
- **Top Tracks** — Your 50 most-played tracks with album art, duration, popularity bars, and 30-second audio previews
- **Top Artists** — Grid view with genre tags, popularity scores, and Spotify profile links
- **Genre Analysis** — Horizontal bar chart with genre diversity scoring and automatic genre inference
- **Listening Heatmap** — Hour-by-day activity visualization showing when you listen most
- **Mood Analysis** — Radar chart profiling danceability, energy, valence, acousticness, and instrumentalness
- **Personality Card** — AI-generated listener personality type based on your patterns

### Smart Engineering
- **Server-side response caching** (10-min TTL) prevents redundant Spotify API calls
- **Rate limit circuit breaker** — detects 429 errors, reads `Retry-After` headers, and falls back to demo data automatically
- **Genre inference engine** — keyword-based + popularity heuristics when Spotify genre data is unavailable
- **Seamless demo mode** — full-featured mock data fallback when no auth token is present
- **Time range switching** — toggle between Last 4 Weeks, Last 6 Months, and All Time views

## 🏗️ Architecture

```
app/
├── api/
│   ├── auth/spotify/         # OAuth flow (authorize, callback, disconnect)
│   └── spotify/
│       ├── data/route.ts     # Cached API proxy with circuit breaker
│       └── refresh/route.ts  # Token refresh endpoint
├── dashboard/page.tsx        # Main dashboard (client component)
└── page.tsx                  # Landing page

components/dashboard/
├── top-tracks.tsx            # Track list with audio previews
├── top-artists.tsx           # Artist grid with genre tags
├── top-genres.tsx            # Genre bar chart + diversity score
├── listening-heatmap.tsx     # Hour×Day activity heatmap
├── mood-analysis.tsx         # Radar chart + feature breakdown
├── personality-card.tsx      # Generated personality type
└── dashboard-skeleton.tsx    # Loading state

lib/
├── spotify.ts                # Spotify API client, types, analytics functions
└── demo-data.ts              # Realistic mock data (50 tracks, 25 artists)

hooks/
└── use-spotify-data.ts       # Client-side data fetching with auth fallback
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- [pnpm](https://pnpm.io/)

### Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/jaitus/stats-fm-clone.git
   cd stats-fm-clone
   pnpm install
   ```

2. **Configure Spotify credentials**
   ```bash
   cp .env.example .env.local
   ```
   
   Get credentials from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard):
   ```env
   SPOTIFY_CLIENT_ID="your_client_id"
   SPOTIFY_CLIENT_SECRET="your_client_secret"
   SPOTIFY_REDIRECT_URI="http://127.0.0.1:3000/api/auth/spotify/callback"
   ```

3. **Run**
   ```bash
   pnpm dev
   ```

4. **Open** [http://127.0.0.1:3000](http://127.0.0.1:3000)

> **Note:** The app works without Spotify credentials — it automatically falls back to demo mode with realistic mock data.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 + custom design system |
| Charts | Recharts |
| Icons | Lucide React |
| Auth | Spotify OAuth 2.0 (PKCE) |
| API | Spotify Web API |

## 🧠 Key Technical Decisions

### Rate Limit Resilience
Spotify's Development Mode has aggressive rate limits. The app handles this with a three-layer strategy:
1. **Server-side cache** — 10-minute TTL on all API responses, keyed by endpoint + time range
2. **Circuit breaker** — On 429 response, blocks all Spotify calls for the backoff period and serves cached/demo data
3. **Smart retry** — Reads `Retry-After` header; only retries if wait is ≤10 seconds

### Genre Inference
Spotify doesn't always return genre data for artists. The app uses a fallback engine:
1. Checks artist `genres[]` array from the API
2. Falls back to keyword-matching against artist/track/album names
3. Final fallback: popularity-based categorization

### Demo Mode
When no Spotify token is available (or during rate limiting), the API transparently serves realistic mock data — 50 tracks across pop, hip-hop, indie, Bollywood, and electronic, with 25 artists and full audio feature profiles. The client code doesn't need to know the difference.

## 📋 What I'd Improve With More Time

- **Persistent caching** — Use Redis or SQLite instead of in-memory `Map` so cache survives server restarts
- **Track comparison** — Side-by-side comparison of listening patterns across time ranges
- **Social sharing** — Generate shareable stat cards (like Spotify Wrapped)
- **Playlist generation** — Create Spotify playlists from mood/genre filters
- **Mobile responsive** — Optimize touch interactions for mobile browsers
- **E2E tests** — Playwright tests for the full OAuth → dashboard flow

## 📁 Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build (type-checked)
pnpm lint         # Run ESLint
```
