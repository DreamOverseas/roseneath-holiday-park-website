'use strict';
const { timingSafeEqual } = require('node:crypto');
// Separate staff credentials, configured only on the server; never a VITE_* secret.
module.exports = (ctx) => {
  let staff;
  try { staff = JSON.parse(process.env.RHP_FINANCE_STAFF_TOKENS || '{}'); } catch { return false; }
  const supplied = Buffer.from((ctx.request.headers.authorization || '').replace(/^Bearer /, ''));
  if (!supplied.length) return false;
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
