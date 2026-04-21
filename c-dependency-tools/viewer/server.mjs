import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const REPO_ROOT = path.resolve(".");
const DEFAULT_FILE = path.resolve("c-dependency-tools", "viewer", "index.html");
const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT ?? 4173);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${HOST}:${PORT}`);
  const safePath = decodeURIComponent(requestUrl.pathname);
  const normalizedPath = safePath === "/" ? "/c-dependency-tools/viewer/index.html" : safePath;
  const repoRelativePath = normalizedPath.replace(/^\//, "");
  const absolutePath = path.resolve(REPO_ROOT, repoRelativePath);

  if (!absolutePath.startsWith(REPO_ROOT)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  if (!existsSync(absolutePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const stats = statSync(absolutePath);
  if (stats.isDirectory()) {
    response.writeHead(302, { Location: path.posix.join(normalizedPath, "index.html") });
    response.end();
    return;
  }

  const extension = path.extname(absolutePath).toLowerCase();
  response.writeHead(200, {
    "Content-Type": MIME_TYPES[extension] ?? "application/octet-stream",
    "Cache-Control": "no-store"
  });
  createReadStream(absolutePath).pipe(response);
});

server.listen(PORT, HOST, () => {
  console.log(`C dependency viewer running at http://${HOST}:${PORT}/c-dependency-tools/viewer/`);
});
