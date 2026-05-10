"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface GenreItem {
  genre: string;
  count: number;
  percentage: number;
}

interface TopGenresProps {
  genres: GenreItem[];
  diversity: number;
  isLoading: boolean;
}

const GENRE_COLORS = [
  "#1DB954", "#1ed760", "#4ade80", "#22d3ee", "#818cf8",
  "#c084fc", "#f472b6", "#fb923c", "#facc15", "#a3e635",
  "#2dd4bf", "#60a5fa", "#a78bfa", "#fb7185", "#fbbf24",
];

export function TopGenres({ genres, diversity, isLoading }: TopGenresProps) {
  if (isLoading && genres.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 skeleton-shimmer h-96" />
    );
  }

  if (genres.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <p className="text-muted-foreground">No genre data available.</p>
      </div>
    );
  }

  const topGenres = genres.slice(0, 15);

  return (
    <div className="space-y-6">
      {/* Diversity Score */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Genre Diversity</h3>
            <p className="text-sm text-muted-foreground">
              How varied your music taste is across genres
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-gradient">{diversity}%</p>
            <p className="text-xs text-muted-foreground">
              {diversity > 75
                ? "Very Diverse"
                : diversity > 50
                ? "Moderately Diverse"
                : diversity > 25
                ? "Somewhat Focused"
                : "Highly Focused"}
            </p>
          </div>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${diversity}%`,
              background: `linear-gradient(90deg, #1DB954, #4ade80, #22d3ee)`,
            }}
          />
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-6">Top Genres</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topGenres}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="genre"
                width={130}
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 20, 30, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: "13px",
                }}
                labelStyle={{ color: "#fff", fontWeight: 600 }}
                itemStyle={{ color: "#1DB954" }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                formatter={(value) => [`${value} artists`, "Count"]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={24} animationDuration={800} animationBegin={100} animationEasing="ease-out">
                {topGenres.map((_, index) => (
                  <Cell
                    key={index}
                    fill={GENRE_COLORS[index % GENRE_COLORS.length]}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Genre Cloud */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">All Genres</h3>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre, index) => (
            <span
              key={genre.genre}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 cursor-default"
              style={{
                backgroundColor: `${GENRE_COLORS[index % GENRE_COLORS.length]}15`,
                color: GENRE_COLORS[index % GENRE_COLORS.length],
                border: `1px solid ${GENRE_COLORS[index % GENRE_COLORS.length]}30`,
                fontSize: `${Math.max(10, Math.min(14, 10 + genre.percentage * 0.3))}px`,
              }}
            >
              {genre.genre} ({genre.percentage}%)
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
