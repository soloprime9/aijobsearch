import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_ORIGIN = "https://www.falconspido.com";
const DEFAULT_COVER = `${SITE_ORIGIN}/assets/AutoClip_Topmate_Cover_1280x720.png`;
const SITE_LOGO = `${SITE_ORIGIN}/assets/AutoClip_Topmate_Thumbnail_600x600.png`;
const DEFAULT_BACKEND_API = "https://backend-k.vercel.app";
const CUTOFF_MS = Date.parse("2026-11-24T18:30:00.000Z"); // 25 Nov 2026 00:00 IST
const CACHE_TTL_MS = 60 * 1000;

let _feedCache = { apiBase: "", ts: 0, posts: null };
const _singleCache = new Map();

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
    DEFAULT_BACKEND_API
  )
    .trim()
    .replace(/\/+$/, "");
  if (!raw || /onrender\.com/i.test(raw) || !/^https?:\/\//i.test(raw)) {
    return DEFAULT_BACKEND_API;
  }
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

function normalizeServerPost(post, apiBase, enforceCutoff = true) {
  if (!post || !post._id) return null;
  const ts = parseTimestampMs(post);
  if (!Number.isFinite(ts)) return null;
  if (enforceCutoff && ts < CUTOFF_MS) return null;

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

  const tags = Array.isArray(post.tags)
    ? post.tags.map((t) => String(t || "").replace(/^#+/, "").trim()).filter(Boolean)
    : Array.isArray(post.hashtags)
      ? post.hashtags.map((h) => String(h || "").replace(/^#+/, "").trim()).filter(Boolean)
      : [];

  return {
    id: String(post._id),
    kind: isVideo ? "video" : "image",
    mediaUrl,
    thumbUrl: safeMediaUrl(post.thumbnail || (isPhoto ? mediaUrl : ""), apiBase),
    title: String(post.title || "").trim() || `Latest ${isVideo ? "Video" : "Photo"} on falconspido.com`,
    description: String(post.description || "").trim(),
    tags,
    location: String(post.location || "").trim(),
    duration: Number(post.duration || 0),
    width: Number(post.width || 1280),
    height: Number(post.height || 720),
    views: Number(post.views || 0),
    likesCount: Array.isArray(post.likes) ? post.likes.length : Number(post.likes || 0),
    commentsCount: Array.isArray(post.comments) ? post.comments.length : Number(post.commentCount || 0),
    comments: Array.isArray(post.comments) ? post.comments : [],
    createdAt: post.createdAt || new Date(ts).toISOString(),
    updatedAt: post.updatedAt || post.createdAt || new Date(ts).toISOString(),
    createdMs: ts,
    user: {
      username: String((post.userId && (post.userId.username || post.userId.name)) || "falconspido"),
      avatar: safeMediaUrl(post.userId && (post.userId.profilePicture || post.userId.profilePic || post.userId.avatar), apiBase),
      verified: Boolean(post.userId && (post.userId.isVerified || post.userId.isEmailVerified)),
    },
    raw: post,
  };
}

async function fetchLiveFeedFromBackend() {
  const apiBase = getConfiguredBackendBase();

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
      let res = await fetch(`${apiBase}/fondpeace/feed?page=${page}&limit=50&sort=latest`, {
        signal: AbortSignal.timeout(5500),
      });
      if (res.status === 404) {
        res = await fetch(`${apiBase}/post/feed/for-you?page=${page}&limit=50`, {
          signal: AbortSignal.timeout(5500),
        });
      }
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
      const n = normalizeServerPost(r, apiBase, true);
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

async function fetchSinglePostFromBackend(id) {
  if (!id || !/^[a-zA-Z0-9_-]{6,64}$/.test(id)) {
    return { status: 404, post: null, related: [] };
  }
  const apiBase = getConfiguredBackendBase();
  const cacheKey = `${apiBase}:${id}`;
  const cached = _singleCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const res = await fetch(`${apiBase}/post/single/${encodeURIComponent(id)}`, {
      signal: AbortSignal.timeout(5500),
    });
    if (res.status === 404) {
      return { status: 404, post: null, related: [] };
    }
    if (!res.ok) {
      return { status: res.status, post: null, related: [] };
    }
    const payload = await res.json();
    if (!payload || !payload.post) {
      return { status: 404, post: null, related: [] };
    }
    const result = {
      status: 200,
      post: payload.post,
      related: Array.isArray(payload.related) ? payload.related : [],
    };
    if (_singleCache.size > 100) _singleCache.clear();
    _singleCache.set(cacheKey, { ts: Date.now(), data: result });
    return result;
  } catch {
    return cached ? cached.data : { status: 502, post: null, related: [] };
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

function buildSsrJsonLd() {
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
      },
    ],
  });
}

function buildSsrArticlesHtml(posts) {
  const cards = posts
    .slice(0, 25)
    .map((p, idx) => {
      const postHref = `/post/${encodeURIComponent(p.id)}`;
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
  <div class="caption-box"><h2 class="caption-title"><a href="${postHref}">${escapeHtml(titleText)}</a></h2>${p.description ? `<p>${escapeHtml(p.description)}</p>` : ""}</div>
</article>`;
    })
    .join("\n");

  return `<div class="stream">${cards}</div>`;
}

function buildSinglePostSeoDescription(p) {
  const verb = p.kind === "video" ? "watch" : "view";
  const snippet = p.description ? `${p.description.slice(0, 110)} — ` : "";
  return `🔥 ${p.views} Views, ${p.likesCount} Likes, ${p.commentsCount} Comments — ${snippet}${verb} "${p.title}" uploaded by ${p.user.username} on falconspido.com.`;
}

function buildSinglePostSsrJsonLd(p) {
  const pageUrl = `${SITE_ORIGIN}/post/${encodeURIComponent(p.id)}`;
  const desc = buildSinglePostSeoDescription(p);
  const keywords = (p.tags && p.tags.length ? p.tags.join(", ") : p.title.split(/\s+/).filter(Boolean).slice(0, 10).join(", "));
  const thumb = p.thumbUrl || (p.kind === "image" ? p.mediaUrl : DEFAULT_COVER) || DEFAULT_COVER;
  const interactionStatistic = [
    { "@type": "InteractionCounter", interactionType: { "@type": "LikeAction" }, userInteractionCount: p.likesCount },
    { "@type": "InteractionCounter", interactionType: { "@type": "CommentAction" }, userInteractionCount: p.commentsCount },
    { "@type": "InteractionCounter", interactionType: { "@type": "WatchAction" }, userInteractionCount: p.views },
  ];
  const publisher = {
    "@type": "Organization",
    name: "falconspido.com",
    url: SITE_ORIGIN,
    logo: { "@type": "ImageObject", url: SITE_LOGO, width: 600, height: 600 },
  };

  let mediaObj;
  if (p.kind === "video") {
    mediaObj = {
      "@type": "VideoObject",
      "@id": `${pageUrl}#video`,
      url: pageUrl,
      name: p.title,
      headline: p.title,
      description: desc,
      thumbnailUrl: thumb,
      contentUrl: p.mediaUrl,
      embedUrl: pageUrl,
      uploadDate: p.createdAt,
      datePublished: p.createdAt,
      dateModified: p.updatedAt,
      width: p.width || 1280,
      height: p.height || 720,
      encodingFormat: "video/mp4",
      publisher,
      author: { "@type": "Person", name: p.user.username },
      creator: { "@type": "Person", name: p.user.username },
      interactionStatistic,
      keywords,
      isFamilyFriendly: true,
      potentialAction: { "@type": "WatchAction", target: pageUrl },
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    };
    const dur = formatIsoDur(p.duration);
    if (dur) mediaObj.duration = dur;
  } else {
    mediaObj = {
      "@type": "ImageObject",
      "@id": `${pageUrl}#image`,
      url: pageUrl,
      name: p.title,
      headline: p.title,
      description: desc,
      contentUrl: p.mediaUrl,
      thumbnailUrl: thumb,
      datePublished: p.createdAt,
      dateModified: p.updatedAt,
      publisher,
      author: { "@type": "Person", name: p.user.username },
      interactionStatistic,
      keywords,
      isFamilyFriendly: true,
      potentialAction: { "@type": "ViewAction", target: pageUrl },
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    };
  }

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${SITE_ORIGIN}/#website`, name: "falconspido.com", url: SITE_ORIGIN },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "Feed", item: `${SITE_ORIGIN}/feed` },
          { "@type": "ListItem", position: 3, name: p.title, item: pageUrl },
        ],
      },
      mediaObj,
    ],
  });
}

