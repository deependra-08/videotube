<p align="center">
  <img src="./logo-horizontal-on-dark.png" alt="videotube" width="420" />
</p>

<p align="center">
  A full-stack, YouTube-style video sharing platform built with the MERN stack.
</p>

<p align="center">
  <a href="https://videotube-jet.vercel.app">Live Demo</a> ·
  <a href="https://github.com/deependra-08/videotube/issues">Report a bug</a>
</p>

---

## About

videotube is a complete video-sharing platform built from the ground up to learn full-stack development: a REST API backend (Node.js, Express, MongoDB) and a React frontend, covering everything from JWT authentication and file uploads to a swipeable Shorts feed.

## Features

**Accounts**
- Register with avatar/cover image upload (Cloudinary)
- JWT access + refresh tokens, stored in httpOnly cookies, with automatic silent refresh on expiry
- Editable profile, avatar, cover image, and password from account settings

**Videos**
- Upload, edit, delete, and publish/unpublish videos
- Video playback with view counts and watch history tracking
- Search across titles and descriptions
- Like / unlike videos, with live counts

**Shorts**
- Dedicated vertical, swipeable Shorts feed (scroll-snap, autoplay-on-view, tap to unmute)
- Infinite scroll with no-repeat randomized batches
- Upload flow supports marking a video as a Short (or auto-detects by duration)

**Community**
- Comments — add, edit, delete
- Subscriptions — subscribe/unsubscribe to channels, subscriber counts
- Community posts (tweets) on channel pages
- Playlists — create, manage, add/remove videos

**Channels & creator tools**
- Public channel pages: videos, playlists, posts, about
- Creator dashboard: channel stats (views, subscribers, likes, video count) and video management
- Watch history and liked videos pages

## Tech stack

| | |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, React Router, Axios |
| **Backend** | Node.js, Express, MongoDB, Mongoose |
| **Auth** | JSON Web Tokens (access + refresh), httpOnly cookies, bcrypt |
| **Storage** | Cloudinary (video, image uploads) |
| **Deployment** | Render (backend), Vercel (frontend), MongoDB Atlas |

## Project structure

```
videotube/
├── videotube-backend/
│   ├── src/
│   │   ├── controllers/    # request handlers (users, videos, comments, likes, ...)
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── middlewares/    # auth, multer (uploads)
│   │   ├── utils/          # ApiError, ApiResponse, asyncHandler, cloudinary
│   │   ├── db/              # MongoDB connection
│   │   ├── seed.js          # sample data seeding script
│   │   ├── app.js
│   │   └── index.js
│   └── package.json
│
└── videotube-frontend/
    ├── src/
    │   ├── api/             # axios service functions, one file per resource
    │   ├── components/      # reusable UI (Navbar, VideoCard, CommentSection, ...)
    │   ├── pages/            # route-level views (Home, Watch, Shorts, Dashboard, ...)
    │   ├── context/          # AuthContext
    │   └── utils/            # formatting helpers
    └── package.json
```

## Getting started

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster)
- A [Cloudinary](https://cloudinary.com) account (free tier is fine) for file uploads

### Backend setup

```bash
cd videotube-backend
npm install
```

Create a `.env` file:

```dotenv
PORT=8000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=some_long_random_string
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=a_different_long_random_string
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run it:

```bash
npm run dev
```

Optional — seed the database with sample users, videos, comments, and subscriptions:

```bash
npm run seed
```

### Frontend setup

```bash
cd videotube-frontend
npm install
```

Create a `.env` file:

```dotenv
VITE_API_URL=http://localhost:8000/api/v1
```

Run it:

```bash
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## API overview

All routes are prefixed with `/api/v1`.

| Resource | Base path |
|---|---|
| Users (auth, profile) | `/users` |
| Videos | `/videos` |
| Comments | `/comments` |
| Likes | `/likes` |
| Playlists | `/playlists` |
| Subscriptions | `/subscriptions` |
| Community posts | `/tweets` |
| Creator dashboard | `/dashboard` |
| Health check | `/healthcheck` |

Notable auth endpoints: `POST /users/register`, `POST /users/login`, `POST /users/refresh-token`.

## Deployment

- **Backend** deploys on [Render](https://render.com) as a Node web service (root directory `videotube-backend`, build `npm install`, start `npm start`).
- **Frontend** deploys on [Vercel](https://vercel.com) (root directory `videotube-frontend`, framework preset Vite).
- Set the same environment variables from your local `.env` files in each platform's dashboard — and make sure `CORS_ORIGIN` (backend) and `VITE_API_URL` (frontend) point at each other's real deployed URLs, not `localhost`.

## Known limitations

- Cloudinary's free tier caps individual file uploads at 100MB.
- Render's free tier spins down after ~15 minutes of inactivity; the first request afterward can take 30-60s to respond.
- Video playback uses direct MP4 delivery rather than adaptive/HLS streaming.

## License

This project is for learning purposes. Feel free to fork and adapt it.