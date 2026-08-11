import axios from "axios";
import { ApiError } from "../middleware/errorHandler.js";

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 8000,
  params: { api_key: TMDB_API_KEY },
});

function ensureConfigured() {
  if (!TMDB_API_KEY || TMDB_API_KEY.includes("your_")) {
    throw new ApiError(500, "Internal Error", "TMDB_API_KEY is not configured on the server.");
  }
}

async function handle(promise) {
  try {
    const { data } = await promise;
    return data;
  } catch (err) {
    if (err.response) {
      throw new ApiError(
        err.response.status === 404 ? 404 : 500,
        err.response.status === 404 ? "Not Found" : "Internal Error",
        err.response.status === 404
          ? "The requested entity does not exist."
          : "TMDB API request failed."
      );
    }
    throw new ApiError(500, "Internal Error", "TMDB API timeout or connection failure.");
  }
}

export const TMDBService = {
  /** GET /movies/search */
  searchMovies(query, page = 1) {
    ensureConfigured();
    return handle(tmdbClient.get("/search/movie", { params: { query, page } }));
  },

  /** GET /movies/:id */
  getMovieById(id) {
    ensureConfigured();
    return handle(tmdbClient.get(`/movie/${id}`));
  },

  /** Fetch multiple movies by id in parallel - used for "data hydration" */
  async hydrateMovies(movieIds = []) {
    ensureConfigured();
    const unique = [...new Set(movieIds)];
    const results = await Promise.allSettled(unique.map((id) => this.getMovieById(id)));
    const byId = {};
    results.forEach((r, i) => {
      if (r.status === "fulfilled") byId[unique[i]] = r.value;
    });
    return byId;
  },

  getPopular(page = 1) {
    ensureConfigured();
    return handle(tmdbClient.get("/movie/popular", { params: { page } }));
  },
};
