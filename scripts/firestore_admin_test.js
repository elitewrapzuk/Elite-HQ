// Firestore admin test script
// Usage:
//   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
//   node scripts/firestore_admin_test.js

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const fs = require('fs');

async function main(){
  try{
    // initialize using ADC (GOOGLE_APPLICATION_CREDENTIALS) if present; else try default service account
    initializeApp();
    const db = getFirestore();

    const ref = db.doc('elitehq/settings');
    const payload = { data: { testedAt: new Date().toISOString(), note: 'admin-test' }, updatedAt: Timestamp.now() };
    console.log('Writing test document to elitehq/settings...');
    await ref.set(payload, { merge: true });
    console.log('Write successful. Reading back...');
    const snap = await ref.get();
    if(!snap.exists){
      console.error('Document not found after write'); process.exit(2);
    }
    console.log('Read OK. Document data:\n', JSON.stringify(snap.data(), null, 2));
    console.log('Admin test completed successfully');
    process.exit(0);
  }catch(err){
    console.error('Admin test failed:', err && err.message ? err.message : err);
    process.exit(3);
  }
}

main();
