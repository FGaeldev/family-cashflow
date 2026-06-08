/**
 * vite.config.js
 *
 * Purpose: Vite build configuration for Family Cashflow PWA
 * Context: React + Vite project deployed to GitHub Pages
 * Dependencies: vite, @vitejs/plugin-react, vite-plugin-pwa
 *
 * Notes:
 * - base must match GitHub repo name for asset paths to resolve correctly
 * - PWA plugin generates service worker and manifest injection automatically
 * - registerType 'autoUpdate' silently updates SW on new deploy
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Must match your GitHub repository name exactly
  base: '/family-cashflow/',

  plugins: [
    react(),

    VitePWA({
      // Automatically update service worker when new version is deployed
      registerType: 'autoUpdate',

      // Assets to precache on install — keeps app usable offline for viewing
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],

      manifest: {
        name: 'Family Cashflow',
        short_name: 'Cashflow',
        description: 'Family budget ledger tracker',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/family-cashflow/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },

      workbox: {
        // Cache Google Fonts and API responses for offline resilience
        runtimeCaching: [
          {
            // Cache Sheets API GET requests for offline viewing
            urlPattern: /^https:\/\/sheets\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sheets-api-cache',
              expiration: {
                // Keep cached data fresh — max 1 hour old
                maxAgeSeconds: 60 * 60
              }
            }
          }
        ]
      }
    })
  ]
})