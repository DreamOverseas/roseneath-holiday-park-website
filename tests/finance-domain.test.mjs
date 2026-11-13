import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { centsFromInput, tenantId, standardCharges, validateEvent, summarize, validDate } from '../backend/strapi/src/api/rhp-finance/services/domain.mjs';
const require = createRequire(import.meta.url);
const today = '2026-11-13';
const seed = () => standardCharges().map(e => ({ ...e, recordedAt: '2026-11-13T01:00:00Z', actor: 'Test staff' }));
const payment = (overrides = {}) => ({ type: 'Payment', period: 'B', date: '2026-11-13', amountCents: 50000, description: 'Part payment', basis: 'Bank statement', payer: 'Other payer', method: 'Bank transfer', reference: 'TR-1', verified: true, ...overrides });
const record = (input, key = 'payment-1', records = seed()) => ({ ...validateEvent(input, records, today), key, recordedAt: '2026-11-13T02:00:00Z', actor: 'Test staff' });

test('tenant IDs derive from site, retaining site suffixes and distinguishing missing sites', () => {
  assert.equal(tenantId('21'), 'RHP-021-A');
  assert.equal(tenantId('021'), 'RHP-021-A');
  assert.equal(tenantId('21b'), 'RHP-021B-A');
  assert.equal(tenantId(null), 'Site not assigned');
});
test('money uses exact cents and rejects invalid, negative, fractional-cent and excessive amounts', () => {
  assert.equal(centsFromInput('1936'), 193600);
  assert.equal(centsFromInput('805.60'), 80560);
  assert.equal(centsFromInput('0.29'), 29);
  for (const input of ['', '0', '-3', '1.005', '1e3', 'NaN', 'Infinity', '1000001', '1,936']) assert.throws(() => centsFromInput(input));
});
test('standard charges are B=3872 and C=1936, advance charge is currently due, A stays unknown', () => {
  const result = summarize(seed(), today);
  assert.equal(result.periods.B.charges, 387200);
  assert.equal(result.periods.C.charges, 193600);
  assert.equal(result.balance, 580800);
  assert.equal(result.historicalComplete, false);
  assert.equal(result.status, 'Review');
  assert.equal(result.rows.at(-1).dueDate, '2026-10-11');
});
test('payments use their allocation, not receipt date; running balances recalculate after backdating', () => {
  const events = [...seed(), record(payment({ date: '2024-12-20' }))];
  const result = summarize(events, today);
  assert.deepEqual(result.rows.map(e => e.balance), [193600, 143600, 337200, 530800]);
  assert.equal(result.periods.B.paid, 50000);
  assert.equal(result.periods.C.paid, 0);
  assert.equal(result.paid, 50000);
});
test('historical charges can be imported without inventing an opening total', () => {
  const legacy = record({ type: 'Charge', period: 'A', date: '2024-10-01', amountCents: 80560, description: 'Old owner balance', basis: 'Handover statement', periodStart: '2022-10-11', periodEnd: '2024-10-10', dueDate: '2024-10-10' }, 'legacy');
  const result = summarize([...seed(), legacy], today);
  assert.equal(result.balance, 661360);
  assert.equal(result.historicalComplete, false);
  assert.equal(result.hasUnverified, true);
});
test('charge period boundaries are inclusive and reject cross-period service dates', () => {
  const b = seed()[0];
  assert.doesNotThrow(() => validateEvent(b, [], today));
  assert.throws(() => validateEvent({ ...b, periodStart: '2024-10-10' }, [], today), /within/);
  assert.throws(() => validateEvent({ ...b, periodEnd: '2026-10-11' }, [], today), /within/);
  assert.throws(() => validateEvent({ ...b, periodStart: '2025-01-01', periodEnd: '2024-12-31' }, [], today), /valid service/);
  assert.equal(validDate('2024-02-29'), true);
  assert.equal(validDate('2025-02-29'), false);
  assert.throws(() => validateEvent(payment({ date: '2026-11-14' }), [], today), /before today/);
});
test('payments require payer, method, reference and source evidence', () => {
  for (const field of ['payer', 'method', 'reference', 'basis', 'description']) assert.throws(() => validateEvent(payment({ [field]: '' }), [], today));
});
test('corrections retain originals and cannot exceed the original charge or payment', () => {
  const events = seed();
  const credit = record({ ...events[0], type: 'Credit', amountCents: 93600, targetKey: events[0].key, description: 'Agreed exemption' }, 'credit-1', events);
  const next = [...events, credit];
  assert.equal(summarize(next, today).balance, 487200);
  assert.equal(next[0].amountCents, 193600);
  assert.throws(() => validateEvent({ ...credit, amountCents: 100001 }, next, today), /exceeds/);
  assert.throws(() => validateEvent({ ...credit, period: 'A', periodStart: '2024-01-01', periodEnd: '2024-10-10' }, events, today), /matching/);
  const paid = record(payment());
  const refund = record(payment({ type: 'Refund', amountCents: 10000, targetKey: paid.key }), 'refund-1', [...events, paid]);
  assert.equal(summarize([...events, paid, refund], today).balance, 540800);
  assert.throws(() => validateEvent(payment({ type: 'Refund' }), [...events, paid], today), /original/);
});
test('review and verification are appended without changing original records', () => {
  const unverified = record(payment({ verified: false }));
  const events = [...seed(), unverified];
  const reviewed = record({ type: 'Review', status: 'Automatic', historicalComplete: true, description: 'All historical sources reconciled' }, 'review-1', events);
  assert.equal(summarize([...events, reviewed], today).status, 'Review');
  const verified = record({ type: 'Verify', targetKey: unverified.key, description: 'Checked bank statement' }, 'verify-1', events);
  assert.equal(summarize([...events, reviewed, verified], today).status, 'Overdue');
  assert.equal(unverified.verified, false);
  assert.throws(() => validateEvent({ type: 'Verify', targetKey: 'missing', description: 'Checked' }, events, today));
});
test('Current requires reconciled history and paid periods; overpayment does not hide another period debt', () => {
  const review = record({ type: 'Review', status: 'Automatic', historicalComplete: true, description: 'Nil historical balance verified' }, 'review');
  const b = record(payment({ amountCents: 387200 }), 'paid-b');
  const c = record(payment({ amountCents: 193600, period: 'C' }), 'paid-c');
  assert.equal(summarize([...seed(), review, b, c], today).status, 'Current');
  assert.equal(summarize([...seed(), review, record(payment({ amountCents: 580800 }))], today).status, 'Overdue');
  const disputed = record({ ...review, status: 'Disputed' }, 'disputed');
  assert.equal(summarize([...seed(), review, disputed], today).status, 'Disputed');
});
test('finance policy fails closed and derives the audit actor from the server credential', () => {
  const policy = require('../backend/strapi/src/api/rhp-finance/policies/finance-staff.js');
  const previous = process.env.RHP_FINANCE_STAFF_TOKENS;
  const ctx = token => ({ request: { headers: { authorization: `Bearer ${token}` } }, state: {} });
  try {
    delete process.env.RHP_FINANCE_STAFF_TOKENS;
    assert.equal(policy(ctx('')), false);
    process.env.RHP_FINANCE_STAFF_TOKENS = JSON.stringify({ Reviewer: 'test-only-access-code-at-least-32-characters' });
    assert.equal(policy(ctx('wrong')), false);
    const context = ctx('test-only-access-code-at-least-32-characters');
    assert.equal(policy(context), true);
    assert.equal(context.state.financeActor, 'Reviewer');
    process.env.RHP_FINANCE_STAFF_TOKENS = 'broken-json';
    assert.equal(policy(ctx('anything')), false);
  } finally { if (previous === undefined) delete process.env.RHP_FINANCE_STAFF_TOKENS; else process.env.RHP_FINANCE_STAFF_TOKENS = previous; }
});
test('stored financial events allow individual edits and reject bulk changes or deletion', async () => {
  const hooks = require('../backend/strapi/src/api/rhp-finance-event/content-types/rhp-finance-event/lifecycles.js');
  for (const key of ['beforeUpdateMany', 'beforeDelete', 'beforeDeleteMany']) assert.throws(() => hooks[key](), /disabled/);
  const previous = globalThis.strapi;
  const original = { id: 1, memberKey: 'member21', eventKey: 'member21:standard-2024', payload: seed()[0], actor: 'Staff', recordedAt: '2026-11-13T00:00:00Z' };
  globalThis.strapi = { db: { query: () => ({ findOne: async () => original, findMany: async () => [original] }) } };
  try {
    const event = { params: { where: { id: 1 }, data: { payload: { ...original.payload, amountCents: 100000 } } } };
    await hooks.beforeUpdate(event);
    assert.equal(event.params.data.payload.amountCents, 100000);
    await assert.rejects(hooks.beforeUpdate({ params: { where: { id: 1 }, data: { memberKey: 'different' } } }), /cannot be changed/);
    await assert.rejects(hooks.beforeUpdate({ params: { where: { id: 1 }, data: { payload: { ...original.payload, amountCents: -100 } } } }), /Invalid amount/);
  } finally { globalThis.strapi = previous; }
});
