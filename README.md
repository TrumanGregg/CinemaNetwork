# Movie Recommendation & Social Watchlist App

Full-stack implementation based on the CIS376 Group 1 design document: React frontend, Node/Express backend, Firebase (Auth + Firestore) for users/data, and TMDB for movie data.

## Project structure

```
movie-app/
├── backend/          Express API (port 5000)
├── frontend/          React + Vite app (port 5173)
└── firestore.rules    Security rules for the Firestore collections
```

## 1. Get your API keys (you said you don't have these yet)

**TMDB API key**
1. Create a free account at https://www.themoviedb.org
2. Go to Settings → API → request a "Developer" API key (v3 auth)
3. Copy the API Key (v3 auth)

**Firebase project**
1. Go to https://console.firebase.google.com → Create project
2. Build → Authentication → Sign-in method → enable **Google**
3. Build → Firestore Database → Create database (start in production mode)
4. Project Settings → General → "Your apps" → add a **Web app** → copy the config object (this feeds `frontend/.env`)
5. Project Settings → Service accounts → **Generate new private key** (downloads a JSON file — this feeds `backend/.env`)
6. Firestore → Rules → paste the contents of `firestore.rules` from this repo and publish

## 2. Configure environment variables

```bash
cd backend
cp .env.example .env
# fill in TMDB_API_KEY and the three FIREBASE_* values from the service account JSON

cd ../frontend
cp .env.example .env
# fill in the VITE_FIREBASE_* values from the Firebase web app config
```

## 3. Install and run

```bash
# Terminal 1
cd backend
npm install
npm run dev      # http://localhost:5000

# Terminal 2
cd frontend
npm install
npm run dev       # http://localhost:5173
```

Visit http://localhost:5173, sign in with Google, and the app is live end to end.

## API overview (backend, base path `/api/v1`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/movies/search?query=` | No | Search TMDB |
| GET | `/movies/popular` | No | Trending/popular movies |
| GET | `/movies/:id` | No | Movie details |
| POST | `/auth/sync` | Yes | Create/fetch the user's profile doc on first login |
| GET | `/watchlist` | Yes | Get the signed-in user's watchlist (hydrated with movie titles/posters) |
| POST | `/watchlist` | Yes | Add a movie `{ movieId, status }` |
| PATCH | `/watchlist/:itemId` | Yes | Update status |
| DELETE | `/watchlist/:itemId` | Yes | Remove item |
| POST | `/reviews` | Yes | Post a rating/review `{ movieId, rating, comment }` |
| GET | `/reviews/me` | Yes | Your own reviews |
| GET | `/social/feed` | Yes | Friends' activity from the last 7 days |
| POST | `/social/friends` | Yes | Send a friend request `{ friendUserId }` |
| PATCH | `/social/friends/:connectionId` | Yes | Accept/decline `{ accept: true/false }` |
| GET | `/recommendations` | Yes | Personalized picks (genre history + watchlist + popularity fallback) |

Authenticated routes expect `Authorization: Bearer <Firebase ID token>`, which the frontend's `api/client.js` attaches automatically once a user is signed in.

## Design decisions carried over from the review feedback

- **Social feed is capped to the last 7 days** of friend activity to control Firestore read volume.
- **Recommendations** blend genre signals from highly-rated reviews *and* watchlist entries, not ratings alone, with a "trending" fallback for new users (cold start).
- **Firestore rules** enforce that a user can only write their own watchlist items, reviews, and friend connections.

## 4. Push to your existing GitHub repo

From inside this `movie-app` folder:

```bash
git init                     # skip if the folder is already a git repo
git remote add origin <your-repo-url>
git add .
git commit -m "Initial implementation: backend API, frontend app, Firestore rules"
git branch -M main
git push -u origin main
```

If your repo already has commits (e.g. a README from GitHub), pull first:

```bash
git remote add origin <your-repo-url>
git pull origin main --allow-unrelated-histories
git add .
git commit -m "Initial implementation"
git push -u origin main
```

## Next steps / things not yet wired up

- Deployment config (e.g. Render/Railway for backend, Vercel/Netlify for frontend) isn't included — let me know if you want that added.
- No automated tests yet.
- The recommendation engine is intentionally simple (genre-overlap heuristic) — good enough to demo, but call it out as a known simplification if your design doc's rubric expects a more advanced approach.
