import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    solid(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-obc.webp', 'favicon.png'],
      manifest: {
        name: 'OBC Matos - Achat Équipement',
        short_name: 'OBC Matos',
        description: 'Application pour l\'enregistrement des achats d\'équipement de badminton',
        theme_color: '#B39DDB',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo-obc.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any'
          },
          {
            src: 'logo-obc.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/script\.google\.com\/.*/i,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    target: 'esnext',
  },
});
