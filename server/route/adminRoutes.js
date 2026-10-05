import express from "express";
import { verifyAdminToken } from "../middleware/auth.js";
import {
  getDashboardData,
  getAllShows,
  getAllBookings,
} from "../controler/dashboardController.js";
import {
  adminLogin,
  verifyAdminSession,
} from "../controler/adminAuthController.js";

const router = express.Router();

// Public — standalone admin login (username/password, not Clerk)
router.post("/login", adminLogin);

// Protected — require a valid admin JWT (x-admin-token header)
router.get("/is-admin", verifyAdminToken, verifyAdminSession);
router.get("/dashboard", verifyAdminToken, getDashboardData);
router.get("/all-shows", verifyAdminToken, getAllShows);
router.get("/all-bookings", verifyAdminToken, getAllBookings);

export default router;
