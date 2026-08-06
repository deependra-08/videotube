import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPlaylistById, removeVideoFromPlaylist } from "../api/playlists";
import { useAuth } from "../context/AuthContext";
import VideoCard from "../components/VideoCard";
import Loader from "../components/Loader";
import { apiErrorMessage } from "../utils/format";

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setIsLoading(true);
    getPlaylistById(playlistId)
      .then(setPlaylist)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [playlistId]);

  const handleRemove = async (videoId) => {
    await removeVideoFromPlaylist(videoId, playlistId);
    setPlaylist((prev) => ({ ...prev, videos: prev.videos.filter((v) => v._id !== videoId) }));
  };

  if (isLoading) return <Loader label="Loading playlist" />;
  if (error) return <p className="py-16 text-center text-(--color-danger)">{error}</p>;
  if (!playlist) return null;

  const isOwner = user?._id === playlist.owner?._id;

  return (
    <div>
      <h1 className="font-(family-name:--font-display) text-2xl">{playlist.name}</h1>
      <p className="mt-1 text-sm text-(--color-muted)">{playlist.description}</p>
      <p className="mt-1 text-xs text-(--color-muted)">{playlist.videos?.length || 0} videos</p>

      {!playlist.videos?.length ? (
        <p className="mt-8 text-sm text-(--color-muted)">This playlist is empty.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlist.videos.map((video) => (
            <div key={video._id}>
              <VideoCard video={video} />
              {isOwner && (
                <button
                  onClick={() => handleRemove(video._id)}
                  className="mt-2 text-xs text-(--color-danger)"
                >
                  Remove from playlist
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
