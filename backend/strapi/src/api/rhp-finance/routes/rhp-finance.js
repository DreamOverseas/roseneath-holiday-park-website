'use strict';
const config = { auth: false, policies: ['api::rhp-finance.finance-staff'] };
module.exports = { routes: [
  { method: 'POST', path: '/rhp-admin/login', handler: 'portal-auth.login', config: { auth: false } },
  { method: 'POST', path: '/rhp-admin/logout', handler: 'portal-auth.logout', config: { auth: false } },
  { method: 'GET', path: '/rhp-admin/platforms', handler: 'portal-auth.platforms', config },
  { method: 'GET', path: '/rhp-finance', handler: 'rhp-finance.list', config },
  { method: 'POST', path: '/rhp-finance/:memberKey/open', handler: 'rhp-finance.open', config },
  { method: 'POST', path: '/rhp-finance/:memberKey/events', handler: 'rhp-finance.append', config },
] };
