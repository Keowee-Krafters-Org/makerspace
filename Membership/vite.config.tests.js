// vite.config.tests.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import * as fs from 'fs';

export default defineConfig({
  plugins: [
    {
      name: 'append-footer',
      closeBundle() {
        const filePath = resolve(__dirname, 'dist/tests.js');
        if (fs.existsSync(filePath)) {
          fs.appendFileSync(filePath, '\nfunction test() { return runTestInternal(); }');
        }
      }
    }
  ],
  build: {
    target: 'es2017',
    minify: false,
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'tests/gas.test.js'),
      name: 'TestLib',
      fileName: () => 'tests.js',
      formats: ['iife'],
    },
    rollupOptions: {
        external: (id) => {
            if (id === resolve(__dirname, 'index.js')) return true;
            return id.includes('models/') || id.includes('services/');
          },
          output: {
            globals: (id) => {
                if (id === resolve(__dirname, 'index.js')) return 'MembershipBundle';
                if (id.includes('models/') || id.includes('services/')) return 'MembershipBundle';
                return id;
            },
          },
    }
  },
});