function buildSinglePostSsrHtml(p) {
  const mediaHtml =
    p.kind === "video"
      ? `<video controls playsinline preload="metadata"${p.thumbUrl ? ` poster="${escapeHtml(p.thumbUrl)}"` : ""}><source src="${escapeHtml(p.mediaUrl)}" type="video/mp4"></video>`
      : `<img src="${escapeHtml(p.mediaUrl)}" alt="${escapeHtml(p.title)}">`;

  const tagsHtml = (p.tags || [])
    .map((t) => `<a class="tag-pill" href="/feed?tag=${encodeURIComponent(t)}">#${escapeHtml(t)}</a>`)
    .join("");

  return `<article class="post-card" data-post-id="${escapeHtml(p.id)}">
  <div class="card-head">
    <div class="avatar-fallback">${escapeHtml((p.user.username || "F").slice(0, 1).toUpperCase())}</div>
    <div class="creator">
      <div class="creator-row"><span class="username">${escapeHtml(p.user.username)}</span></div>
      <div class="subline"><time datetime="${escapeHtml(p.createdAt)}">${escapeHtml(p.createdAt.slice(0, 10))}</time>${p.location ? ` · <span>${escapeHtml(p.location)}</span>` : ""}</div>
    </div>
    <span class="type-badge${p.kind === "video" ? " is-video" : ""}">${p.kind === "video" ? "Video" : "Photo"}</span>
  </div>
  <div class="stage ${p.kind === "video" ? "is-video" : "is-photo"}">${mediaHtml}</div>
  <div class="post-body">
    <h1 class="post-h1">${escapeHtml(p.title)}</h1>
    ${p.description ? `<p class="post-desc">${escapeHtml(p.description)}</p>` : ""}
    ${tagsHtml ? `<div class="tags-row">${tagsHtml}</div>` : ""}
    <div class="interact-bar"><div class="interact-left"><span>♥ ${p.likesCount}</span><span>💬 ${p.commentsCount}</span><span class="views-stat">👁 ${p.views} views</span></div></div>
    <div class="feed-back-row"><a class="feed-back-link" href="/feed">← View all latest photos &amp; videos on Feed</a><span style="font-size:.78rem;color:var(--mute);font-weight:600">/post/${escapeHtml(p.id)}</span></div>
  </div>
</article>`;
}

