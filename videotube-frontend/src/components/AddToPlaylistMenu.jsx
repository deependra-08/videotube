import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { addVideoToPlaylist, createPlaylist, getUserPlaylists } from "../api/playlists";

export default function AddToPlaylistMenu({ videoId }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newName, setNewName] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (open && user) {
      getUserPlaylists(user._id).then(setPlaylists).catch(() => {});
    }
  }, [open, user]);

  const handleAdd = async (playlistId) => {
    try {
      await addVideoToPlaylist(videoId, playlistId);
      setStatus("Added ✓");
    } catch {
      setStatus("Already in playlist");
    }
    setTimeout(() => setStatus(""), 1500);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const playlist = await createPlaylist({ name: newName.trim(), description: newName.trim() });
    await addVideoToPlaylist(videoId, playlist._id);
    setPlaylists((prev) => [playlist, ...prev]);
    setNewName("");
    setStatus("Added ✓");
    setTimeout(() => setStatus(""), 1500);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-(--color-border) px-4 py-2 text-sm hover:bg-(--color-surface-2)"
      >
        Save
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-(--color-border) bg-(--color-surface) p-3 shadow-xl"
        >
          <p className="mb-2 text-xs font-medium text-(--color-muted)">Save to playlist</p>
          <div className="max-h-48 overflow-y-auto">
            {playlists.map((p) => (
              <button
                key={p._id}
                onClick={() => handleAdd(p._id)}
                className="block w-full truncate rounded px-2 py-1.5 text-left text-sm hover:bg-(--color-surface-2)"
              >
                {p.name}
              </button>
            ))}
            {!playlists.length && (
              <p className="px-2 py-1.5 text-sm text-(--color-muted)">No playlists yet</p>
            )}
          </div>
          <div className="mt-2 flex gap-1.5 border-t border-(--color-border) pt-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New playlist name"
              className="min-w-0 flex-1 rounded border border-(--color-border) bg-(--color-bg) px-2 py-1 text-xs focus:border-(--color-accent) focus:outline-none"
            />
            <button
              onClick={handleCreate}
              className="rounded bg-(--color-accent) px-2 py-1 text-xs text-(--color-bg)"
            >
              Create
            </button>
          </div>
          {status && <p className="mt-1.5 text-xs text-(--color-accent)">{status}</p>}
        </div>
      )}
    </div>
  );
}
