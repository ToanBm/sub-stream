import { Link } from 'react-router-dom';
import { Play, Clock, Star } from 'lucide-react';
import type { Video } from '../data/videos';

type VideoCardProps = {
  video: Video;
  index?: number;
};

export function VideoCard({ video, index = 0 }: VideoCardProps) {
  return (
    <Link
      to={`/watch/${video.id}`}
      className="group relative block rounded-lg overflow-hidden bg-white card-shadow animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[var(--color-navy-dark)]/0 group-hover:bg-[var(--color-navy-dark)]/40 transition-colors duration-300" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-[var(--color-red)] flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-black/70 text-white rounded">
          {video.duration}
        </span>

        {/* Rating badge */}
        <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold tracking-wide bg-[var(--color-navy)] text-white rounded">
          {video.rating}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 pb-5 border-t-[3px] border-[var(--color-red)] group-hover:border-[var(--color-gold)] transition-colors duration-300">
        <h3
          className="text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-navy)] transition-colors duration-200 truncate uppercase tracking-wide"
        >
          {video.title}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1.5 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {video.year}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-[var(--color-gold)] text-[var(--color-gold)]" />
            {video.genre[0]}
          </span>
        </p>
      </div>
    </Link>
  );
}
