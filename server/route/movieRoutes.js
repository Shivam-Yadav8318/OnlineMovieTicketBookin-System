import express from "express";
import { verifyAdminToken } from "../middleware/auth.js";
import {
  searchMovies,
  addShow,
  getShows,
  getShow,
} from "../controler/showControler.js";

const router = express.Router();

// Public
router.get("/all", getShows);
router.get("/search", searchMovies);
router.get("/:movieId", getShow);

// Admin only (standalone admin login, not Clerk)
router.post("/add", verifyAdminToken, addShow);

export default router;
