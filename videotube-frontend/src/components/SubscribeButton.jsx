import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toggleSubscription } from "../api/subscriptions";
import { useAuth } from "../context/AuthContext";

export default function SubscribeButton({ channelId, initialSubscribed, subscriberCount = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(!!initialSubscribed);
  const [count, setCount] = useState(subscriberCount);
  const [isBusy, setIsBusy] = useState(false);

  const handleClick = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setIsBusy(true);
    try {
      await toggleSubscription(channelId);
      setIsSubscribed((v) => !v);
      setCount((c) => (isSubscribed ? c - 1 : c + 1));
    } finally {
      setIsBusy(false);
    }
  };

  if (user?._id === channelId) return null;

  return (
    <button
      onClick={handleClick}
      disabled={isBusy}
      className={`rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
        isSubscribed
          ? "border border-(--color-border) text-(--color-ink) hover:bg-(--color-surface-2)"
          : "bg-(--color-accent) text-(--color-bg) hover:brightness-110"
      }`}
    >
      {isSubscribed ? "Subscribed" : "Subscribe"}
      {count > 0 && <span className="ml-1 opacity-70">· {count}</span>}
    </button>
  );
}
