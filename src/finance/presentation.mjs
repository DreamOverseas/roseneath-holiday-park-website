import { money } from '../../backend/strapi/src/api/rhp-finance/services/domain.mjs';

// Receipt amounts describe money received; they are not the change in receivables.
// Charges are positive assessed fees; credits reverse fees; refunds reverse receipts.
export const transactionAmount = entry => ['Refund', 'Credit'].includes(entry.type) ? -entry.amountCents : entry.amountCents;
export const balancePosition = cents => cents < 0 ? 'Tenant credit' : cents > 0 ? 'Amount due' : 'Balanced';
export const displayBalance = cents => `${money(Math.abs(cents))} · ${balancePosition(cents)}`;
export const outstandingDebt = balance => Math.max(0, balance);
// Payments stay in their allocated period until staff explicitly reallocate them.
export const totalOutstandingDebt = periods => Object.values(periods).reduce((total, period) => total + outstandingDebt(period.balance), 0);
