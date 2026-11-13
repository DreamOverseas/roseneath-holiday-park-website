'use strict';
const UID = 'api::rhp-finance-event.rhp-finance-event';
const domain = () => import('../services/domain.mjs');
const memberFields = ['documentId', 'SiteNumber', 'TenantType', 'FirstName', 'LastName', 'FirstName2', 'LastName2', 'Email', 'Email2', 'ContactString', 'ContactString2', 'Contact', 'Contact2'];
const serialize = row => ({ ...row.payload, key: row.eventKey.split(':').slice(1).join(':'), actor: row.actor, recordedAt: row.recordedAt });
const recordsFor = async memberKey => (await strapi.db.query(UID).findMany({ where: { memberKey }, orderBy: { id: 'asc' } })).map(serialize);
async function tenant(memberKey) {
  const member = await strapi.documents('api::rhp-membership.rhp-membership').findOne({ documentId: memberKey, status: 'published', fields: memberFields });
  if (!member || !['Annual', 'Permanent'].includes(member.TenantType)) return null;
  return member;
}
async function write(memberKey, key, payload, actor) {
  return strapi.db.query(UID).create({ data: { eventKey: `${memberKey}:${key}`, memberKey, payload, actor, recordedAt: new Date().toISOString() } });
}
module.exports = {
  async list(ctx) {
    const members = await strapi.documents('api::rhp-membership.rhp-membership').findMany({
      status: 'published', filters: { TenantType: { $in: ['Annual', 'Permanent'] } }, fields: memberFields,
    });
    const events = await strapi.db.query(UID).findMany({ orderBy: { id: 'asc' } });
    const accounts = {};
    for (const event of events) (accounts[event.memberKey] ||= []).push(serialize(event));
    ctx.set('Cache-Control', 'no-store');
    ctx.body = { members, accounts };
  },
  async open(ctx) {
    const memberKey = ctx.params.memberKey;
    if (!await tenant(memberKey)) return ctx.notFound('Annual or permanent member not found.');
    if (ctx.request.body?.confirmStandardFees !== true) return ctx.badRequest('Confirm the three annual charges before opening the account.');
    const { standardCharges } = await domain();
    try {
      await strapi.db.transaction(async () => {
        const existing = await recordsFor(memberKey);
        for (const { key, ...payload } of standardCharges()) {
          if (!existing.some(e => e.key === key)) await write(memberKey, key, payload, ctx.state.financeActor);
        }
      });
    } catch (error) {
      // A concurrent open may have committed the same unique standard keys.
      const existing = await recordsFor(memberKey);
      if (!standardCharges().every(e => existing.some(r => r.key === e.key))) throw error;
    }
    ctx.body = { records: await recordsFor(memberKey) };
  },
  async append(ctx) {
    const memberKey = ctx.params.memberKey;
    if (!await tenant(memberKey)) return ctx.notFound('Annual or permanent member not found.');
    const { requestId, event } = ctx.request.body || {};
    if (typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(requestId)) return ctx.badRequest('A UUID requestId is required.');
    const { validateEvent } = await domain();
    try {
      // Lock the membership row to serialize correction-limit checks across workers.
      await strapi.db.transaction(async ({ trx }) => {
        const metadata = strapi.db.metadata.get('api::rhp-membership.rhp-membership');
        await trx(metadata.tableName).where('document_id', memberKey).forUpdate().select('id');
        const records = await recordsFor(memberKey);
        if (records.some(e => e.key === requestId)) return;
        if (!records.some(e => e.key === 'standard-2024')) throw new Error('Open this account first.');
        const payload = validateEvent(event || {}, records);
        await write(memberKey, requestId, payload, ctx.state.financeActor);
      });
    } catch (error) {
      if (!(await recordsFor(memberKey)).some(e => e.key === requestId)) return ctx.badRequest(error.message);
    }
    ctx.body = { records: await recordsFor(memberKey) };
  },
};
