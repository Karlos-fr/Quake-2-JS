import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      name: "quake2js-root-only",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const pathname = req.url?.split("?")[0] ?? "/";
          const retiredPathFragment = ["full", "game"].join("-");
          if (
            pathname.includes(retiredPathFragment)
            || (pathname.endsWith(".html") && pathname !== "/index.html")
          ) {
            res.statusCode = 404;
            res.end("Not found");
            return;
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const pathname = req.url?.split("?")[0] ?? "/";
          const retiredPathFragment = ["full", "game"].join("-");
          if (
            pathname.includes(retiredPathFragment)
            || (pathname.endsWith(".html") && pathname !== "/index.html")
          ) {
            res.statusCode = 404;
            res.end("Not found");
            return;
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html")
      }
    }
  }
});
