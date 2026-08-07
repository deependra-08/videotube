import { forwardRef, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toggleVideoLike } from "../api/likes";
import { formatCount } from "../utils/format";
import SubscribeButton from "./SubscribeButton";

const ShortCard = forwardRef(function ShortCard({ short, isActive, muted, onToggleMute }, ref) {
  const videoRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(!!short.isLiked);
  const [likeCount, setLikeCount] = useState(short.likesCount || 0);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      el.currentTime = 0;
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isActive]);

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    await toggleVideoLike(short._id);
    setIsLiked((v) => !v);
    setLikeCount((c) => (isLiked ? Math.max(0, c - 1) : c + 1));
  };

  return (
    <section
      ref={ref}
      data-short-id={short._id}
      className="relative flex h-[calc(100vh-4rem)] w-full snap-start items-center justify-center bg-black"
    >
      <video
        ref={videoRef}
        src={short.videoFile}
        muted={muted}
        loop
        playsInline
        onClick={onToggleMute}
        className="h-full max-w-full cursor-pointer object-contain sm:aspect-[9/16] sm:h-full sm:w-auto sm:rounded-2xl"
      />

      {muted && (
        <button
          onClick={onToggleMute}
          className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white sm:right-[calc(50%-190px)]"
        >
          Tap to unmute
        </button>
      )}

      <div className="absolute bottom-20 right-3 flex flex-col items-center gap-5 sm:right-[calc(50%-230px)]">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 text-white">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full ${
              isLiked ? "bg-(--color-accent) text-(--color-bg)" : "bg-black/50"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z" />
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </span>
          <span className="text-xs">{formatCount(likeCount)}</span>
        </button>

        <Link to={`/watch/${short._id}`} className="flex flex-col items-center gap-1 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span className="text-xs">Comments</span>
        </Link>
      </div>

      <div className="absolute bottom-6 left-3 right-20 text-white sm:left-[calc(50%-190px)] sm:right-auto sm:w-[300px]">
        <div className="flex items-center gap-2">
          <Link to={`/channel/${short.owner?.username}`} className="flex items-center gap-2">
            <img
              src={short.owner?.avatar}
              alt=""
              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/40"
            />
            <span className="text-sm font-medium">@{short.owner?.username}</span>
          </Link>
          {short.owner?._id && <SubscribeButton channelId={short.owner._id} />}
        </div>
        <p className="mt-2 line-clamp-2 text-sm">{short.title}</p>
      </div>
    </section>
  );
});

export default ShortCard;