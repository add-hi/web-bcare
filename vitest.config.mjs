import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./setupTests.js'],
    css: true,
    globals: true, // expect/vi/describe global
  },
  esbuild: {
    loader: 'jsx',
    include: [/\.(js|jsx)$/, /\/(src|app|components|__tests__)\/.*\.(js|jsx)$/],
    exclude: [/node_modules/],
  },
  // ⬇️ Penting: alias @ menunjuk ke folder src
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
});
