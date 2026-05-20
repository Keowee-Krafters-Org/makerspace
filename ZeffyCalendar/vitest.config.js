import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setupTests.js'],
    css: true,
    include: ['tests/**/*.spec.js'],
    exclude: ['node_modules/**', 'dist/**', 'build/**', '.output/**'],
    coverage: { reporter: ['text', 'html'] },
  },
});