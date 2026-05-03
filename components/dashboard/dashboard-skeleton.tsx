"use client";

import { Music2 } from "lucide-react";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Music2 className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-base tracking-tight">
                stats.<span className="text-primary">fm</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full skeleton-shimmer" />
              <div className="w-20 h-4 rounded skeleton-shimmer hidden sm:block" />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Loading Message */}
        <div className="text-center py-8 mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-4 h-4 rounded-full bg-primary pulse-glow" />
            <span className="text-sm font-medium text-primary">
              Loading your Spotify stats...
            </span>
          </div>
        </div>

        {/* Overview Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 h-20 skeleton-shimmer" />
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 mb-6 w-fit">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-24 h-9 rounded-lg skeleton-shimmer" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 h-16 skeleton-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
