import { standardCharges, validateEvent } from '../../backend/strapi/src/api/rhp-finance/services/domain.mjs';

export const LOCAL_REVIEW = import.meta.env.DEV && import.meta.env.VITE_FINANCE_LIVE !== 'true';
const storageKey = 'rhp-finance-local-review-v1';
const endpoint = (import.meta.env.VITE_CMS_ENDPOINT || 'https://api.do360.com').replace(/\/$/, '');
let accessToken = '';
export const setFinanceToken = token => { accessToken = token; };
export const reviewMembers = [
  { documentId: 'review-site-21', SiteNumber: '21', TenantType: 'Permanent', FirstName: 'Sample', LastName: 'Resident', FirstName2: 'Other', LastName2: 'Payer', ContactString: '0400 000 021', Email: 'resident@example.test' },
  { documentId: 'review-site-99', SiteNumber: '99', TenantType: 'Annual', FirstName: 'Sample', LastName: 'Annual', ContactString: '0400 000 099', Email: 'annual@example.test' },
];
function readLocal() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.values(parsed).some(v => !Array.isArray(v))) throw new Error('Local review data is invalid. Export or inspect it before resetting browser storage.');
  return parsed;
}
async function request(path, body) {
  const response = await fetch(`${endpoint}/api/rhp-finance${path}`, {
    method: body ? 'POST' : 'GET', cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    if ([401, 403].includes(response.status)) throw new Error('Your admin session has expired. Please log out and sign in again.');
    if (response.status === 404) throw new Error('Finance backend is not installed. Install the included Strapi module before using live accounts.');
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Finance request failed (${response.status}).`);
  }
  return response.json();
}
export async function loadFinance() {
  return LOCAL_REVIEW ? { accounts: readLocal() } : request('');
}
async function localMutation(memberKey, change) {
  const mutate = () => {
    const accounts = readLocal();
    const records = change(accounts[memberKey] || []);
    localStorage.setItem(storageKey, JSON.stringify({ ...accounts, [memberKey]: records }));
    return { records };
  };
  // Serialize tabs too; do not overwrite another reviewer's simultaneous local edit.
  return navigator.locks ? navigator.locks.request(storageKey, mutate) : mutate();
}
export function openAccount(memberKey) {
  if (!LOCAL_REVIEW) return request(`/${encodeURIComponent(memberKey)}/open`, { confirmStandardFees: true });
  return localMutation(memberKey, records => [
    ...records,
    ...standardCharges().filter(e => !records.some(r => r.key === e.key)).map(e => ({ ...e, actor: 'Local reviewer', recordedAt: new Date().toISOString() })),
  ]);
}
export function appendEvent(memberKey, event, requestId) {
  if (!LOCAL_REVIEW) return request(`/${encodeURIComponent(memberKey)}/events`, { event, requestId });
  return localMutation(memberKey, records => {
    if (records.some(e => e.key === requestId)) return records;
    if (!records.some(e => e.key === 'standard-2024')) throw new Error('Open this account first.');
    return [...records, { ...validateEvent(event, records), key: requestId, actor: 'Local reviewer', recordedAt: new Date().toISOString() }];
  });
}
