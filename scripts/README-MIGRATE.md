Migration script: migrate-referrals-to-firestore.js

This script migrates referrals stored in `data/db.json` into Firestore `referrals` collection.

Usage:

1. Create or obtain a GCP service account JSON with Firestore access and download it.
2. Set environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

3. Run the script from the repo root:

```bash
node scripts/migrate-referrals-to-firestore.js
```

Notes:
- This is a one-time migration tool. It will add documents to Firestore and WILL NOT delete or modify the local `data/db.json` file.
- Review `data/db.json` and the script before running. Keep backups.
- Requires `firebase-admin` to be installed globally or in your project (npm install firebase-admin).
