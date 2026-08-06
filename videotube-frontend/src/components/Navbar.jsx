import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-(--color-border) bg-(--color-bg)/95 px-4 backdrop-blur sm:px-6">
      <Link to="/" className="flex shrink-0 items-center gap-2">
        <span className="tally-light" />
        <span className="font-(family-name:--font-display) text-xl tracking-tight text-(--color-ink)">
          videotube
        </span>
      </Link>

      <form onSubmit={handleSearch} className="mx-auto hidden max-w-lg flex-1 sm:block">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos"
          className="w-full rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm text-(--color-ink) placeholder:text-(--color-muted) focus:border-(--color-accent) focus:outline-none"
        />
      </form>

      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <Link
              to="/upload"
              className="hidden rounded-full bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-bg) transition hover:brightness-110 sm:block"
            >
              Upload
            </Link>
            <div className="relative">
              <button onClick={() => setMenuOpen((v) => !v)} className="block">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-(--color-border)"
                />
              </button>
              {menuOpen && (
                <div
                  onMouseLeave={() => setMenuOpen(false)}
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-(--color-border) bg-(--color-surface) py-1 shadow-xl"
                >
                  <Link
                    to={`/channel/${user.username}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-(--color-surface-2)"
                  >
                    Your channel
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-(--color-surface-2)"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-(--color-surface-2)"
                  >
                    Watch history
                  </Link>
                  <Link
                    to="/liked-videos"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-(--color-surface-2)"
                  >
                    Liked videos
                  </Link>
                  <Link
                    to="/playlists"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-(--color-surface-2)"
                  >
                    Playlists
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-(--color-surface-2)"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-(--color-danger) hover:bg-(--color-surface-2)"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="rounded-full border border-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-accent) transition hover:bg-(--color-accent) hover:text-(--color-bg)"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
