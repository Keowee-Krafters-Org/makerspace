// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';
import clean from 'vite-plugin-clean';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    clean(),
    vue(), // Use Vue plugin
    viteSingleFile(),
    tailwindcss(), // Add Tailwind CSS plugin here
    copy({
      targets: [
        { src: 'service/**/*', dest: 'dist/service' },
        { src: 'appsscript.json', dest: 'dist' },
      ],
      hook: 'writeBundle',
    }),
  ],
  build: {
    minify: false,
    outDir: resolve(__dirname, 'dist/ui'),
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // Ensure dynamic imports are inlined
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // Ensure this alias is configured
    },
  },

});