import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: "./server/node-build.ts",
      formats: ["es"],
      fileName: "node-build",
    },
    outDir: "dist/server",
    rollupOptions: {
      external: ["express", "cors", "dotenv", "ethers", "jsonwebtoken", "zod"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
