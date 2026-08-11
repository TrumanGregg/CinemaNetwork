import { FirebaseService } from "../services/firebaseService.js";
import { TMDBService } from "../services/tmdbService.js";
import { ApiError } from "../middleware/errorHandler.js";

// GET /social/feed
// Per design-review feedback: limited to recent activity only (last 7 days)
// to reduce database reads and improve load time.
export async function getSocialFeed(req, res, next) {
  try {
    const friendIds = await FirebaseService.getFriendIds(req.user.uid);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activity = await FirebaseService.getRecentActivity(friendIds, sevenDaysAgo);

    const hydration = await TMDBService.hydrateMovies(activity.map((a) => a.movieId));
    const hydrated = activity.map((a) => ({
      ...a,
      movieTitle: hydration[a.movieId]?.title ?? null,
    }));

    res.status(200).json(hydrated);
  } catch (err) {
    next(err);
  }
}

// POST /social/friends
export async function requestFriend(req, res, next) {
  try {
    const { friendUserId } = req.body;
    if (!friendUserId) throw new ApiError(400, "Bad Request", "Missing friendUserId in request body.");
    const connectionId = await FirebaseService.requestFriend(req.user.uid, friendUserId);
    res.status(201).json({ message: "Friend request sent.", connectionId });
  } catch (err) {
    next(err);
  }
}

// PATCH /social/friends/:connectionId
export async function respondToFriendRequest(req, res, next) {
  try {
    const { connectionId } = req.params;
    const { accept } = req.body;
    await FirebaseService.respondToFriendRequest(connectionId, Boolean(accept));
    res.status(200).json({ message: accept ? "Friend request accepted." : "Friend request declined." });
  } catch (err) {
    next(err);
  }
}
