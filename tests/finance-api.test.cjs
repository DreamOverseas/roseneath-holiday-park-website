const test = require('node:test');
const assert = require('node:assert/strict');
const controller = require('../backend/strapi/src/api/rhp-finance/controllers/rhp-finance');
const uuid = '12345678-1234-1234-1234-123456789abc';

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
