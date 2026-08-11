import { FirebaseService } from "../services/firebaseService.js";
import { TMDBService } from "../services/tmdbService.js";
import { ApiError } from "../middleware/errorHandler.js";

const VALID_STATUSES = ["Plan to Watch", "Watching", "Watched", "Dropped"];

// GET /watchlist
export async function getWatchlist(req, res, next) {
  try {
    const items = await FirebaseService.getWatchlist(req.user.uid);
    const hydration = await TMDBService.hydrateMovies(items.map((i) => i.movieId));
    const hydrated = items.map((item) => ({
      ...item,
      title: hydration[item.movieId]?.title ?? null,
      posterPath: hydration[item.movieId]?.poster_path ?? null,
    }));
    res.status(200).json(hydrated);
  } catch (err) {
    next(err);
  }
}

// POST /watchlist
export async function addToWatchlist(req, res, next) {
  try {
    const { movieId, status = "Plan to Watch" } = req.body;
    if (!movieId) throw new ApiError(400, "Bad Request", "Missing or malformed request body.");
    if (!VALID_STATUSES.includes(status)) {
      throw new ApiError(400, "Bad Request", `status must be one of: ${VALID_STATUSES.join(", ")}`);
    }
    const itemId = await FirebaseService.addWatchlistItem(req.user.uid, { movieId, status });
    res.status(201).json({ message: "Movie successfully added to your watchlist.", itemId });
  } catch (err) {
    next(err);
  }
}

// PATCH /watchlist/:itemId
export async function updateWatchlistItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const { status } = req.body;
    if (status && !VALID_STATUSES.includes(status)) {
      throw new ApiError(400, "Bad Request", `status must be one of: ${VALID_STATUSES.join(", ")}`);
    }
    const updated = await FirebaseService.updateWatchlistItem(req.user.uid, itemId, { status });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /watchlist/:itemId
export async function deleteWatchlistItem(req, res, next) {
  try {
    const { itemId } = req.params;
    await FirebaseService.deleteWatchlistItem(req.user.uid, itemId);
    res.status(200).json({ message: "Watchlist item removed." });
  } catch (err) {
    next(err);
  }
}
