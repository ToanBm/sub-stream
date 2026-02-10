import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Star, Calendar, Shield, ExternalLink, Lock } from 'lucide-react';
import { videos, getRelatedVideos } from '../data/videos';
import { VideoCard } from '../components/VideoCard';

type VideoPlayerPageProps = {
  address: string | null;
  isRegistered: boolean;
  onRegister: () => void;
  onLogin: () => void;
};

export function VideoPlayerPage({ address, isRegistered, onRegister, onLogin }: VideoPlayerPageProps) {
  const { id } = useParams<{ id: string }>();
  const video = videos.find((v) => v.id === id);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Check subscription status
  useEffect(() => {
    if (!address || !isRegistered) {
      setHasActiveSubscription(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/my-subscription/${address}`)
      .then(r => r.json())
      .then(data => {
        const sub = data?.subscription;
        const isActive = sub && sub.status === 'active';
        setHasActiveSubscription(isActive);
      })
      .catch(err => {
        console.error('Failed to check subscription:', err);
        setHasActiveSubscription(false);
      });
  }, [address, isRegistered]);

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Video not found</h2>
          <Link to="/" className="text-[var(--color-navy)] hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const related = getRelatedVideos(video.id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div key={id} className="min-h-screen pt-20 bg-[var(--color-bg-alt)]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-navy)] hover:text-[var(--color-red)] mb-6 transition-colors group uppercase tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Browse
        </Link>

        {/* Player + Info Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* YouTube Embed or Lock Overlay */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-xl">
              {isRegistered && hasActiveSubscription ? (
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&rel=0&modestbranding=1&color=white`}
                  title={video.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  {/* Blurred thumbnail background */}
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover blur-sm scale-105 brightness-[0.4]"
                  />
                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[var(--color-navy-dark)]/60">
                    <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center max-w-sm px-4">
                      <h3
                        className="text-xl font-bold text-white uppercase tracking-wide"
                      >
                        {!isRegistered ? 'Sign in to watch' : 'Subscribe to watch'}
                      </h3>
                      <p className="text-sm text-white/70 mt-2">
                        {!isRegistered
                          ? 'Register or sign in with your passkey to unlock full streaming access.'
                          : 'Subscribe to one of our plans to access premium content.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isRegistered ? (
                        <>
                          <button
                            onClick={onLogin}
                            className="px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white border border-white/40 hover:bg-white/10 rounded transition-all duration-200"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={onRegister}
                            className="px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white bg-[var(--color-red)] hover:bg-[#C71530] rounded shadow-lg transition-all duration-200 active:scale-95"
                          >
                            Get Started
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/subscribe"
                          className="px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white bg-[var(--color-red)] hover:bg-[#C71530] rounded shadow-lg transition-all duration-200 active:scale-95"
                        >
                          View Plans
                        </Link>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Video Info */}
            <div className="animate-fade-up bg-white rounded-lg p-6 card-shadow" style={{ animationDelay: '100ms' }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1
                    className="text-2xl md:text-3xl font-bold tracking-tight uppercase text-[var(--color-text)]"
                  >
                    {video.title}
                  </h1>
                  <p className="text-[var(--color-red)] text-sm font-semibold mt-1 uppercase tracking-wide">
                    {video.subtitle}
                  </p>
                </div>

                {hasActiveSubscription ? (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold uppercase tracking-wide rounded shrink-0">
                    <Shield className="w-4 h-4" />
                    Active Subscriber
                  </div>
                ) : isRegistered ? (
                  <Link
                    to="/subscribe"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-navy)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-bold uppercase tracking-wide rounded transition-all duration-200 shrink-0"
                  >
                    <Shield className="w-4 h-4" />
                    Subscribe for Full Access
                  </Link>
                ) : (
                  <button
                    onClick={onRegister}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-red)] hover:bg-[#C71530] text-white text-sm font-bold uppercase tracking-wide rounded transition-all duration-200 shrink-0"
                  >
                    <Lock className="w-4 h-4" />
                    Sign Up to Watch
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="section-divider mt-4 mb-4" />

              {/* Meta */}
              <div className="flex items-center gap-5 text-sm text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {video.year}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {video.duration}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-[var(--color-navy)] text-white uppercase">
                  {video.rating}
                </span>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[var(--color-gold)] fill-[var(--color-gold)]" />
                  <span className="text-[var(--color-gold)] font-semibold">4.8</span>
                </div>
              </div>

              {/* Genre tags */}
              <div className="flex items-center gap-2 mt-4">
                {video.genre.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded border border-[var(--color-border)] text-[var(--color-text-muted)]"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="mt-5 p-5 rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
                <p className="text-[var(--color-text)] leading-relaxed text-sm">
                  {video.description}
                </p>
              </div>

              {/* Blockchain info */}
              <div className="mt-4 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-alt)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[var(--color-navy)]/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[var(--color-navy)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wide">Content Rights on Tempo</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      Access managed via on-chain subscription keys
                    </p>
                  </div>
                  <a
                    href="https://explore.tempo.xyz"
                    target="_blank"
                    className="flex items-center gap-1 text-[10px] text-[var(--color-navy)] font-semibold hover:underline"
                  >
                    View on Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-white rounded-lg p-5 card-shadow">
              <h3
                className="text-lg font-bold flex items-center gap-2 uppercase tracking-wide text-[var(--color-text)]"
              >
                <span className="w-1 h-5 bg-[var(--color-red)] rounded-full" />
                Up Next
              </h3>
              <div className="space-y-1 mt-4">
                {related.map((v) => (
                  <Link
                    key={v.id}
                    to={`/watch/${v.id}`}
                    className="flex gap-4 group rounded-lg p-2.5 -mx-2.5 hover:bg-[var(--color-bg-alt)] transition-colors duration-200"
                  >
                    <div className="relative w-32 shrink-0 aspect-video rounded overflow-hidden bg-gray-100">
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <h4
                        className="text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-navy)] transition-colors truncate uppercase tracking-wide"
                      >
                        {v.title}
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">{v.subtitle}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
                        {v.duration} &middot; {v.year}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* More Like This */}
        <section className="mt-12 pb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="accent-bar-gold" />
            <h3
              className="text-xl font-bold uppercase tracking-wide text-[var(--color-text)]"
            >
              More Like This
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.slice(0, 3).map((v, i) => (
              <VideoCard key={v.id} video={v} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
