import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain; charset=utf-8",
};

export function handleRequest(req, res) {
  const host = req.headers.host || "localhost";
  const reqUrl = new URL(req.url, `http://${host}`);
  let pathname = decodeURIComponent(reqUrl.pathname);

  if (pathname === "/api/health" || pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok" }));
  }

  if (pathname === "/" || pathname === "" || pathname === "/index.html") {
    pathname = "/index.html";
  }

  const searchLocations = [
    path.join(__dirname, "public", pathname),
    path.join(__dirname, pathname),
    path.join(ROOT_DIR, pathname),
  ];

  let filePath = null;
  for (const loc of searchLocations) {
    if (fs.existsSync(loc) && fs.statSync(loc).isFile()) {
      filePath = loc;
      break;
    }
  }

  if (!filePath) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("404 Not Found");
  }

  const stats = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const totalSize = stats.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

    if (start >= totalSize || end >= totalSize || start > end) {
      res.writeHead(416, { "Content-Range": `bytes */${totalSize}` });
      return res.end();
    }

    const chunkSize = end - start + 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${totalSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": totalSize,
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400",
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

// Default export for Vercel Serverless Function
export default handleRequest;

// Direct listener for Docker (Render.com) and Localhost
const server = http.createServer(handleRequest);
if (process.env.VERCEL !== "1") {
  server.listen(PORT, () => {
    console.log(`AutoClip Pro Server listening on port ${PORT}`);
  });
}
