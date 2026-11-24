'use strict';

const fs = require('node:fs');

const [file, operation] = process.argv.slice(2);
const schema = JSON.parse(fs.readFileSync(file, 'utf8'));
const fields = {
  TenantId: { type: 'string', maxLength: 80 },
  OutstandingDebtA: { type: 'decimal', min: 0, default: 0 },
  OutstandingDebtB: { type: 'decimal', min: 0, default: 3872 },
  OutstandingDebtC: { type: 'decimal', min: 0, default: 1936 },
};

let changed = false;
for (const [field, definition] of Object.entries(fields)) {
  const existing = schema.attributes[field];
  if (existing && existing.type !== definition.type) throw new Error(`Incompatible member finance field: ${field}`);
  const prepared = { ...definition, ...existing, private: true };
  if (Object.keys(prepared).some(key => prepared[key] !== existing?.[key])) changed = true;
  schema.attributes[field] = prepared;
}

if (changed && operation === '--write') fs.writeFileSync(file, JSON.stringify(schema, null, 2) + '\n');
else if (changed) process.exitCode = 1;
