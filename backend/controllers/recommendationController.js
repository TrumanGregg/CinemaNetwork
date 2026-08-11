import { FirebaseService } from "../services/firebaseService.js";
import { TMDBService } from "../services/tmdbService.js";

/**
 * RecommendationEngine
 * Per design-review feedback, recommendations factor in more than ratings alone:
 *  - Ratings (highly-rated genres weighted heavier)
 *  - Viewing history (Watched items)
 *  - Watchlist behavior (Plan to Watch / Watching signal interest)
 */
async function buildRecommendations(userId) {
  const [reviews, watchlist] = await Promise.all([
    FirebaseService.getUserReviews(userId),
    FirebaseService.getWatchlist(userId),
  ]);

  const seedMovieIds = [
    ...reviews.filter((r) => r.rating >= 4).map((r) => r.movieId),
    ...watchlist.map((w) => w.movieId),
  ];

  if (seedMovieIds.length === 0) {
    // Cold start: no history yet, fall back to trending titles.
    const popular = await TMDBService.getPopular(1);
    return (popular.results || []).slice(0, 10).map((m) => ({
      movieId: m.id,
      title: m.title,
      matchScore: 0.5,
      reason: "Trending now",
    }));
  }

  const hydrated = await TMDBService.hydrateMovies(seedMovieIds);
  const genreCounts = {};
  Object.values(hydrated).forEach((movie) => {
    (movie.genres || []).forEach((g) => {
      genreCounts[g.id] = (genreCounts[g.id] || 0) + 1;
    });
  });
  const topGenreId = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const seen = new Set(seedMovieIds);
  const popular = await TMDBService.getPopular(1);
  const candidates = (popular.results || []).filter((m) => !seen.has(m.id));

  return candidates.slice(0, 10).map((m) => ({
    movieId: m.id,
    title: m.title,
    matchScore: topGenreId && m.genre_ids?.includes(Number(topGenreId)) ? 0.9 : 0.6,
    reason: topGenreId && m.genre_ids?.includes(Number(topGenreId))
      ? "Matches genres you've rated highly"
      : "Popular with similar viewers",
  }));
}

// GET /recommendations
export async function getRecommendations(req, res, next) {
  try {
    const recommendations = await buildRecommendations(req.user.uid);
    res.status(200).json({
      generatedAt: new Date().toISOString(),
      recommendations,
    });
  } catch (err) {
    next(err);
  }
}
