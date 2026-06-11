// vite.config.tests.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';

export default defineConfig({
  plugins: [
    copy({
      targets: [
        { src: 'tests/test.js', dest: 'dist' }
      ],
      hook: 'writeBundle',
      verbose: true,
    }),
  ],
  build: {
    minify: false,
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false, // Do not clean the output directory, as the main build runs first
    lib: {
      entry: resolve(__dirname, 'index.dev.js'),
      name: 'TestRunner',
      fileName: 'TestRunner',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        // This is the key to preventing the class name change
        name: 'TestRunner',
        extend: true,
      },
    },
    target: 'es2020',
  },
  resolve: { 
    alias: { 
      '@': resolve(__dirname, 'src'),
      '../../MembershipCommon': resolve(__dirname, '../MembershipCommon')
    } 
  },
});