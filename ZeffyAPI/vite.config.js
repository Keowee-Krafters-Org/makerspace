import { defineConfig } from 'vite';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  const entry = isProd
    ? resolve(__dirname, 'ZeffyAPI.js')
    : resolve(__dirname, 'index.dev.js');

  const libName = isProd ? 'ZeffyAPI' : 'ZeffyDev';

  return {
    plugins: [
      copy({
        targets: [
          { src: 'appsscript.json', dest: 'dist' },
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
          // Force the output file to have a .js extension
          entryFileNames: `[name].js`,
          chunkFileNames: `[name].js`,
          assetFileNames: `[name].[ext]`
        }
      }
    },
    resolve: { alias: { '@': resolve(__dirname) } },
  };
});