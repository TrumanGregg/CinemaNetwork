import { TMDBService } from "../services/tmdbService.js";
import { ApiError } from "../middleware/errorHandler.js";

// GET /movies/search?query=&page=
export async function searchMovies(req, res, next) {
  try {
    const { query, page = 1 } = req.query;
    if (!query) {
      throw new ApiError(400, "Bad Request", "Missing or malformed query parameters.");
    }
    const data = await TMDBService.searchMovies(query, Number(page));
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /movies/:id
export async function getMovieById(req, res, next) {
  try {
    const { id } = req.params;
    const data = await TMDBService.getMovieById(id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /movies/popular
export async function getPopularMovies(req, res, next) {
  try {
    const { page = 1 } = req.query;
    const data = await TMDBService.getPopular(Number(page));
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
