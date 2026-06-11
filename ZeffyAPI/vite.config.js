import { defineConfig } from 'vite';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  const entry = resolve(__dirname, 'src/index.js');
  const libName = 'ZeffyAPI';

  return {
    plugins: [
      copy({
        targets: [
          { src: 'appsscript.json', dest: 'dist' },
          { src: 'utils.js', dest: 'dist' },
          { src: 'tests/test.js', dest: 'dist' }
        ],
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
          footer: [
            '',
            '// Expose bundle exports to globalThis for Apps Script',
            'if (typeof ZeffyAPI !== "undefined") {',
            '  globalThis.ZeffyAPIFactory = ZeffyAPI.ZeffyAPIFactory;',
            '  globalThis.ZeffyStorageManager = ZeffyAPI.ZeffyStorageManager;',
            '  globalThis.TestRunner = ZeffyAPI.TestRunner;',
            '}',
            ''
          ].join('\n')
        }
      }
    },
    resolve: { alias: { '@': resolve(__dirname) } },
  };
});