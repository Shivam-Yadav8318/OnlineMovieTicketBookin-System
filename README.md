# QuickShow — Movie Ticket Booking (MERN)

A full-stack movie ticket booking site: React + Vite + Tailwind on the
frontend, Express + MongoDB on the backend, Clerk for regular user
authentication, OMDb for movie data, and **Stripe** for payments.

The admin dashboard (`/admin`) uses its own separate username/password
login — it does **not** require a Clerk account.

This package is the completed version of the project you uploaded. The
sections below explain exactly what was missing, what was added, and how to
run and test it.

---

## What was missing before

The uploaded project had working movie search/admin UI and page layouts, but
several core features were either fake (dummy data) or completely absent:

- **No payment gateway at all** — no Stripe/Razorpay integration, no way to
  actually pay for a booking.
- **No booking system on the backend** — there was no `Booking` model or
  routes. Seat selection, "My Bookings", and the admin booking list were all
  wired to hardcoded sample data (`assets.js`), not the database.
- **"Theaters" nav link pointed to `/`** (the homepage) — effectively dead.
- **Home page hero banner was 100% hardcoded** (a fake movie, made-up
  year/runtime), not tied to real "now showing" data.
- **Admin dashboard always showed 0 bookings / 0 revenue / 0 users** —
  placeholder numbers, never computed from real data.
- **Duplicate/broken routes** — the same route file was mounted twice under
  different paths, and the frontend called an endpoint
  (`/api/movies/:id`) that didn't exist on the server.
- **No favorites backend** — the heart icon on movie pages didn't do
  anything.

## What was added / fixed

### Backend (`server/`)
- `model/Booking.js` — new schema (user, show, seats, amount, `isPaid`,
  Stripe payment link).
- `model/User.js` — added a `favorites` array.
- `middleware/auth.js` — `requireAuth` (Clerk, any signed-in user, used for
  bookings/favorites) and `verifyAdminToken` (standalone JWT, used for the
  admin dashboard — see below).
- `controler/adminAuthController.js` — standalone admin login
  (`POST /api/admin/login`, username/password from `server/.env`,
  independent of Clerk).
- `controler/bookingController.js` — creates a booking, locks the selected
  seats, and creates a real **Stripe Checkout session**. Falls back to
  auto-confirming the booking if Stripe isn't configured, so the booking
  flow still works in a dev environment with no Stripe keys.
- `controler/stripeWebhooks.js` — Stripe webhook handler. Marks a booking
  `isPaid: true` when checkout completes, and releases the seats again if a
  checkout session expires unpaid.
