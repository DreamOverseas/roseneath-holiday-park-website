import test from 'node:test';
import assert from 'node:assert/strict';
import { transactionAmount, balancePosition, displayBalance, periodDebt, totalOutstandingDebt } from '../src/finance/presentation.mjs';
import { summarize } from '../backend/strapi/src/api/rhp-finance/services/domain.mjs';

test('summary retains original period debts and deducts all receipts once from their total', () => {
  const entry = (key, type, period, amountCents) => ({ key, type, period, amountCents, date: '2026-11-01' });
  const records = [
    entry('a', 'Charge', 'A', 10000), entry('ac', 'Credit', 'A', 1000),
    entry('b', 'Charge', 'B', 387200), entry('c', 'Charge', 'C', 193600),
    entry('ap', 'Payment', 'A', 4000), entry('bp', 'Payment', 'B', 25000),
    entry('cp', 'Payment', 'C', 30000), entry('up', 'Payment', '', 2000),
  ];
  const incomplete = summarize(records);
  assert.equal(periodDebt(incomplete, 'A'), null);
  assert.equal(periodDebt(incomplete, 'B'), 387200);
  assert.equal(periodDebt(incomplete, 'C'), 193600);
  assert.equal(totalOutstandingDebt(incomplete), 519800); // Known portion, plus unknown A.
  const complete = summarize([...records, { type: 'Review', historicalComplete: true }]);
  assert.equal(periodDebt(complete, 'A'), 9000);
  assert.equal(totalOutstandingDebt(complete), 528800);
  // Standard fees apply even before matching charge transactions are recorded.
  assert.equal(totalOutstandingDebt(summarize([entry('p', 'Payment', '', 10000)])), 570800);
  assert.equal(totalOutstandingDebt(summarize([entry('p', 'Payment', '', 600000)])), -19200);
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
