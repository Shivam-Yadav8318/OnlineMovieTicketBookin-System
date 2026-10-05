import jwt from "jsonwebtoken";

// POST /api/admin/login  { username, password }
// A simple, standalone admin login that has nothing to do with Clerk.
// Credentials are compared against ADMIN_USERNAME / ADMIN_PASSWORD in
// server/.env, and a signed JWT is returned for the admin dashboard to use
// on subsequent requests (sent back as the `x-admin-token` header).
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_JWT_SECRET) {
      console.log(
        "ADMIN LOGIN ERROR: ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_JWT_SECRET is not set in server/.env"
      );
      return res.status(500).json({
        success: false,
        message: "Admin login is not configured on the server yet.",
      });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { role: "admin", username },
      ADMIN_JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      token,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.log("ADMIN LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/admin/verify — lets the frontend check a stored token is still
// valid (e.g. on page load) without repeating the login form unnecessarily.
export const verifyAdminSession = async (req, res) => {
  return res.status(200).json({
    success: true,
    isAdmin: true,
  });
};
