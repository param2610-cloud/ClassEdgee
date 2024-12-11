// vite.config.ts
import path from "path";
import react from "file:///D:/ClassEdge/ClassEdgee/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///D:/ClassEdge/ClassEdgee/frontend/node_modules/vite/dist/node/index.js";
import { VitePWA } from "file:///D:/ClassEdge/ClassEdgee/frontend/node_modules/vite-plugin-pwa/dist/index.js";
import jotaiDebugLabel from "file:///D:/ClassEdge/ClassEdgee/frontend/node_modules/jotai/esm/babel/plugin-debug-label.mjs";
import jotaiReactRefresh from "file:///D:/ClassEdge/ClassEdgee/frontend/node_modules/jotai/esm/babel/plugin-react-refresh.mjs";
var __vite_injected_original_dirname = "D:\\ClassEdge\\ClassEdgee\\frontend";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxDbGFzc0VkZ2VcXFxcQ2xhc3NFZGdlZVxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcQ2xhc3NFZGdlXFxcXENsYXNzRWRnZWVcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0NsYXNzRWRnZS9DbGFzc0VkZ2VlL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgeyBWaXRlUFdBLCBWaXRlUFdBT3B0aW9ucyB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcclxuaW1wb3J0IGpvdGFpRGVidWdMYWJlbCBmcm9tICdqb3RhaS9iYWJlbC9wbHVnaW4tZGVidWctbGFiZWwnXHJcbmltcG9ydCBqb3RhaVJlYWN0UmVmcmVzaCBmcm9tICdqb3RhaS9iYWJlbC9wbHVnaW4tcmVhY3QtcmVmcmVzaCdcclxuXHJcbmNvbnN0IG1hbmlmZXN0Rm9yUGx1Z2luOiBQYXJ0aWFsPFZpdGVQV0FPcHRpb25zPiA9IHtcclxuICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcclxuICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgXCJhcHBsZS10b3VjaC1pY29uLnBuZ1wiLCBcIm1hc2tlZC1pY29uLnN2Z1wiXSxcclxuICBtYW5pZmVzdDoge1xyXG4gICAgbmFtZTogXCJDbGFzc0VkZ2VlXCIsXHJcbiAgICBzaG9ydF9uYW1lOiBcImNsYXNzZWRnZVwiLFxyXG4gICAgZGVzY3JpcHRpb246IFwibXkgbmFtZSBpcyBjbGFzc2VkZ2VlXCIsXHJcbiAgICBpY29uczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgc3JjOiAnL2FuZHJvaWQtY2hyb21lLTE5MngxOTIucG5nJyxcclxuICAgICAgICBzaXplczogJzE5MngxOTInLFxyXG4gICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgIHB1cnBvc2U6ICdhbnknXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBzcmM6ICcvYW5kcm9pZC1jaHJvbWUtNTEyeDUxMi5wbmcnLFxyXG4gICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgcHVycG9zZTogJ2FueSdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHNyYzogJy9hcHBsZS10b3VjaC1pY29uLnBuZycsXHJcbiAgICAgICAgc2l6ZXM6ICcxODB4MTgwJyxcclxuICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICBwdXJwb3NlOiAnYXBwbGUgdG91Y2ggaWNvbicsXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBzcmM6ICcvbWFza2FibGVfaWNvbi5wbmcnLFxyXG4gICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgcHVycG9zZTogJ21hc2thYmxlJyxcclxuICAgICAgfVxyXG4gICAgXSxcclxuICAgIHRoZW1lX2NvbG9yOiAnIzE3MTcxNycsXHJcbiAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2YwZTdkYicsXHJcbiAgICBkaXNwbGF5OiBcInN0YW5kYWxvbmVcIixcclxuICAgIHNjb3BlOiAnLycsXHJcbiAgICBzdGFydF91cmw6IFwiL1wiLFxyXG4gICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCdcclxuICB9XHJcbn07XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbcmVhY3QoeyBiYWJlbDogeyBwbHVnaW5zOiBbam90YWlEZWJ1Z0xhYmVsLCBqb3RhaVJlYWN0UmVmcmVzaF0gfSB9KSwgVml0ZVBXQShtYW5pZmVzdEZvclBsdWdpbildLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQTBSLE9BQU8sVUFBVTtBQUMzUyxPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxlQUErQjtBQUN4QyxPQUFPLHFCQUFxQjtBQUM1QixPQUFPLHVCQUF1QjtBQUw5QixJQUFNLG1DQUFtQztBQU96QyxJQUFNLG9CQUE2QztBQUFBLEVBQ2pELGNBQWM7QUFBQSxFQUNkLGVBQWUsQ0FBQyxlQUFlLHdCQUF3QixpQkFBaUI7QUFBQSxFQUN4RSxVQUFVO0FBQUEsSUFDUixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixhQUFhO0FBQUEsSUFDYixPQUFPO0FBQUEsTUFDTDtBQUFBLFFBQ0UsS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBO0FBQUEsUUFDRSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsUUFDUCxNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNFLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQ0UsS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLE1BQ1g7QUFBQSxJQUNGO0FBQUEsSUFDQSxhQUFhO0FBQUEsSUFDYixrQkFBa0I7QUFBQSxJQUNsQixTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsSUFDUCxXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsRUFDZjtBQUNGO0FBR0EsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLGlCQUFpQixpQkFBaUIsRUFBRSxFQUFFLENBQUMsR0FBRyxRQUFRLGlCQUFpQixDQUFDO0FBQUEsRUFDekcsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
