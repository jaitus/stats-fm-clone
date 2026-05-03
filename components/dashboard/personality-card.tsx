"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { SpotifyUser, SpotifyArtist, SpotifyTrack } from "@/lib/spotify";
import Image from "next/image";
import { Download, Share2, Check, Music2 } from "lucide-react";

interface PersonalityCardProps {
  personality: { type: string; description: string; emoji: string };
  profile: SpotifyUser | null;
  topArtists: SpotifyArtist[];
  topTracks: SpotifyTrack[];
  topGenre: string;
  moodLabel: string;
  genreDiversity: number;
}

export function PersonalityCard({
  personality,
  profile,
  topArtists,
  topTracks,
  topGenre,
  moodLabel,
  genreDiversity,
}: PersonalityCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: "#0a0a14",
      });

      const link = document.createElement("a");
      link.download = `${profile?.display_name || "my"}-music-personality.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export card:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: "#0a0a14",
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "music-personality.png", {
          type: "image/png",
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "My Music Personality",
            text: `I'm ${personality.type}! Check out my Spotify listening stats.`,
          });
          return;
        }
      }

      // Fallback: copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 glow-green"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? "Generating..." : "Download as PNG"}
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-all hover:scale-105 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-primary" />
              Copied!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Share
            </>
          )}
        </button>
      </div>

      {/* The Card */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          className="w-full max-w-[480px] rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, #0a0a14 0%, #0d1a0f 30%, #0a0a14 60%, #0f0a1a 100%)",
          }}
        >
          {/* Card Content */}
          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1DB954]/20 flex items-center justify-center">
                  <Music2 className="w-4 h-4 text-[#1DB954]" />
                </div>
                <span
                  className="font-bold text-sm"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  stats.fm
                </span>
              </div>
              {profile?.images?.[0]?.url && (
                <Image
                  src={profile.images[0].url}
                  alt={profile.display_name}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full ring-2 ring-[#1DB954]/30"
                />
              )}
            </div>

            {/* Personality Type */}
            <div className="text-center py-4">
              <p className="text-5xl mb-3">{personality.emoji}</p>
              <h2
                className="text-3xl font-extrabold mb-2"
                style={{
                  background:
                    "linear-gradient(135deg, #1DB954, #4ade80)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {personality.type}
              </h2>
              <p
                className="text-sm max-w-[320px] mx-auto leading-relaxed"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {personality.description}
              </p>
            </div>

            {/* Stats Grid */}
            <div
              className="grid grid-cols-3 gap-3 p-4 rounded-2xl"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-center">
                <p
                  className="text-lg font-bold"
                  style={{ color: "#1DB954" }}
                >
                  {genreDiversity}%
                </p>
                <p
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Diversity
                </p>
              </div>
              <div className="text-center">
                <p
                  className="text-lg font-bold"
                  style={{ color: "#1DB954" }}
                >
                  {moodLabel}
                </p>
                <p
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Mood
                </p>
              </div>
              <div className="text-center">
                <p
                  className="text-lg font-bold truncate"
                  style={{ color: "#1DB954" }}
                >
                  {topGenre}
                </p>
                <p
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Top Genre
                </p>
              </div>
            </div>

            {/* Top Artists */}
            {topArtists.length > 0 && (
              <div>
                <p
                  className="text-[10px] uppercase tracking-wider mb-3"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Top Artists
                </p>
                <div className="space-y-2">
                  {topArtists.map((artist, i) => (
                    <div
                      key={artist.id}
                      className="flex items-center gap-3 p-2 rounded-xl"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <span
                        className="text-xs font-bold w-5 text-center"
                        style={{ color: "#1DB954" }}
                      >
                        {i + 1}
                      </span>
                      {artist.images[0]?.url && (
                        <Image
                          src={artist.images[0].url}
                          alt={artist.name}
                          width={28}
                          height={28}
                          className="w-7 h-7 rounded-full"
                        />
                      )}
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: "rgba(255,255,255,0.8)" }}
                      >
                        {artist.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Tracks */}
            {topTracks.length > 0 && (
              <div>
                <p
                  className="text-[10px] uppercase tracking-wider mb-3"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Top Tracks
                </p>
                <div className="space-y-2">
                  {topTracks.map((track, i) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-2 rounded-xl"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <span
                        className="text-xs font-bold w-5 text-center"
                        style={{ color: "#1DB954" }}
                      >
                        {i + 1}
                      </span>
                      {track.album.images[0]?.url && (
                        <Image
                          src={track.album.images[0].url}
                          alt={track.album.name}
                          width={28}
                          height={28}
                          className="w-7 h-7 rounded-lg"
                        />
                      )}
                      <div className="min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "rgba(255,255,255,0.8)" }}
                        >
                          {track.name}
                        </p>
                        <p
                          className="text-[10px] truncate"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          {track.artists.map((a) => a.name).join(", ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div
              className="flex items-center justify-between pt-2"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="text-[10px]"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {profile?.display_name || "Anonymous"}&apos;s music personality
              </p>
              <p
                className="text-[10px]"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                stats.fm clone
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
