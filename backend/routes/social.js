import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getSocialFeed, requestFriend, respondToFriendRequest } from "../controllers/socialController.js";

const router = Router();

router.use(requireAuth);
router.get("/feed", getSocialFeed);
router.post("/friends", requestFriend);
router.patch("/friends/:connectionId", respondToFriendRequest);

export default router;
