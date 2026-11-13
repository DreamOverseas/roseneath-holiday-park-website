'use strict';
const UID = 'api::rhp-finance-event.rhp-finance-event';
const immutable = () => { throw new Error('Bulk changes and deletion are disabled. Edit an individual record or add a correction.'); };
module.exports = {
  async beforeUpdate(event) {
    const existing = await strapi.db.query(UID).findOne({ where: event.params.where });
    if (!existing) throw new Error('Financial record not found.');
    const data = event.params.data;
    for (const key of ['eventKey', 'memberKey', 'actor', 'recordedAt']) {
      if (data[key] !== undefined && data[key] !== existing[key]) throw new Error(`${key} cannot be changed. Edit the financial payload instead.`);
    }
    const { validateEvent } = await import('../../../rhp-finance/services/domain.mjs');
    const rows = await strapi.db.query(UID).findMany({ where: { memberKey: existing.memberKey }, orderBy: { id: 'asc' } });
    const key = existing.eventKey.slice(existing.memberKey.length + 1);
    const records = rows.filter(row => row.id !== existing.id).map(row => ({ ...row.payload, key: row.eventKey.slice(row.memberKey.length + 1) }));
    const payload = data.payload === undefined ? existing.payload : data.payload;
    records.push({ ...payload, key });
    for (const record of records) validateEvent(record, records.filter(other => other.key !== record.key));
    data.payload = validateEvent(payload, records.filter(row => row.key !== key));
  },
  beforeUpdateMany: immutable, beforeDelete: immutable, beforeDeleteMany: immutable,
};
