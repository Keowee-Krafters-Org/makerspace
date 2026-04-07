import { defineConfig } from 'vite';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const isZohoApiModule = (id) => /(^|\/)ZohoAPI\.js$/.test(id || '');

  return {
    plugins: [
      copy({
        targets: [
          { src: 'appsscript.json', dest: 'dist' },
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
        entry: resolve(__dirname, 'index.js'),
        name: 'Membership',
        fileName: 'Code',
        formats: ['iife'],
      },
      // Use V8-compatible target; GAS supports modern syntax
      target: 'es2017',
      rollupOptions: {
        external: (id) => isZohoApiModule(id),
        output: {
          inlineDynamicImports: true,
          globals: (id) => (isZohoApiModule(id) ? 'ZohoAPI' : undefined),
        },
        treeshake: true,
      },
    },
    resolve: { alias: { '@': resolve(__dirname) } },
  };
});