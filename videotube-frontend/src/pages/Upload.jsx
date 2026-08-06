import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publishVideo } from "../api/videos";
import { apiErrorMessage } from "../utils/format";

export default function Upload() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "" });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile || !thumbnail) {
      setError("Please choose a video file and a thumbnail image");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnail);
      const video = await publishVideo(formData);
      navigate(`/watch/${video._id}`);
    } catch (err) {
      setError(apiErrorMessage(err, "Upload failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl py-6">
      <h1 className="mb-6 font-(family-name:--font-display) text-2xl">Publish a video</h1>
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
          <label className="mb-1 block text-sm text-(--color-muted)">Video file</label>
          <input
            required
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-(--color-muted) file:mr-3 file:rounded-full file:border-0 file:bg-(--color-surface-2) file:px-3 file:py-1.5 file:text-(--color-ink)"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-(--color-muted)">Thumbnail</label>
          <input
            required
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
          {isSubmitting ? "Uploading…" : "Publish"}
        </button>
      </form>
    </div>
  );
}
