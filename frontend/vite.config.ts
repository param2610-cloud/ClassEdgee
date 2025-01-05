import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label'
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh'

const manifestForPlugin: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', "apple-touch-icon.png", "masked-icon.svg"],
  manifest: {
    name: "ClassEdgee",
    short_name: "classedge",
    description: "my name is classedgee",
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'apple touch icon',
      },
      {
        src: '/maskable_icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }
    ],
    theme_color: '#171717',
    background_color: '#f0e7db',
    display: "standalone",
    scope: '/',
    start_url: "/",
    orientation: 'portrait'
  }
};


export default defineConfig({
  plugins: [react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] } }), VitePWA(manifestForPlugin)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});