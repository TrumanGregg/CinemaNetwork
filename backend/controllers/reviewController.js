import { FirebaseService } from "../services/firebaseService.js";
import { ApiError } from "../middleware/errorHandler.js";

// POST /reviews
export async function addReview(req, res, next) {
  try {
    const { movieId, rating, comment } = req.body;
    if (!movieId || rating === undefined) {
      throw new ApiError(400, "Bad Request", "movieId and rating are required.");
    }
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, "Bad Request", "rating must be between 1 and 5.");
    }
    const reviewId = await FirebaseService.addReview(req.user.uid, { movieId, rating, comment: comment || "" });
    res.status(201).json({ message: "Review posted.", reviewId });
  } catch (err) {
    next(err);
  }
}

// GET /reviews/me
export async function getMyReviews(req, res, next) {
  try {
    const reviews = await FirebaseService.getUserReviews(req.user.uid);
    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
}
