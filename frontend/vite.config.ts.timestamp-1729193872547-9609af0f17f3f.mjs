// vite.config.ts
import path from "path";
import react from "file:///G:/Coding/Hackathon/SIH2024/Prototype/Try1/ssms-fe/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///G:/Coding/Hackathon/SIH2024/Prototype/Try1/ssms-fe/node_modules/vite/dist/node/index.js";
import { VitePWA } from "file:///G:/Coding/Hackathon/SIH2024/Prototype/Try1/ssms-fe/node_modules/vite-plugin-pwa/dist/index.js";
import jotaiDebugLabel from "file:///G:/Coding/Hackathon/SIH2024/Prototype/Try1/ssms-fe/node_modules/jotai/esm/babel/plugin-debug-label.mjs";
import jotaiReactRefresh from "file:///G:/Coding/Hackathon/SIH2024/Prototype/Try1/ssms-fe/node_modules/jotai/esm/babel/plugin-react-refresh.mjs";
var __vite_injected_original_dirname = "G:\\Coding\\Hackathon\\SIH2024\\Prototype\\Try1\\ssms-fe";
var manifestForPlugin = {
  registerType: "autoUpdate",
  includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
  manifest: {
    name: "ClassEdgee",
    short_name: "classedge",
    description: "my name is classedgee",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "apple touch icon"
      },
      {
        src: "/maskable_icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    theme_color: "#171717",
    background_color: "#f0e7db",
    display: "standalone",
    scope: "/",
    start_url: "/",
    orientation: "portrait"
  }
};
var vite_config_default = defineConfig({
  plugins: [react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] } }), VitePWA(manifestForPlugin)],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJHOlxcXFxDb2RpbmdcXFxcSGFja2F0aG9uXFxcXFNJSDIwMjRcXFxcUHJvdG90eXBlXFxcXFRyeTFcXFxcc3Ntcy1mZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRzpcXFxcQ29kaW5nXFxcXEhhY2thdGhvblxcXFxTSUgyMDI0XFxcXFByb3RvdHlwZVxcXFxUcnkxXFxcXHNzbXMtZmVcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0c6L0NvZGluZy9IYWNrYXRob24vU0lIMjAyNC9Qcm90b3R5cGUvVHJ5MS9zc21zLWZlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyBWaXRlUFdBLCBWaXRlUFdBT3B0aW9ucyB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcbmltcG9ydCBqb3RhaURlYnVnTGFiZWwgZnJvbSAnam90YWkvYmFiZWwvcGx1Z2luLWRlYnVnLWxhYmVsJ1xuaW1wb3J0IGpvdGFpUmVhY3RSZWZyZXNoIGZyb20gJ2pvdGFpL2JhYmVsL3BsdWdpbi1yZWFjdC1yZWZyZXNoJ1xuXG5jb25zdCBtYW5pZmVzdEZvclBsdWdpbjogUGFydGlhbDxWaXRlUFdBT3B0aW9ucz4gPSB7XG4gIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgXCJhcHBsZS10b3VjaC1pY29uLnBuZ1wiLCBcIm1hc2tlZC1pY29uLnN2Z1wiXSxcbiAgbWFuaWZlc3Q6IHtcbiAgICBuYW1lOiBcIkNsYXNzRWRnZWVcIixcbiAgICBzaG9ydF9uYW1lOiBcImNsYXNzZWRnZVwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIm15IG5hbWUgaXMgY2xhc3NlZGdlZVwiLFxuICAgIGljb25zOiBbXG4gICAgICB7XG4gICAgICAgIHNyYzogJy9hbmRyb2lkLWNocm9tZS0xOTJ4MTkyLnBuZycsXG4gICAgICAgIHNpemVzOiAnMTkyeDE5MicsXG4gICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICBwdXJwb3NlOiAnYW55J1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgc3JjOiAnL2FuZHJvaWQtY2hyb21lLTUxMng1MTIucG5nJyxcbiAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgIHB1cnBvc2U6ICdhbnknXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBzcmM6ICcvYXBwbGUtdG91Y2gtaWNvbi5wbmcnLFxuICAgICAgICBzaXplczogJzE4MHgxODAnLFxuICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgcHVycG9zZTogJ2FwcGxlIHRvdWNoIGljb24nLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgc3JjOiAnL21hc2thYmxlX2ljb24ucG5nJyxcbiAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgIHB1cnBvc2U6ICdtYXNrYWJsZScsXG4gICAgICB9XG4gICAgXSxcbiAgICB0aGVtZV9jb2xvcjogJyMxNzE3MTcnLFxuICAgIGJhY2tncm91bmRfY29sb3I6ICcjZjBlN2RiJyxcbiAgICBkaXNwbGF5OiBcInN0YW5kYWxvbmVcIixcbiAgICBzY29wZTogJy8nLFxuICAgIHN0YXJ0X3VybDogXCIvXCIsXG4gICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCdcbiAgfVxufTtcblxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoeyBiYWJlbDogeyBwbHVnaW5zOiBbam90YWlEZWJ1Z0xhYmVsLCBqb3RhaVJlYWN0UmVmcmVzaF0gfSB9KSwgVml0ZVBXQShtYW5pZmVzdEZvclBsdWdpbildLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXNWLE9BQU8sVUFBVTtBQUN2VyxPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxlQUErQjtBQUN4QyxPQUFPLHFCQUFxQjtBQUM1QixPQUFPLHVCQUF1QjtBQUw5QixJQUFNLG1DQUFtQztBQU96QyxJQUFNLG9CQUE2QztBQUFBLEVBQ2pELGNBQWM7QUFBQSxFQUNkLGVBQWUsQ0FBQyxlQUFlLHdCQUF3QixpQkFBaUI7QUFBQSxFQUN4RSxVQUFVO0FBQUEsSUFDUixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixhQUFhO0FBQUEsSUFDYixPQUFPO0FBQUEsTUFDTDtBQUFBLFFBQ0UsS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsUUFDRSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsUUFDUCxNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNFLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQ0UsS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLE1BQ1g7QUFBQSxJQUNGO0FBQUEsSUFDQSxhQUFhO0FBQUEsSUFDYixrQkFBa0I7QUFBQSxJQUNsQixTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsSUFDUCxXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsRUFDZjtBQUNGO0FBR0EsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLGlCQUFpQixpQkFBaUIsRUFBRSxFQUFFLENBQUMsR0FBRyxRQUFRLGlCQUFpQixDQUFDO0FBQUEsRUFDekcsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
