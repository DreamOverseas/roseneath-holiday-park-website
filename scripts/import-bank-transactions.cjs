'use strict';
// Run from the Strapi app directory, after a database backup and module installation.
// Input is private task data, never a public repository artifact.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
async function main() {
  const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const { validateEvent, summarize } = await import(pathToFileURL(path.join(process.cwd(), 'src/api/rhp-finance/services/domain.mjs')));
  const { matchTransaction } = await import(pathToFileURL(path.join(__dirname, 'match-bank-import.mjs')));
  const { createStrapi } = require(path.join(process.cwd(), 'node_modules/@strapi/strapi'));
  const app = await createStrapi({ appDir: process.cwd(), distDir: process.cwd() }).load();
  try {
    const members = await app.documents('api::rhp-membership.rhp-membership').findMany({ status: 'published', filters: { TenantType: { $in: ['Annual', 'Permanent'] } }, fields: ['SiteNumber', 'TenantType', 'FirstName', 'LastName', 'FirstName2', 'LastName2'] });
    const fields = ['SiteNumber', 'TenantType', 'FirstName', 'LastName', 'FirstName2', 'LastName2'];
    if (members.length !== input.members.length) throw Error('Membership count changed; re-match before import');
    for (const original of input.members) {
      const live = members.find(m => m.documentId === original.documentId);
      if (!live || fields.some(f => {
        if (f === 'SiteNumber' && input.confirmed?.siteCorrection?.memberKey === original.documentId && String(live[f]) === input.confirmed.siteCorrection.to) return false;
        return String(live[f] || '') !== String(original[f] || '');
      })) throw Error(`Membership changed: ${original.documentId}`);
    }
    const BANK = 'api::rhp-bank-transaction.rhp-bank-transaction';
    const FINANCE = 'api::rhp-finance-event.rhp-finance-event';
    const bank = app.db.query(BANK);
    const finance = app.db.query(FINANCE);
    let bankCreated = 0, paymentsCreated = 0;
    const at = new Date().toISOString();
    const matched = input.rows.filter(r => r.memberKey);
    const correction = input.confirmed?.siteCorrection;
    const effectiveMembers = members.map(m => correction?.memberKey === m.documentId ? { ...m, SiteNumber: correction.to } : m);
    if (new Set(input.rows.map(r => r.sourceKey)).size !== input.rows.length) throw Error('Duplicate input identity');
    // Recheck each matching decision against the live roster, before any mutation.
    for (const row of input.rows) {
      const check = matchTransaction(row, effectiveMembers, input.confirmed?.mappings);
      if (check.memberKey !== row.memberKey || check.matchStatus !== row.matchStatus) throw Error(`Matching decision changed at ${row.source.sheet}:${row.source.row}`);
    }
    await app.db.transaction(async () => {
      if (correction && members.find(m => m.documentId === correction.memberKey)?.SiteNumber !== correction.to) {
        await app.documents('api::rhp-membership.rhp-membership').update({ documentId: correction.memberKey, status: 'published', data: { SiteNumber: correction.to } });
      }
      for (const memberKey of input.confirmed?.noteMembers || []) {
        const member = await app.documents('api::rhp-membership.rhp-membership').findOne({ documentId: memberKey, status: 'published', fields: ['Note'] });
        const held = input.rows.filter(r => /Owner requested no ledger entry/.test(r.matchReason));
        const note = `${input.confirmed.note}\nHeld receipts: ${held.length}; total AUD ${(held.reduce((n,r) => n + r.creditCents, 0) / 100).toFixed(2)}. Source rows: ${held.map(r => `${r.source.sheet} row ${r.source.row}`).join('; ')}.`;
        if (!member) throw Error('Note membership missing');
        if (!String(member.Note || '').includes(input.confirmed.note)) {
          await app.documents('api::rhp-membership.rhp-membership').update({ documentId: memberKey, status: 'published', data: { Note: [member.Note, note].filter(Boolean).join('\n\n') } });
        }
      }
      for (const row of input.rows) {
        const { sourceKey, date, description, debitCents, creditCents, balanceCents, accountTag, memberKey, matchStatus, matchReason, source, candidates } = row;
        const existing = await bank.findOne({ where: { sourceKey } });
        if (existing) {
          if ((existing.memberKey || '') !== memberKey || existing.debitCents !== debitCents || existing.creditCents !== creditCents) throw Error('Existing bank source differs; manual review required');
        } else {
          await bank.create({ data: { sourceKey, date, description, debitCents, creditCents, balanceCents, accountTag, memberKey, matchStatus, matchReason, source, candidates } });
          bankCreated++;
        }
        if (!memberKey) continue;
        if (debitCents || !creditCents) throw Error('Only confirmed incoming tenant payments may enter the tenant ledger');
        const eventKey = `${memberKey}:bank-${sourceKey}`;
        const payload = validateEvent({ type: 'Payment', period: '', date, amountCents: creditCents, description,
          basis: `${source.workbook}; ${source.sheet}; row ${source.row}; ${source.file}; page ${source.page}. ${matchReason}. Allocation not yet reviewed.`,
          payer: description, method: /\bCASH\b/i.test(description) ? 'Cash' : 'Bank transfer', reference: `${source.file} p${source.page}; ${source.sheet} row ${source.row}`,
          accountTag, source, verified: false });
        const existingEvent = await finance.findOne({ where: { eventKey } });
        if (existingEvent) {
          if (existingEvent.payload.amountCents !== creditCents || existingEvent.payload.source?.fingerprint !== source.fingerprint) throw Error('Existing tenant payment differs');
        } else {
          await finance.create({ data: { eventKey, memberKey, payload, actor: 'RHP bank statement import', recordedAt: at } });
          paymentsCreated++;
        }
      }
    });
    const imported = (await finance.findMany({ orderBy: { id: 'asc' } })).filter(e => e.payload.source?.workbook === input.workbook);
    const summary = summarize(imported.map(e => ({ ...e.payload, key: e.eventKey, recordedAt: e.recordedAt })));
    const expected = matched.reduce((n, r) => n + r.creditCents, 0);
    if (imported.length !== matched.length || summary.paid !== expected || summary.periods[''].paid !== expected || imported.some(e => e.payload.period !== '')) throw Error('Post-import reconciliation failed');
    const archived = await bank.findMany();
    for (const row of input.rows) if (!archived.some(r => r.sourceKey === row.sourceKey)) throw Error('Missing source row');
    console.log('RHP_IMPORT_OK ' + JSON.stringify({ bankRows: input.rows.length, matchedPayments: imported.length, pendingReview: input.rows.length - matched.length,
      amountCents: expected, unassignedCents: summary.periods[''].paid, tenants: new Set(matched.map(r => r.memberKey)).size, bankCreated, paymentsCreated }));
  } finally { await app.destroy(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
