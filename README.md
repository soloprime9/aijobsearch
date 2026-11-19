# 🎬 AutoClip Pro Bundle – Turn Long Videos into Viral Shorts

> High-converting, fully responsive landing page and showcase for the **AutoClip Pro Bundle** — featuring interactive video showcases, dual-stream H.264 video playback, mobile-first design, and instant Topmate checkout integration.

---

## 🚀 Live Demo & Deployment

- **GitHub Pages:** [https://soloprime9.github.io/aijobsearch/](https://soloprime9.github.io/aijobsearch/)
- **Repository:** [https://github.com/soloprime9/aijobsearch](https://github.com/soloprime9/aijobsearch)

---

## ⚡ Quick Start (Local Run)

You can run this project locally in multiple ways:

### Method 1: Node.js (Recommended — Includes HTTP 206 Byte-Range Video Streaming)
```bash
# Start the local server
npm start
# OR: node server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Method 2: Python HTTP Server
```bash
python -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Method 3: Direct Browser Launch
Double-click `index.html` in your file explorer to open it directly in Chrome, Edge, or Safari.

---

## 🎥 Media Files & GitHub Video Playback

All 5 showcase videos are included in the `videos/` directory and tracked in this repository:

| # | Video Name | Codec | Audio | Size | Native GitHub Preview |
|---|------------|-------|-------|------|-----------------------|
| 1 | `ai-labs-debate.mp4` | H.264 (AVC1) | AAC | 2.4 MB | ✅ Supported |
| 2 | `altman-uses-ai.mp4` | H.264 (AVC1) | AAC | 2.6 MB | ✅ Supported |
| 3 | `garfield-poehler.mp4` | H.264 (AVC1) | AAC | 3.2 MB | ✅ Supported |
| 4 | `gates-ezra.mp4` | H.264 (AVC1) | AAC | 1.5 MB | ✅ Supported |
| 5 | `mrbeast-colin-samir.mp4` | H.264 (AVC1) | AAC | 4.6 MB | ✅ Supported |

### Why Videos Play Perfectly on GitHub:
1. **GitHub Repository UI:** Clicking any video file inside the [`videos/`](./videos/) folder on GitHub launches GitHub's native HTML5 web video player.
2. **GitHub Pages (Fastly CDN):** Serves `.mp4` with `Content-Type: video/mp4` and supports HTTP 206 Partial Content (byte range requests) for seamless streaming and scrubbing.
3. **Dual-Source Redundancy:** Each `<video>` tag includes both the local repository path (`videos/*.mp4`) and a high-speed CDN fallback (`cdn.jsdelivr.net`), ensuring 100% playback availability anywhere.

---

## 📦 Project Structure

```
aijobsearch/
├── index.html               # Main AutoClip Pro Bundle landing page
├── server.js                # Zero-dependency HTTP 206 streaming server
├── package.json             # NPM package scripts & configuration
├── download_videos.bat      # CLI script to re-download showcase videos
├── videos/                  # H.264 / AAC MP4 showcase video assets
│   ├── ai-labs-debate.mp4
│   ├── altman-uses-ai.mp4
│   ├── garfield-poehler.mp4
│   ├── gates-ezra.mp4
│   └── mrbeast-colin-samir.mp4
└── legacy-jobcopilot/       # Archived legacy AI Job Copilot codebase
```

---

## 🗄️ Legacy Code Archive

The previous **AI Job Copilot** platform (browser extension, scraper, resume tailoring, server, etc.) has been safely preserved:
1. **Inside this repository:** Archived in the [`legacy-jobcopilot/`](./legacy-jobcopilot/) directory.
2. **On GitHub Git Branch:** Saved permanently on branch [`backup/legacy-aijobsearch`](https://github.com/soloprime9/aijobsearch/tree/backup/legacy-aijobsearch).

---

## 📄 License
MIT © [SoloPrime](https://github.com/soloprime9)
