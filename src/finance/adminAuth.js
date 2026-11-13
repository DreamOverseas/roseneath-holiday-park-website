const endpoint = (import.meta.env.VITE_CMS_ENDPOINT || 'https://api.do360.com').replace(/\/$/, '');
export async function loginAdmin(password) {
  const response = await fetch(`${endpoint}/api/rhp-admin/login`, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Unable to sign in.');
  if (!result.token) throw new Error('Invalid sign-in response.');
  return result.token;
}
export async function logoutAdmin(token) {
  await fetch(`${endpoint}/api/rhp-admin/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
}
