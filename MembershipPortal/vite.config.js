// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';
import clean from 'vite-plugin-clean';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [
      clean(),
      vue(),
      viteSingleFile(),
      tailwindcss(),
      copy({
        targets: [
          // Always include GAS service code and manifest in dist root
          { src: 'service/**/*', dest: 'dist/service' },
          { src: 'appsscript.json', dest: 'dist' },
        ],
        hook: 'writeBundle',
      }),
    ],
    build: {
      minify: isProd,
      // Emit index.html directly into dist/ui for GAS compatibility
      outDir: resolve(__dirname, 'dist/ui'),
      rollupOptions: { output: { inlineDynamicImports: true } },
      emptyOutDir: true,
    },
    resolve: { alias: { '@': resolve(__dirname, 'src') } },
  };
});
