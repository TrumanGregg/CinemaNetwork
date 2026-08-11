import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getRecommendations } from "../controllers/recommendationController.js";

const router = Router();

router.use(requireAuth);
router.get("/", getRecommendations);

export default router;
