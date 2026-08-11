import { Router } from "express";
import { searchMovies, getMovieById, getPopularMovies } from "../controllers/movieController.js";

const router = Router();

router.get("/search", searchMovies);
router.get("/popular", getPopularMovies);
router.get("/:id", getMovieById);

export default router;
