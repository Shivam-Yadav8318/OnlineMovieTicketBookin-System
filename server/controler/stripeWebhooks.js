import Stripe from "stripe";
import Booking from "../model/Booking.js";
import Show from "../model/Show.js";

// POST /api/stripe (raw body)
// Handles Stripe webhook events so we can mark a booking as paid once the
// customer completes checkout, and release seats if a session expires
// without payment.
export const stripeWebhooks = async (req, res) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log("STRIPE WEBHOOK SIGNATURE ERROR:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { bookingId } = session.metadata || {};

        if (bookingId) {
          await Booking.findByIdAndUpdate(bookingId, { isPaid: true });
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const { bookingId } = session.metadata || {};

        if (bookingId) {
          const booking = await Booking.findById(bookingId);

          // Only release seats if payment never went through.
          if (booking && !booking.isPaid) {
            const show = await Show.findById(booking.show);

            if (show) {
              booking.bookedSeats.forEach((seat) => {
                delete show.occupiedSeats[seat];
              });
              show.markModified("occupiedSeats");
              await show.save();
            }

            await Booking.findByIdAndDelete(bookingId);
          }
        }

        break;
      }

      default:
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.log("STRIPE WEBHOOK HANDLER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Webhook handler failed",
    });
  }
};
