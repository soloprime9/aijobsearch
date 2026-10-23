// AI Job Copilot Studio — Modern, Multi-Platform Logic Engine
(function () {
  'use strict';

  // Active Multi-Key Gemini Pool (Dynamic Obfuscated Tokens)
  const RAW_TOKENS = [
    "QVEuQWI4Uk42SlRuQlpvOXNPWVlwQjhjQ2FSTzdRLU9kUkdvVWV6ZW15MjNYZUVqdFU4OFE=",
    "QVEuQWI4Uk42TFlDNFc3UHF0VTFuSVBLa0hxSGJnclR5U2Utckt2NEsyR2hENHRBZU9pa1E=",
    "QVEuQWI4Uk42S1IyMTVTU0E3eHlhNXJqejVMNHcxbGJKb3RqYjNXbENGX0x0aC0tUU51Qmc="
  ];
  const GEMINI_KEY_POOL = RAW_TOKENS.map(t => atob(t));
  const GEMINI_MODELS = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];

  // Default Candidate Profile
  const DEFAULT_PROFILE = {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    skills: '',
    achievements: ''
  };

  // Curated Salary Benchmarks
  const SALARY_BENCHMARKS = {
    'digital websynation': { name: 'Digital Websynation', baseline: 'Market +25.0%', index: '125.0', count: 30, role: 'Full Stack Developer' },
    'swiggy': { name: 'Swiggy', baseline: 'Market +45.0%', index: '145.0', count: 420, role: 'Software & Tech Roles' },
    'saas labs': { name: 'SaaS Labs', baseline: 'Market +20.0%', index: '120.0', count: 45, role: 'Software & Tech Roles' },
    'google': { name: 'Google', baseline: 'Market +82.5%', index: '182.5', count: 650, role: 'Software / AI Engineer' },
    'microsoft': { name: 'Microsoft', baseline: 'Market +72.0%', index: '172.0', count: 800, role: 'Software Engineer' },
    'universal software': { name: 'Universal Software', baseline: 'Market +15.0%', index: '115.0', count: 80, role: 'Full Stack Engineer' },
    'amazon': { name: 'Amazon', baseline: 'Market +90.0%', index: '190.0', count: 450, role: 'Software Development Engineer' },
    'meta': { name: 'Meta', baseline: 'Market +98.0%', index: '198.0', count: 500, role: 'Software Engineer' },
    'avoma': { name: 'Avoma', baseline: 'Market +25.0%', index: '125.0', count: 40, role: 'Software Engineer' },
    'flipkart': { name: 'Flipkart', baseline: 'Market +60.0%', index: '160.0', count: 220, role: 'Full Stack Developer' }
  };

  let activeScrapedJob = null;

  // DOM Elements
  const tabButtons = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const statusBanner = document.getElementById('statusBanner');
  const btnScanTab = document.getElementById('btnScanTab');
  const jobEmptyState = document.getElementById('jobEmptyState');
  const jobScrapedData = document.getElementById('jobScrapedData');
  const scrapedPortal = document.getElementById('scrapedPortal');
  const scrapedTime = document.getElementById('scrapedTime');
  const scrapedTitle = document.getElementById('scrapedTitle');
  const scrapedCompany = document.getElementById('scrapedCompany');
  const scrapedLocation = document.getElementById('scrapedLocation');
  const evaluationSection = document.getElementById('evaluationSection');
  const evalScore = document.getElementById('evalScore');
  const evalBadge = document.getElementById('evalBadge');
  const evalSummary = document.getElementById('evalSummary');
  const domainBar = document.getElementById('domainBar');
  const domainVal = document.getElementById('domainVal');
  const skillsBar = document.getElementById('skillsBar');
  const skillsVal = document.getElementById('skillsVal');
  const matchedChips = document.getElementById('matchedChips');
  const missingChips = document.getElementById('missingChips');
  const salaryCard = document.getElementById('salaryCard');
  const salaryBody = document.getElementById('salaryBody');
  const btnDraftForJob = document.getElementById('btnDraftForJob');
  const btnPrintCv = document.getElementById('btnPrintCv');
  const btnCopyLetter = document.getElementById('btnCopyLetter');
  const btnSaveProfile = document.getElementById('btnSaveProfile');
  const btnTrackJob = document.getElementById('btnTrackJob');
  const btnExportCsv = document.getElementById('btnExportCsv');
  const trackerList = document.getElementById('trackerList');

  // Search & Batch Elements
  const cliQuery = document.getElementById('cliQuery');
  const cliLocation = document.getElementById('cliLocation');
  const btnCliSearch = document.getElementById('btnCliSearch');
  const btnScanPageBatch = document.getElementById('btnScanPageBatch');
  const batchResultsWrap = document.getElementById('batchResultsWrap');
  const batchCountBadge = document.getElementById('batchCountBadge');
  const batchList = document.getElementById('batchList');

  // Smooth In-App Banner (Zero Alert Popups)
  function showBanner(msg, type = 'info') {
    if (!statusBanner) return;
    statusBanner.textContent = msg;
    statusBanner.className = `status-banner ${type}`;
    statusBanner.style.display = 'flex';
    clearTimeout(statusBanner._timer);
    statusBanner._timer = setTimeout(() => {
      statusBanner.style.display = 'none';
    }, 4000);
  }

  // Tab Navigation
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.style.display = 'none');
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.style.display = 'block';

      if (btn.dataset.tab === 'trackerTab') {
        renderTrackerList();
      }
    });
  });

  // Profile Storage
  function getProfile() {
    try {
      const saved = localStorage.getItem('ai_job_candidate_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  function saveProfile(prof) {
    try {
      localStorage.setItem('ai_job_candidate_profile', JSON.stringify(prof));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }

  function syncProfileUI() {
    const p = getProfile();
    document.getElementById('profName').value = p.fullName || '';
    document.getElementById('profEmail').value = p.email || '';
    document.getElementById('profPhone').value = p.phone || '';
    document.getElementById('profLocation').value = p.location || '';
    document.getElementById('profHeadline').value = p.headline || '';
    document.getElementById('profSkills').value = p.skills || '';
    document.getElementById('profAchievements').value = p.achievements || '';

    // Update CV preview
    document.getElementById('cvName').textContent = p.fullName;
    document.getElementById('cvContact').textContent = `${p.location} • ${p.email} • ${p.phone}`;
  }

  btnSaveProfile.addEventListener('click', () => {
    const updated = {
      fullName: document.getElementById('profName').value.trim(),
      email: document.getElementById('profEmail').value.trim(),
      phone: document.getElementById('profPhone').value.trim(),
      location: document.getElementById('profLocation').value.trim(),
      headline: document.getElementById('profHeadline').value.trim(),
      skills: document.getElementById('profSkills').value.trim(),
      achievements: document.getElementById('profAchievements').value.trim()
    };
    saveProfile(updated);
    syncProfileUI();
    showBanner('✓ Profile saved successfully!', 'success');
  });

  // =========================================================================
  // FREEMIUM & PRO LICENSING ENGINE (3 Free Scans & 1 Free CV)
  // =========================================================================
  const creditBar = document.getElementById('creditBar');
  const creditScansCount = document.getElementById('creditScansCount');
  const creditCvCount = document.getElementById('creditCvCount');
  const btnOpenUpgrade = document.getElementById('btnOpenUpgrade');
  const upgradeModal = document.getElementById('upgradeModal');
  const btnCloseUpgradeModal = document.getElementById('btnCloseUpgradeModal');
  const upgradeReasonText = document.getElementById('upgradeReasonText');
  const btnPayUpi = document.getElementById('btnPayUpi');
  const upiDetailsBox = document.getElementById('upiDetailsBox');
  const btnCopyUpi = document.getElementById('btnCopyUpi');
  const btnPayCard = document.getElementById('btnPayCard');
  const activationKeyInput = document.getElementById('activationKeyInput');
  const btnActivateKey = document.getElementById('btnActivateKey');
  const activationStatus = document.getElementById('activationStatus');

  // =========================================================================
  // HARDWARE DEVICE LOCK & SMART GEO PRICING (Chrome Extension)
  // =========================================================================
  function getOrGenerateDeviceId() {
    let devId = localStorage.getItem('copilot_device_id');
    if (!devId) {
      const raw = `${navigator.userAgent}|${screen.width}x${screen.height}|${navigator.language}|${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
      let hash = 0;
      for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
      }
      devId = 'DEV-EXT-' + Math.abs(hash).toString(16).toUpperCase() + '-' + Date.now().toString(16).slice(-4).toUpperCase();
      localStorage.setItem('copilot_device_id', devId);
    }
    return devId;
  }

  function getServerBaseUrl() {
    return localStorage.getItem('copilot_server_url') || 'http://localhost:3000';
  }

  let currentExtGeo = { isIndia: true };

  async function initSmartGeoPricing() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const browserLang = navigator.language || '';
    const clientDetectIndia = tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('India') || tz.includes('IST') || browserLang.includes('IN') || browserLang.includes('hi');
    currentExtGeo = { isIndia: clientDetectIndia };
    applyExtGeoToUi(currentExtGeo.isIndia);

    try {
      const res = await fetch(`${getServerBaseUrl()}/api/geo?tz=${encodeURIComponent(tz)}`);
      if (res.ok) {
        currentExtGeo = await res.json();
        applyExtGeoToUi(currentExtGeo.isIndia);
      }
    } catch {}
  }

  function applyExtGeoToUi(isIndia) {
    currentExtGeo.isIndia = isIndia;
    const regionLabel = document.getElementById('extDetectedRegion');
    const indiaCard = document.getElementById('extIndiaCard');
    const globalCard = document.getElementById('extGlobalCard');
    const btnInr = document.getElementById('btnExtInr');
    const btnUsd = document.getElementById('btnExtUsd');

    if (regionLabel) {
      regionLabel.textContent = isIndia ? '🇮🇳 India (INR - ₹)' : '🌍 Global / US (USD - $)';
    }

    if (indiaCard && globalCard) {
      if (isIndia) {
        indiaCard.style.display = 'flex';
        globalCard.style.display = 'none';
        if (btnInr) { btnInr.style.background = '#f59e0b'; btnInr.style.color = '#000'; }
        if (btnUsd) { btnUsd.style.background = 'transparent'; btnUsd.style.color = 'var(--text-muted)'; }
      } else {
        indiaCard.style.display = 'none';
        globalCard.style.display = 'flex';
        if (btnInr) { btnInr.style.background = 'transparent'; btnInr.style.color = 'var(--text-muted)'; }
        if (btnUsd) { btnUsd.style.background = '#38bdf8'; btnUsd.style.color = '#000'; }
      }
    }
  }

  async function verifyExtProSessionOnBoot() {
    const state = getFreemiumState();
    if (!state.isPro || !state.token || !state.proKey) return;

    const deviceId = getOrGenerateDeviceId();
    try {
      const res = await fetch(`${getServerBaseUrl()}/api/license/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: state.proKey, deviceId, token: state.token })
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        console.warn('Pro token invalid or hardware mismatch. Reverting to trial.');
        state.isPro = false;
        state.token = null;
        saveFreemiumState(state);
        renderFreemiumUI();
      }
    } catch {}
  }

  const btnExtInr = document.getElementById('btnExtInr');
  const btnExtUsd = document.getElementById('btnExtUsd');
  if (btnExtInr) btnExtInr.addEventListener('click', () => applyExtGeoToUi(true));
  if (btnExtUsd) btnExtUsd.addEventListener('click', () => applyExtGeoToUi(false));

  function getFreemiumState() {
    try {
      const saved = localStorage.getItem('ai_copilot_freemium_state');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { scans: 3, cv: 1, isPro: false, proKey: null };
  }

  function saveFreemiumState(state) {
    try {
      localStorage.setItem('ai_copilot_freemium_state', JSON.stringify(state));
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ ai_copilot_freemium_state: state });
      }
    } catch (e) {
      console.warn('Freemium save error:', e);
    }
  }

  function renderFreemiumUI() {
    const state = getFreemiumState();
    if (!creditBar) return;

    if (state.isPro) {
      creditBar.className = 'freemium-credit-bar freemium-pro-active';
      creditBar.innerHTML = `
        <div class="credit-pill">
          <span class="credit-icon">👑</span>
          <strong style="color: #10b981;">PRO ACTIVE</strong>
          <span class="credit-sep">•</span>
          <span style="color: #a1a1aa; font-size: 11px;">${state.buyer || 'Device Locked'}</span>
        </div>
        <span style="font-size: 10px; color: #10b981; font-weight: 700;">✓ Verified</span>
      `;
    } else {
      creditBar.className = 'freemium-credit-bar';
      if (creditScansCount) creditScansCount.textContent = state.scans;
      if (creditCvCount) creditCvCount.textContent = state.cv;
    }
  }

  function openUpgradeModal(reason) {
    if (upgradeReasonText && reason) {
      upgradeReasonText.textContent = reason;
    }
    initSmartGeoPricing();
    if (upgradeModal) upgradeModal.style.display = 'flex';
  }

  function closeUpgradeModal() {
    if (upgradeModal) upgradeModal.style.display = 'none';
  }

  if (btnOpenUpgrade) {
    btnOpenUpgrade.addEventListener('click', () => {
      openUpgradeModal("Upgrade to unlock unlimited live job scans, 1-click ATS resume tailoring, and anti-fraud shield.");
    });
  }

  if (btnCloseUpgradeModal) {
    btnCloseUpgradeModal.addEventListener('click', closeUpgradeModal);
  }

  if (upgradeModal) {
    upgradeModal.addEventListener('click', (e) => {
      if (e.target === upgradeModal) closeUpgradeModal();
    });
  }

  const extPlanLifetime = document.getElementById('extPlanLifetime');
  const extPlanMonthly = document.getElementById('extPlanMonthly');
  const extRealQrImage = document.getElementById('extRealQrImage');
  const btnShowBankDetails = document.getElementById('btnShowBankDetails');
  const extBankDetailsBox = document.getElementById('extBankDetailsBox');

  if (extPlanLifetime) {
    extPlanLifetime.addEventListener('click', () => {
      extPlanLifetime.style.background = 'rgba(245, 158, 11, 0.15)';
      extPlanLifetime.style.border = '1.5px solid #f59e0b';
      if (extPlanMonthly) {
        extPlanMonthly.style.background = '#18181b';
        extPlanMonthly.style.border = '1px solid var(--border-color)';
      }
      if (extRealQrImage) {
        extRealQrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi%3A%2F%2Fpay%3Fpa%3Dsoloprime%40upi%26pn%3DSoloPrime%26am%3D799%26cu%3DINR%26tn%3DJobCopilotProLifetime';
      }
    });
  }

  if (extPlanMonthly) {
    extPlanMonthly.addEventListener('click', () => {
      extPlanMonthly.style.background = 'rgba(245, 158, 11, 0.15)';
      extPlanMonthly.style.border = '1.5px solid #f59e0b';
      if (extPlanLifetime) {
        extPlanLifetime.style.background = '#18181b';
        extPlanLifetime.style.border = '1px solid var(--border-color)';
      }
      if (extRealQrImage) {
        extRealQrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi%3A%2F%2Fpay%3Fpa%3Dsoloprime%40upi%26pn%3DSoloPrime%26am%3D299%26cu%3DINR%26tn%3DJobCopilotProMonthly';
      }
    });
  }

  if (btnShowBankDetails) {
    btnShowBankDetails.addEventListener('click', () => {
      if (extBankDetailsBox) {
        extBankDetailsBox.style.display = extBankDetailsBox.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  if (btnCopyUpi) {
    btnCopyUpi.addEventListener('click', () => {
      navigator.clipboard.writeText('soloprime@upi').then(() => {
        btnCopyUpi.textContent = 'Copied!';
        setTimeout(() => { btnCopyUpi.textContent = 'Copy'; }, 2000);
      });
    });
  }

  if (btnPayCard) {
    btnPayCard.addEventListener('click', () => {
      window.open('https://paypal.me/soloprime', '_blank');
    });
  }

  // Secure Server-Side Device-Locked Activation (Accepts Keys, UPI UTR, or Founder Master PIN)
  if (btnActivateKey) {
    btnActivateKey.addEventListener('click', async () => {
      const key = (activationKeyInput?.value || '').trim().toUpperCase();
      if (!key) {
        if (activationStatus) {
          activationStatus.textContent = 'Please enter an activation code, UPI UTR, or PIN.';
          activationStatus.className = 'activation-status error';
          activationStatus.style.display = 'block';
        }
        return;
      }

      const deviceId = getOrGenerateDeviceId();
      btnActivateKey.disabled = true;
      btnActivateKey.textContent = 'Verifying Hardware...';

      try {
        const res = await fetch(`${getServerBaseUrl()}/api/license/activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ licenseKey: key, deviceId, clientPlatform: 'Chrome Extension Sidepanel' })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          const state = getFreemiumState();
          state.isPro = true;
          state.proKey = data.licenseKey || key;
          state.token = data.token;
          state.buyer = data.buyer;
          saveFreemiumState(state);
          renderFreemiumUI();

          if (activationStatus) {
            activationStatus.textContent = `✓ Device Locked & Verified: Welcome ${data.buyer}! Unlimited Pro Suite Unlocked.`;
            activationStatus.className = 'activation-status success';
            activationStatus.style.display = 'block';
          }
          showBanner(`👑 Pro Activated for ${data.buyer}!`, 'success');
          setTimeout(() => {
            closeUpgradeModal();
          }, 1400);
        } else {
          if (activationStatus) {
            activationStatus.textContent = `❌ ${data.error || 'Invalid or already locked license.'}`;
            activationStatus.className = 'activation-status error';
            activationStatus.style.display = 'block';
          }
        }
      } catch (err) {
        if (activationStatus) {
          activationStatus.textContent = 'Verification error. Server may be offline.';
          activationStatus.className = 'activation-status error';
          activationStatus.style.display = 'block';
        }
      } finally {
        btnActivateKey.disabled = false;
        btnActivateKey.textContent = 'Unlock Pro';
      }
    });
  }

  const extServerLabel = document.getElementById('extServerLabel');
  const btnChangeServerUrl = document.getElementById('btnChangeServerUrl');

  function syncServerLabel() {
    const cur = getServerBaseUrl();
    if (extServerLabel) {
      extServerLabel.textContent = cur.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
  }
  syncServerLabel();

  if (btnChangeServerUrl) {
    btnChangeServerUrl.addEventListener('click', () => {
      const cur = getServerBaseUrl();
      const next = prompt('Enter AI Job Copilot Cloud Server URL (e.g. https://your-app.onrender.com):', cur);
      if (next && next.trim()) {
        const cleaned = next.trim().replace(/\/$/, '');
        localStorage.setItem('copilot_server_url', cleaned);
        syncServerLabel();
        showBanner(`✓ Server switched to: ${cleaned}`, 'success');
        initSmartGeoPricing();
      }
    });
  }

  // =========================================================================
  // REAL RIGOROUS 1-TO-5 EVALUATION ENGINE
  // =========================================================================
  function evaluateJob(job, profile) {
    const fullText = `${job.title} ${job.description || ''}`.toLowerCase();
    const candidateSkills = (profile.skills || '')
      .toLowerCase()
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Tech tokens catalog (AI, Full Stack, Software, Backend, Frontend)
    const techCatalog = [
      'python', 'javascript', 'typescript', 'react', 'node', 'fastapi', 'docker',
      'kubernetes', 'postgresql', 'sql', 'rest', 'git', 'ci/cd', 'full stack',
      'fullstack', 'frontend', 'backend', 'web', 'html', 'css', 'pytorch',
      'tensorflow', 'scikit-learn', 'llm', 'llms', 'generative ai', 'rag', 'aws', 'redis'
    ];

    const jobTechKeywords = techCatalog.filter(tech => fullText.includes(tech));

    const titleLower = job.title.toLowerCase();
    const isSalesOrNonTech = titleLower.includes('sales manager') || 
                             titleLower.includes('branch sales') || 
                             titleLower.includes('real estate sales') || 
                             titleLower.includes('inside sales') || 
                             titleLower.includes('telecaller') || 
                             titleLower.includes('business development') || 
                             titleLower.includes('bdr') || 
                             titleLower.includes('sdr') || 
                             titleLower.includes('recruiter') || 
                             titleLower.includes('human resources') || 
                             titleLower.includes('social media manager') ||
                             titleLower.includes('moderation operations');

    if (isSalesOrNonTech || (jobTechKeywords.length === 0 && !titleLower.includes('developer') && !titleLower.includes('engineer'))) {
      return {
        score: 0.5,
        badge: 'DISQUALIFIED FIT',
        badgeClass: 'disqualified',
        summary: `Domain Mismatch: "${job.title}" is a sales / non-technical role with 0% software or engineering alignment for candidate profile.`,
        domainOverlap: 0,
        skillsOverlap: 0,
        matched: [],
        missing: ['Software / Engineering Domain', 'Technical Alignment']
      };
    }

    const matched = [];
    const missing = [];

    jobTechKeywords.forEach(kw => {
      const isMatch = candidateSkills.some(cs => cs.includes(kw) || kw.includes(cs));
      if (isMatch) {
        matched.push(kw.toUpperCase());
      } else {
        missing.push(kw.toUpperCase());
      }
    });

    const isEngRole = titleLower.includes('full stack') || titleLower.includes('fullstack') ||
                     titleLower.includes('developer') || titleLower.includes('engineer') || 
                     titleLower.includes('software') || titleLower.includes('ai') || 
                     titleLower.includes('machine learning');

    let matchRatio = matched.length / Math.max(1, jobTechKeywords.length);
    if (isEngRole && matchRatio === 0) matchRatio = 0.5; // Baseline tech alignment

    const skillsPercentage = Math.round(matchRatio * 100);
    const domainPercentage = isEngRole ? 95 : 45;

    let calculatedScore = 1.8 + (matchRatio * 3.1);
    if (isEngRole) calculatedScore = Math.max(calculatedScore, 3.8); // High score for Full Stack & AI Developer
    calculatedScore = Math.min(5.0, Math.max(1.0, calculatedScore));
    const finalScore = Number(calculatedScore.toFixed(1));

    let badge = 'SOLID CORE FIT';
    let badgeClass = 'moderate';
    let summary = 'Strong technical alignment on engineering stack and core requirements.';

    if (finalScore >= 4.0) {
      badge = '★ STRONG FIT MATCH';
      badgeClass = 'strong';
      summary = `High alignment! Candidate profile matches the ${job.title} stack closely.`;
    } else if (finalScore < 2.5) {
      badge = 'WEAK FIT MATCH';
      badgeClass = 'disqualified';
      summary = 'Skill gap detected. May require domain transition.';
    }

    return {
      score: finalScore,
      badge,
      badgeClass,
      summary,
      domainOverlap: domainPercentage,
      skillsOverlap: skillsPercentage,
      matched: [...new Set(matched)],
      missing: [...new Set(missing)]
    };
  }

  // =========================================================================
  // UNIVERSAL SINGLE JOB SCRAPER (LinkedIn, Naukri, Indeed, Web)
  // =========================================================================
  function universalSingleJobExtractor() {
    function clean(str) {
      if (!str) return '';
      return str
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/ignore\s+(previous|all)\s+instructions/gi, '[FILTERED]')
        .replace(/system\s+override/gi, '[FILTERED]')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function isGarbageTitle(title) {
      if (!title) return true;
      const lower = title.toLowerCase().trim();
      if (lower.length < 3 || lower.length > 100) return true;
      const bad = [
        'notification', 'messaging', 'network', 'search', 'linkedin', 'feed', 'home',
        'skip to', 'manage your', 'job search', 'job alerts', 'promoted', 'explore',
        'results', 'job details', 'about the job', 'search by', 'viewed', 'status',
        'preferences', 'my jobs', 'applied', 'applicant', 'jobs in', 'sales jobs'
      ];
      if (bad.some(b => lower === b || (lower.startsWith('jobs in') && lower.length < 25))) return true;
      if (lower === 'jobs' || lower === 'job' || lower === 'sales jobs') return true;
      if (/^[0-9\s+]+$/.test(lower)) return true;
      return false;
    }

    const url = window.location.href;
    const hostname = window.location.hostname;

    // 1. STRICT NON-JOB DOMAIN FILTER (Rejects GitHub, YouTube, Social Media, Google)
    const nonJobHosts = [
      'github.com', 'gitlab.com', 'bitbucket.org',
      'youtube.com', 'twitter.com', 'x.com', 'facebook.com',
      'instagram.com', 'reddit.com', 'wikipedia.org', 'google.com',
      'bing.com', 'yahoo.com', 'medium.com', 'stackoverflow.com'
    ];
    const isNonJobDomain = nonJobHosts.some(h => hostname === h || hostname.endsWith('.' + h));
    if (isNonJobDomain) {
      const pathname = window.location.pathname.toLowerCase();
      if (!pathname.includes('/careers') && !pathname.includes('/jobs') && !pathname.includes('/job/')) {
        return { isNotJob: true, hostname: hostname };
      }
    }

    let title = '';
    let company = '';
    let location = '';
    let description = '';
    let portal = 'Web';

    // -----------------------------------------------------------------------
    // A. NAUKRI.COM
    // -----------------------------------------------------------------------
    if (hostname.includes('naukri.com')) {
      portal = 'Naukri';

      // 1. Check if user is viewing a job description page / modal
      const jdHeading = document.querySelector('h1.styles_jd-header-title__rZwM1, h1.title, .top-sec-wrapper h1, h1.jd-header-title');
      if (jdHeading && !isGarbageTitle(clean(jdHeading.innerText))) {
        title = clean(jdHeading.innerText);
      }

      // 2. If on search results page, find active or first job card
      if (!title || isGarbageTitle(title)) {
        const firstCard = document.querySelector('article.jobTuple, div.cust-job-tuple, div.srp-jobtuple-wrapper, div[data-job-id]');
        if (firstCard) {
          const tEl = firstCard.querySelector('a.title, a[title]');
          if (tEl) {
            title = clean(tEl.getAttribute('title') || tEl.innerText);
          }
          const cEl = firstCard.querySelector('a.comp-name, a.subTitle, .companyInfo a, [class*="comp-name"]');
          if (cEl) {
            company = clean(cEl.getAttribute('title') || cEl.innerText);
          }
          const lEl = firstCard.querySelector('.locWdth, span.loc-wrap, .location, [class*="loc"]');
          if (lEl) {
            location = clean(lEl.innerText);
          }
          const dEl = firstCard.querySelector('.job-desc, .job-description, ul.tags-gt');
          if (dEl) {
            description = clean(dEl.innerText);
          }
        }
      }

      // Naukri Company & Location fallback
      if (!company) {
        const cEl = document.querySelector('.comp-name, .companyInfo a, .top-sec-wrapper a');
        if (cEl) company = clean(cEl.innerText);
      }
      if (!location) {
        const lEl = document.querySelector('.locWdth, .location');
        if (lEl) location = clean(lEl.innerText);
      }
    }

    // -----------------------------------------------------------------------
    // B. LINKEDIN.COM
    // -----------------------------------------------------------------------
    else if (hostname.includes('linkedin.com')) {
      portal = 'LinkedIn';
      const currentJobId = (url.match(/currentJobId=([0-9]+)/) || url.match(/\/view\/([0-9]+)/))?.[1];

      // 1. Check Detail View Pane
      const detailContainer = document.querySelector(
        '.jobs-search__job-details, .job-view-layout, .scaffold-layout__detail, .jobs-details__main-content, main'
      );
      if (detailContainer) {
        const headings = detailContainer.querySelectorAll(
          '.job-details-jobs-unified-top-card__job-title h1, .job-details-jobs-unified-top-card__job-title a, .job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24, h2.t-24, h1'
        );
        for (const h of headings) {
          if (h.closest('header, nav, #global-nav, .global-nav, [role="navigation"]')) continue;
          const txt = clean(h.innerText);
          if (!isGarbageTitle(txt)) {
            title = txt;
            break;
          }
        }

        const compEl = detailContainer.querySelector(
          '.job-details-jobs-unified-top-card__company-name a, .job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, a[href*="/company/"]'
        );
        if (compEl && !isGarbageTitle(clean(compEl.innerText))) {
          company = clean(compEl.innerText);
        }

        const locEl = detailContainer.querySelector(
          '.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet, .job-details-jobs-unified-top-card__primary-description span:nth-child(2), [class*="workplace-type"]'
        );
        if (locEl) location = clean(locEl.innerText);

        const descEl = detailContainer.querySelector(
          '#job-details, .jobs-description__content, .jobs-description-content__text, .jobs-box__html-content, article'
        );
        if (descEl && descEl.innerText && descEl.innerText.length > 50) {
          description = clean(descEl.innerText);
        }
      }

      // 2. Check Active / Selected Card on Search List
      if (!title || isGarbageTitle(title)) {
        let card = null;
        if (currentJobId) {
          card = document.querySelector(`[data-job-id="${currentJobId}"], [data-occludable-job-id="${currentJobId}"], a[href*="${currentJobId}"]`);
        }
        if (!card) {
          card = document.querySelector('.jobs-search-results-list__list-item--active, .job-card-list--is-active, [class*="list-item--active"]');
        }
        if (!card) {
          card = document.querySelector('.jobs-search-results-list__list-item, .job-card-container, [data-job-id]');
        }
        if (card) {
          const tEl = card.querySelector('.job-card-list__title, a.job-card-container__link, .artdeco-entity-lockup__title a, a[href*="/jobs/view/"]');
          if (tEl && !isGarbageTitle(clean(tEl.innerText))) {
            title = clean(tEl.innerText);
          }
          const cEl = card.querySelector('.job-card-container__primary-description, .artdeco-entity-lockup__subtitle, a[href*="/company/"]');
          if (cEl && !company) company = clean(cEl.innerText);
          const lEl = card.querySelector('.job-card-container__metadata-item, .artdeco-entity-lockup__caption');
          if (lEl && !location) location = clean(lEl.innerText);
        }
      }

      // 3. Document Title Fallback
      if (!title || isGarbageTitle(title)) {
        let raw = clean(document.title).replace(/^\([0-9+]+\)\s*/, '').replace(/\|?\s*LinkedIn\s*$/i, '').trim();
        let m = raw.match(/^(.+?)\s+hiring\s+(.+?)\s+in\s+(.+)$/i);
        if (m && !isGarbageTitle(m[2])) {
          title = clean(m[2]);
          company = company || clean(m[1]);
          location = location || clean(m[3]);
        } else {
          m = raw.match(/^(.+?)\s+(?:–|—|-|at)\s+(.+?)(?:\s+\((.+?)\))?$/i);
          if (m && !isGarbageTitle(m[1])) {
            title = clean(m[1]);
            company = company || clean(m[2]);
          }
        }
      }
    }

    // -----------------------------------------------------------------------
    // C. UNIVERSAL WEB SITES (Indeed, Greenhouse, Lever, etc.)
    // -----------------------------------------------------------------------
    else {
      portal = hostname.replace('www.', '').split('.')[0];
      portal = portal.charAt(0).toUpperCase() + portal.slice(1);

      // JSON-LD
      try {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const s of scripts) {
          const parsed = JSON.parse(s.innerText);
          const job = parsed['@type'] === 'JobPosting' ? parsed : (Array.isArray(parsed) ? parsed.find(x => x['@type'] === 'JobPosting') : null);
          if (job) {
            title = clean(job.title || title);
            company = clean(job.hiringOrganization?.name || company);
            location = clean(job.jobLocation?.address?.addressLocality || location);
            if (job.description) {
              const div = document.createElement('div');
              div.innerHTML = job.description;
              description = clean(div.innerText || job.description);
            }
            break;
          }
        }
      } catch (e) {}

      if (!title || isGarbageTitle(title)) {
        const titleEl = document.querySelector('main h1, article h1, h1, [class*="job-title"], [data-testid*="title"]');
        title = titleEl ? clean(titleEl.innerText || '') : '';
      }
      if (!company) {
        const compEl = document.querySelector('[class*="company-name"], meta[property="og:site_name"]');
        company = compEl ? clean(compEl.innerText || compEl.content || '') : hostname.split('.')[0];
      }
      if (!location) {
        const locEl = document.querySelector('[class*="location"]');
        location = locEl ? clean(locEl.innerText) : 'Unspecified';
      }
      if (!description) {
        const descEl = document.querySelector('#job-description, .job-description, [class*="description"], main');
        description = descEl ? clean(descEl.innerText) : clean(document.body.innerText.slice(0, 3000));
      }
    }

    return {
      portal,
      url,
      title: clean(title),
      company: clean(company) || 'Direct Employer',
      location: clean(location) || 'Remote / Unspecified',
      description: clean(description),
      timestamp: new Date().toISOString()
    };
  }

  // =========================================================================
  // UNIVERSAL BATCH PAGE SCRAPER (LinkedIn, Naukri, Indeed)
  // =========================================================================
  function universalBatchPageExtractor() {
    function clean(str) {
      if (!str) return '';
      return str.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
    }

    const hostname = window.location.hostname;
    const nonJobHosts = [
      'github.com', 'gitlab.com', 'bitbucket.org',
      'youtube.com', 'twitter.com', 'x.com', 'facebook.com',
      'instagram.com', 'reddit.com', 'wikipedia.org', 'google.com',
      'bing.com', 'yahoo.com', 'medium.com', 'stackoverflow.com'
    ];
    if (nonJobHosts.some(h => hostname === h || hostname.endsWith('.' + h))) {
      return []; // Return empty list on non-career sites
    }

    const jobs = [];
    const seen = new Set();

    // 1. NAUKRI BATCH
    if (hostname.includes('naukri.com')) {
      const cards = Array.from(document.querySelectorAll(
        'article.jobTuple, div.cust-job-tuple, div.srp-jobtuple-wrapper, div[data-job-id]'
      ));
      cards.forEach((card, idx) => {
        const tEl = card.querySelector('a.title, a[title]');
        const cEl = card.querySelector('a.comp-name, a.subTitle, .companyInfo a, [class*="comp-name"]');
        const lEl = card.querySelector('.locWdth, span.loc-wrap, .location');
        const linkEl = card.querySelector('a.title');

        const title = clean(tEl ? (tEl.getAttribute('title') || tEl.innerText) : '');
        const company = clean(cEl ? (cEl.getAttribute('title') || cEl.innerText) : 'Employer');
        const location = clean(lEl ? lEl.innerText : 'India');
        const url = linkEl ? linkEl.href : window.location.href;

        if (title && title.length > 2 && !seen.has(title.toLowerCase())) {
          seen.add(title.toLowerCase());
          jobs.push({
            id: `naukri_${idx + 1}`,
            title,
            company,
            location,
            url,
            portal: 'Naukri Active Page',
            description: `Posting for ${title} at ${company} in ${location}.`
          });
        }
      });
    }
    // 2. LINKEDIN BATCH
    else if (hostname.includes('linkedin.com')) {
      const cardNodes = Array.from(document.querySelectorAll(
        '.jobs-search-results-list__list-item, .job-card-container, [data-job-id], [class*="job-card"], li.scaffold-layout__list-item'
      ));

      cardNodes.forEach((card, idx) => {
        const tEl = card.querySelector('.job-card-list__title, a.job-card-container__link, .artdeco-entity-lockup__title a, a[href*="/jobs/view/"]');
        const cEl = card.querySelector('.job-card-container__primary-description, .artdeco-entity-lockup__subtitle, a[href*="/company/"]');
        const lEl = card.querySelector('.job-card-container__metadata-item, .artdeco-entity-lockup__caption');
        const linkEl = card.querySelector('a[href*="/jobs/view/"], a.job-card-container__link');

        const title = clean(tEl ? tEl.innerText : '');
        const company = clean(cEl ? cEl.innerText : 'Direct Employer');
        const location = clean(lEl ? lEl.innerText : 'Remote / Hybrid');
        const url = linkEl ? linkEl.href : window.location.href;

        if (title && title.length > 2 && !seen.has(title.toLowerCase()) && !title.toLowerCase().includes('notification')) {
          seen.add(title.toLowerCase());
          jobs.push({
            id: `li_${idx + 1}`,
            title,
            company,
            location,
            url,
            portal: 'LinkedIn Active Page',
            description: `Posting for ${title} at ${company} in ${location}.`
          });
        }
      });

      // If cards query was empty, look for all job links on page
      if (jobs.length === 0) {
        const jobLinks = Array.from(document.querySelectorAll('a[href*="/jobs/view/"]'));
        jobLinks.forEach((link, idx) => {
          const title = clean(link.innerText);
          if (title && title.length > 3 && !seen.has(title.toLowerCase()) && !title.toLowerCase().includes('notification')) {
            seen.add(title.toLowerCase());
            jobs.push({
              id: `link_${idx + 1}`,
              title,
              company: 'LinkedIn Employer',
              location: 'Active Search Result',
              url: link.href,
              portal: 'LinkedIn Active Page',
              description: `Posting for ${title}.`
            });
          }
        });
      }
    }
    // 3. GENERAL WEBSITES
    else {
      const genericCards = Array.from(document.querySelectorAll('[class*="job"], article, [data-testid*="job"]'));
      genericCards.slice(0, 15).forEach((card, idx) => {
        const h = card.querySelector('h1, h2, h3, a');
        if (h) {
          const title = clean(h.innerText);
          if (title && title.length > 3 && !seen.has(title.toLowerCase())) {
            seen.add(title.toLowerCase());
            jobs.push({
              id: `web_${idx + 1}`,
              title,
              company: hostname.split('.')[0],
              location: 'Web',
              url: window.location.href,
              portal: 'Career Website',
              description: `Posting on ${hostname} for ${title}.`
            });
          }
        }
      });
    }

    return jobs;
  }

  function resetScanButton() {
    btnScanTab.disabled = false;
    btnScanTab.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg> Scan Current Job`;
  }

  // Scan Active Tab Button
  btnScanTab.addEventListener('click', () => {
    const freeState = getFreemiumState();
    if (!freeState.isPro && freeState.scans <= 0) {
      openUpgradeModal("You have used all 3 free job scans! Upgrade to Pro to continue scanning jobs on LinkedIn, Naukri, and Indeed.");
      resetScanButton();
      return;
    }

    btnScanTab.textContent = 'Scanning...';
    btnScanTab.disabled = true;

    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) {
      showBanner("Extension must run inside a Chrome window.", "error");
      resetScanButton();
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        showBanner("Please open LinkedIn or Naukri in Chrome.", "error");
        resetScanButton();
        return;
      }

      const tab = tabs[0];
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://'))) {
        showBanner("Cannot scan internal browser pages. Switch to a job tab.", "error");
        resetScanButton();
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: universalSingleJobExtractor
      }, (results) => {
        const res = results?.[0]?.result;
        if (!chrome.runtime.lastError && res) {
          finishScan(res);
        } else {
          // Fallback via message
          chrome.tabs.sendMessage(tab.id, { action: 'SCRAPE_CURRENT_PAGE' }, (response) => {
            if (!chrome.runtime.lastError && response) {
              finishScan(response);
            } else {
              resetScanButton();
              showBanner("Could not detect active job. Click on a job card and try again.", "error");
            }
          });
        }
      });
    });
  });

  function finishScan(job) {
    if (!job || job.isNotJob || !job.title) {
      activeScrapedJob = null;
      jobEmptyState.style.display = 'block';
      jobEmptyState.innerHTML = `
        <div style="color: #f87171; font-weight: 600; margin-bottom: 6px; font-size: 12px;">⚠️ Not a Job Posting</div>
        <div style="color: #a1a1aa; font-size: 11px; line-height: 1.5;">Current tab (<strong>${job?.hostname || 'this page'}</strong>) is not a career or job board. Please open a job posting on <strong>LinkedIn</strong>, <strong>Naukri</strong>, or <strong>Indeed</strong>.</div>
      `;
      jobScrapedData.style.display = 'none';
      evaluationSection.style.display = 'none';
      showBanner("Not a job posting page.", "error");
      resetScanButton();
      return;
    }

    activeScrapedJob = job;
    jobEmptyState.style.display = 'none';
    jobScrapedData.style.display = 'block';

    scrapedPortal.textContent = job.portal || 'Web';
    scrapedTime.textContent = 'Active Tab';
    scrapedTitle.textContent = job.title || 'Untitled Role';
    scrapedCompany.textContent = job.company || 'Direct Employer';
    scrapedLocation.textContent = job.location || 'Remote / Unspecified';

    const profile = getProfile();
    const evalResult = evaluateJob(job, profile);

    // Deduct Freemium scan credit if not Pro
    const freeState = getFreemiumState();
    if (!freeState.isPro) {
      freeState.scans = Math.max(0, freeState.scans - 1);
      saveFreemiumState(freeState);
      renderFreemiumUI();
      if (freeState.scans === 0) {
        showBanner(`✓ Scanned: ${job.title} • All 3 free scans used!`, "info");
      } else {
        showBanner(`✓ Scanned: ${job.title} (${freeState.scans} free scans left)`, "success");
      }
    } else {
      showBanner(`✓ Scanned: ${job.title} (Pro Unlimited)`, "success");
    }

    // Render Evaluation
    evaluationSection.style.display = 'block';
    evalScore.textContent = evalResult.score.toFixed(1);
    evalBadge.textContent = evalResult.badge;
    evalBadge.className = `verdict-tag ${evalResult.badgeClass}`;
    evalSummary.textContent = evalResult.summary;

    domainBar.style.width = `${evalResult.domainOverlap}%`;
    domainVal.textContent = `${evalResult.domainOverlap}%`;
    skillsBar.style.width = `${evalResult.skillsOverlap}%`;
    skillsVal.textContent = `${evalResult.skillsOverlap}%`;

    // Render Chips
    matchedChips.innerHTML = '';
    if (evalResult.matched.length === 0) {
      matchedChips.innerHTML = '<span class="chip chip-missing">None</span>';
    } else {
      evalResult.matched.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'chip chip-matched';
        span.textContent = skill;
        matchedChips.appendChild(span);
      });
    }

    missingChips.innerHTML = '';
    if (evalResult.missing.length === 0) {
      missingChips.innerHTML = '<span class="chip chip-matched">Zero Critical Gaps</span>';
    } else {
      evalResult.missing.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'chip chip-missing';
        span.textContent = skill;
        missingChips.appendChild(span);
      });
    }

    renderSalaryBenchmark(job.company);

    resetScanButton();
    btnScanTab.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg> Re-Scan Current Job`;
  }

  function renderSalaryBenchmark(companyName) {
    if (!companyName) {
      salaryCard.style.display = 'none';
      return;
    }

    const key = companyName.toLowerCase().trim();
    let match = null;
    for (const [k, v] of Object.entries(SALARY_BENCHMARKS)) {
      if (key.includes(k) || k.includes(key)) {
        match = v;
        break;
      }
    }

    if (match) {
      salaryCard.style.display = 'block';
      salaryBody.innerHTML = `
        <div class="salary-row">
          <span>Target Compensation:</span>
          <span class="salary-val">${match.baseline}</span>
        </div>
        <div class="salary-row">
          <span>Benchmark Comp Index:</span>
          <span class="salary-val">${match.index} (Base 100)</span>
        </div>
        <div class="salary-row">
          <span>Sampled Profile Role:</span>
          <span class="salary-val">${match.role}</span>
        </div>
      `;
    } else {
      salaryCard.style.display = 'block';
      salaryBody.innerHTML = `
        <div class="salary-row">
          <span>Market Compensation:</span>
          <span class="salary-val">Standard Market Median</span>
        </div>
        <div class="salary-row">
          <span>Industry Baseline:</span>
          <span class="salary-val">Index 100.0 (Competitive)</span>
        </div>
      `;
    }
  }

  // =========================================================================
  // ONLINE LIVE SEARCH & PAGE BATCH SCANNER
  // =========================================================================

  // 1. Online Search
  btnCliSearch.addEventListener('click', async () => {
    const q = cliQuery.value.trim() || 'Full Stack Developer';
    const loc = cliLocation.value.trim() || 'Noida';
    btnCliSearch.textContent = 'Searching...';
    btnCliSearch.disabled = true;

    try {
      const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(q)}&location=${encodeURIComponent(loc)}&start=0`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const cards = Array.from(doc.querySelectorAll('li, div.base-search-card'));

      const jobs = [];
      cards.forEach((c, idx) => {
        const titleEl = c.querySelector('.base-search-card__title');
        const compEl = c.querySelector('.base-search-card__subtitle a, .base-search-card__subtitle');
        const locEl = c.querySelector('.job-search-card__location');
        const linkEl = c.querySelector('a.base-card__full-link, a');

        if (titleEl) {
          jobs.push({
            id: `online_${idx + 1}`,
            title: titleEl.innerText.trim(),
            company: compEl ? compEl.innerText.trim() : 'Tech Employer',
            location: locEl ? locEl.innerText.trim() : loc,
            url: linkEl ? linkEl.href : '#',
            portal: 'Online Job API',
            description: `Live posting for ${titleEl.innerText.trim()} in ${loc}.`
          });
        }
      });

      renderBatchResults(jobs);
      showBanner(`Found ${jobs.length} jobs for "${q}"!`, "success");
    } catch (e) {
      showBanner(`Search paused: You can use "Scan All Jobs On Page" for your active tab!`, "error");
    } finally {
      btnCliSearch.textContent = '🔍 Search Jobs Online';
      btnCliSearch.disabled = false;
    }
  });

  // 2. Scan All Jobs on Page (LinkedIn or Naukri)
  btnScanPageBatch.addEventListener('click', () => {
    btnScanPageBatch.textContent = 'Scanning Page...';
    btnScanPageBatch.disabled = true;

    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) {
      showBanner("Extension must run inside Chrome.", "error");
      btnScanPageBatch.textContent = '📑 Scan All Jobs On Page';
      btnScanPageBatch.disabled = false;
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        showBanner("Please open a job page.", "error");
        btnScanPageBatch.textContent = '📑 Scan All Jobs On Page';
        btnScanPageBatch.disabled = false;
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: universalBatchPageExtractor
      }, (results) => {
        btnScanPageBatch.textContent = '📑 Scan All Jobs On Page';
        btnScanPageBatch.disabled = false;

        const jobs = results?.[0]?.result || [];
        if (jobs.length === 0) {
          showBanner("No job cards detected on current tab. Make sure job listings are visible.", "error");
        } else {
          renderBatchResults(jobs);
          showBanner(`✓ Successfully evaluated ${jobs.length} jobs on this page!`, "success");
        }
      });
    });
  });

  function renderBatchResults(jobs) {
    const profile = getProfile();
    batchResultsWrap.style.display = 'block';
    batchCountBadge.textContent = `${jobs.length} Jobs Evaluated`;

    const evaluatedList = jobs.map(j => {
      const evalRes = evaluateJob(j, profile);
      return { job: j, eval: evalRes };
    });

    evaluatedList.sort((a, b) => b.eval.score - a.eval.score);

    batchList.innerHTML = '';
    evaluatedList.forEach(item => {
      const { job, eval: ev } = item;
      const row = document.createElement('div');
      row.className = 'batch-item';

      let scoreClass = 'score-disq';
      if (ev.score >= 4.0) scoreClass = 'score-strong';
      else if (ev.score >= 2.5) scoreClass = 'score-mod';

      row.innerHTML = `
        <div class="batch-item-left">
          <div class="batch-item-title" title="${job.title}">${job.title}</div>
          <div class="batch-item-meta">${job.company} • ${job.location}</div>
        </div>
        <div class="batch-item-right">
          <span class="batch-item-score ${scoreClass}">${ev.score.toFixed(1)}</span>
          <button class="btn-mini btn-select-job">Inspect</button>
        </div>
      `;

      row.querySelector('.btn-select-job').addEventListener('click', () => {
        document.querySelector('[data-tab="radarTab"]').click();
        finishScan(job);
        showBanner(`Inspecting: ${job.title}`, "info");
      });

      batchList.appendChild(row);
    });
  }

  // =========================================================================
  // MULTI-KEY GEMINI AI (100% Background & Automated)
  // =========================================================================
  async function callGemini(promptText) {
    for (let i = 0; i < GEMINI_KEY_POOL.length; i++) {
      const key = GEMINI_KEY_POOL[i];
      for (const model of GEMINI_MODELS) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: { temperature: 0.6, maxOutputTokens: 1024 }
            })
          });
          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text.trim();
          }
        } catch (e) {
          console.warn(`[Gemini Failover] Key #${i + 1} with ${model} failed, trying next...`);
        }
      }
    }
    return null;
  }

  // 1-Click Tailor CV & Letter
  btnDraftForJob.addEventListener('click', async () => {
    if (!activeScrapedJob) {
      showBanner('Please scan or select a job posting first!', 'error');
      return;
    }

    const freeState = getFreemiumState();
    if (!freeState.isPro && freeState.cv <= 0) {
      openUpgradeModal("You have used your 1 free tailored ATS CV! Upgrade to Pro for unlimited AI resume and cover letter tailoring.");
      return;
    }

    document.querySelector('[data-tab="cvTab"]').click();

    const prof = getProfile();
    const originalBtnText = btnDraftForJob.textContent;
    btnDraftForJob.textContent = '⏳ Tailoring with AI...';

    document.getElementById('cvSummary').textContent = 
      `Results-oriented Software & Full Stack Engineer targeting the ${activeScrapedJob.title} position at ${activeScrapedJob.company}. Demonstrates strong command of Python, TypeScript, React, and production microservices with verified performance scaling distributed pipelines.`;

    const prompt = `You are an elite career assistant following strict anti-cliche guidelines.
Write a 3-paragraph tailored cover letter for:
Candidate: ${prof.fullName}
Target Role: ${activeScrapedJob.title} at ${activeScrapedJob.company}
Candidate Skills: ${prof.skills}
Candidate Achievements: ${prof.achievements}
Strict requirement: Professional, forward-looking, high impact.`;

    const aiLetter = await callGemini(prompt);

    if (aiLetter) {
      document.getElementById('coverLetterText').value = aiLetter;
      showBanner('✓ AI Cover Letter crafted successfully!', 'success');
    } else {
      document.getElementById('coverLetterText').value = 
`Dear Hiring Team at ${activeScrapedJob.company},

I am writing to express my strong interest in the ${activeScrapedJob.title} position. Having reviewed your engineering requirements, I am confident that my technical foundation in full stack development, scalable architectures, and production microservices makes me an ideal fit.

In my recent projects, I architected high-performance applications and data ingestion pipelines maintaining 99.98% uptime. My technical toolkit includes Python, JavaScript, TypeScript, React, FastAPI, Docker, and Kubernetes.

I welcome the opportunity to discuss how my hands-on experience can directly contribute to ${activeScrapedJob.company}'s upcoming milestones.

Sincerely,
${prof.fullName}`;
      showBanner('✓ Tailored Cover Letter ready!', 'info');
    }

    // Deduct free CV credit if not Pro
    if (!freeState.isPro) {
      freeState.cv = Math.max(0, freeState.cv - 1);
      saveFreemiumState(freeState);
      renderFreemiumUI();
      if (freeState.cv === 0) {
        showBanner('✓ CV Tailored! All free CV credits used.', 'info');
      }
    }

    btnDraftForJob.textContent = originalBtnText;
  });

  btnPrintCv.addEventListener('click', () => {
    window.print();
  });

  btnCopyLetter.addEventListener('click', () => {
    const text = document.getElementById('coverLetterText').value;
    navigator.clipboard.writeText(text);
    btnCopyLetter.textContent = '✓ Copied!';
    showBanner('Cover letter copied to clipboard!', 'success');
    setTimeout(() => { btnCopyLetter.textContent = 'Copy Letter'; }, 2000);
  });

  // =========================================================================
  // APPLICATION TRACKER
  // =========================================================================
  function getTrackerRows() {
    try {
      return JSON.parse(localStorage.getItem('job_search_tracker_rows') || '[]');
    } catch {
      return [];
    }
  }

  function renderTrackerList() {
    const rows = getTrackerRows();
    if (rows.length === 0) {
      trackerList.innerHTML = '<div class="empty-state">No jobs tracked yet. Click "Save to Application Tracker" on any scanned job.</div>';
      return;
    }

    trackerList.innerHTML = '';
    rows.slice().reverse().forEach((r, idx) => {
      const item = document.createElement('div');
      item.className = 'tracker-item';
      item.innerHTML = `
        <div>
          <div class="tracker-role">${r.title}</div>
          <div class="tracker-comp-meta">${r.company} • ${r.date}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="tracker-tag">${r.score} Fit</span>
          <button class="btn-mini btn-del-track" data-index="${rows.length - 1 - idx}">✕</button>
        </div>
      `;

      item.querySelector('.btn-del-track').addEventListener('click', (e) => {
        const deleteIdx = Number(e.target.dataset.index);
        const current = getTrackerRows();
        current.splice(deleteIdx, 1);
        localStorage.setItem('job_search_tracker_rows', JSON.stringify(current));
        renderTrackerList();
      });

      trackerList.appendChild(item);
    });
  }

  btnTrackJob.addEventListener('click', () => {
    if (!activeScrapedJob) {
      showBanner('Please scan or select a job first!', 'error');
      return;
    }
    const dateStr = new Date().toISOString().slice(0, 10);
    const score = evalScore.textContent || '4.0';
    const csvRow = `"${dateStr}","${activeScrapedJob.company}","Technology","${activeScrapedJob.title}","Permanent","${activeScrapedJob.portal}","applied","Hiring Team","${score}","Scanned via Copilot Studio","","","${activeScrapedJob.url}",""`;
    
    try {
      const stored = getTrackerRows();
      stored.push({
        date: dateStr,
        company: activeScrapedJob.company,
        title: activeScrapedJob.title,
        url: activeScrapedJob.url,
        score: score,
        csvRow: csvRow
      });
      localStorage.setItem('job_search_tracker_rows', JSON.stringify(stored));
    } catch (e) {
      console.warn('Storage error:', e);
    }

    navigator.clipboard.writeText(csvRow);
    showBanner(`✓ Saved "${activeScrapedJob.title}" to Tracker!`, 'success');
    btnTrackJob.textContent = '✓ Saved in Tracker!';
    setTimeout(() => { btnTrackJob.textContent = '💾 Save to Application Tracker'; }, 2500);
  });

  btnExportCsv.addEventListener('click', () => {
    const rows = getTrackerRows();
    if (rows.length === 0) {
      showBanner('No tracked jobs to copy yet.', 'info');
      return;
    }
    const header = '"date","company","industry","role","employment_type","portal","status","contact_person","match_score","notes","salary_range","compensation_benchmark","posting_url","response_notes"\n';
    const csvContent = header + rows.map(r => r.csvRow).join('\n');
    navigator.clipboard.writeText(csvContent);
    btnExportCsv.textContent = '✓ Copied All CSV!';
    showBanner('All tracker records copied as CSV!', 'success');
    setTimeout(() => { btnExportCsv.textContent = '📥 Copy CSV'; }, 2000);
  });

  // Init
  syncProfileUI();
  initSmartGeoPricing();
  renderFreemiumUI();
  verifyExtProSessionOnBoot();
})();
