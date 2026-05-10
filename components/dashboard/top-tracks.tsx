"use client";

import type { SpotifyTrack } from "@/lib/spotify";
import Image from "next/image";
import { ExternalLink, Clock, Play, Pause, Volume2 } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

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
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPlayingId(null);
    setProgress(0);
  }, []);

  const togglePreview = useCallback((track: SpotifyTrack) => {
    if (playingId === track.id) {
      stopPlayback();
      return;
    }

    stopPlayback();

    if (!track.preview_url) return;

    const audio = new Audio(track.preview_url);
    audioRef.current = audio;
    audio.volume = 0.5;
    audio.play();
    setPlayingId(track.id);

    intervalRef.current = setInterval(() => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    }, 100);

    audio.onended = () => stopPlayback();
  }, [playingId, stopPlayback]);

  useEffect(() => {
    return () => stopPlayback();
  }, [stopPlayback]);

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

  const totalMs = tracks.reduce((sum, t) => sum + (t.duration_ms || 0), 0);
  const avgPopularity = Math.round(tracks.reduce((sum, t) => sum + (t.popularity || 0), 0) / tracks.length);
  const uniqueArtists = new Set(tracks.flatMap(t => (t.artists || []).map(a => a.name))).size;

  return (
    <div>
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gradient">{tracks.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Top Tracks</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gradient">{uniqueArtists}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Unique Artists</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gradient">{Math.round(totalMs / 3600000)}h {Math.round((totalMs % 3600000) / 60000)}m</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Duration</p>
        </div>
      </div>

      {/* Track List */}
      <div className="space-y-2 stagger-children">
        {tracks.map((track, index) => {
          const isPlaying = playingId === track.id;
          const isHovered = hoveredId === track.id;
          const showOverlay = track.preview_url && (isPlaying || isHovered);
          return (
            <div
              key={track.id}
              className={`group glass-card rounded-xl p-3 sm:p-4 flex items-center gap-4 transition-all duration-300 hover:bg-white/[0.03] hover:border-primary/20 ${
                isPlaying ? "border-primary/30 bg-primary/[0.03] glow-green" : ""
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                <span className={`text-sm font-bold ${index < 3 ? "text-primary" : "text-muted-foreground"}`}>
                  {index + 1}
                </span>
              </div>

              {/* Album Art + Play Button */}
              <div
                className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-secondary cursor-pointer"
                onClick={(e) => { e.preventDefault(); togglePreview(track); }}
                onMouseEnter={() => setHoveredId(track.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {track.album?.images?.[0]?.url && (
                  <Image
                    src={track.album.images[0].url}
                    alt={track.album?.name || "Album"}
                    fill
                    className="object-cover transition-all duration-300"
                    style={{
                      transform: showOverlay ? "scale(1.1)" : "scale(1)",
                      filter: showOverlay ? "brightness(0.6)" : "brightness(1)",
                    }}
                    sizes="48px"
                  />
                )}
                {/* Play/Pause overlay — always rendered, opacity toggled */}
                <div
                  className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
                  style={{ opacity: showOverlay ? 1 : 0 }}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white drop-shadow-lg" fill="white" />
                  ) : (
                    <Play className="w-5 h-5 text-white drop-shadow-lg" fill="white" />
                  )}
                </div>
                {/* Playback progress bar */}
                {isPlaying && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                    <div
                      className="h-full bg-primary transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Track Info */}
              <a
                href={track.external_urls?.spotify || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0"
              >
                <p className={`font-semibold text-sm truncate transition-colors ${isPlaying ? "text-primary" : "group-hover:text-primary"}`}>
                  {track.name}
                  {isPlaying && <Volume2 className="inline w-3 h-3 ml-1.5 animate-pulse" />}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {(track.artists || []).map((a) => a.name).join(", ")}
                </p>
              </a>

              {/* Album Name */}
              <p className="text-xs text-muted-foreground truncate max-w-[150px] hidden md:block">
                {track.album?.name}
              </p>

              {/* Duration */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 hidden sm:flex">
                <Clock className="w-3 h-3" />
                {formatDuration(track.duration_ms)}
              </div>

              {/* Popularity Bar */}
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
            </div>
          );
        })}
      </div>

      {/* Avg Popularity */}
      <div className="mt-4 glass-card rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Average Track Popularity</span>
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-1000"
              style={{ width: `${avgPopularity}%` }}
            />
          </div>
          <span className="text-sm font-bold text-primary">{avgPopularity}%</span>
        </div>
      </div>
    </div>
  );
}
