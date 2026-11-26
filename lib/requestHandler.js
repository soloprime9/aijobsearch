import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_ORIGIN = "https://www.falconspido.com";
const DEFAULT_COVER = `${SITE_ORIGIN}/assets/AutoClip_Topmate_Cover_1280x720.png`;
const CUTOFF_MS = Date.parse("2026-11-24T18:30:00.000Z"); // 25 Nov 2026 00:00 IST
const DUMMY_API = "https://api-demo.vercel.app";
const CACHE_TTL_MS = 60 * 1000;

let _feedCache = { apiBase: "", ts: 0, posts: null };

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain; charset=utf-8",
};

function escapeXml(str) {
  return String(str || "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getConfiguredBackendBase() {
  const raw = (
    process.env.BACKEND_API_BASE ||
    process.env.VERCEL_BACKEND_URL ||
    process.env.API_BASE ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");
  if (!raw || raw === DUMMY_API || !/^https?:\/\//i.test(raw)) return "";
  return raw;
}

function safeMediaUrl(raw, apiBase) {
  if (!raw || typeof raw !== "string") return "";
  const s = raw.trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/") && apiBase) return apiBase + s;
  return "";
}

function parseTimestampMs(post) {
  const ts = Date.parse(post && post.createdAt);
  if (Number.isFinite(ts)) return ts;
  const id = String((post && post._id) || "");
  if (/^[a-f0-9]{24}$/i.test(id)) {
    return parseInt(id.slice(0, 8), 16) * 1000;
  }
  return NaN;
}

function normalizeServerPost(post, apiBase) {
  if (!post || !post._id) return null;
  const ts = parseTimestampMs(post);
  if (!Number.isFinite(ts) || ts < CUTOFF_MS) return null;

  const mediaUrl = safeMediaUrl(
    post.media || post.mediaUrl || (post.medias && post.medias.url) || "",
    apiBase
  );
  if (!mediaUrl || /(youtube\.com|youtu\.be)/i.test(mediaUrl)) return null;

  const mt = String(post.mediaType || "").toLowerCase();
  const isVideo = mt.startsWith("video") || /\.(mp4|mov|webm|mkv|m4v)(\?|#|$)/i.test(mediaUrl);
  const isPhoto =
    !isVideo &&
    (mt.startsWith("image") || /\.(jpe?g|png|webp|gif|avif|bmp|svg)(\?|#|$)/i.test(mediaUrl));

  if (!isVideo && !isPhoto) return null;

  return {
    id: String(post._id),
    kind: isVideo ? "video" : "image",
    mediaUrl,
    thumbUrl: safeMediaUrl(post.thumbnail || (isPhoto ? mediaUrl : ""), apiBase),
    title: String(post.title || "").trim(),
    description: String(post.description || "").trim(),
    location: String(post.location || "").trim(),
    duration: Number(post.duration || 0),
    views: Number(post.views || 0),
    likesCount: Array.isArray(post.likes) ? post.likes.length : Number(post.likes || 0),
    createdAt: post.createdAt || new Date(ts).toISOString(),
    createdMs: ts,
    user: {
      username: String((post.userId && (post.userId.username || post.userId.name)) || "falconspido"),
    },
    raw: post,
  };
}

async function fetchLiveFeedFromBackend() {
  const apiBase = getConfiguredBackendBase();
  if (!apiBase) return null;

  if (
    _feedCache.posts &&
    _feedCache.apiBase === apiBase &&
    Date.now() - _feedCache.ts < CACHE_TTL_MS
  ) {
    return _feedCache.posts;
  }

  try {
    const rawList = [];
    for (let page = 1; page <= 4; page++) {
      const res = await fetch(`${apiBase}/post/feed/for-you?page=${page}&limit=50`, {
        signal: AbortSignal.timeout(4500),
      });
      if (!res.ok) break;
      const data = await res.json();
      const batch = Array.isArray(data) ? data : Array.isArray(data.posts) ? data.posts : [];
      if (!batch.length) break;

      let hitOlder = false;
      for (const item of batch) {
        rawList.push(item);
        const ts = parseTimestampMs(item);
        if (Number.isFinite(ts) && ts < CUTOFF_MS && !item?.isPinned) {
          hitOlder = true;
        }
      }
      if (hitOlder || !data.hasMore) break;
    }

    const seen = new Set();
    const clean = [];
    for (const r of rawList) {
      const n = normalizeServerPost(r, apiBase);
      if (n && !seen.has(n.id)) {
        seen.add(n.id);
        clean.push(n);
      }
    }
    clean.sort((a, b) => (b.createdMs !== a.createdMs ? b.createdMs - a.createdMs : b.id.localeCompare(a.id)));

    if (clean.length) {
      _feedCache = { apiBase, ts: Date.now(), posts: clean };
    }
    return clean;
  } catch {
    return _feedCache.apiBase === apiBase ? _feedCache.posts : null;
  }
}

function formatIsoDur(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  if (!s) return undefined;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${r || (!h && !m) ? `${r}S` : ""}`;
}

function buildSsrJsonLd(posts) {
  const items = posts.slice(0, 25).map((p, idx) => {
    const postUrl = `${SITE_ORIGIN}/feed#post-${encodeURIComponent(p.id)}`;
    const name = p.title || p.description || `${p.user.username} on falconspido.com`;
    if (p.kind === "video") {
      const obj = {
        "@type": "VideoObject",
        name,
        description: p.description || name,
        url: postUrl,
        contentUrl: p.mediaUrl,
        thumbnailUrl: p.thumbUrl || DEFAULT_COVER,
        uploadDate: p.createdAt,
        interactionStatistic: [
          { "@type": "InteractionCounter", interactionType: "https://schema.org/WatchAction", userInteractionCount: p.views },
          { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: p.likesCount },
        ],
      };
      const dur = formatIsoDur(p.duration);
      if (dur) obj.duration = dur;
      return { "@type": "ListItem", position: idx + 1, item: obj };
    }
    return {
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "ImageObject",
        name,
        caption: p.description || name,
        url: postUrl,
        contentUrl: p.mediaUrl,
        thumbnailUrl: p.thumbUrl || p.mediaUrl,
        datePublished: p.createdAt,
      },
    };
  });

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        name: "falconspido.com",
        url: SITE_ORIGIN,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_ORIGIN}/feed#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "Feed", item: `${SITE_ORIGIN}/feed` },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${SITE_ORIGIN}/feed#webpage`,
        name: "Feed — Latest Photos & Videos | falconspido.com",
        url: `${SITE_ORIGIN}/feed`,
        description: "Latest photos, short videos, and creator reels on falconspido.com sorted newest-first.",
        isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
        breadcrumb: { "@id": `${SITE_ORIGIN}/feed#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: items.length,
          itemListElement: items,
        },
      },
    ],
  });
}

function buildSsrArticlesHtml(posts) {
  const cards = posts
    .slice(0, 25)
    .map((p, idx) => {
      const postHref = `/feed#post-${encodeURIComponent(p.id)}`;
      const titleText = p.title || p.description || `${p.user.username} ${p.kind}`;
      const mediaHtml =
        p.kind === "video"
          ? `<video controls muted playsinline preload="metadata"${p.thumbUrl ? ` poster="${escapeHtml(p.thumbUrl)}"` : ""}><source src="${escapeHtml(p.mediaUrl)}" type="video/mp4"></video>`
          : `<img src="${escapeHtml(p.mediaUrl)}" alt="${escapeHtml(titleText)}"${idx === 0 ? ' fetchpriority="high"' : ' loading="lazy"'}>`;

      return `<article class="card" id="post-${escapeHtml(p.id)}" data-post-id="${escapeHtml(p.id)}">
  <div class="card-head">
    <div class="creator">
      <div class="creator-row"><span class="username">${escapeHtml(p.user.username)}</span></div>
      <div class="subline"><time datetime="${escapeHtml(p.createdAt)}">${escapeHtml(p.createdAt.slice(0, 10))}</time> · <a class="post-link" href="${postHref}" rel="bookmark">Open ↗</a></div>
    </div>
    <span class="type-badge${p.kind === "video" ? " is-video" : ""}">${p.kind === "video" ? "Video" : "Photo"}</span>
  </div>
  <div class="stage ${p.kind === "video" ? "is-video" : "is-photo"}">${mediaHtml}</div>
  <div class="caption-box"><h2 class="caption-title">${escapeHtml(titleText)}</h2>${p.description ? `<p>${escapeHtml(p.description)}</p>` : ""}</div>
</article>`;
    })
    .join("\n");

  return `<div class="stream">${cards}</div>`;
}

function buildSitemapXml(posts) {
  const safePosts = Array.isArray(posts) ? posts : [];
  const feedLastMod = safePosts.length && safePosts[0].createdAt ? safePosts[0].createdAt : "2026-11-26";

  const imageBlocks = [];
  const videoBlocks = [];

  for (const p of safePosts) {
    if (!/^https?:\/\//i.test(p.mediaUrl)) continue;
    if (p.kind === "image" && imageBlocks.length < 25) {
      imageBlocks.push(
`    <image:image>
      <image:loc>${escapeXml(p.mediaUrl)}</image:loc>
    </image:image>`
      );
    } else if (p.kind === "video" && videoBlocks.length < 25) {
      const titleText = (p.title || p.description || `${p.user.username} on falconspido.com`).slice(0, 100);
      const descText = (p.description || p.title || "Watch the latest video on falconspido.com.").slice(0, 2048);
      const dur = Number.isFinite(p.duration) && p.duration >= 1 && p.duration <= 28800
        ? `\n      <video:duration>${Math.round(p.duration)}</video:duration>`
        : "";
      videoBlocks.push(
`    <video:video>
      <video:thumbnail_loc>${escapeXml(p.thumbUrl || DEFAULT_COVER)}</video:thumbnail_loc>
      <video:title>${escapeXml(titleText)}</video:title>
      <video:description>${escapeXml(descText)}</video:description>
      <video:content_loc>${escapeXml(p.mediaUrl)}</video:content_loc>
      <video:publication_date>${escapeXml(p.createdAt)}</video:publication_date>${dur}
    </video:video>`
      );
    }
  }

  const feedMedia = [...videoBlocks, ...imageBlocks].join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_ORIGIN}/</loc>
    <lastmod>2026-11-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <video:video>
      <video:thumbnail_loc>${escapeXml(DEFAULT_COVER)}</video:thumbnail_loc>
      <video:title>AutoClip Pro Bundle — Turn Long Videos into Viral Shorts</video:title>
      <video:description>Paste one link, get ready-to-post YouTube Shorts, Reels, and TikToks with subtitles, covers, and captions on falconspido.com.</video:description>
      <video:content_loc>${SITE_ORIGIN}/videos/ai-labs-debate.mp4</video:content_loc>
    </video:video>
  </url>
  <url>
    <loc>${SITE_ORIGIN}/feed</loc>
    <lastmod>${escapeXml(feedLastMod)}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>${feedMedia ? `\n${feedMedia}` : ""}
  </url>
</urlset>
`;
}

function firstExistingFile(paths) {
  for (const p of paths) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

const FEED_HTML_PATHS = [
  path.join(__dirname, "..", "feed.html"),
  path.join(__dirname, "..", "web", "public", "feed.html"),
];
const INDEX_HTML_PATHS = [
  path.join(__dirname, "..", "index.html"),
  path.join(__dirname, "..", "web", "public", "index.html"),
  path.join(__dirname, "..", "web", "index.html"),
];

function resolvePublicFile(pathname) {
  const clean = path.posix.normalize(pathname);
  if (clean.includes("..")) return null;

  if (clean === "/" || clean === "" || clean === "/index.html") {
    return firstExistingFile(INDEX_HTML_PATHS);
  }
  if (clean === "/feed") {
    return firstExistingFile(FEED_HTML_PATHS);
  }
  if (clean === "/robots.txt") return path.join(__dirname, "..", "robots.txt");
  if (clean === "/sitemap.xml") return path.join(__dirname, "..", "sitemap.xml");
  if (clean.startsWith("/videos/")) {
    const file = clean.slice("/videos/".length);
    if (!file || file.includes("/") || file.includes("\\")) return null;
    return firstExistingFile([
      path.join(__dirname, "..", "videos", file),
      path.join(__dirname, "..", "web", "public", "videos", file),
      path.join(__dirname, "..", "web", "videos", file),
    ]);
  }
  if (clean.startsWith("/assets/")) {
    const file = clean.slice("/assets/".length);
    if (!file || file.includes("/") || file.includes("\\")) return null;
    return firstExistingFile([
      path.join(__dirname, "..", "assets", file),
      path.join(__dirname, "..", "web", "public", "assets", file),
    ]);
  }
  return null;
}

function serveStaticFile(req, res, filePath) {
  const stats = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const totalSize = stats.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= totalSize || end >= totalSize || start > end) {
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
    return;
  }

  res.writeHead(200, {
    "Content-Length": totalSize,
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400",
  });
  fs.createReadStream(filePath).pipe(res);
}

export async function handleRequest(req, res) {
  const host = req.headers.host || "localhost";
  const reqUrl = new URL(req.url, `http://${host}`);

  let pathname;
  try {
    pathname = decodeURIComponent(reqUrl.pathname);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("400 Bad Request");
  }

  if (pathname === "/api/health" || pathname === "/healthz") {
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "X-Robots-Tag": "noindex",
    });
    return res.end(JSON.stringify({ status: "ok" }));
  }

  if (pathname === "/feed.html" || pathname === "/feed/") {
    const qs = reqUrl.search || "";
    res.writeHead(301, {
      Location: `/feed${qs}`,
      "Cache-Control": "public, max-age=3600",
    });
    return res.end();
  }

  if (pathname === "/robots.txt") {
    const robotsFile = resolvePublicFile("/robots.txt");
    if (robotsFile && fs.existsSync(robotsFile)) {
      return serveStaticFile(req, res, robotsFile);
    }
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    });
    return res.end(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`);
  }

  if (pathname === "/sitemap.xml") {
    const livePosts = await fetchLiveFeedFromBackend();
    let xml = "";
    if (livePosts && livePosts.length) {
      xml = buildSitemapXml(livePosts);
    } else {
      const sitemapFile = resolvePublicFile("/sitemap.xml");
      xml = sitemapFile && fs.existsSync(sitemapFile)
        ? fs.readFileSync(sitemapFile, "utf-8")
        : buildSitemapXml(null);
    }
    res.writeHead(200, {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": livePosts ? "public, s-maxage=300, stale-while-revalidate=600" : "public, max-age=3600",
    });
    return res.end(xml);
  }

  if (pathname === "/api/feed") {
    const livePosts = await fetchLiveFeedFromBackend();
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "X-Robots-Tag": "noindex",
    });
    return res.end(
      JSON.stringify({
        mode: livePosts ? "live" : "unconfigured",
        posts: livePosts ? livePosts.map((p) => p.raw) : [],
      })
    );
  }

  if (pathname === "/feed") {
    const feedFile = resolvePublicFile("/feed");
    if (!feedFile) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("404 Not Found");
    }

    let html = fs.readFileSync(feedFile, "utf-8");
    const livePosts = await fetchLiveFeedFromBackend();

    if (livePosts && livePosts.length) {
      const jsonLd = buildSsrJsonLd(livePosts).replace(/<\/script/gi, "<\\/script");
      html = html.replace(
        /<script type="application\/ld\+json" id="feedSchemaJsonLd">[\s\S]*?<\/script>/i,
        `<script type="application/ld+json" id="feedSchemaJsonLd">\n${jsonLd}\n</script>`
      );

      const firstHttpsThumb = livePosts.find((p) => /^https?:\/\//i.test(p.thumbUrl || p.mediaUrl));
      if (firstHttpsThumb) {
        const ogUrl = escapeHtml(firstHttpsThumb.thumbUrl || firstHttpsThumb.mediaUrl);
        html = html.replace(
          /(<meta property="og:image" id="ogImageMeta" content=")[^"]*(")/i,
          `$1${ogUrl}$2`
        );
        html = html.replace(
          /(<meta name="twitter:image" id="twImageMeta" content=")[^"]*(")/i,
          `$1${ogUrl}$2`
        );
      }

      const ssrCards = buildSsrArticlesHtml(livePosts);
      const bootstrapJson = JSON.stringify(livePosts.map((p) => p.raw)).replace(/<\/script/gi, "<\\/script");
      html = html.replace(
        '<div id="feedContainer" aria-live="polite"></div>',
        `<div id="feedContainer" aria-live="polite">${ssrCards}</div>`
      );
      html = html.replace(
        "<!-- __SSR_BOOTSTRAP__ -->",
        `<script>window.__INITIAL_FEED_POSTS__=${bootstrapJson};</script>`
      );
    }

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": livePosts ? "public, s-maxage=60, stale-while-revalidate=300" : "no-cache",
    });
    return res.end(html);
  }

  const filePath = resolvePublicFile(pathname);
  if (!filePath) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("404 Not Found");
  }

  return serveStaticFile(req, res, filePath);
}

export function startServer(port = process.env.PORT || 3000) {
  const server = http.createServer(handleRequest);
  server.listen(port, () => {
    console.log(`falconspido.com server listening on port ${port}`);
  });
  return server;
}
