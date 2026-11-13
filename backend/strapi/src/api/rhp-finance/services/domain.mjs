// Shared by the browser and Strapi. Money is always integer AUD cents.
export const PERIODS = {
  A: { title: 'Pre-acquisition', start: null, end: '2024-10-10', expected: null },
  B: { title: 'Post-acquisition', start: '2024-10-11', end: '2026-10-10', expected: 387200 },
  C: { title: 'Advance annual fee', start: '2026-10-11', end: '2027-10-10', expected: 193600 },
};
export const METHODS = ['Bank transfer', 'Cash', 'Card', 'Cheque', 'Other'];
export const REVIEW_STATUSES = ['Automatic', 'Review', 'Disputed', 'Arrangement'];
export const todaySydney = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const money = cents => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100);
export const displayDate = value => value ? value.slice(0, 10).split('-').reverse().join('/') : '—';
export function tenantId(site) {
  const value = String(site ?? '').trim();
  if (!value) return 'Site not assigned';
  const match = value.match(/^(\d+)(.*)$/);
  return `RHP-${match ? match[1].padStart(3, '0') + match[2].toUpperCase() : value.toUpperCase()}-A`;
}
export function centsFromInput(value) {
  const text = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new Error('Enter a positive amount with no more than two decimal places.');
  const [whole, fraction = ''] = text.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 100000000) throw new Error('Amount must be between A$0.01 and A$1,000,000.00.');
  return cents;
}
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
const requiredText = (value, label, max = 2000) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${label} is required (maximum ${max} characters).`);
  return value.trim();
};
export function validateEvent(input, records = [], today = todaySydney()) {
  const type = input.type;
  if (type === 'Review') {
    if (!REVIEW_STATUSES.includes(input.status)) throw new Error('Invalid account status.');
    if (typeof input.historicalComplete !== 'boolean') throw new Error('Historical reconciliation is required.');
    if (input.nextPayment && !validDate(input.nextPayment)) throw new Error('Invalid next payment date.');
    return { type, status: input.status, historicalComplete: input.historicalComplete, nextPayment: input.nextPayment || '', description: requiredText(input.description, 'Review reason') };
  }
  if (type === 'Verify') {
    const original = records.find(e => e.key === input.targetKey && ['Charge', 'Payment', 'Credit', 'Refund'].includes(e.type));
    if (!original) throw new Error('The original record was not found.');
    return { type, targetKey: original.key, description: requiredText(input.description, 'Verification evidence') };
  }
  if (!['Charge', 'Payment', 'Credit', 'Refund'].includes(type)) throw new Error('Invalid transaction type.');
  if (!PERIODS[input.period]) throw new Error('Choose a financial period.');
  if (!validDate(input.date) || input.date > today) throw new Error('Transaction date must be a valid date on or before today.');
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents <= 0 || input.amountCents > 100000000) throw new Error('Invalid amount in AUD cents.');
  const result = { type, period: input.period, date: input.date, amountCents: input.amountCents, description: requiredText(input.description, 'Description'), basis: requiredText(input.basis, 'Source / evidence'), verified: input.verified === true };
  if (type === 'Charge' || type === 'Credit') {
    const period = PERIODS[input.period];
    if (!validDate(input.periodStart) || !validDate(input.periodEnd) || input.periodStart > input.periodEnd) throw new Error('Enter a valid service period.');
    if ((period.start && input.periodStart < period.start) || input.periodEnd > period.end) throw new Error('Service dates must fall within the selected A, B or C period. Split charges spanning periods.');
    Object.assign(result, { periodStart: input.periodStart, periodEnd: input.periodEnd });
    if (type === 'Charge') {
      if (!validDate(input.dueDate)) throw new Error('Enter a valid due date.');
      result.dueDate = input.dueDate;
    }
  } else {
    if (!METHODS.includes(input.method)) throw new Error('Choose a payment method.');
    Object.assign(result, { payer: requiredText(input.payer, 'Payer / recipient', 200), method: input.method, reference: requiredText(input.reference, 'Bank / receipt reference', 200) });
  }
  if (input.targetKey) {
    const original = records.find(e => e.key === input.targetKey);
    const expected = type === 'Credit' ? 'Charge' : type === 'Refund' ? 'Payment' : null;
    if (!original || original.type !== expected || original.period !== input.period) throw new Error('Correction must reference a matching charge or payment in the same period.');
    const corrected = records.filter(e => e.targetKey === original.key && e.type === type).reduce((sum, e) => sum + e.amountCents, 0);
    if (corrected + input.amountCents > original.amountCents) throw new Error('Correction exceeds the remaining original amount.');
    result.targetKey = original.key;
  } else if (type === 'Credit' || type === 'Refund') {
    throw new Error('Choose the original transaction to correct.');
  }
  return result;
}
export function standardCharges() {
  return [2024, 2025, 2026].map(year => ({
    key: `standard-${year}`, type: 'Charge', period: year < 2026 ? 'B' : 'C',
    date: `${year}-10-11`, dueDate: `${year}-10-11`,
    periodStart: `${year}-10-11`, periodEnd: `${year + 1}-10-10`, amountCents: 193600,
    description: `Annual fee ${year}/${year + 1}${year === 2026 ? ' — payable in advance' : ''}`,
    basis: 'RHP standard annual fee: A$1,936 per year. Confirmed when opening this account.', verified: true,
  }));
}
export const signedAmount = entry => ['Payment', 'Credit'].includes(entry.type) ? -entry.amountCents : entry.amountCents;
export function summarize(records, today = todaySydney()) {
  const periods = Object.fromEntries(Object.keys(PERIODS).map(key => [key, { charges: 0, paid: 0, credits: 0, refunds: 0, balance: 0 }]));
  const verifiedKeys = new Set(records.filter(e => e.type === 'Verify').map(e => e.targetKey));
  const transactions = records.filter(e => ['Charge', 'Payment', 'Credit', 'Refund'].includes(e.type))
    .sort((a, b) => a.date.localeCompare(b.date) || String(a.recordedAt).localeCompare(String(b.recordedAt)) || a.key.localeCompare(b.key));
  let balance = 0;
  let hasUnverified = false;
  const rows = transactions.map(entry => {
    const p = periods[entry.period];
    p[{ Charge: 'charges', Payment: 'paid', Credit: 'credits', Refund: 'refunds' }[entry.type]] += entry.amountCents;
    p.balance += signedAmount(entry);
    balance += signedAmount(entry);
    const verified = entry.verified || verifiedKeys.has(entry.key);
    if (!verified) hasUnverified = true;
    return { ...entry, verified, balance };
  });
  const review = records.filter(e => e.type === 'Review').at(-1);
  const historicalComplete = review?.historicalComplete === true;
  // Credits/payments are allocated to their explicitly selected period, not silently to another period.
  const overdue = Object.keys(PERIODS).some(period => {
    const dueCharges = rows.filter(e => e.period === period && e.type === 'Charge' && e.dueDate < today).reduce((n, e) => n + e.amountCents, 0);
    const p = periods[period];
    return dueCharges - p.paid - p.credits + p.refunds > 0;
  });
  const status = review?.status && review.status !== 'Automatic' ? review.status :
    !historicalComplete || hasUnverified ? 'Review' : overdue ? 'Overdue' :
      Object.values(periods).some(p => p.balance > 0) ? 'Review' : 'Current';
  return { rows, periods, balance, historicalComplete, hasUnverified, status, review,
    charges: Object.values(periods).reduce((n, p) => n + p.charges, 0),
    paid: Object.values(periods).reduce((n, p) => n + p.paid, 0),
    credits: Object.values(periods).reduce((n, p) => n + p.credits, 0),
    refunds: Object.values(periods).reduce((n, p) => n + p.refunds, 0) };
}
