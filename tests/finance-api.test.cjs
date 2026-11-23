const test = require('node:test');
const assert = require('node:assert/strict');
const controller = require('../backend/strapi/src/api/rhp-finance/controllers/rhp-finance');
const uuid = '12345678-1234-1234-1234-123456789abc';

test('membership settings persist across reloads and isolate draft/published copies by documentId', async () => {
  const rows = [
    { id: 1, documentId: 'one', TenantType: 'Annual', Note: 'Unpublished edit', publishedAt: null },
    { id: 2, documentId: 'one', TenantType: 'Annual', Note: 'Published note', publishedAt: '2026-11-01' },
    { id: 3, documentId: 'two', TenantType: 'Permanent', OutstandingDebtA: 0, TenantId: 'RHP-002-P' },
    { id: 4, documentId: 'guest', TenantType: 'Guest' },
  ];
  const previous = global.strapi;
  let updates = 0;
  global.strapi = {
    documents: () => ({ findOne: async ({ documentId }) => rows.find(r => r.documentId === documentId && r.publishedAt !== null) }),
    db: {
      metadata: { get: () => ({ tableName: 'members' }) },
      transaction: async fn => fn({ trx: () => ({ where() { return this; }, forUpdate() { return this; }, select: async () => [] }) }),
      query: () => ({ updateMany: async ({ where, data }) => {
        updates++;
        rows.filter(row => row.documentId === where.documentId).forEach(row => Object.assign(row, data));
      } }),
    },
  };
  const ctx = (key, body) => ({ params: { memberKey: key }, request: { body }, set() {},
    badRequest(message) { this.status = 400; this.body = message; }, notFound(message) { this.status = 404; this.body = message; } });
  try {
    const save = ctx('one', { OutstandingDebtA: '5000.00', OutstandingDebtB: 0, TenantId: 'CUSTOM-ONE' });
    await controller.settings(save);
    assert.equal(save.body.member.OutstandingDebtA, 5000);
    assert.equal(rows[0].OutstandingDebtA, 5000);
    assert.equal(rows[0].Note, 'Unpublished edit');
    assert.equal(rows[0].publishedAt, null);
    assert.equal(rows[1].Note, 'Published note');
    assert.equal(rows[2].OutstandingDebtA, 0);
    assert.equal(rows[2].TenantId, 'RHP-002-P');
    const bad = ctx('one', { Password: 'forbidden' }); await controller.settings(bad);
    assert.equal(bad.status, 400);
    const guest = ctx('guest', { OutstandingDebtA: 100 }); await controller.settings(guest);
    assert.equal(guest.status, 404);
    const missing = ctx('missing', { OutstandingDebtA: 100 }); await controller.settings(missing);
    assert.equal(missing.status, 404);
    assert.equal(updates, 1);
    const routes = require('../backend/strapi/src/api/rhp-finance/routes/rhp-finance').routes;
    assert.deepEqual(routes.find(r => r.handler === 'rhp-finance.settings').config.policies, ['api::rhp-finance.finance-staff']);
  } finally { global.strapi = previous; }
});

test('Strapi controller contract: tenant isolation, idempotency, append-only history and validation', async () => {
  const events = [];
  const members = [{ documentId: 'member-21', TenantType: 'Permanent' }, { documentId: 'member-99', TenantType: 'Annual' }, { documentId: 'guest', TenantType: 'Guest' }];
  const previous = global.strapi;
  const repo = {
    findMany: async ({ where } = {}) => events.filter(e => !where || e.memberKey === where.memberKey),
    create: async ({ data }) => {
      if (events.some(e => e.eventKey === data.eventKey)) throw new Error('Unique key violation');
      const row = { ...data, id: events.length + 1 };
      events.push(row); return row;
    },
  };
  const ctx = (memberKey, body = {}) => ({ params: { memberKey }, request: { body }, state: { financeActor: 'Server-authorized staff' }, set() {},
    badRequest(message) { this.status = 400; this.body = { error: message }; }, notFound(message) { this.status = 404; this.body = { error: message }; } });
  global.strapi = {
    documents: () => ({ findOne: async ({ documentId }) => members.find(m => m.documentId === documentId), findMany: async () => members.filter(m => m.TenantType !== 'Guest') }),
    db: { query: () => repo, metadata: { get: () => ({ tableName: 'members' }) }, transaction: async fn => {
      const snapshot = events.length;
      try { return await fn({ trx: () => ({ where() { return this; }, forUpdate() { return this; }, select: async () => [] }) }); }
      catch (error) { events.splice(snapshot); throw error; }
    } },
  };
  try {
    const rejected = ctx('guest', { confirmStandardFees: true });
    await controller.open(rejected); assert.equal(rejected.status, 404);
    const confirmation = ctx('member-21');
    await controller.open(confirmation); assert.equal(confirmation.status, 400);
    const first = ctx('member-21', { confirmStandardFees: true });
    await controller.open(first); assert.equal(first.body.records.length, 3);
    await controller.open(first); assert.equal(events.length, 3);
    await controller.open(ctx('member-99', { confirmStandardFees: true })); assert.equal(events.length, 6);
    const request = ctx('member-21', { requestId: uuid, event: { type: 'Payment', date: '2026-11-13', period: 'B', amountCents: 50000, description: 'Payment', basis: 'Bank evidence', payer: 'Test payer', reference: 'TR1', method: 'Bank transfer', actor: 'Forged actor' } });
    await controller.append(request);
    assert.equal(request.body.records.length, 4);
    assert.equal(request.body.records.at(-1).actor, 'Server-authorized staff');
    await controller.append(request); assert.equal(events.length, 7);
    const invalid = ctx('member-21', { requestId: '22345678-1234-1234-1234-123456789abc', event: { ...request.request.body.event, amountCents: -100 } });
    await controller.append(invalid); assert.equal(invalid.status, 400); assert.equal(events.length, 7);
    const listing = ctx(''); await controller.list(listing);
    assert.equal(listing.body.accounts['member-21'].length, 4);
    assert.equal(listing.body.accounts['member-99'].length, 3);
    assert.equal(listing.body.members.length, 2);
  } finally { global.strapi = previous; }
});
