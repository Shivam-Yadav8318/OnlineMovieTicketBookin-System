import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createBooking,
  getOccupiedSeats,
} from "../controler/bookingController.js";

const router = express.Router();

router.post("/create", requireAuth, createBooking);
router.get("/seats/:showId", getOccupiedSeats);

export default router;
