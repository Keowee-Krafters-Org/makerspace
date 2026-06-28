import { defineConfig } from 'vite';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  const entry = resolve(__dirname, isProd ? 'src/index.prod.js' : 'src/index.dev.js');
  const libName = 'ZeffyAPI';

  const copyTargets = [
    { src: 'appsscript.json', dest: 'dist' },
    { src: 'utils.js', dest: 'dist' },
  ];

  if (!isProd) {
    copyTargets.push({ src: 'tests/test.js', dest: 'dist' });
  }

  const footer = [
    '',
    '// Expose bundle exports to globalThis for Apps Script',
    'if (typeof ZeffyAPI !== "undefined") {',
    '  globalThis.ZeffyAPIFactory = ZeffyAPI.ZeffyAPIFactory;',
    '  globalThis.ZeffyStorageManager = ZeffyAPI.ZeffyStorageManager;',
    ...(!isProd ? [
      '  globalThis.TestRunner = ZeffyAPI.TestRunner;',
      '  globalThis.StorageManagerTestRunner = ZeffyAPI.StorageManagerTestRunner;',
    ] : []),
    '}',
    ''
  ].join('\n');

  return {
    plugins: [
      copy({
        targets: copyTargets,
        hook: 'writeBundle',
        verbose: true,
      }),
    ],
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      minify: isProd,
      lib: {
        entry,
        name: libName,
        fileName: 'Code',
        formats: ['iife'],
      },
      target: 'es2020',
      rollupOptions: {
        output: {
          entryFileNames: `Code.js`,
          chunkFileNames: `[name].js`,
          assetFileNames: `[name].[ext]`,
          footer
        }
      }
    },
    resolve: { alias: { '@': resolve(__dirname) } },
  };
});