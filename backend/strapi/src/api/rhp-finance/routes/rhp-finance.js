'use strict';
const config = { auth: false, policies: ['api::rhp-finance.finance-staff'] };
module.exports = { routes: [
  { method: 'GET', path: '/rhp-finance', handler: 'rhp-finance.list', config },
  { method: 'POST', path: '/rhp-finance/:memberKey/open', handler: 'rhp-finance.open', config },
  { method: 'POST', path: '/rhp-finance/:memberKey/events', handler: 'rhp-finance.append', config },
] };
