'use strict';
const { randomBytes, createHash, timingSafeEqual } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const sessions = new Map();
const attempts = new Map();
const TTL = 8 * 60 * 60 * 1000;
function validPassword(password) {
  if (typeof password !== 'string' || !password || password.length > 256) return false;
  try {
    const expected = fs.readFileSync(path.join(process.cwd(), '.rhp-finance-portal.sha256'), 'utf8').trim();
    const actual = createHash('sha256').update(password).digest('hex');
    return expected.length === actual.length && timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  } catch { return false; }
}
function cleanup() {
  const now = Date.now();
  for (const [key, expiry] of sessions) if (expiry <= now) sessions.delete(key);
  for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
}
module.exports = {
  login(password, ip) {
    cleanup();
    const entry = attempts.get(ip) || { count: 0, until: Date.now() + 15 * 60 * 1000 };
    if (entry.count >= 10 || attempts.size > 10000 || sessions.size >= 10000) return { status: 429 };
    if (!validPassword(password)) { entry.count++; attempts.set(ip, entry); return { status: 401 }; }
    attempts.delete(ip);
    const token = randomBytes(32).toString('hex');
    sessions.set(createHash('sha256').update(token).digest('hex'), Date.now() + TTL);
    return { token, expiresIn: TTL / 1000 };
  },
  verify(token) {
    if (typeof token !== 'string' || token.length !== 64) return false;
    const key = createHash('sha256').update(token).digest('hex');
    const expiry = sessions.get(key);
    if (!expiry || expiry <= Date.now()) { sessions.delete(key); return false; }
    return true;
  },
  logout(token) { if (typeof token === 'string') sessions.delete(createHash('sha256').update(token).digest('hex')); },
};
