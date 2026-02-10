import { Link } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { videos } from '../data/videos';

export function Hero() {
  const featured = videos[0];

  return (
    <section className="relative w-full h-[80vh] min-h-[560px] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={featured.thumbnail}
          alt={featured.title}
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-navy-dark)] via-[var(--color-navy-dark)]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy-dark)] via-transparent to-[var(--color-navy-dark)]/30" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 w-full">
          <div className="max-w-2xl space-y-5 animate-fade-up">
            {/* Badge */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase bg-[var(--color-red)] text-white rounded">
                SubStream Original
              </span>
              <span className="text-white/70 text-xs font-medium">
                {featured.year} &middot; {featured.rating} &middot; {featured.duration}
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight uppercase text-white"
            >
              {featured.title.split(':').map((part, i) => (
                <span key={i}>
                  {i === 0 ? (
                    <span>{part}</span>
                  ) : (
                    <>
                      <br />
                      <span className="text-[var(--color-gold)]">{part.trim()}</span>
                    </>
                  )}
                </span>
              ))}
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-xl">
              {featured.description.slice(0, 160)}...
            </p>

            {/* Genre tags */}
            <div className="flex items-center gap-2">
              {featured.genre.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide rounded border border-white/30 text-white/80"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2">
              <Link
                to={`/watch/${featured.id}`}
                className="flex items-center gap-2.5 px-7 py-3.5 bg-[var(--color-red)] hover:bg-[#C71530] text-white font-bold uppercase tracking-wide rounded transition-all duration-200 active:scale-95 shadow-lg"
              >
                <Play className="w-5 h-5 fill-white" />
                Watch Now
              </Link>
              <Link
                to={`/watch/${featured.id}`}
                className="flex items-center gap-2.5 px-7 py-3.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold uppercase tracking-wide rounded transition-all duration-200"
              >
                <Info className="w-5 h-5" />
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent stripe */}
      <div className="absolute bottom-0 left-0 right-0 section-divider" />
    </section>
  );
}
