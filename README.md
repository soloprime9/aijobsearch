# aijobsearch 🚀

> **AI Job Search & Application Copilot Studio** — An end-to-end, privacy-first, automated job discovery and application platform with a standalone Web Studio, Companion Chrome Extension, multi-tier license security vault, and zero external database dependencies.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Manifest_v3-blueviolet.svg)](web/public/ai-job-copilot-extension.zip)
[![Platform](https://img.shields.io/badge/Deployment-Render%20%7C%20Railway%20%7C%20Local-orange.svg)](#deployment)

---

## 🌟 Highlights & Key Features

- 🔎 **Real-time Job Search & LinkedIn Scraper**: Search real-time tech, AI, remote, and hybrid job openings worldwide without rate limits.
- 🎯 **AI Match Scoring & Radar**: Instantly evaluates job descriptions against your candidate profile, assigning quantitative match percentages, pros, and red flags.
- ✍️ **Tailored CV & Cover Letter Generator**: Generates customized LaTeX / Markdown CVs and compelling, recruiter-ready cover letters in seconds.
- 💬 **Interactive Interview Simulator**: Roleplays live technical and behavioral interviews with tailored follow-up questions and immediate coaching feedback.
- 🧩 **Zero-Config Chrome Companion Extension**: 
  - Install directly via 1-click download from the Web Studio.
  - Inspects LinkedIn job pages and auto-fills applications right from your browser sidepanel.
  - Automatically syncs between local `http://localhost:3000` and cloud deployment URLs.
- 🛡️ **Self-Contained Security & License Vault**:
  - Multi-tier device fingerprinting (Browser canvas, screen, audio context, hardware specs).
  - Rate limiting with progressive IP throttling.
  - Automated Gumroad webhook integration with instant license generation.
  - Currency-smart payment modals (₹ INR UPI / QR for domestic users, $ USD Gumroad for international).
- 📊 **Founder Analytics & Revenue Dashboard**:
  - Real-time sales metrics, revenue counter, active device tracking, and 1-click CSV audit export.
  - Zero external database required — operates via atomic, self-healing JSON ledger.
- ⚡ **24/7 Render Keep-Alive Heartbeat**: Built-in ping mechanism keeps free cloud tiers running without cold-start sleeping.

---

## 🏗️ Architecture

```
aijobsearch/
├── web/
│   ├── server.js              # Production Node.js engine & REST API
│   ├── pack_extension.js      # Zero-dependency Chrome extension packager
│   └── public/
│       ├── index.html         # High-aesthetic responsive web studio
│       ├── app.js             # Client logic, fingerprinting & payment modal
│       ├── index.css          # Glassmorphic, modern design system
│       └── ai-job-copilot-extension.zip # Packaged browser extension
├── extension/                 # Chrome Manifest V3 Companion Extension
│   ├── manifest.json
│   ├── sidepanel.html
│   ├── sidepanel.js
│   ├── content.js
│   ├── background.js
│   └── icons/
├── data/
│   └── license_vault.json     # Atomic, self-healing local ledger
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/soloprime9/aijobsearch.git
cd aijobsearch
```

### 2. Install dependencies & launch
```bash
cd web
npm install
node server.js
```

### 3. Open Web Studio
Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧩 Installing the Chrome Extension

1. Open the Web Studio at [http://localhost:3000](http://localhost:3000).
2. Click **"🧩 Get Extension"** in the top navigation bar or go to `/download/extension`.
3. Unzip the downloaded `ai-job-copilot-extension.zip` into a folder.
4. Open Google Chrome and go to `chrome://extensions`.
5. Enable **Developer mode** (top-right toggle).
6. Click **Load unpacked** and select the unzipped `extension` folder.
7. Open any LinkedIn job page and click the extension icon to launch the AI sidepanel!

---

## 🌐 Deploy to Cloud (Render / Railway / VPS)

### Deploy on Render (Free 24/7)

1. Create a free account at [render.com](https://render.com).
2. Click **New +** ➔ **Web Service**.
3. Connect your GitHub repository: `soloprime9/aijobsearch`.
4. Configure service settings:
   - **Environment**: `Node`
   - **Root Directory**: `web`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. *(Optional)* Add Environment Variables in Render Dashboard:
   - `PORT`: `3000` (or leave default assigned by Render)
   - `ADMIN_SECRET`: Your custom secure admin password
   - `APP_URL`: Your Render service URL (e.g., `https://aijobsearch.onrender.com`) to activate the 24/7 keep-alive heartbeat!
   - `GEMINI_API_KEYS`: Optional comma-separated list of your custom Gemini API keys.
6. Click **Deploy Web Service**!

---

## 🔐 Admin Dashboard & Vault Access

The Founder Dashboard is protected and accessible via:
- Endpoint: [http://localhost:3000/admin.html](http://localhost:3000/admin.html) (or `/admin` route)
- Features:
  - Total Revenue & Sales analytics.
  - Active licenses, customer names, emails, and device IDs.
  - Revoke / Activate license keys.
  - Add offline / UPI payment records manually.
  - 1-Click Export to CSV.

---

## ⚙️ Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | HTTP port for the web server |
| `ADMIN_SECRET` | `founder_super_secure_vault_2026_xyz` | Secret key for admin vault access |
| `APP_URL` | Auto-detected | Base URL of deployed server for self-ping heartbeat |
| `GEMINI_API_KEYS`| Built-in Pool | Comma-separated Gemini API keys for AI evaluation |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
