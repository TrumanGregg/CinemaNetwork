import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { syncProfile, getMe } from "../controllers/authController.js";

const router = Router();

router.use(requireAuth);
router.post("/sync", syncProfile);
router.get("/me", getMe);

export default router;