- `controler/userController.js` — real "My Bookings" and favorites
  endpoints (auto-provisions a local user record from Clerk if the
  Clerk→Inngest sync webhook hasn't fired yet).
- `controler/showControler.js` — added `getShows` (now-showing movies) and
  `getShow` (single movie + grouped showtimes) endpoints. Kept the existing
  OMDb search and add-show logic.
- `controler/dashboardController.js` — dashboard stats are now computed from
  real `Booking`/`User`/`Show` documents, plus new admin
  list-shows/list-bookings endpoints.
- Rewired all routes and `server.js` (the Stripe webhook route needs the
  **raw** request body, so it's registered before `express.json()`).

### Frontend (`client/`)
- `context/AppContext.jsx` — new global context: a shared `axios` instance
  that automatically attaches the signed-in user's Clerk token (for
  booking/favorites) **and** the standalone admin token (for `/api/admin/*`
  and adding shows) to every request, plus shared `shows`, `favoriteMovies`,
  and `isAdmin` state.
- `pages/admin/AdminLogin.jsx` — a simple username/password form for admin
  access, completely separate from Clerk sign-in.
- `pages/admin/Layout.jsx` — visiting `/admin` now shows the login form
  directly if you're not logged in as admin, and the dashboard once you are
  (no Clerk account needed at all for admin access).
- Every page that used dummy data now calls the real API: `Movies`,
  `MovieDetails`, `SeatLayout` (real seat locking + Stripe checkout
  redirect), `MyBooking`, `Favorite`, and the admin `Dashboard` /
  `ListShow` / `ListBooking` pages.
- `pages/Theaters.jsx` — new page with real content, linked from the navbar
  (previously a dead link).
- `pages/RedirectLoading.jsx` — brief loading screen Stripe redirects to
  after a successful payment, giving the webhook a moment to mark the
  booking paid before showing "My Bookings".
- `components/HeroSection.jsx` — now displays a real "now showing" movie's
  title, genres, year, runtime, and overview, with a safe fallback to the
  original static copy if no data has loaded yet. **No layout, image, or
  design changes** — only the text is now dynamic.
- `components/Navbar.jsx` — "Theaters" now links to `/theaters`; a small
  "Admin" button is always visible and goes straight to the admin
  login/dashboard.
- Admin "Add Shows" now refreshes the site's movie list immediately after a
  new movie/show is added.

Design, layout, colors, and all existing image assets are unchanged.

---

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Notes |
|---|---|
| `MONGO_URI` | Your MongoDB connection string (local or Atlas) |
| `OMDB_API_KEY` | Free key from https://www.omdbapi.com/apikey.aspx |
| `CURRENCY` | e.g. `INR`, `USD` — used for Stripe checkout |
| `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY` | From your Clerk dashboard |
| `INNGEST_SIGNING_KEY` / `INNGEST_EVENT_KEY` | From your Inngest dashboard |
| `STRIPE_SECRET_KEY` | **Test mode** secret key from https://dashboard.stripe.com/test/apikeys |
| `STRIPE_WEBHOOK_SECRET` | See "Stripe webhook" below |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Your own choice — used to log into `/admin` |
| `ADMIN_JWT_SECRET` | Any long random string, used to sign admin login sessions |

```bash
npm start
```

### 2. Client

```bash
cd client
npm install
cp .env.example .env
```

Fill in `.env` (`VITE_BASE_URL` should point at your running server,
`VITE_CLERK_PUBLISHABLE_KEY` from the same Clerk project as the server).

```bash
npm run dev
```

### 3. Logging into the admin dashboard

Admin access is **completely separate from Clerk** — it's a simple
username/password login. Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and
`ADMIN_JWT_SECRET` in `server/.env` (there are working defaults already
filled in, but change them before deploying anywhere public), then visit
`/admin` on the site. You'll see a login form — enter those credentials and
you're in. No Clerk account, sign-up, or metadata configuration needed.

### 4. Stripe webhook (required for payments to mark themselves "paid")

For local development, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe
```

This prints a webhook signing secret (`whsec_...`) — put it in
`STRIPE_WEBHOOK_SECRET`. In production, create a webhook endpoint in the
Stripe dashboard pointing at `https://your-domain.com/api/stripe`, listening
for `checkout.session.completed` and `checkout.session.expired`.

**Note:** if `STRIPE_SECRET_KEY` is left blank, bookings are auto-confirmed
without going through checkout, so you can still test the booking flow
end-to-end without setting up Stripe first.

---

## Testing performed

- `npm run build` on the client completes with no errors.
- All server files pass `node --check` (syntax validation).
- Verified live with the server running (no database attached):
  - Public routes (`/`, `/api/show/search`) respond.
  - `/api/admin/login` correctly rejects a wrong password and issues a
    working JWT for the right one.
  - That JWT correctly grants access to `/api/admin/is-admin`,
    `/api/admin/dashboard`, and `/api/show/add` via the `x-admin-token`
    header; missing/invalid tokens are correctly rejected.
  - Protected user routes (`/api/booking/create`, `/api/user/bookings`)
    correctly return `401 Not authorized` without a Clerk session token.
  - The server starts and stays up even if MongoDB is unreachable, matching
    the original project's behavior.

**Not testable in this environment:** a full live booking (seat select →
Stripe checkout → webhook → "My Bookings") requires a real MongoDB
instance, Clerk project, and Stripe test keys, none of which are available
in the sandbox this was built in. Please test that flow yourself with
Stripe's test card `4242 4242 4242 4242`, any future expiry, and any CVC —
it should take you all the way to a confirmed booking.

---

## Troubleshooting

**"Admin login is not configured on the server yet."**

`ADMIN_USERNAME`, `ADMIN_PASSWORD`, or `ADMIN_JWT_SECRET` is missing from
`server/.env`. There are working defaults shipped in `.env`, but if you
copied from `.env.example` instead, fill all three in and restart the
server.

**Admin login says "Invalid username or password" even though you're sure it's right.**

Double-check for accidental quotes or trailing spaces around the values in
`server/.env` (e.g. `ADMIN_PASSWORD="admin123"` — the quotes become part of
the password). It should read exactly `ADMIN_PASSWORD=admin123`, no quotes.

**Logged in, but admin pages (Add Shows, dashboard, etc.) still fail with 401.**

The admin token is sent as a custom `x-admin-token` header (separate from
Clerk's `Authorization` header), attached automatically by the `axios`
instance in `context/AppContext.jsx`. If you're calling the API directly
(e.g. with curl/Postman) rather than through the site, make sure you're
sending that same header with the token from `/api/admin/login`.

**Movie search / OMDb requests fail.**

Confirm `OMDB_API_KEY` is set and valid, and that your server has normal
outbound internet access (some sandboxed/restricted hosting environments
block outbound requests to `omdbapi.com` by default).

---

## Project structure

```
client/   React + Vite + Tailwind frontend
server/   Express + MongoDB backend
```

`node_modules/` are not included — run `npm install` in each folder first.
