Cloud Function: useReferral

This function atomically marks a referral code as used and records an audit entry.

Prerequisites
- Firebase CLI installed and logged in
- The project `elite-hq-6e0b7` selected
- Billing enabled if required

Install dependencies

```bash
cd functions
npm install
```

Deploy the function

```bash
cd ../
firebase deploy --only functions:useReferral --project=elite-hq-6e0b7
```

Testing
- From client (web) using the Firebase JS SDK callable functions:

```js
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-functions.js';
const functions = getFunctions();
const useReferral = httpsCallable(functions, 'useReferral');

// ensure user is authenticated (anonymous or real)
useReferral({ code: 'ABC123', newClientName: 'New Customer' })
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
```

Or use the Firebase CLI emulator for local testing:

```bash
# start emulator
firebase emulators:start --only functions,firestore

# call function from node (examples in emulator UI) or client
```

Notes
- Function enforces caller authentication (context.auth). For testing you can use anonymous auth.
- The function writes to `referrals` and `referralClaims` atomically.
