import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  deleteWatchlistItem,
} from "../controllers/watchlistController.js";

const router = Router();

router.use(requireAuth);
router.get("/", getWatchlist);
router.post("/", addToWatchlist);
router.patch("/:itemId", updateWatchlistItem);
router.delete("/:itemId", deleteWatchlistItem);

export default router;