function buildRelatedSsrHtml(relatedList, apiBase, excludeId) {
  const clean = (relatedList || [])
    .map((r) => normalizeServerPost(r, apiBase, false))
    .filter((r) => r && r.id !== excludeId)
    .slice(0, 8);
  if (!clean.length) return "";

  const cards = clean
    .map((r) => {
      const thumb = r.thumbUrl
        ? `<img src="${escapeHtml(r.thumbUrl)}" alt="${escapeHtml(r.title)}" loading="lazy">`
        : `<video src="${escapeHtml(r.mediaUrl)}" muted playsinline preload="metadata"></video>`;
      return `<a class="rel-card" href="/post/${encodeURIComponent(r.id)}">
  <div class="rel-media">${thumb}<span class="rel-badge">${r.kind === "video" ? "Video" : "Photo"}</span></div>
  <div class="rel-body">
    <div class="rel-title">${escapeHtml(r.title)}</div>
    <div class="rel-stats"><span>♥ ${r.likesCount}</span><span>💬 ${r.commentsCount}</span><span>👁 ${r.views}</span></div>
  </div>
</a>`;
    })
    .join("\n");

  return `<div class="related-head"><h2>Related Posts</h2><span>More photos &amp; videos</span></div><div class="related-grid">${cards}</div>`;
}

