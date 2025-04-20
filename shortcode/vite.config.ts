import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],

  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "@components": resolve(__dirname, "./src/components/"),
    },
  },

  build: {
    outDir: "../shortcodeDist/",
    emptyOutDir: true,

    rollupOptions: {
      output: {
        format: "es",

        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
