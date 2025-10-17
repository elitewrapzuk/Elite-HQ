async function api(path, opts = {}) {
  const res = await fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
  const text = await res.text();
  try { return JSON.parse(text); } catch(e) { return text; }
}

document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.currentTarget;
  const data = {
    clientName: f.clientName.value,
    jobRef: f.jobRef.value,
    jobTotal: parseFloat(f.jobTotal.value)
  };
  const res = await api('/api/referrals/create', { method: 'POST', body: JSON.stringify(data) });
  document.getElementById('createResult').textContent = JSON.stringify(res, null, 2);
  loadList();
});

document.getElementById('useForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.currentTarget;
  const data = { code: f.code.value.trim().toUpperCase(), newClientName: f.newClientName.value };
  const res = await api('/api/referrals/use', { method: 'POST', body: JSON.stringify(data) });
  document.getElementById('useResult').textContent = JSON.stringify(res, null, 2);
  loadList();
});

async function loadList() {
  const rows = document.querySelector('#list tbody');
  rows.innerHTML = '';
  const list = await api('/api/referrals');
  if (!Array.isArray(list)) return;
  list.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(r.clientName)}</td>
      <td>${r.referralCode}</td>
      <td>${escapeHtml(r.jobRef)}</td>
      <td>${Number(r.jobTotal).toFixed(2)}</td>
      <td>${r.used ? 'Yes' : 'No'}</td>
      <td>${escapeHtml(r.usedBy || '')}</td>
      <td>${r.usedDate ? new Date(r.usedDate).toLocaleString() : ''}</td>
    `;
    rows.appendChild(tr);
  });
}

function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }

loadList();
