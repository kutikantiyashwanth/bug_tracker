const fs = require('fs');
const path = require('path');

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
    paths: {
      '@/*': ['./src/*']
    }
  },
  include: [
    'next-env.d.ts',
    '**/*.ts',
    '**/*.tsx',
    '.next/types/**/*.ts'
  ],
  exclude: ['node_modules']
};

const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
console.log('✅ tsconfig.json written with moduleResolution: bundler');
