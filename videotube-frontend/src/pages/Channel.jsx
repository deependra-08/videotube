import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getChannelProfile } from "../api/users";
import { getAllVideos } from "../api/videos";
import { getUserPlaylists } from "../api/playlists";
import { useAuth } from "../context/AuthContext";
import VideoCard from "../components/VideoCard";
import TweetFeed from "../components/TweetFeed";
import SubscribeButton from "../components/SubscribeButton";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";
import { formatCount, apiErrorMessage } from "../utils/format";

const TABS = ["Videos", "Playlists", "Posts", "About"];

export default function Channel() {
  const { username } = useParams();
  const { user } = useAuth();

  const [channel, setChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Videos");
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    getChannelProfile(username)
      .then(setChannel)
      .catch((err) => setError(apiErrorMessage(err, "Channel not found")))
      .finally(() => setIsLoading(false));
  }, [username]);

  useEffect(() => {
    if (!channel) return;
    getAllVideos({ userId: channel._id, limit: 50 }).then((data) => setVideos(data?.docs || []));
    getUserPlaylists(channel._id).then(setPlaylists);
  }, [channel]);

  if (isLoading) return <Loader label="Loading channel" />;
  if (error) return <p className="py-16 text-center text-(--color-danger)">{error}</p>;
  if (!channel) return null;

  const isOwner = user?._id === channel._id;

  return (
    <div>
      {channel.coverImage && (
        <div className="mb-4 aspect-[6/1] w-full overflow-hidden rounded-xl bg-(--color-surface-2)">
          <img src={channel.coverImage} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <img
          src={channel.avatar}
          alt={channel.username}
          className="h-20 w-20 rounded-full object-cover ring-1 ring-(--color-border)"
        />
        <div className="flex-1">
          <h1 className="font-(family-name:--font-display) text-2xl">{channel.fullname}</h1>
          <p className="text-sm text-(--color-muted)">
            @{channel.username} · {formatCount(channel.subscribersCount)} subscribers ·{" "}
            {formatCount(channel.channelSubscribedToCount)} subscribed
          </p>
        </div>
        {!isOwner && (
          <SubscribeButton
            channelId={channel._id}
            initialSubscribed={channel.isSubscribed}
            subscriberCount={channel.subscribersCount}
          />
        )}
        {isOwner && (
          <Link
            to="/settings"
            className="rounded-full border border-(--color-border) px-4 py-2 text-sm hover:bg-(--color-surface-2)"
          >
            Edit channel
          </Link>
        )}
      </div>

      <div className="mt-6 flex gap-1 border-b border-(--color-border)">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium ${
              tab === t
                ? "border-b-2 border-(--color-accent) text-(--color-ink)"
                : "text-(--color-muted) hover:text-(--color-ink)"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Videos" &&
          (videos.length ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((v) => (
                <VideoCard key={v._id} video={{ ...v, owner: channel }} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-(--color-muted)">No videos published yet.</p>
          ))}

        {tab === "Playlists" &&
          (playlists.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((p) => (
                <Link
                  key={p._id}
                  to={`/playlist/${p._id}`}
                  className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 hover:bg-(--color-surface-2)"
                >
                  <p className="font-medium">{p.name}</p>
                  <p className="mt-1 text-xs text-(--color-muted)">{p.videos?.length || 0} videos</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-(--color-muted)">No playlists yet.</p>
          ))}

        {tab === "Posts" && <TweetFeed channelId={channel._id} isOwner={isOwner} />}

        {tab === "About" && (
          <div className="max-w-xl text-sm text-(--color-muted)">
            <p>Email: {channel.email}</p>
            <p className="mt-2">
              Joined {new Date(channel.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
