import Link from "next/link";
import {
  Music2,
  BarChart3,
  Clock,
  Palette,
  Share2,
  Headphones,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: TrendingUp,
      title: "Top Tracks & Artists",
      description:
        "See your most played tracks and artists across different time periods — 4 weeks, 6 months, or all time.",
    },
    {
      icon: BarChart3,
      title: "Genre Breakdown",
      description:
        "Discover your genre diversity with detailed breakdowns and see how eclectic your taste really is.",
    },
    {
      icon: Clock,
      title: "Listening Heatmap",
      description:
        "Visualize when you listen most — hour by hour, day by day. Find your peak listening patterns.",
    },
    {
      icon: Palette,
      title: "Mood Analysis",
      description:
        "Understand the energy, vibe, and mood of your music through Spotify's audio feature analysis.",
    },
    {
      icon: Share2,
      title: "Shareable Card",
      description:
        "Generate a beautiful personality card summarizing your listening identity. Download & share it anywhere.",
    },
    {
      icon: Headphones,
      title: "Deep Insights",
      description:
        "From genre diversity scores to your music personality type — get insights you won't find elsewhere.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Music2 className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                stats.<span className="text-primary">fm</span>
              </span>
            </Link>

            <Link
              href="/api/auth/spotify"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Connect Spotify
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-chart-2/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 pt-20 pb-24 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Your Spotify Listening Stats, Beautifully Visualized
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Discover your{" "}
              <span className="text-gradient">music DNA</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
              Deep analytics for your Spotify history — top artists, tracks,
              listening patterns, genre breakdowns, and a shareable personality
              card that captures your unique taste.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/api/auth/spotify"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:brightness-110 transition-all hover:scale-[1.02] active:scale-[0.98] glow-green"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                Connect with Spotify
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-border text-foreground/80 font-medium text-lg hover:bg-secondary transition-all"
              >
                Learn More
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Preview */}
      <section className="container mx-auto px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card rounded-3xl p-8 sm:p-12 glow-green">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Top Artists", value: "50+", sub: "Ranked by plays" },
                { label: "Top Tracks", value: "50+", sub: "All time periods" },
                { label: "Genres", value: "30+", sub: "Diversity score" },
                { label: "Mood Score", value: "100", sub: "Audio analysis" },
              ].map((stat) => (
                <div key={stat.label} className="text-center space-y-2">
                  <p className="text-3xl sm:text-4xl font-bold text-gradient">
                    {stat.value}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {stat.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Everything about your{" "}
              <span className="text-gradient">listening</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect your Spotify account and unlock detailed analytics about
              your music taste, habits, and personality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group glass-card rounded-2xl p-6 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Ready to explore?
          </h2>
          <p className="text-lg text-muted-foreground">
            It only takes a few seconds. Connect your Spotify and discover your
            music personality.
          </p>
          <Link
            href="/api/auth/spotify"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:brightness-110 transition-all hover:scale-[1.02] active:scale-[0.98] glow-green"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Music2 className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                stats.fm clone — Built for 8x Engineer
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Not affiliated with Spotify or stats.fm. Data sourced via Spotify
              Web API.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
