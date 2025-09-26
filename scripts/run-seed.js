// scripts/run-seed.js
require('ts-node').register({
  compilerOptions: {
    module: 'CommonJS',
  },
});

require('../src/lib/seed.ts');
