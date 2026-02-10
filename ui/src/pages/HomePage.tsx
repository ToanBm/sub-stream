import { Hero } from '../components/Hero';
import { VideoCard } from '../components/VideoCard';
import { videos, getVideosByCategory } from '../data/videos';
import { Film, Tv, TrendingUp } from 'lucide-react';

type HomePageProps = {
  filter?: 'movie' | 'series';
};

export function HomePage({ filter }: HomePageProps) {
  const displayVideos = filter ? getVideosByCategory(filter) : videos;
  const title = filter === 'movie' ? 'Movies' : filter === 'series' ? 'Series' : 'Trending Now';
  const Icon = filter === 'movie' ? Film : filter === 'series' ? Tv : TrendingUp;

  return (
    <div>
      {!filter && <Hero />}

      {filter && <div className="h-20" />}

      {/* Main content section */}
      <section className="py-12 lg:py-16 bg-[var(--color-bg-alt)]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          {/* Section Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <Icon className="w-5 h-5 text-[var(--color-red)]" />
              <span className="accent-bar" />
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-[var(--color-text)]"
            >
              {title}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {filter
                ? `Browse all ${filter === 'movie' ? 'movies' : 'series'}`
                : 'Top picks for you this week'}
            </p>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {displayVideos.map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} />
            ))}
          </div>

          {/* Empty State */}
          {displayVideos.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[var(--color-text-muted)] text-lg">No content available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* If home, show additional sections */}
      {!filter && (
        <>
          {/* Movies Section */}
          <section className="py-12 lg:py-16 bg-white">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <Film className="w-5 h-5 text-[var(--color-navy)]" />
                  <span className="accent-bar-gold" />
                </div>
                <h2
                  className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-[var(--color-text)]"
                >
                  Featured Movies
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Cinematic experiences you won't forget
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {getVideosByCategory('movie').map((video, i) => (
                  <VideoCard key={video.id} video={video} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* Series Section */}
          <section className="py-12 lg:py-16 bg-[var(--color-bg-alt)]">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <Tv className="w-5 h-5 text-[var(--color-navy)]" />
                  <span className="accent-bar" />
                </div>
                <h2
                  className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-[var(--color-text)]"
                >
                  Popular Series
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Binge-worthy shows streaming now
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {getVideosByCategory('series').map((video, i) => (
                  <VideoCard key={video.id} video={video} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="py-16 lg:py-24 bg-[var(--color-navy)]">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
              <div className="max-w-2xl">
                <span className="block w-12 h-1 bg-[var(--color-gold)] rounded mb-6" />
                <h3
                  className="text-3xl md:text-5xl font-bold tracking-tight uppercase text-white leading-tight"
                >
                  Unlimited streaming, <br />
                  <span className="text-[var(--color-gold)]">powered by blockchain.</span>
                </h3>
                <p className="text-white/70 mt-4 max-w-md text-lg">
                  Subscribe once with your passkey. No credit cards, no middlemen. Your keys, your content.
                </p>
                <a
                  href="/subscribe"
                  className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-[var(--color-red)] hover:bg-[#C71530] text-white font-bold uppercase tracking-wide rounded transition-all duration-200 active:scale-95 shadow-lg"
                >
                  Subscribe with Tempo
                </a>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-[var(--color-navy-dark)] py-10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            &copy; 2025 SubStream. Powered by Tempo Network.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/50">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="https://explore.tempo.xyz" target="_blank" className="hover:text-[var(--color-gold)] transition-colors">
              Tempo Explorer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
