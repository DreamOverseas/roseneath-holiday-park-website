import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultSettings, missingSettings, validateSettings, memberTenantId } from '../backend/strapi/src/api/rhp-finance/services/member-settings.mjs';
import { summarize } from '../backend/strapi/src/api/rhp-finance/services/domain.mjs';
import { periodDebt, totalOutstandingDebt } from '../src/finance/presentation.mjs';

test('membership defaults, Permanent suffix and custom IDs survive initialization', () => {
  const annual = { SiteNumber: '21', TenantType: 'Annual' };
  assert.deepEqual(defaultSettings(annual), { TenantId: 'RHP-021-A', OutstandingDebtA: 0, OutstandingDebtB: 3872, OutstandingDebtC: 1936 });
  assert.equal(memberTenantId({ ...annual, TenantType: 'Permanent' }), 'RHP-021-P');
  const customized = { ...annual, ...defaultSettings(annual), TenantId: 'CUSTOM-21', OutstandingDebtA: 5000, OutstandingDebtB: 0 };
  assert.deepEqual(missingSettings(customized), {});
  assert.equal(memberTenantId(customized), 'CUSTOM-21');
  assert.deepEqual(missingSettings({ ...customized, OutstandingDebtC: null }), { OutstandingDebtC: 1936 });
});

test('saved per-member debts drive totals, retaining zero and decimal values', () => {
  const summary = summarize([{ type: 'Payment', amountCents: 10000, period: '', date: '2026-11-01', key: 'payment' }]);
  const original = defaultSettings({ SiteNumber: '21', TenantType: 'Annual' });
  const changed = { ...original, OutstandingDebtA: '5000.25', OutstandingDebtB: 0 };
  assert.equal(periodDebt(summary, 'A', changed), 500025);
  assert.equal(periodDebt(summary, 'B', changed), 0);
  assert.equal(totalOutstandingDebt(summary, changed), 683625);
  assert.equal(totalOutstandingDebt(summary, original), 570800);
  assert.deepEqual(validateSettings({ OutstandingDebtA: '0.00', OutstandingDebtB: '50.05' }), { OutstandingDebtA: 0, OutstandingDebtB: 50.05 });
});

test('settings reject invalid amounts, unrelated fields and malformed IDs', () => {
  for (const value of [-1, '', null, '1.001', '1e3', 'NaN', 1000000.01]) assert.throws(() => validateSettings({ OutstandingDebtA: value }));
  for (const value of [{}, { Password: 'changed' }, { TenantId: '' }, { TenantId: '<script>' }, { OutstandingDebtD: 1 }]) assert.throws(() => validateSettings(value));
});
