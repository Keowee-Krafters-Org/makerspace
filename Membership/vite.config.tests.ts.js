// vite.config.tests.ts.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import * as fs from 'fs';

export default defineConfig({
  plugins: [
    {
      name: 'append-footer',
      closeBundle() {
        const filePath = resolve(__dirname, 'dist/tests-ts.js');
        if (fs.existsSync(filePath)) {
          fs.appendFileSync(filePath, '\nfunction test() { return new TestLib.EventManagerIntegrationTests().run(); }');
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
      entry: resolve(__dirname, 'tests/EventManagerIntegrationTests.ts'),
      name: 'TestLib',
      fileName: () => 'tests-ts.js',
      formats: ['iife'],
    },
    rollupOptions: {
        external: (id) => {
            if (id.includes('models/') || id.includes('services/')) return true;
            return false;
          },
          output: {
            globals: (id) => {
                if (id.includes('models/') || id.includes('services/')) return 'MembershipBundle';
                return id;
            },
          },
    }
  },
});
