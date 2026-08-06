import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createPlaylist, deletePlaylist, getUserPlaylists } from "../api/playlists";
import Loader from "../components/Loader";

export default function Playlists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getUserPlaylists(user._id)
      .then(setPlaylists)
      .finally(() => setIsLoading(false));
  }, [user._id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const playlist = await createPlaylist({
        name: form.name.trim(),
        description: form.description.trim() || form.name.trim(),
      });
      setPlaylists((prev) => [{ ...playlist, videos: [] }, ...prev]);
      setForm({ name: "", description: "" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this playlist?")) return;
    await deletePlaylist(id);
    setPlaylists((prev) => prev.filter((p) => p._id !== id));
  };

  if (isLoading) return <Loader label="Loading playlists" />;

  return (
    <div>
      <h1 className="mb-6 font-(family-name:--font-display) text-2xl">Your playlists</h1>

      <form onSubmit={handleCreate} className="mb-8 flex max-w-lg flex-col gap-3 sm:flex-row">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="New playlist name"
          className="flex-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm focus:border-(--color-accent) focus:outline-none"
        />
        <button
          type="submit"
          disabled={creating}
          className="rounded-full bg-(--color-accent) px-4 py-2.5 text-sm font-medium text-(--color-bg) disabled:opacity-60"
        >
          Create
        </button>
      </form>

      {playlists.length === 0 ? (
        <p className="text-sm text-(--color-muted)">No playlists yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((p) => (
            <div key={p._id} className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
              <Link to={`/playlist/${p._id}`} className="font-medium hover:text-(--color-accent)">
                {p.name}
              </Link>
              <p className="mt-1 text-xs text-(--color-muted)">{p.videos?.length || 0} videos</p>
              <button
                onClick={() => handleDelete(p._id)}
                className="mt-3 text-xs text-(--color-danger)"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
