"use client";

import type { SpotifyArtist } from "@/lib/spotify";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

interface TopArtistsProps {
  artists: SpotifyArtist[];
  isLoading: boolean;
}

export function TopArtists({ artists, isLoading }: TopArtistsProps) {
  if (isLoading && artists.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 skeleton-shimmer h-56" />
        ))}
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <p className="text-muted-foreground">No artists data available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 stagger-children">
      {artists.map((artist, index) => (
        <a
          key={artist.id}
          href={artist.external_urls?.spotify || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group glass-card rounded-2xl p-4 text-center hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 relative"
        >
          {/* Rank Badge */}
          <div
            className={`absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              index < 3
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {index + 1}
          </div>

          {/* Artist Image */}
          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 ring-2 ring-border/50 group-hover:ring-primary/30 transition-all bg-secondary">
            {artist.images[0]?.url && (
              <Image
                src={artist.images[0].url}
                alt={artist.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="80px"
              />
            )}
          </div>

          {/* Artist Name */}
          <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
            {artist.name}
          </p>

          {/* Genres */}
          <div className="mt-2 flex flex-wrap gap-1 justify-center">
            {(artist.genres || []).slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80 truncate max-w-full"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Popularity */}
          <div className="mt-3">
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/50 rounded-full"
                style={{ width: `${artist.popularity}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Popularity: {artist.popularity}
            </p>
          </div>

          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3" />
        </a>
      ))}
    </div>
  );
}
