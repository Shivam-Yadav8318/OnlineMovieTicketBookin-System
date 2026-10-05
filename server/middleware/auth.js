import jwt from "jsonwebtoken";

// Verifies the standalone admin JWT (issued by /api/admin/login), sent by
// the frontend as the `x-admin-token` header. This is completely separate
// from Clerk — admins log in with a username/password from server/.env,
// not a Clerk account.
export const verifyAdminToken = (req, res, next) => {
  try {
    const token = req.headers["x-admin-token"];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin login required.",
      });
    }

    const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

    if (!ADMIN_JWT_SECRET) {
      console.log("ADMIN AUTH ERROR: ADMIN_JWT_SECRET is not set in server/.env");
      return res.status(500).json({
        success: false,
        message: "Admin login is not configured on the server yet.",
      });
    }

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);

    if (decoded?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins only.",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Admin session expired or invalid. Please log in again.",
    });
  }
};

// Middleware that just requires the user to be signed in via Clerk (used
// for booking/favorites/etc — regular site users, not admins).
export const requireAuth = (req, res, next) => {
  try {
    const { userId } = req.auth() || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please sign in.",
      });
    }

    next();
  } catch (error) {
    console.log("AUTH MIDDLEWARE ERROR:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized.",
    });
  }
};
