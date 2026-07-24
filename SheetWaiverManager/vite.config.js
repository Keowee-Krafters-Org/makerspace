// vite.config.js
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
        entry: resolve(__dirname, 'SheetWaiverManager.js'),
        name: 'SheetWaiverManager',
        fileName: 'Code',
        formats: ['iife'],
      },
      target: 'es2020',
      rollupOptions: {
        output: {
          entryFileNames: `Code.js`,
          chunkFileNames: `[name].js`,
          assetFileNames: `[name].[ext]`,
          footer: 'globalThis.SheetWaiverManager = SheetWaiverManager;',
        },
      },
    },
    resolve: { alias: { '@': resolve(__dirname, 'src') } },
  };
});
