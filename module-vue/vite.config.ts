import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "@components": resolve(__dirname, "./src/components/")
    }
  },

  build: {
    outDir: "../dist-module/",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,

    rollupOptions: {
      output: {
        format: "es",

        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
});
