// server.js - Ultra-lightweight Zero-Dependency HTTP & Video Streaming Server
// Supports HTTP 206 Partial Content (Byte Ranges) for smooth seeking & instant playback.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(reqUrl.pathname);

  if (pathname === "/" || pathname === "") {
    pathname = "/index.html";
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(__dirname, safePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("403 Forbidden");
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(`
        <!DOCTYPE html>
        <html>
          <head><title>404 Not Found</title></head>
          <body style="font-family:sans-serif;text-align:center;padding:50px;background:#0f172a;color:#fff;">
            <h1>404 - Not Found</h1>
            <p>The requested file <code>${pathname}</code> was not found.</p>
            <p><a href="/" style="color:#38bdf8;">Return to Home</a></p>
          </body>
        </html>
      `);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const totalSize = stats.size;
    const range = req.headers.range;

    // Handle HTTP Byte-Range requests for video/audio streaming
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (start >= totalSize || end >= totalSize || start > end) {
        res.writeHead(416, {
          "Content-Range": `bytes */${totalSize}`,
        });
        return res.end();
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${totalSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      });

      fileStream.pipe(res);
    } else {
      // Standard 200 response
      res.writeHead(200, {
        "Content-Length": totalSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400",
      });

      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`⚡ AutoClip Pro Bundle Server is LIVE!`);
  console.log(`🌐 Local URL:  http://localhost:${PORT}`);
  console.log(`🎬 Video streaming: Byte-Range (HTTP 206) Enabled`);
  console.log(`==================================================\n`);
});
