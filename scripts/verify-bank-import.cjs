'use strict';
const fs = require('node:fs');
const path = require('node:path');
async function main() {
  const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const staff = Object.values(JSON.parse(fs.readFileSync('.rhp-finance-staff.json', 'utf8')))[0];
  let response;
  for (let i = 0; i < 30; i++) {
    try {
      response = await fetch('http://127.0.0.1:1337/api/rhp-finance', { headers: { Authorization: `Bearer ${staff}` } });
      if (response.ok) break;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  if (!response?.ok) throw Error('Finance API did not become ready');
  const body = await response.json();
  const imported = Object.values(body.accounts).flat().filter(e => e.source?.workbook === input.workbook);
  const matched = input.rows.filter(r => r.memberKey);
  const expected = matched.reduce((n, r) => n + r.creditCents, 0);
  if (body.bankTransactions?.length !== input.rows.length || imported.length !== matched.length || imported.some(e => e.period !== '' || e.type !== 'Payment') || imported.reduce((n, e) => n + e.amountCents, 0) !== expected) throw Error('Live financial totals do not reconcile');
  const correction = input.confirmed.siteCorrection;
  if (body.members.find(m => m.documentId === correction.memberKey)?.SiteNumber !== correction.to) throw Error('Site correction was not published');
  const Database = require(path.join(process.cwd(), 'node_modules/better-sqlite3'));
  const db = new Database('.tmp/data.db', { readonly: true });
  for (const key of input.confirmed.noteMembers) {
    const row = db.prepare('SELECT note FROM rhp_memberships WHERE document_id = ? AND published_at IS NOT NULL').get(key);
    if (!row?.note?.includes(input.confirmed.note)) throw Error('Membership note missing');
  }
  db.close();
  for (const route of ['/api/rhp-finance', '/api/rhp-bank-transactions', '/api/rhp-finance-events']) {
    const denied = await fetch(`http://127.0.0.1:1337${route}`);
    if (denied.ok) throw Error(`Unexpected public access: ${route}`);
  }
  console.log('RHP_LIVE_FINANCE_OK ' + JSON.stringify({ bankRows: body.bankTransactions.length, importedPayments: imported.length, unassignedPayments: imported.length, paidCents: expected, siteCorrected: true, membershipNotes: 2, protected: true }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
