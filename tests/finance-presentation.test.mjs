import test from 'node:test';
import assert from 'node:assert/strict';
import { transactionAmount, balancePosition, displayBalance, outstandingDebt, totalOutstandingDebt } from '../src/finance/presentation.mjs';
import { summarize } from '../backend/strapi/src/api/rhp-finance/services/domain.mjs';

test('outstanding debt uses unpaid charges and keeps credits in their allocated period', () => {
  const entry = (key, type, period, amountCents) => ({ key, type, period, amountCents, date: '2026-11-01' });
  const summary = summarize([
    entry('a', 'Charge', 'A', 10000), entry('ap', 'Payment', 'A', 4000),
    entry('ac', 'Credit', 'A', 1000), entry('ar', 'Refund', 'A', 500),
    entry('b', 'Charge', 'B', 20000), entry('bp', 'Payment', 'B', 25000),
    entry('c', 'Charge', 'C', 30000), entry('cp', 'Payment', 'C', 30000),
    entry('u', 'Charge', '', 2000),
  ]);
  assert.equal(outstandingDebt(summary.periods.A.balance), 5500);
  assert.equal(outstandingDebt(summary.periods.B.balance), 0);
  assert.equal(outstandingDebt(summary.periods.C.balance), 0);
  assert.equal(totalOutstandingDebt(summary.periods), 7500);
  assert.equal(totalOutstandingDebt(summarize([]).periods), 0);
});

test('received payments display positive and refunds negative while receivables retain their meaning', () => {
  const payment = { key: 'receipt', type: 'Payment', period: '', date: '2026-11-01', amountCents: 10000 };
  const refund = { ...payment, key: 'refund', type: 'Refund', targetKey: payment.key, amountCents: 2500 };
  assert.equal(transactionAmount(payment), 10000);
  assert.equal(transactionAmount(refund), -2500);
  assert.equal(transactionAmount({ type: 'Charge', amountCents: 10000 }), 10000);
  assert.equal(transactionAmount({ type: 'Credit', amountCents: 2500 }), -2500);
  const summary = summarize([payment, refund]);
  assert.equal(summary.paid, 10000);
  assert.equal(summary.refunds, 2500);
  assert.equal(summary.balance, -7500);
  assert.equal(balancePosition(summary.balance), 'Tenant credit');
  assert.equal(balancePosition(7500), 'Amount due');
  assert.equal(balancePosition(0), 'Balanced');
  assert.equal(displayBalance(summary.balance), '$75.00 · Tenant credit');
  assert.equal(payment.amountCents, 10000);
});
