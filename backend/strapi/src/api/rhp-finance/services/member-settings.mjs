import { tenantId, PERIODS } from './domain.mjs';

export const DEBT_FIELDS = { A: 'OutstandingDebtA', B: 'OutstandingDebtB', C: 'OutstandingDebtC' };
export const SETTINGS_FIELDS = ['TenantId', ...Object.values(DEBT_FIELDS)];
export function debtCents(member, period) {
  const value = member?.[DEBT_FIELDS[period]];
  return value === null || value === undefined || value === '' ? (PERIODS[period].expected ?? 0) : Math.round(Number(value) * 100);
}
export const memberTenantId = member => member.TenantId?.trim() || tenantId(member.SiteNumber, member.TenantType);
export function defaultSettings(member) {
  return { TenantId: memberTenantId(member), ...Object.fromEntries(Object.entries(DEBT_FIELDS).map(([period, field]) => [field, debtCents(member, period) / 100])) };
}
export function missingSettings(member) {
  const defaults = defaultSettings(member);
  return Object.fromEntries(Object.entries(defaults).filter(([field]) => member[field] === null || member[field] === undefined || member[field] === ''));
}
export function validateSettings(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(key => !SETTINGS_FIELDS.includes(key))) throw Error('Invalid account settings.');
  const result = {};
  if (Object.hasOwn(input, 'TenantId')) {
    if (typeof input.TenantId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9 _.-]{0,79}$/.test(input.TenantId.trim())) throw Error('Tenant ID must contain 1–80 letters, numbers, spaces, dots, underscores or hyphens.');
    result.TenantId = input.TenantId.trim();
  }
  for (const field of Object.values(DEBT_FIELDS)) {
    if (!Object.hasOwn(input, field)) continue;
    const text = String(input[field]);
    if (!/^\d+(\.\d{1,2})?$/.test(text) || Number(text) > 1000000) throw Error('Outstanding debt must be between $0.00 and $1,000,000.00, with at most two decimal places.');
    result[field] = Number(text);
  }
  if (!Object.keys(result).length) throw Error('No account settings supplied.');
  return result;
}
