import { useCallback, useEffect, useRef, useState } from "react";
import { getShorts } from "../api/videos";
import ShortCard from "../components/ShortCard";
import Loader from "../components/Loader";

const BATCH_SIZE = 6;

export default function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [muted, setMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const containerRef = useRef(null);
  const cardRefs = useRef(new Map());
  const seenIds = useRef(new Set());

  const loadMore = useCallback(async () => {
    setIsFetchingMore(true);
    try {
      const exclude = Array.from(seenIds.current).join(",");
      const batch = await getShorts({ limit: BATCH_SIZE, exclude });
      batch.forEach((s) => seenIds.current.add(s._id));
      setShorts((prev) => [...prev, ...batch]);
    } finally {
      setIsFetchingMore(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            setActiveId(entry.target.dataset.shortId);
          }
        });
      },
      { root, threshold: [0.6] }
    );

    cardRefs.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [shorts]);

  const handleScroll = () => {
    const root = containerRef.current;
    if (!root || isFetchingMore) return;
    const nearEnd = root.scrollTop + root.clientHeight >= root.scrollHeight - root.clientHeight;
    if (nearEnd) loadMore();
  };

  if (isLoading) return <Loader label="Loading shorts" />;

  if (!shorts.length) {
    return (
      <div className="py-24 text-center">
        <p className="font-(family-name:--font-display) text-2xl">No shorts yet</p>
        <p className="mt-2 text-sm text-(--color-muted)">
          Publish a video under a minute long and mark it as a Short to see it here.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="-mx-4 -my-6 h-[calc(100vh-4rem)] snap-y snap-mandatory overflow-y-scroll sm:-mx-6"
    >
      {shorts.map((short) => (
        <ShortCard
          key={short._id}
          short={short}
          isActive={activeId === short._id}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
          ref={(node) => {
            if (node) cardRefs.current.set(short._id, node);
            else cardRefs.current.delete(short._id);
          }}
        />
      ))}
      {isFetchingMore && <Loader label="Loading more" />}
    </div>
  );
}