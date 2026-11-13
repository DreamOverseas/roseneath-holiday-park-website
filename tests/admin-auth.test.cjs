const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
test('server verifies unchanged credential, issues expiring sessions, revokes logout and limits guessing', () => {
  const original = fs.readFileSync;
  const password = 'test-only-password';
  fs.readFileSync = function(file, ...args) {
    if (String(file).endsWith('.rhp-finance-portal.sha256')) return crypto.createHash('sha256').update(password).digest('hex');
    return original.call(this, file, ...args);
  };
  const auth = require('../backend/strapi/src/api/rhp-finance/services/portal-auth.cjs');
  try {
    assert.equal(auth.login('wrong', 'test-ip').status, 401);
    const session = auth.login(password, 'test-ip');
    assert.equal(session.token.length, 64);
    assert.equal(auth.verify(session.token), true);
    assert.equal(auth.verify(password), false);
    assert.equal(auth.verify('0'.repeat(64)), false);
    const originalNow = Date.now;
    Date.now = () => originalNow() + 9 * 3600000;
    try { assert.equal(auth.verify(session.token), false); } finally { Date.now = originalNow; }
    const next = auth.login(password, 'test-ip');
    auth.logout(next.token);
    assert.equal(auth.verify(next.token), false);
    for (let i = 0; i < 10; i++) auth.login('wrong', 'attacker');
    assert.equal(auth.login(password, 'attacker').status, 429);
  } finally { fs.readFileSync = original; }
});
