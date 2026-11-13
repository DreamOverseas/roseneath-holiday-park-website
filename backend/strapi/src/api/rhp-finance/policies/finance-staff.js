'use strict';
const { timingSafeEqual, createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
// Separate staff credentials, configured only on the server; never a VITE_* secret.
module.exports = (ctx) => {
  let staff;
  try {
    const file = path.join(process.cwd(), '.rhp-finance-staff.json');
    staff = JSON.parse(process.env.RHP_FINANCE_STAFF_TOKENS || (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '{}'));
  } catch { return false; }
  const supplied = Buffer.from((ctx.request.headers.authorization || '').replace(/^Bearer /, ''));
  if (!supplied.length) return false;
  const portalFile = path.join(process.cwd(), '.rhp-finance-portal.sha256');
  if (fs.existsSync(portalFile)) {
    const expected = fs.readFileSync(portalFile, 'utf8').trim();
    const actual = createHash('sha256').update(supplied).digest('hex');
    if (expected.length === actual.length && timingSafeEqual(Buffer.from(expected), Buffer.from(actual))) {
      ctx.state.financeActor = 'RHP admin portal';
      return true;
    }
  }
  for (const [name, token] of Object.entries(staff)) {
    if (typeof token !== 'string' || token.length < 32) continue;
    const expected = Buffer.from(token);
    if (supplied.length === expected.length && timingSafeEqual(supplied, expected)) {
      ctx.state.financeActor = name;
      return true;
    }
  }
  return false;
};
