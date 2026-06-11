import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'MembershipCommon',
      fileName: 'membership-common',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      output: {
        // In UMD builds, this is the global variable name
        globals: {},
      },
    },
    minify: 'terser',
    terserOptions: {
      keep_classnames: true,
    },
  },
});
