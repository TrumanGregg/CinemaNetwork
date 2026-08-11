import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import movieRoutes from "./routes/movies.js";
import watchlistRoutes from "./routes/watchlist.js";
import socialRoutes from "./routes/social.js";
import recommendationRoutes from "./routes/recommendations.js";
import reviewRoutes from "./routes/reviews.js";
import authRoutes from "./routes/auth.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// ---------- Security & parsing middleware ----------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/v1", limiter);

// ---------- Health check ----------
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// ---------- API routes (base URL: /api/v1) ----------
app.use("/api/v1/movies", movieRoutes);
app.use("/api/v1/watchlist", watchlistRoutes);
app.use("/api/v1/social", socialRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/auth", authRoutes);

// ---------- Error handling ----------
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Movie app backend listening on http://localhost:${PORT}`);
});
