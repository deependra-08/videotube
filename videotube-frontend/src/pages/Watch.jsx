import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getVideoById, deleteVideo } from "../api/videos";
import { getChannelProfile } from "../api/users";
import { useAuth } from "../context/AuthContext";
import LikeButton from "../components/LikeButton";
import SubscribeButton from "../components/SubscribeButton";
import CommentSection from "../components/CommentSection";
import AddToPlaylistMenu from "../components/AddToPlaylistMenu";
import Loader from "../components/Loader";
import { getAllVideos } from "../api/videos";
import { formatCount, timeAgo, apiErrorMessage } from "../utils/format";

export default function Watch() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [channel, setChannel] = useState(null);
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError("");

    getVideoById(videoId)
      .then(async (data) => {
        if (ignore) return;
        setVideo(data);
        getAllVideos({ limit: 12 })
          .then((res) => !ignore && setRelated((res?.docs || []).filter((v) => v._id !== videoId)))
          .catch(() => {});
        if (data?.owner?.username) {
          getChannelProfile(data.owner.username)
            .then((c) => !ignore && setChannel(c))
            .catch(() => {});
        }
      })
      .catch((err) => !ignore && setError(apiErrorMessage(err, "Video not found")))
      .finally(() => !ignore && setIsLoading(false));

    return () => {
      ignore = true;
    };
  }, [videoId]);

  const handleDelete = async () => {
    if (!confirm("Delete this video? This can't be undone.")) return;
    await deleteVideo(videoId);
    navigate(`/channel/${user.username}`);
  };

  if (isLoading) return <Loader label="Loading video" />;
  if (error) return <p className="py-16 text-center text-(--color-danger)">{error}</p>;
  if (!video) return null;

  const isOwner = user?._id === video.owner?._id;
  const description = video.description || "";
  const isLong = description.length > 220;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <div className="overflow-hidden rounded-xl bg-black ring-1 ring-(--color-border)">
          <video src={video.videoFile} controls poster={video.thumbnail} className="aspect-video w-full" />
        </div>

        <h1 className="mt-4 text-xl font-semibold leading-snug">{video.title}</h1>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Link to={`/channel/${video.owner?.username}`} className="flex items-center gap-3">
            <img
              src={video.owner?.avatar}
              alt={video.owner?.username}
              className="h-11 w-11 rounded-full object-cover ring-1 ring-(--color-border)"
            />
            <div>
              <p className="text-sm font-medium">{video.owner?.fullname}</p>
              <p className="text-xs text-(--color-muted)">
                {formatCount(channel?.subscribersCount ?? 0)} subscribers
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <SubscribeButton
              channelId={video.owner?._id}
              initialSubscribed={!!channel?.isSubscribed}
              subscriberCount={channel?.subscribersCount ?? 0}
            />
            <LikeButton videoId={video._id} initialLiked={video.isLiked} initialCount={video.likesCount} />
            {user && <AddToPlaylistMenu videoId={video._id} />}
            {isOwner && (
              <>
                <Link
                  to={`/edit/${video._id}`}
                  className="rounded-full border border-(--color-border) px-4 py-2 text-sm hover:bg-(--color-surface-2)"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="rounded-full border border-(--color-danger) px-4 py-2 text-sm text-(--color-danger) hover:bg-(--color-danger)/10"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-(--color-surface) p-4 text-sm">
          <p className="mb-1 font-medium text-(--color-muted)">
            {formatCount(video.views)} views · {timeAgo(video.createdAt)}
          </p>
          <p className="whitespace-pre-wrap">
            {isLong && !showFullDescription ? `${description.slice(0, 220)}…` : description}
          </p>
          {isLong && (
            <button
              onClick={() => setShowFullDescription((v) => !v)}
              className="mt-2 text-xs font-medium text-(--color-accent)"
            >
              {showFullDescription ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        <CommentSection videoId={video._id} />
      </div>

      <aside className="flex flex-col gap-4">
        {related.map((v) => (
          <RelatedRow key={v._id} video={v} />
        ))}
      </aside>
    </div>
  );
}

function RelatedRow({ video }) {
  return (
    <Link to={`/watch/${video._id}`} className="flex gap-3">
      <div className="aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-(--color-surface-2)">
        <img src={video.thumbnail} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-medium">{video.title}</p>
        <p className="mt-1 text-xs text-(--color-muted)">{video.owner?.fullname}</p>
        <p className="text-xs text-(--color-muted)">{formatCount(video.views)} views</p>
      </div>
    </Link>
  );
}
