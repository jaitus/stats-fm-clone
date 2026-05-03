"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface MoodData {
  overall: number;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  label: string;
}

interface MoodAnalysisProps {
  mood: MoodData;
  isLoading: boolean;
}

export function MoodAnalysis({ mood, isLoading }: MoodAnalysisProps) {
  if (isLoading && mood.overall === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 skeleton-shimmer h-96" />
    );
  }

  const radarData = [
    { attribute: "Danceability", value: mood.danceability, fullMark: 100 },
    { attribute: "Energy", value: mood.energy, fullMark: 100 },
    { attribute: "Happiness", value: mood.valence, fullMark: 100 },
    { attribute: "Acousticness", value: mood.acousticness, fullMark: 100 },
    {
      attribute: "Instrumentalness",
      value: mood.instrumentalness,
      fullMark: 100,
    },
  ];

  const moodDescriptions: Record<string, string> = {
    Euphoric:
      "Your music radiates pure joy and high energy. You're the person who lights up every room with an infectious playlist.",
    "Chill & Happy":
      "Laid-back vibes with a positive undertone. Your music is like a sunny afternoon with nowhere to be.",
    Intense:
      "Dark, powerful, and driving. Your music has an edge — it's built for focus, workouts, or late-night coding sessions.",
    Melancholic:
      "There's a beautiful depth to your music taste. You appreciate emotional complexity and atmospheric soundscapes.",
    Energetic:
      "High BPM, maximum intensity. Your playlist is a constant adrenaline rush that keeps you moving.",
    "Acoustic Soul":
      "Stripped back and organic. You love the raw beauty of acoustic instruments and authentic voices.",
    Groovy:
      "Rhythm-driven and funky. Your music makes it physically impossible to sit still.",
    Balanced:
      "A harmonious blend of moods and styles. You're musically well-rounded with no extreme tendencies.",
  };

  return (
    <div className="space-y-6">
      {/* Mood Score */}
      <div className="glass-card rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
          Your Mood Profile
        </p>
        <h2 className="text-4xl font-bold text-gradient mb-2">{mood.label}</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {moodDescriptions[mood.label] ||
            "Your music reflects a unique emotional palette."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Audio Profile</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid
                  stroke="rgba(255,255,255,0.1)"
                  strokeDasharray="3 3"
                />
                <PolarAngleAxis
                  dataKey="attribute"
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Your Music"
                  dataKey="value"
                  stroke="#1DB954"
                  fill="#1DB954"
                  fillOpacity={0.2}
                  strokeWidth={2}
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
                  formatter={(value) => [`${value}%`, ""]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Breakdown */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Feature Breakdown</h3>
          <div className="space-y-4">
            {[
              {
                label: "Danceability",
                value: mood.danceability,
                description: "How suitable for dancing",
                color: "#1DB954",
              },
              {
                label: "Energy",
                value: mood.energy,
                description: "Intensity and activity",
                color: "#22d3ee",
              },
              {
                label: "Happiness",
                value: mood.valence,
                description: "Positive musical mood",
                color: "#facc15",
              },
              {
                label: "Acousticness",
                value: mood.acousticness,
                description: "Acoustic vs electronic",
                color: "#fb923c",
              },
              {
                label: "Instrumentalness",
                value: mood.instrumentalness,
                description: "Vocal vs instrumental",
                color: "#c084fc",
              },
            ].map((feature) => (
              <div key={feature.label}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-medium">{feature.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {feature.description}
                    </span>
                  </div>
                  <span className="text-sm font-bold">{feature.value}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${feature.value}%`,
                      backgroundColor: feature.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Mood Score</span>
              <span className="text-2xl font-bold text-gradient">
                {mood.overall}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
