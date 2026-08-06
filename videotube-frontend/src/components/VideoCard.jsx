import { Link } from "react-router-dom";
import { formatCount, formatDuration, timeAgo } from "../utils/format";

export default function VideoCard({ video }) {
  if (!video) return null;
  const owner = video.owner || {};

  return (
    <Link to={`/watch/${video._id}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-(--color-surface-2) ring-1 ring-(--color-border)">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </span>
        <div className="pointer-events-none absolute inset-0 opacity-0 ring-2 ring-(--color-accent) transition group-hover:opacity-100 rounded-xl" />
      </div>
      <div className="mt-2.5 flex gap-2.5">
        {owner.avatar && (
          <img
            src={owner.avatar}
            alt={owner.username}
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-(--color-border)"
          />
        )}
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-(--color-ink)">
            {video.title}
          </h3>
          <p className="mt-1 truncate text-xs text-(--color-muted)">{owner.fullname}</p>
          <p className="text-xs text-(--color-muted)">
            {formatCount(video.views)} views · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
