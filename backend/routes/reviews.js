import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { addReview, getMyReviews } from "../controllers/reviewController.js";

const router = Router();

router.use(requireAuth);
router.post("/", addReview);
router.get("/me", getMyReviews);

export default router;
