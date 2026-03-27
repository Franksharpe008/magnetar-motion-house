import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        work: resolve(__dirname, 'work.html'),
        lab: resolve(__dirname, 'lab.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
});
