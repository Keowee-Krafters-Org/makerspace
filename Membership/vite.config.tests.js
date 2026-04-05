// vite.config.tests.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
      // Make sure to externalize deps that are provided by the main 'Code.js' bundle
      external: [/^\.\.\/(models|services|storage)\/.*\.js$/],
      output: {
        globals: (id) => {
          // This function converts an external module ID into a global variable expression.
          // e.g., '../models/Member.js' becomes 'Membership.Member'
          // e.g., '../services/ModelFactory.js' becomes 'Membership.ModelFactory'
          const name = id.split('/').pop().replace('.js', '');
          return `Membership.${name}`;
        },
      },
    },
  },
});