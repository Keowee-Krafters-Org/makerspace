// vite.config.secrets.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es2020',
    minify: false,
    outDir: 'dist',
    emptyOutDir: false, // Do not clear the dist folder
    lib: {
      entry: resolve(__dirname, 'config.secrets.js'),
      name: 'config',
      fileName: () => 'config.secrets.js',
      formats: ['umd'],
    },
  },
});
