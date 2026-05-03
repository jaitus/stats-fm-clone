"use client";

import { useState } from "react";

interface ListeningHeatmapProps {
  data: number[][];
  isLoading: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return "12a";
  if (i < 12) return `${i}a`;
  if (i === 12) return "12p";
  return `${i - 12}p`;
});

function getColor(value: number, max: number): string {
  if (value === 0) return "rgba(255,255,255,0.03)";
  const intensity = value / max;
  if (intensity < 0.25) return "rgba(29, 185, 84, 0.2)";
  if (intensity < 0.5) return "rgba(29, 185, 84, 0.4)";
  if (intensity < 0.75) return "rgba(29, 185, 84, 0.65)";
  return "rgba(29, 185, 84, 0.9)";
}

export function ListeningHeatmap({ data, isLoading }: ListeningHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    day: number;
    hour: number;
    value: number;
  } | null>(null);

  if (isLoading && data.every((row) => row.every((v) => v === 0))) {
    return (
      <div className="glass-card rounded-2xl p-8 skeleton-shimmer h-72" />
    );
  }

  const maxValue = Math.max(...data.flat(), 1);
  const totalListens = data.flat().reduce((a, b) => a + b, 0);

  // Find peak listening time
  let peakDay = 0;
  let peakHour = 0;
  let peakValue = 0;
  data.forEach((dayData, dayIndex) => {
    dayData.forEach((value, hourIndex) => {
      if (value > peakValue) {
        peakValue = value;
        peakDay = dayIndex;
        peakHour = hourIndex;
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gradient">{totalListens}</p>
          <p className="text-xs text-muted-foreground mt-1">Recent Plays</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gradient">{DAYS[peakDay]}</p>
          <p className="text-xs text-muted-foreground mt-1">Most Active Day</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gradient">
            {peakHour === 0
              ? "12 AM"
              : peakHour < 12
              ? `${peakHour} AM`
              : peakHour === 12
              ? "12 PM"
              : `${peakHour - 12} PM`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Peak Hour</p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-2">Listening Heatmap</h3>
        <p className="text-sm text-muted-foreground mb-6">
          When you listen to music throughout the week
        </p>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour Labels */}
            <div className="flex ml-12 mb-2">
              {HOURS.map((hour, i) => (
                <div
                  key={i}
                  className="flex-1 text-center text-[10px] text-muted-foreground"
                >
                  {i % 3 === 0 ? hour : ""}
                </div>
              ))}
            </div>

            {/* Grid Rows */}
            {data.map((dayData, dayIndex) => (
              <div key={dayIndex} className="flex items-center gap-2 mb-1">
                <span className="w-10 text-xs text-muted-foreground text-right">
                  {DAYS[dayIndex]}
                </span>
                <div className="flex flex-1 gap-[2px]">
                  {dayData.map((value, hourIndex) => (
                    <div
                      key={hourIndex}
                      className="flex-1 aspect-square rounded-sm heatmap-cell cursor-pointer relative"
                      style={{ backgroundColor: getColor(value, maxValue) }}
                      onMouseEnter={() =>
                        setHoveredCell({
                          day: dayIndex,
                          hour: hourIndex,
                          value,
                        })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {hoveredCell?.day === dayIndex &&
                        hoveredCell?.hour === hourIndex && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border rounded-lg text-xs whitespace-nowrap z-20 shadow-xl">
                            <p className="font-semibold">
                              {DAYS[dayIndex]} {HOURS[hourIndex]}
                            </p>
                            <p className="text-muted-foreground">
                              {value} {value === 1 ? "play" : "plays"}
                            </p>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {[0.03, 0.2, 0.4, 0.65, 0.9].map((opacity, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor:
                      i === 0
                        ? `rgba(255,255,255,${opacity})`
                        : `rgba(29, 185, 84, ${opacity})`,
                  }}
                />
              ))}
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Based on your last 50 recently played tracks on Spotify
      </p>
    </div>
  );
}
