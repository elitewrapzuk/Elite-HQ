const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { Low, JSONFile } = require('lowdb');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the single-file SPA located at project root for the root path.
// This makes the app available at GET / when running the dev server.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Simple file-backed JSON store (avoids lowdb compatibility issues)
const fs = require('fs').promises;
const file = path.join(__dirname, 'data', 'db.json');

async function readDb() {
  try {
    const txt = await fs.readFile(file, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    return { referrals: [] };
  }
}

async function writeDb(data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

async function initDb() {
  const data = await readDb();
  if (!data.referrals) data.referrals = [];
  await writeDb(data);
}

initDb();

// Contract:
// - POST /api/referrals/create  => { clientName, jobRef, jobTotal } -> creates referral code
// - GET /api/referrals/:code    => returns referral record
// - POST /api/referrals/use     => { code, newClientName, dateUsed } -> marks used and returns discount/refund info
// - GET /api/referrals          => list all referrals

app.post('/api/referrals/create', async (req, res) => {
  const { clientName, jobRef, jobTotal } = req.body;
  if (!clientName || !jobRef || jobTotal == null) {
    return res.status(400).json({ error: 'clientName, jobRef and jobTotal required' });
  }

  const referralCode = (nanoid(8)).toUpperCase();
  const now = new Date().toISOString();
  const record = {
    id: nanoid(),
    clientName,
    referralCode,
    jobRef,
    jobTotal: Number(jobTotal),
    dateCreated: now,
    used: false,
    usedBy: null,
    usedDate: null,
    discountAmount: null,
    refundAmount: null
  };

  const data = await readDb();
  data.referrals.push(record);
  await writeDb(data);
  res.json(record);
});

app.get('/api/referrals/:code', async (req, res) => {
  const code = req.params.code.toUpperCase();
  const data = await readDb();
  const rec = data.referrals.find(r => r.referralCode === code);
  if (!rec) return res.status(404).json({ error: 'code not found' });
  res.json(rec);
});

app.post('/api/referrals/use', async (req, res) => {
  const { code, newClientName, dateUsed } = req.body;
  if (!code || !newClientName) return res.status(400).json({ error: 'code and newClientName required' });

  const data = await readDb();
  const rec = data.referrals.find(r => r.referralCode === code.toUpperCase());
  if (!rec) return res.status(404).json({ error: 'code not found' });
  if (rec.used) return res.status(400).json({ error: 'code already used' });

  // Apply 10% discount to new client's job total and 10% refund to referee
  const discountAmount = +(rec.jobTotal * 0.10).toFixed(2);
  const refundAmount = discountAmount; // same amount back to original payment method

  rec.used = true;
  rec.usedBy = newClientName;
  rec.usedDate = dateUsed || new Date().toISOString();
  rec.discountAmount = discountAmount;
  rec.refundAmount = refundAmount;

  await writeDb(data);

  res.json({
    message: 'code applied',
    referral: rec,
    newClientDiscount: discountAmount,
    refereeRefund: refundAmount,
  });
});

app.get('/api/referrals', async (req, res) => {
  const data = await readDb();
  res.json(data.referrals);
});

app.listen(PORT, () => {
  console.log(`Referrals service listening on http://localhost:${PORT}`);
});
