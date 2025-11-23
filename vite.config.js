import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    target: 'esnext',
  },
});
