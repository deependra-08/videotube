import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getChannelStats, getChannelVideos } from "../api/dashboard";
import { deleteVideo, togglePublishStatus } from "../api/videos";
import Loader from "../components/Loader";
import { formatCount, timeAgo } from "../utils/format";

const STAT_LABELS = [
  ["totalVideos", "Videos"],
  ["totalViews", "Views"],
  ["totalSubscribers", "Subscribers"],
  ["totalLikes", "Likes"],
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const [statsData, videosData] = await Promise.all([getChannelStats(), getChannelVideos()]);
    setStats(statsData);
    setVideos(videosData);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleTogglePublish = async (videoId) => {
    const updated = await togglePublishStatus(videoId);
    setVideos((prev) => prev.map((v) => (v._id === videoId ? updated : v)));
  };

  const handleDelete = async (videoId) => {
    if (!confirm("Delete this video?")) return;
    await deleteVideo(videoId);
    setVideos((prev) => prev.filter((v) => v._id !== videoId));
  };

  if (isLoading) return <Loader label="Loading dashboard" />;

  return (
    <div>
      <h1 className="mb-6 font-(family-name:--font-display) text-2xl">Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_LABELS.map(([key, label]) => (
          <div key={key} className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
            <p className="text-2xl font-semibold">{formatCount(stats?.[key] ?? 0)}</p>
            <p className="text-xs text-(--color-muted)">{label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Your videos</h2>
        <Link to="/upload" className="rounded-full bg-(--color-accent) px-4 py-2 text-sm text-(--color-bg)">
          Upload
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-(--color-border)">
        {videos.length === 0 ? (
          <p className="p-6 text-sm text-(--color-muted)">You haven't uploaded anything yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-(--color-surface) text-xs uppercase text-(--color-muted)">
              <tr>
                <th className="px-4 py-3">Video</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v._id} className="border-t border-(--color-border)">
                  <td className="px-4 py-3">
                    <Link to={`/watch/${v._id}`} className="flex items-center gap-3">
                      <img src={v.thumbnail} alt="" className="h-12 w-20 rounded object-cover" />
                      <span className="line-clamp-2 max-w-xs">{v.title}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublish(v._id)}
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        v.isPublished
                          ? "bg-(--color-accent)/20 text-(--color-accent)"
                          : "bg-(--color-surface-2) text-(--color-muted)"
                      }`}
                    >
                      {v.isPublished ? "Published" : "Private"}
                    </button>
                  </td>
                  <td className="px-4 py-3">{formatCount(v.views)}</td>
                  <td className="px-4 py-3 text-(--color-muted)">{timeAgo(v.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3 text-xs">
                      <Link to={`/edit/${v._id}`} className="text-(--color-accent)">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(v._id)} className="text-(--color-danger)">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
