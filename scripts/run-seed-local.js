// scripts/run-seed-local.js
require('ts-node').register({
  compilerOptions: {
    module: 'CommonJS',
  },
});

require('../src/lib/seed-local.ts');