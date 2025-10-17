# Referrals microservice + UI

This small addon provides a referrals system you can drop into the Elite-HQ dashboard.

What it includes
- An Express server (`server.js`) that serves a tiny API and static UI (`/public`).
- Persistent JSON storage using `lowdb` at `data/db.json`.
- A simple UI at `/referrals.html` to create codes, apply them once, and list referrals.

API summary
- POST /api/referrals/create { clientName, jobRef, jobTotal } -> create code
- GET /api/referrals/:code -> get referral record
- POST /api/referrals/use { code, newClientName } -> mark used, returns discount/refund amounts
- GET /api/referrals -> list all

Data shape (referral record)
- id, clientName, referralCode, jobRef, jobTotal, dateCreated, used (bool), usedBy, usedDate, discountAmount, refundAmount

Run locally
1. Install dependencies

```bash
cd /path/to/Elite-HQ
npm install
```

2. Start server

```bash
npm start
```

3. Open the UI

Visit http://localhost:4000/referrals.html

Integration notes
- You can embed `/public/referrals.html` inside your dashboard or link to it from the left menu.
- To create referral codes automatically when jobs are finished, POST to `/api/referrals/create` with the job details from your existing backend.
- When a new client redeems a code, call `/api/referrals/use` to mark it used. The server returns the discount amount (10%) and the referee refund amount (10%). Your payment/refund flow should implement sending that refund to the original payment method.

Security & production
- This demo uses a local JSON file. For production replace lowdb with a proper DB (Postgres, MySQL, MongoDB) and add authentication and rate-limiting.
- Validate inputs and ensure only your dashboard can call these endpoints (API key, session checks or similar).

Next steps you might want me to do
- Hook this into your existing dashboard code (tell me where your dashboard files live and I can add link/route).
- Swap lowdb for a real database and add authentication.
