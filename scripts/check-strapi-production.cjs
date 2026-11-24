'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { setTimeout: wait } = require('node:timers/promises');

const base = 'http://127.0.0.1:1337';
const request = (path, options) => fetch(base + path, { ...options, signal: AbortSignal.timeout(5000) });

async function check() {
  const deadline = Date.now() + 60000;
  let healthy = false;
  do {
    healthy = await request('/_health').then(response => response.status === 204, () => false);
    if (!healthy) await wait(1000);
  } while (!healthy && Date.now() < deadline);
  assert(healthy, 'Strapi did not become healthy');

  const login = await request('/api/rhp-admin/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  });
  assert([401, 429].includes(login.status), `Admin login route returned HTTP ${login.status}`);
  assert.equal(typeof (await login.json()).error?.message, 'string', 'Invalid admin login response');
  for (const path of ['/api/rhp-finance', '/api/rhp-admin/platforms']) {
    const denied = await request(path);
    assert([401, 403].includes(denied.status), `${path} returned HTTP ${denied.status} without authorization`);
  }
  for (const path of ['/api/rhp-finance-events', '/api/rhp-bank-transactions']) {
    assert(!(await request(path)).ok, `Unexpected public access to ${path}`);
  }

  const credentials = JSON.parse(fs.readFileSync('.rhp-finance-staff.json', 'utf8'));
  const token = Object.values(credentials).find(value => typeof value === 'string' && value.length >= 32);
  assert(token, 'Missing configured finance staff credential');
  const finance = await request('/api/rhp-finance', { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(finance.status, 200, 'Authenticated finance request failed');
  const { members, accounts, bankTransactions } = await finance.json();
  assert(Array.isArray(members) && members.length && accounts && Array.isArray(bankTransactions), 'Invalid finance response');
  console.log('RHP_PRODUCTION_ROUTES_VERIFIED');
}

async function main() {
  if (process.argv[2] !== '--candidate') return check();
  const app = await require('./open-strapi-deploy-db.cjs')();
  try {
    await app.start();
    await check();
  } finally {
    await app.destroy();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
