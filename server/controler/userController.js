import { clerkClient } from "@clerk/express";
import Booking from "../model/Booking.js";
import Movie from "../model/Movie.js";
import User from "../model/User.js";

// Fallback in case the Clerk -> Inngest user-sync webhook hasn't fired yet
// (e.g. it isn't configured in this environment). Fetches the user from
// Clerk directly and creates a local record so favorites/bookings still work.
const findOrCreateUser = async (userId) => {
  let user = await User.findById(userId);

  if (user) return user;

  try {
    const clerkUser = await clerkClient.users.getUser(userId);

    user = await User.create({
      _id: userId,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
      email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
      image: clerkUser.imageUrl || "",
    });
  } catch (error) {
    console.log("FIND OR CREATE USER ERROR:", error.message);
  }

  return user;
};

// GET /api/user/bookings
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.auth();

    const bookings = await Booking.find({ user: userId })
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
    console.log("GET USER BOOKINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/user/update-favorite  { movieId }
export const updateFavorite = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "movieId is required",
      });
    }

    const user = await findOrCreateUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isFavorite = user.favorites.includes(movieId);

    if (isFavorite) {
      user.favorites = user.favorites.filter((id) => id !== movieId);
    } else {
      user.favorites.push(movieId);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      isFavorite: !isFavorite,
      message: isFavorite ? "Removed from favorites" : "Added to favorites",
    });
  } catch (error) {
    console.log("UPDATE FAVORITE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/user/favorites
export const getFavorites = async (req, res) => {
  try {
    const { userId } = req.auth();

    const user = await findOrCreateUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const movies = await Movie.find({ _id: { $in: user.favorites } });

    return res.status(200).json({
      success: true,
      movies,
    });
  } catch (error) {
    console.log("GET FAVORITES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
