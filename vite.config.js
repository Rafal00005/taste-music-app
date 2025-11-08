// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',                                // << index.html siedzi w src
  publicDir: resolve(__dirname, 'public'),    // używaj public/ z root projektu
  build: {
    outDir: resolve(__dirname, 'dist'),       // wynik do dist/ w root
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 5173,
  },
});