// IMPORTANT: Never add individual /post/<id> URLs to sitemap.xml (discovered from /feed links only).
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
const POST_HTML_PATHS = [
  path.join(__dirname, "..", "post.html"),
  path.join(__dirname, "..", "web", "public", "post.html"),
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
  if (clean === "/post") {
    return firstExistingFile(POST_HTML_PATHS);
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

function replaceMetaTag(html, regex, val) {
  return html.replace(regex, (_, pre, post) => `${pre}${escapeHtml(val)}${post}`);
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

  if (pathname === "/post.html" || pathname === "/post/") {
    const qs = reqUrl.search || "";
    res.writeHead(301, {
      Location: `/feed${qs}`,
      "Cache-Control": "public, max-age=3600",
    });
    return res.end();
  }

  if (pathname.startsWith("/post/") && pathname.endsWith("/") && pathname.length > 6) {
    const qs = reqUrl.search || "";
    res.writeHead(301, {
      Location: `${pathname.slice(0, -1)}${qs}`,
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
    res.writeHead(livePosts ? 200 : 502, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": livePosts ? "public, s-maxage=60, stale-while-revalidate=300" : "no-store",
      "X-Robots-Tag": "noindex",
    });
    return res.end(
      JSON.stringify({
        success: Boolean(livePosts),
        mode: livePosts ? "live" : "error",
        posts: livePosts ? livePosts.map((p) => p.raw) : [],
      })
    );
  }

  if (pathname === "/api/post") {
    const id = (reqUrl.searchParams.get("id") || "").trim();
    const result = await fetchSinglePostFromBackend(id);
    res.writeHead(result.status, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": result.status === 200 ? "public, s-maxage=60, stale-while-revalidate=300" : "no-store",
      "X-Robots-Tag": "noindex",
    });
    return res.end(
      JSON.stringify({
        success: result.status === 200,
        post: result.post,
        related: result.related,
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
        /<span id="statusText">[\s\S]*?<\/span>/i,
        `<span id="statusText">${livePosts.length} ${livePosts.length === 1 ? "post" : "posts"} · Latest first</span>`
      );
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

  if (pathname.startsWith("/post/")) {
    const id = pathname.slice("/post/".length).trim();
    if (!id || id.includes("/")) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("404 Not Found");
    }

    const postFile = resolvePublicFile("/post");
    if (!postFile) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("404 Not Found");
    }

    const apiBase = getConfiguredBackendBase();
    const fetched = await fetchSinglePostFromBackend(id);
    if (fetched.status === 404) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" });
      return res.end("404 Post Not Found");
    }

    let html = fs.readFileSync(postFile, "utf-8");
    const norm = fetched.post ? normalizeServerPost(fetched.post, apiBase, false) : null;

    if (norm) {
      const pageUrl = `${SITE_ORIGIN}/post/${encodeURIComponent(norm.id)}`;
      const titleTag = `${norm.title} - falconspido.com`;
      const desc = buildSinglePostSeoDescription(norm);
      const kw = (norm.tags && norm.tags.length ? norm.tags.join(", ") : norm.title.split(/\s+/).filter(Boolean).slice(0, 10).join(", "));
      const thumb = norm.thumbUrl || (norm.kind === "image" ? norm.mediaUrl : DEFAULT_COVER) || DEFAULT_COVER;

      html = html.replace(
        /<title id="metaTitle">[\s\S]*?<\/title>/i,
        `<title id="metaTitle">${escapeHtml(titleTag)}</title>`
      );
      html = replaceMetaTag(html, /(<meta name="description" id="metaDesc" content=")[^"]*(")/i, desc);
      html = replaceMetaTag(html, /(<meta name="keywords" id="metaKeywords" content=")[^"]*(")/i, kw);
      html = replaceMetaTag(html, /(<link rel="canonical" id="canonicalLink" href=")[^"]*(")/i, pageUrl);

      html = replaceMetaTag(html, /(<meta property="og:type" id="ogTypeMeta" content=")[^"]*(")/i, norm.kind === "video" ? "video.other" : "article");
      html = replaceMetaTag(html, /(<meta property="og:url" id="ogUrlMeta" content=")[^"]*(")/i, pageUrl);
      html = replaceMetaTag(html, /(<meta property="og:title" id="ogTitleMeta" content=")[^"]*(")/i, titleTag);
      html = replaceMetaTag(html, /(<meta property="og:description" id="ogDescMeta" content=")[^"]*(")/i, desc);
      html = replaceMetaTag(html, /(<meta property="og:image" id="ogImageMeta" content=")[^"]*(")/i, thumb);
      html = replaceMetaTag(html, /(<meta property="og:image:alt" id="ogImageAltMeta" content=")[^"]*(")/i, norm.title);

      if (norm.kind === "video") {
        html = replaceMetaTag(html, /(<meta property="og:video" id="ogVideoMeta" content=")[^"]*(")/i, norm.mediaUrl);
        html = replaceMetaTag(html, /(<meta property="og:video:type" id="ogVideoTypeMeta" content=")[^"]*(")/i, "video/mp4");
        html = replaceMetaTag(html, /(<meta property="og:video:width" id="ogVideoWidthMeta" content=")[^"]*(")/i, String(norm.width || 1280));
        html = replaceMetaTag(html, /(<meta property="og:video:height" id="ogVideoHeightMeta" content=")[^"]*(")/i, String(norm.height || 720));
        html = replaceMetaTag(html, /(<meta name="twitter:card" id="twCardMeta" content=")[^"]*(")/i, "player");
        html = replaceMetaTag(html, /(<meta name="twitter:player" id="twPlayerMeta" content=")[^"]*(")/i, norm.mediaUrl);
      } else {
        html = replaceMetaTag(html, /(<meta name="twitter:card" id="twCardMeta" content=")[^"]*(")/i, "summary_large_image");
      }

      html = replaceMetaTag(html, /(<meta name="twitter:title" id="twTitleMeta" content=")[^"]*(")/i, titleTag);
      html = replaceMetaTag(html, /(<meta name="twitter:description" id="twDescMeta" content=")[^"]*(")/i, desc);
      html = replaceMetaTag(html, /(<meta name="twitter:image" id="twImageMeta" content=")[^"]*(")/i, thumb);

      const jsonLd = buildSinglePostSsrJsonLd(norm).replace(/<\/script/gi, "<\\/script");
      html = html.replace(
        /<script type="application\/ld\+json" id="postSchemaJsonLd">[\s\S]*?<\/script>/i,
        `<script type="application/ld+json" id="postSchemaJsonLd">\n${jsonLd}\n</script>`
      );

      html = html.replace(
        '<div id="postContainer" aria-live="polite"></div>',
        `<div id="postContainer" aria-live="polite">${buildSinglePostSsrHtml(norm)}</div>`
      );

      const relHtml = buildRelatedSsrHtml(fetched.related, apiBase, norm.id);
      if (relHtml) {
        html = html.replace(
          '<aside class="related-shell" id="relatedAside" aria-label="Related Posts"></aside>',
          `<aside class="related-shell" id="relatedAside" aria-label="Related Posts">${relHtml}</aside>`
        );
      }

      const postBoot = JSON.stringify(fetched.post).replace(/<\/script/gi, "<\\/script");
      const relBoot = JSON.stringify(fetched.related).replace(/<\/script/gi, "<\\/script");
      html = html.replace(
        "<!-- __SSR_POST_BOOTSTRAP__ -->",
        `<script>window.__INITIAL_SINGLE_POST__=${postBoot};window.__INITIAL_RELATED_POSTS__=${relBoot};</script>`
      );
    }

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": norm ? "public, s-maxage=60, stale-while-revalidate=300" : "no-cache",
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
