import { useEffect, useState } from "react";
import { getWatchHistory } from "../api/users";
import VideoCard from "../components/VideoCard";
import Loader from "../components/Loader";

export default function History() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getWatchHistory()
      .then(setVideos)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loader label="Loading history" />;

  return (
    <div>
      <h1 className="mb-6 font-(family-name:--font-display) text-2xl">Watch history</h1>
      {!videos.length ? (
        <p className="text-sm text-(--color-muted)">You haven't watched anything yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((v) => (
            <VideoCard key={v._id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}
