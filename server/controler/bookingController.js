import Stripe from "stripe";
import Booking from "../model/Booking.js";
import Show from "../model/Show.js";

// Checks whether the requested seats are still free for a given show
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const show = await Show.findById(showId);

    if (!show) return false;

    const occupiedSeats = show.occupiedSeats || {};

    const isAnySeatTaken = selectedSeats.some(
      (seat) => occupiedSeats[seat]
    );

    return !isAnySeatTaken;
  } catch (error) {
    console.log("CHECK SEATS ERROR:", error);
    return false;
  }
};

// POST /api/booking/create
// Creates a booking, locks the seats on the show, and creates a Stripe
// Checkout session for the user to pay.
export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    if (!showId || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "showId and at least one selected seat are required",
      });
    }

    if (selectedSeats.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can only book up to five seats at a time",
      });
    }

    const show = await Show.findById(showId).populate("movie");

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: "One or more selected seats have already been booked. Please select different seats.",
      });
    }

    const amount = show.showPrice * selectedSeats.length;

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount,
      bookedSeats: selectedSeats,
    });

    // Lock the seats immediately so no one else can select them while this
    // user is completing payment.
    selectedSeats.forEach((seat) => {
      show.occupiedSeats[seat] = userId;
    });
    show.markModified("occupiedSeats");
    await show.save();

    // If Stripe isn't configured, skip real payment (useful for local/dev
    // testing) and mark the booking as paid immediately.
    if (!process.env.STRIPE_SECRET_KEY) {
      booking.isPaid = true;
      await booking.save();

      return res.status(201).json({
        success: true,
        message: "Booking confirmed (Stripe not configured, payment skipped)",
        booking,
      });
    }

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = [
      {
        price_data: {
          currency: process.env.CURRENCY?.toLowerCase() || "usd",
          product_data: {
            name: show.movie?.title || "Movie Ticket",
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      line_items,
      mode: "payment",
      metadata: {
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    booking.paymentLink = session.url;
    booking.stripeSessionId = session.id;
    await booking.save();

    return res.status(201).json({
      success: true,
      url: session.url,
      booking,
    });
  } catch (error) {
    console.log("CREATE BOOKING ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/booking/seats/:showId
// Public — used by the seat layout page to grey out already booked seats.
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    const show = await Show.findById(showId);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    const occupiedSeats = Object.keys(show.occupiedSeats || {});

    return res.status(200).json({
      success: true,
      occupiedSeats,
    });
  } catch (error) {
    console.log("GET OCCUPIED SEATS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
