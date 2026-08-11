import { auth } from "../firebase.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

async function request(path, { method = "GET", body, auth: needsAuth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (needsAuth) {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

export const api = {
  // Movies (public)
  searchMovies: (query, page = 1) =>
    request(`/movies/search?query=${encodeURIComponent(query)}&page=${page}`, { auth: false }),
  getMovie: (id) => request(`/movies/${id}`, { auth: false }),
  getPopular: (page = 1) => request(`/movies/popular?page=${page}`, { auth: false }),

  // Auth
  syncProfile: () => request("/auth/sync", { method: "POST" }),

  // Watchlist
  getWatchlist: () => request("/watchlist"),
  addToWatchlist: (movieId, status) => request("/watchlist", { method: "POST", body: { movieId, status } }),
  updateWatchlistItem: (itemId, updates) => request(`/watchlist/${itemId}`, { method: "PATCH", body: updates }),
  removeFromWatchlist: (itemId) => request(`/watchlist/${itemId}`, { method: "DELETE" }),

  // Reviews
  addReview: (movieId, rating, comment) =>
    request("/reviews", { method: "POST", body: { movieId, rating, comment } }),
  getMyReviews: () => request("/reviews/me"),

  // Social
  getSocialFeed: () => request("/social/feed"),
  requestFriend: (friendUserId) => request("/social/friends", { method: "POST", body: { friendUserId } }),
  respondToFriendRequest: (connectionId, accept) =>
    request(`/social/friends/${connectionId}`, { method: "PATCH", body: { accept } }),

  // Recommendations
  getRecommendations: () => request("/recommendations"),
};
