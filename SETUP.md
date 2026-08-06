# Videotube — Full Stack

A YouTube-style video platform: Node/Express/MongoDB backend + React (Vite + Tailwind) frontend.

## What changed

### Backend (`videotube-backend/`)
The backend had several serious bugs that made most of it non-functional. All are fixed:

- `app.js` only mounted the `users` router — video, comment, like, playlist, subscription,
  tweet, dashboard, and healthcheck routes existed but were unreachable. All are now wired in.
- Added a global JSON error handler and a JSON 404 handler (previously errors returned an
  HTML crash page, which breaks any frontend/API consumer).
- `src/models/video.models.js` contained **controller code**, not a schema (and imported a
  file that didn't exist). The real `Video` schema didn't exist anywhere in the codebase.
  Rebuilt the schema and moved the working controller logic to `src/controllers/video.controllers.js`.
- `Like` schema's field was named `like`, but every controller queried `likedBy` — likes
  silently never worked. Renamed the field.
- `refreshAccessToken` had swapped `(res, req)` parameters.
- Fixed typos: `user?._refreshToken` → `user?.refreshToken`, `channnel` → `channel`,
  `localfield` → `localField`, `"Subscriptions"` → `"subscriptions"` (Mongo collection casing).
- `watchHistory` ref pointed at `"video"` (lowercase) instead of the registered model name `"Video"`.
- Added the missing `mongoose-aggregate-paginate-v2` dependency (used by two models but absent
  from `package.json`).
- Cookies were hardcoded `secure: true`, which silently breaks login over plain `http://localhost`
  in development — now environment-aware, with `sameSite` set for cross-origin frontend/backend setups.
- Multer kept original filenames (upload collisions) — now generates unique names.
- Added `.env.sample` (there was no environment template at all).
- Channel pages and playlist views required login just to *view* them — added an optional-auth
  middleware so public browsing works, while still personalizing "Subscribed" state for logged-in viewers.
- Video feeds, liked-videos, and playlist videos weren't populating the uploader's profile info
  (avatar/name), which any frontend needs to render a video card — added the lookups.
- `getVideoById` now returns `likesCount` and whether the current viewer has liked the video, and
  records the video in the viewer's watch history.

I verified these by booting the server (with the global error handler in place) and confirming
`/api/v1/healthcheck` and a protected route both return clean JSON. **I could not run a full
database-backed integration test in this environment** (MongoDB binary downloads are blocked by
sandbox network policy) — please run `npm run dev` locally with a real MongoDB connection and
exercise the flows below before deploying.

### Frontend (`videotube-frontend/`)
Built from scratch: Vite + React + Tailwind CSS v4, React Router, Axios (with automatic
refresh-token retry on 401). Covers the full backend feature set:

- Auth: register (with avatar/cover upload), login, logout, session persistence
- Home feed, search
- Watch page: video player, like, subscribe, save-to-playlist, comments (add/edit/delete)
- Upload, edit, delete, publish/unpublish videos
- Channel pages (public): videos, playlists, community posts, about
- Creator dashboard: stats + manage your videos
- Playlists: create, view, add/remove videos, delete
- Watch history, liked videos
- Account settings: profile details, avatar, cover image, password change

## Running it

### Backend
```
cd videotube-backend
npm install
cp .env.sample .env   # fill in a real MongoDB URI, JWT secrets, Cloudinary keys
npm run dev
```

### Frontend
```
cd videotube-frontend
npm install
cp .env.example .env   # points at http://localhost:8000/api/v1 by default
npm run dev
```

Then open the frontend dev server URL (Vite will print it, typically `http://localhost:5173`).

## Suggested test pass
1. Register a new account (needs an avatar image).
2. Upload a video.
3. Open it from another (or the same) account, like it, comment, subscribe to the channel.
4. Create a playlist and add the video to it.
5. Check Dashboard, Watch History, and Liked Videos all reflect the activity above.
6. Edit the video's title/thumbnail, then unpublish/republish it.
