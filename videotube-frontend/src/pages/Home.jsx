import { useEffect, useState } from "react";
import { getAllVideos } from "../api/videos";
import VideoCard from "../components/VideoCard";
import Loader from "../components/Loader";
import { apiErrorMessage } from "../utils/format";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    getAllVideos({ page: 1, limit: 24, sortBy: "createdAt", sortType: "desc", videoType: "video" })
      .then((data) => {
        if (!ignore) setVideos(data?.docs || []);
      })
      .catch((err) => !ignore && setError(apiErrorMessage(err)))
      .finally(() => !ignore && setIsLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading) return <Loader label="Loading videos" />;
  if (error) return <p className="py-16 text-center text-(--color-danger)">{error}</p>;
  if (!videos.length)
    return (
      <div className="py-24 text-center">
        <p className="font-(family-name:--font-display) text-2xl">Nothing here yet</p>
        <p className="mt-2 text-sm text-(--color-muted)">Be the first to publish a video.</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}