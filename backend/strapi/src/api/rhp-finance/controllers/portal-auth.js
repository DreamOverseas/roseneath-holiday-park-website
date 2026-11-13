'use strict';
const auth = require('../services/portal-auth.cjs');
module.exports = {
  async platforms(ctx) {
    const fs = require('node:fs');
    const path = require('node:path');
    ctx.set('Cache-Control', 'no-store');
    ctx.body = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.rhp-admin-platforms.json'), 'utf8'));
  },
  async login(ctx) {
    ctx.set('Cache-Control', 'no-store');
    const result = auth.login(ctx.request.body?.password, ctx.request.ip);
    if (result.status) { ctx.status = result.status; ctx.body = { error: { message: result.status === 429 ? 'Too many attempts. Please try again later.' : 'Incorrect password.' } }; return; }
    ctx.body = result;
  },
  async logout(ctx) {
    auth.logout((ctx.request.headers.authorization || '').replace(/^Bearer /, ''));
    ctx.status = 204;
  },
};
