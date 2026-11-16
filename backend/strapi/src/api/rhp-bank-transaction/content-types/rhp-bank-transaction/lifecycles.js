'use strict';
// Immutable bank source. Tenant allocations live in the finance audit ledger.
const reject = () => { throw new Error('Original bank imports cannot be edited or deleted. Record corrections in the finance ledger.'); };
module.exports = { beforeUpdate: reject, beforeUpdateMany: reject, beforeDelete: reject, beforeDeleteMany: reject };
