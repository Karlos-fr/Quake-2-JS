import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        demo: resolve(__dirname, "demo.html"),
        "full-game": resolve(__dirname, "full-game.html")
      }
    }
  }
});
