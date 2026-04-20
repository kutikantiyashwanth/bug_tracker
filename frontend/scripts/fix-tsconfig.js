const fs = require('fs');
const path = require('path');

// ── Delete ALL TypeScript cache files that could restore NodeNext ──
const filesToDelete = [
  path.join(__dirname, '..', 'tsconfig.tsbuildinfo'),
  path.join(__dirname, '..', '.next', 'tsconfig.tsbuildinfo'),
  path.join(__dirname, '..', '.next', 'cache', 'tsbuildinfo.json'),
];

filesToDelete.forEach(f => {
  try {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
      console.log(`🗑️  Deleted: ${f}`);
    }
  } catch (e) {}
});

// ── Delete entire .next/cache to prevent stale TypeScript state ──
const nextCache = path.join(__dirname, '..', '.next', 'cache');
try {
  if (fs.existsSync(nextCache)) {
    fs.rmSync(nextCache, { recursive: true, force: true });
    console.log('🗑️  Deleted .next/cache');
  }
} catch (e) {}

// ── Write correct tsconfig.json ──
const tsconfig = {
  compilerOptions: {
    target: 'es5',
    lib: ['dom', 'dom.iterable', 'esnext'],
    allowJs: true,
    skipLibCheck: true,
    strict: false,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'bundler',
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

const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
console.log('✅ tsconfig.json written with moduleResolution: bundler');
console.log('✅ All TypeScript cache cleared');
