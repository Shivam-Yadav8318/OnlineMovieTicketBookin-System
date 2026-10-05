import Booking from "../model/Booking.js";
import Show from "../model/Show.js";
import User from "../model/User.js";

// GET /api/admin/dashboard
export const getDashboardData = async (req, res) => {
  try {
    const activeShows = await Show.find({
      showDateTime: { $gte: new Date() },
    })
      .populate("movie")
      .sort({ showDateTime: 1 });

    const paidBookings = await Booking.find({ isPaid: true });

    const totalBookings = paidBookings.length;

    const totalRevenue = paidBookings.reduce(
      (sum, booking) => sum + (booking.amount || 0),
      0
    );

    const totalUser = await User.countDocuments();

    res.status(200).json({
      success: true,
      totalBookings,
      totalRevenue,
      activeShows,
      totalUser,
    });
  } catch (error) {
    console.log("DASHBOARD CONTROLLER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/admin/is-admin
// Simply confirms to the frontend that the protectAdmin middleware passed.
export const isAdminCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    isAdmin: true,
  });
};

// GET /api/admin/all-shows
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({
      showDateTime: { $gte: new Date() },
    })
      .populate("movie")
      .sort({ showDateTime: 1 });

    return res.status(200).json({
      success: true,
      shows,
    });
  } catch (error) {
    console.log("GET ALL SHOWS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/admin/all-bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.log("GET ALL BOOKINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
