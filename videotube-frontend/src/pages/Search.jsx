import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllVideos } from "../api/videos";
import VideoCard from "../components/VideoCard";
import Loader from "../components/Loader";
import { apiErrorMessage } from "../utils/format";

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    getAllVideos({ query, page: 1, limit: 24 })
      .then((data) => !ignore && setVideos(data?.docs || []))
      .catch((err) => !ignore && setError(apiErrorMessage(err)))
      .finally(() => !ignore && setIsLoading(false));
    return () => {
      ignore = true;
    };
  }, [query]);

  return (
    <div>
      <h1 className="mb-6 font-(family-name:--font-display) text-2xl">
        Results for &ldquo;{query}&rdquo;
      </h1>
      {isLoading ? (
        <Loader label="Searching" />
      ) : error ? (
        <p className="text-(--color-danger)">{error}</p>
      ) : !videos.length ? (
        <p className="text-(--color-muted)">No videos matched your search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
