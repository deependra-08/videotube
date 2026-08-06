import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVideoById, updateVideo, togglePublishStatus } from "../api/videos";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import { apiErrorMessage } from "../utils/format";

export default function EditVideo() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [form, setForm] = useState({ title: "", description: "" });
  const [thumbnail, setThumbnail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getVideoById(videoId)
      .then((data) => {
        setVideo(data);
        setForm({ title: data.title, description: data.description });
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      if (thumbnail) formData.append("thumbnail", thumbnail);
      await updateVideo(videoId, formData);
      navigate(`/watch/${videoId}`);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save changes"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async () => {
    const updated = await togglePublishStatus(videoId);
    setVideo(updated);
  };

  if (isLoading) return <Loader label="Loading video" />;
  if (error && !video) return <p className="py-16 text-center text-(--color-danger)">{error}</p>;
  if (!video) return null;

  if (user._id !== video.owner?._id && user._id !== video.owner) {
    return <p className="py-16 text-center text-(--color-danger)">You can't edit this video.</p>;
  }

  return (
    <div className="mx-auto max-w-xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-(family-name:--font-display) text-2xl">Edit video</h1>
        <button
          onClick={handleTogglePublish}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            video.isPublished
              ? "border border-(--color-border)"
              : "bg-(--color-accent) text-(--color-bg)"
          }`}
        >
          {video.isPublished ? "Unpublish" : "Publish"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-(--color-muted)">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm focus:border-(--color-accent) focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-(--color-muted)">Description</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm focus:border-(--color-accent) focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-(--color-muted)">Replace thumbnail</label>
          <img src={video.thumbnail} alt="" className="mb-2 h-32 rounded-lg object-cover" />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-(--color-muted) file:mr-3 file:rounded-full file:border-0 file:bg-(--color-surface-2) file:px-3 file:py-1.5 file:text-(--color-ink)"
          />
        </div>

        {error && <p className="text-sm text-(--color-danger)">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-(--color-accent) py-2.5 text-sm font-medium text-(--color-bg) transition hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
