'use strict';
const path = require('node:path');
const { pathToFileURL } = require('node:url');
async function main() {
  const { missingSettings } = await import(pathToFileURL(path.join(process.cwd(), 'src/api/rhp-finance/services/member-settings.mjs')));
  const { createStrapi } = require(path.join(process.cwd(), 'node_modules/@strapi/strapi'));
  const app = await createStrapi({ appDir: process.cwd(), distDir: process.cwd() }).load();
  try {
    const query = app.db.query('api::rhp-membership.rhp-membership');
    let changed = 0;
    await app.db.transaction(async () => {
      const rows = await query.findMany({ where: { TenantType: { $in: ['Annual', 'Permanent'] } } });
      for (const row of rows) {
        const data = missingSettings(row);
        if (Object.keys(data).length) {
          await query.update({ where: { id: row.id }, data });
          changed++;
        }
      }
    });
    const rows = await query.findMany({ where: { TenantType: { $in: ['Annual', 'Permanent'] } } });
    if (rows.some(row => Object.keys(missingSettings(row)).length)) throw Error('Incomplete membership settings migration');
    console.log(`RHP_MEMBER_SETTINGS_OK rows=${rows.length} initialized=${changed}`);
  } finally { await app.destroy(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
