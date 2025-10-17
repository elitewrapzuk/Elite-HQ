#!/usr/bin/env node
/**
 * scripts/migrate-referrals-to-firestore.js
 *
 * Reads data/db.json.referrals and writes them to Firestore 'referrals' collection
 * using firebase-admin. Requires GOOGLE_APPLICATION_CREDENTIALS env var.
 *
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
 *   node scripts/migrate-referrals-to-firestore.js
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

if(!process.env.GOOGLE_APPLICATION_CREDENTIALS){
  console.error('ERROR: Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON file.');
  process.exit(1);
}

try{
  admin.initializeApp();
}catch(e){
  console.error('firebase-admin initialize error',e);
  process.exit(1);
}

const db = admin.firestore();

async function run(){
  if(!fs.existsSync(DB_PATH)){
    console.error('No data/db.json found - nothing to migrate');
    process.exit(0);
  }
  const raw = fs.readFileSync(DB_PATH,'utf8');
  const obj = JSON.parse(raw);
  const referrals = obj.referrals || [];
  if(referrals.length===0){
    console.log('No referrals to migrate');
    return;
  }
  console.log(`Migrating ${referrals.length} referrals to Firestore...`);
  for(const r of referrals){
    // Normalize fields
    const doc = {
      referralCode: r.referralCode || r.code || '',
      clientName: r.clientName || r.client || '',
      jobRef: r.jobRef || r.job || '',
      jobTotal: r.jobTotal != null ? r.jobTotal : (r.total || 0),
      used: !!r.used,
      createdAt: r.createdAt ? admin.firestore.Timestamp.fromDate(new Date(r.createdAt)) : admin.firestore.FieldValue.serverTimestamp()
    };
    try{
      await db.collection('referrals').add(doc);
      console.log('Imported', doc.referralCode || '(no-code)');
    }catch(err){
      console.error('Failed to import', doc.referralCode, err);
    }
  }
  console.log('Migration complete');
}

run().catch(e=>{ console.error(e); process.exit(1) });
