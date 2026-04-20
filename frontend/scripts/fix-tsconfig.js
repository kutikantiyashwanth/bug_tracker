const fs = require('fs');
const path = require('path');

// Delete all cache
['tsconfig.tsbuildinfo', '.next/tsconfig.tsbuildinfo'].forEach(f => {
  const full = path.join(__dirname, '..', f);
  try { if (fs.existsSync(full)) fs.unlinkSync(full); } catch(e) {}
});
try { fs.rmSync(path.join(__dirname, '..', '.next', 'cache'), { recursive: true, force: true }); } catch(e) {}

// Write tsconfig that matches what Next.js 14+ wants
// Using NodeNext for BOTH module and moduleResolution to satisfy TS5109
const tsconfig = {
  compilerOptions: {
    target: 'ES2017',
    lib: ['dom', 'dom.iterable', 'esnext'],
    allowJs: true,
    skipLibCheck: true,
    strict: false,
    noEmit: true,
    esModuleInterop: true,
    module: 'NodeNext',
    moduleResolution: 'NodeNext',
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: 'preserve',
    incremental: false,
    plugins: [{ name: 'next' }],
    paths: { '@/*': ['./src/*'] }
  },
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
  exclude: ['node_modules']
};

fs.writeFileSync(
  path.join(__dirname, '..', 'tsconfig.json'),
  JSON.stringify(tsconfig, null, 2)
);
console.log('✅ tsconfig.json written with NodeNext/NodeNext');
