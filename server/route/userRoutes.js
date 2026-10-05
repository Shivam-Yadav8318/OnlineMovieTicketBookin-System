import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getUserBookings,
  updateFavorite,
  getFavorites,
} from "../controler/userController.js";

const router = express.Router();

router.get("/bookings", requireAuth, getUserBookings);
router.post("/update-favorite", requireAuth, updateFavorite);
router.get("/favorites", requireAuth, getFavorites);

export default router;
