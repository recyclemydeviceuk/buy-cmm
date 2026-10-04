import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// The admin shares the storefront's types and catalogue (../frontend/src) via the @store alias.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@store': path.resolve(__dirname, '../frontend/src'),
    },
  },
  server: { port: 3004, host: true, fs: { allow: [path.resolve(__dirname, '..')] } },
  preview: { port: 3004 },
});
