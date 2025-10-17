Firestore testing and security guide

Files added:
- `firestore.rules` — suggested Firestore security rules for referrals, signatures, templates, and the elitehq/settings doc.
- `scripts/firestore_admin_test.js` — Node admin (firebase-admin) script to write/read elitehq/settings. Uses Application Default Credentials (set via GOOGLE_APPLICATION_CREDENTIALS env var).

Quick checklist

1) Prepare a service account JSON and set env var (recommended for server tests):

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

2) Install dependencies for admin script (run once in project root):

```bash
npm install firebase-admin
```

3) Run the admin test script (writes and reads `elitehq/settings`):

```bash
node scripts/firestore_admin_test.js
```

Expected output:
- "Write successful. Reading back..."
- A printed JSON of the document with `data` and `updatedAt` fields.

Notes about `firestore.rules`
- The rules allow public reads for ease of use in the SPA. Writes are restricted: creating referrals and signatures requires authentication. Importantly, clients are prevented from toggling the `used` flag on referral documents — updates that would change `used` are denied; this enforces that marking a referral as used must be done via a trusted server path.
- For production, change `allow read: if true;` to require authentication or to check for claims.
- Consider using Firebase Callable Cloud Functions for server-controlled actions (marking a referral used and issuing refunds).

Next security steps
- Deploy rules via Firebase Console or CLI: `firebase deploy --only firestore:rules` (requires Firebase CLI and login).
- Implement a server-side function (Cloud Function or Express endpoint using service account) to atomically mark a referral used and to initiate refund flows.
- Optionally, create a migration script to copy `data/db.json` into Firestore using firebase-admin (I can add this if you want).

Troubleshooting
- If the admin script fails with auth errors, ensure GOOGLE_APPLICATION_CREDENTIALS points to a valid service account JSON with Firestore permissions.
- When testing client-side SDK, check browser console for permission/unauthenticated errors — Firestore rules will deny writes if the client is not authenticated.
