'use strict';
const immutable = () => { throw new Error('Financial records are append-only. Add a correction instead.'); };
module.exports = { beforeUpdate: immutable, beforeUpdateMany: immutable, beforeDelete: immutable, beforeDeleteMany: immutable };
