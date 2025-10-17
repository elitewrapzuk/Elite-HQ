const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Callable function: useReferral
 * Payload: { code: string, newClientName: string }
 * Behaviour: perform a transaction to find the referral by code, ensure not used, mark used, set usedBy and usedDate
 */
exports.useReferral = functions.https.onCall(async (data, context) => {
  const { code, newClientName } = data || {};
  if(!code) throw new functions.https.HttpsError('invalid-argument', 'Missing referral code');
  const codeUpper = String(code).toUpperCase().trim();

  // Require the caller to be authenticated (best practice)
  if(!context.auth){
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  // Query for the referral document by code
  const referralsRef = db.collection('referrals');
  const q = referralsRef.where('referralCode','==', codeUpper).limit(1);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(q);
    if(snap.empty){
      throw new functions.https.HttpsError('not-found', 'Referral code not found');
    }
    const doc = snap.docs[0];
    const data0 = doc.data();
    if(data0.used){
      throw new functions.https.HttpsError('failed-precondition', 'Referral code already used');
    }

    // Mark as used atomically
    tx.update(doc.ref, {
      used: true,
      usedBy: newClientName || null,
      usedDate: admin.firestore.FieldValue.serverTimestamp()
    });

    // Optionally, create a ledger entry in 'referralClaims' for audit/tracking
    const ledgerRef = db.collection('referralClaims').doc();
    tx.set(ledgerRef, {
      referralId: doc.id,
      referralCode: codeUpper,
      usedBy: newClientName || null,
      usedByUid: context.auth.uid || null,
      actor: context.auth.token.email || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, id: doc.id };
  });
});
