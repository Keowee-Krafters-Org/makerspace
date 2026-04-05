// vite.config.tests.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';

export default defineConfig({
  plugins: [
    copy({
      targets: [
        { src: 'test.js', dest: 'dist' },
        { src: 'testConfig.js', dest: 'dist' },
      ],
      hook: 'writeBundle',
      verbose: true,
    }),
  ],
  build: {
    target: 'es2017',
    minify: false,
    outDir: 'dist',
    emptyOutDir: false, // Do not clear the dist folder, as other builds might be there
    lib: {
      entry: resolve(__dirname, 'tests/TestRunner.js'),
      name: 'TestRunner',
      fileName: () => 'tests.js',
      formats: ['iife'],
    },
    rollupOptions: {
      external: [/^\.\.\/(models|services|storage)\/.*\.js$/],
      output: {
        globals: () => 'Membership',
      },
    },
  },
});