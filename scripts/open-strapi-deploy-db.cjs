'use strict';

const path = require('node:path');

module.exports = async function openDeploymentDatabase() {
  const appDir = process.cwd();
  const { createStrapi } = require(path.join(appDir, 'node_modules/@strapi/strapi'));
  const app = createStrapi({ appDir, distDir: appDir });
  const configured = app.config.get('database.connection');
  const candidate = process.env.RHP_DEPLOY_DATABASE;
  if (process.env.NODE_ENV !== 'production' || !candidate || configured?.client !== 'sqlite' ||
      path.resolve(configured.connection.filename) !== path.resolve(candidate) ||
      path.resolve(candidate) === path.join(appDir, '.tmp/data.db')) {
    throw new Error('Refusing to run a deployment migration outside the temporary SQLite database');
  }
  return app.load();
};
