import { defineConfig } from 'vite';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [
      copy({
        targets: [
          { src: 'appsscript.json', dest: 'dist' },
          ...(isProd ? [] : [{ src: 'tests/**/*.js', dest: 'dist/tests' }]),
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
        formats: ['iife'],
        name: 'MembershipBundle',
        fileName: () => 'Code.js',
      },
      // Use V8-compatible target; GAS supports modern syntax
      target: 'es2017',
      rollupOptions: {
        output: { inlineDynamicImports: true },
        treeshake: true,
      },
    },
    resolve: { alias: { '@': resolve(__dirname) } },
  };
});