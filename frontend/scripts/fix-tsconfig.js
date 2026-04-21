const fs = require('fs');
const path = require('path');

// Write a tsconfig compatible with Next.js 15+ and static export
const tsconfig = {
  compilerOptions: {
    target: 'ES2017',
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

fs.writeFileSync(
  path.join(__dirname, '..', 'tsconfig.json'),
  JSON.stringify(tsconfig, null, 2)
);
console.log('tsconfig.json written with esnext/bundler');
