"use client";

import type { SpotifyTrack } from "@/lib/spotify";
import Image from "next/image";
import { ExternalLink, Clock } from "lucide-react";

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface TopTracksProps {
  tracks: SpotifyTrack[];
  isLoading: boolean;
}

export function TopTracks({ tracks, isLoading }: TopTracksProps) {
  if (isLoading && tracks.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 skeleton-shimmer h-20" />
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <p className="text-muted-foreground">No tracks data available yet. Listen to more music on Spotify!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 stagger-children">
      {tracks.map((track, index) => (
        <a
          key={track.id}
          href={track.external_urls?.spotify || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group glass-card rounded-xl p-3 sm:p-4 flex items-center gap-4 hover:border-primary/20 transition-all duration-200 hover:bg-white/[0.02]"
        >
          {/* Rank */}
          <div className="w-8 text-center flex-shrink-0">
            <span
              className={`text-sm font-bold ${
                index < 3 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {index + 1}
            </span>
          </div>

          {/* Album Art */}
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
            {track.album?.images?.[0]?.url && (
              <Image
                src={track.album.images[0].url}
                alt={track.album.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="48px"
              />
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {track.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {(track.artists || []).map((a) => a.name).join(", ")}
            </p>
          </div>

          {/* Album Name */}
          <p className="text-xs text-muted-foreground truncate max-w-[150px] hidden md:block">
            {track.album.name}
          </p>

          {/* Duration */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 hidden sm:flex">
            <Clock className="w-3 h-3" />
            {formatDuration(track.duration_ms)}
          </div>

          {/* Popularity */}
          <div className="w-16 flex-shrink-0 hidden lg:block">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-full transition-all duration-500"
                style={{ width: `${track.popularity}%` }}
              />
            </div>
          </div>

          {/* External Link */}
          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </a>
      ))}
    </div>
  );
}
