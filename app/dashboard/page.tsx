"use client";

import { useEffect, useState, useCallback } from "react";
import { useSpotifyData } from "@/hooks/use-spotify-data";
import {
  calculateGenreDistribution,
  calculateGenreDiversity,
  calculateMoodScore,
  buildListeningHeatmap,
  getPersonalityType,
  type SpotifyUser,
  type SpotifyTrack,
  type SpotifyArtist,
  type SpotifyAudioFeatures,
  type RecentlyPlayedItem,
  type TimeRange,
  TIME_RANGE_LABELS,
} from "@/lib/spotify";
import { TopTracks } from "@/components/dashboard/top-tracks";
import { TopArtists } from "@/components/dashboard/top-artists";
import { TopGenres } from "@/components/dashboard/top-genres";
import { ListeningHeatmap } from "@/components/dashboard/listening-heatmap";
import { MoodAnalysis } from "@/components/dashboard/mood-analysis";
import { PersonalityCard } from "@/components/dashboard/personality-card";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import {
  Music2,
  BarChart3,
  Clock,
  Palette,
  Users,
  Disc3,
  LogOut,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Tab = "tracks" | "artists" | "genres" | "heatmap" | "mood" | "personality";

export default function DashboardPage() {
  const {
    fetchProfile,
    fetchTopTracks,
    fetchTopArtists,
    fetchRecentlyPlayed,
    fetchAudioFeatures,
  } = useSpotifyData();

  const [profile, setProfile] = useState<SpotifyUser | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>([]);
  const [audioFeatures, setAudioFeatures] = useState<SpotifyAudioFeatures[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("tracks");
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const loadData = useCallback(
    async (range: TimeRange) => {
      setIsLoading(true);
      try {
        const [profileData, tracksData, artistsData, recentData] =
          await Promise.all([
            !initialLoadDone ? fetchProfile() : Promise.resolve(profile),
            fetchTopTracks(range),
            fetchTopArtists(range),
            !initialLoadDone ? fetchRecentlyPlayed() : Promise.resolve(recentlyPlayed),
          ]);

        if (profileData) setProfile(profileData);
        setTopTracks(tracksData);
        setTopArtists(artistsData);
        if (recentData && Array.isArray(recentData)) setRecentlyPlayed(recentData);

        // Fetch audio features for top tracks
        if (tracksData.length > 0) {
          const trackIds = tracksData.map((t) => t.id);
          const features = await fetchAudioFeatures(trackIds);
          setAudioFeatures(features);
        }

        setInitialLoadDone(true);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProfile, fetchTopTracks, fetchTopArtists, fetchRecentlyPlayed, fetchAudioFeatures, initialLoadDone, profile, recentlyPlayed]
  );

  useEffect(() => {
    loadData(timeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // Derived data
  const genreDistribution = calculateGenreDistribution(topArtists);
  const genreDiversity = calculateGenreDiversity(topArtists);
  const moodScore = calculateMoodScore(audioFeatures);
  const heatmapData = buildListeningHeatmap(recentlyPlayed);
  const personality = getPersonalityType(
    genreDiversity,
    moodScore.label,
    heatmapData,
    topArtists
  );

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "tracks", label: "Top Tracks", icon: Disc3 },
    { id: "artists", label: "Top Artists", icon: Users },
    { id: "genres", label: "Genres", icon: BarChart3 },
    { id: "heatmap", label: "Heatmap", icon: Clock },
    { id: "mood", label: "Mood", icon: Palette },
    { id: "personality", label: "Personality", icon: Sparkles },
  ];

  if (isLoading && !initialLoadDone) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Music2 className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-base tracking-tight">
                stats.<span className="text-primary">fm</span>
              </span>
            </Link>

            {/* User Profile */}
            {profile && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  {profile.images?.[0]?.url ? (
                    <Image
                      src={profile.images[0].url}
                      alt={profile.display_name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:block">
                    {profile.display_name}
                  </span>
                </div>
                <form action="/api/auth/spotify/disconnect" method="POST">
                  <button
                    type="submit"
                    className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    title="Disconnect Spotify"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Top Artist",
              value: topArtists[0]?.name || "—",
              icon: Users,
            },
            {
              label: "Top Track",
              value: topTracks[0]?.name || "—",
              icon: Disc3,
            },
            {
              label: "Genre Diversity",
              value: `${genreDiversity}%`,
              icon: BarChart3,
            },
            {
              label: "Mood",
              value: moodScore.label,
              icon: Palette,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-xl p-4 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="font-bold text-sm truncate mt-0.5">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Time Range Selector + Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-secondary/50 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Time Range */}
          {(activeTab === "tracks" || activeTab === "artists" || activeTab === "genres" || activeTab === "mood") && (
            <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
              {(Object.entries(TIME_RANGE_LABELS) as [TimeRange, string][]).map(
                ([range, label]) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      timeRange === range
                        ? "bg-card text-foreground shadow-sm border border-border/50"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="fade-in-up" key={`${activeTab}-${timeRange}`}>
          {activeTab === "tracks" && (
            <TopTracks tracks={topTracks} isLoading={isLoading} />
          )}
          {activeTab === "artists" && (
            <TopArtists artists={topArtists} isLoading={isLoading} />
          )}
          {activeTab === "genres" && (
            <TopGenres
              genres={genreDistribution}
              diversity={genreDiversity}
              isLoading={isLoading}
            />
          )}
          {activeTab === "heatmap" && (
            <ListeningHeatmap data={heatmapData} isLoading={isLoading} />
          )}
          {activeTab === "mood" && (
            <MoodAnalysis mood={moodScore} isLoading={isLoading} />
          )}
          {activeTab === "personality" && (
            <PersonalityCard
              personality={personality}
              profile={profile}
              topArtists={topArtists.slice(0, 3)}
              topTracks={topTracks.slice(0, 3)}
              topGenre={genreDistribution[0]?.genre || "Unknown"}
              moodLabel={moodScore.label}
              genreDiversity={genreDiversity}
            />
          )}
        </div>
      </div>
    </div>
  );
}
