import { money, PERIODS } from '../../backend/strapi/src/api/rhp-finance/services/domain.mjs';

// Receipt amounts describe money received; they are not the change in receivables.
// Charges are positive assessed fees; credits reverse fees; refunds reverse receipts.
export const transactionAmount = entry => ['Refund', 'Credit'].includes(entry.type) ? -entry.amountCents : entry.amountCents;
export const balancePosition = cents => cents < 0 ? 'Tenant credit' : cents > 0 ? 'Amount due' : 'Balanced';
export const displayBalance = cents => `${money(Math.abs(cents))} · ${balancePosition(cents)}`;
// A remains unknown until its history is reconciled; B and C retain standard fees.
export const periodDebt = (summary, key) => key === 'A'
  ? (summary.historicalComplete ? summary.periods.A.charges - summary.periods.A.credits : null)
  : PERIODS[key].expected;
// Deduct every tenant receipt, including unassigned payments, exactly once.
export const totalOutstandingDebt = summary => ['A', 'B', 'C'].reduce((total, key) => total + (periodDebt(summary, key) ?? 0), 0) - summary.paid;
