import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toggleVideoLike } from "../api/likes";
import { useAuth } from "../context/AuthContext";

export default function LikeButton({ videoId, initialLiked = false, initialCount = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isBusy, setIsBusy] = useState(false);

  const handleClick = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setIsBusy(true);
    try {
      await toggleVideoLike(videoId);
      setIsLiked((v) => !v);
      setCount((c) => (isLiked ? Math.max(0, c - 1) : c + 1));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isBusy}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
        isLiked
          ? "border-(--color-accent) text-(--color-accent)"
          : "border-(--color-border) text-(--color-ink) hover:bg-(--color-surface-2)"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z" />
        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
      {count}
    </button>
  );
}
