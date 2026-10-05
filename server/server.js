import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDb from './config/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import showRoutes from "./route/movieRoutes.js";
import adminRoutes from "./route/adminRoutes.js";
import bookingRoutes from "./route/bookingRoutes.js";
import userRoutes from "./route/userRoutes.js";
import { stripeWebhooks } from "./controler/stripeWebhooks.js";

const app = express();
const port = process.env.PORT || 3000;

await connectDb()

// Stripe webhook needs the RAW request body to verify the signature, so it
// must be registered BEFORE express.json() (which would otherwise parse it).
app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())

app.use("/api/show", showRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/user", userRoutes);

app.get('/', (req, res) => {
    res.send("Server is Live!")
})

app.use("/api/inngest", serve({ client: inngest, functions }));

app.listen(port, (err) => {
    if (err) {
        console.log(err)
    }
    else {
        console.log("Server is Running on Port ", port)
    }
})
