// AI Job Copilot Web UI — Frontend Engine (Full Autonomous Career Suite)
(function () {
  'use strict';

  // Global State
  let activeJobDetail = null;
  let candidateProfile = null;
  let lastInterviewPrepText = "";
  let selectedTone = "executive";
  let interviewCardsData = [];

  // DOM Elements
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const toast = document.getElementById('toast');

  // Search Elements
  const searchForm = document.getElementById('searchForm');
  const inputQuery = document.getElementById('inputQuery');
  const inputLocation = document.getElementById('inputLocation');
  const selectRemote = document.getElementById('selectRemote');
  const selectPortal = document.getElementById('selectPortal');
  const selectLimit = document.getElementById('selectLimit');
  const btnRunSearch = document.getElementById('btnRunSearch');
  const searchLoading = document.getElementById('searchLoading');
  const jobsGrid = document.getElementById('jobsGrid');
  const resultsCount = document.getElementById('resultsCount');
  const directJobId = document.getElementById('directJobId');
  const btnLoadDirectId = document.getElementById('btnLoadDirectId');
  const btnOpenPasteModal = document.getElementById('btnOpenPasteModal');
  const btnExportCsv = document.getElementById('btnExportCsv');
  const btnExportJson = document.getElementById('btnExportJson');

  // Detail Elements
  const detTitle = document.getElementById('detTitle');
  const detCompany = document.getElementById('detCompany');
  const detLocation = document.getElementById('detLocation');
  const detSeniority = document.getElementById('detSeniority');
  const detEmployment = document.getElementById('detEmployment');
  const detIndustries = document.getElementById('detIndustries');
  const detStatus = document.getElementById('detStatus');
  const detDescription = document.getElementById('detDescription');
  const detLiveUrl = document.getElementById('detLiveUrl');
  const detScore = document.getElementById('detScore');
  const detVerdictBadge = document.getElementById('detVerdictBadge');
  const detVerdictSummary = document.getElementById('detVerdictSummary');
  const detDomainBar = document.getElementById('detDomainBar');
  const detDomainVal = document.getElementById('detDomainVal');
  const detSkillsBar = document.getElementById('detSkillsBar');
  const detSkillsVal = document.getElementById('detSkillsVal');
  const detMatchedChips = document.getElementById('detMatchedChips');
  const detMissingChips = document.getElementById('detMissingChips');
  const detSalaryBody = document.getElementById('detSalaryBody');
  const btnTailorFromDetail = document.getElementById('btnTailorFromDetail');
  const btnInterviewFromDetail = document.getElementById('btnInterviewFromDetail');
  const btnTrackFromDetail = document.getElementById('btnTrackFromDetail');

  // Salary Explorer
  const salarySearchInput = document.getElementById('salarySearchInput');
  const btnSearchSalary = document.getElementById('btnSearchSalary');
  const salarySearchResult = document.getElementById('salarySearchResult');

  // Custom Job Paste Elements
  const customPasteCard = document.getElementById('customPasteCard');
  const btnCloseCustomPaste = document.getElementById('btnCloseCustomPaste');
  const btnTogglePasteFromDetail = document.getElementById('btnTogglePasteFromDetail');
  const btnSubmitCustomJob = document.getElementById('btnSubmitCustomJob');
  const customTitle = document.getElementById('customTitle');
  const customCompany = document.getElementById('customCompany');
  const customLocation = document.getElementById('customLocation');
  const customDesc = document.getElementById('customDesc');

  // CV & Letter Elements
  const cvName = document.getElementById('cvName');
  const cvContact = document.getElementById('cvContact');
  const cvSummary = document.getElementById('cvSummary');
  const cvSkills = document.getElementById('cvSkills');
  const cvAchievements = document.getElementById('cvAchievements');
  const letterTargetRole = document.getElementById('letterTargetRole');
  const letterTargetComp = document.getElementById('letterTargetComp');
  const letterTextarea = document.getElementById('letterTextarea');
  const btnPrintPdf = document.getElementById('btnPrintPdf');
  const btnCopyResumeText = document.getElementById('btnCopyResumeText');
  const btnCopyCoverLetter = document.getElementById('btnCopyCoverLetter');
  const btnRegenerateAi = document.getElementById('btnRegenerateAi');
  const btnInterviewFromCv = document.getElementById('btnInterviewFromCv');
  const toneBtns = document.querySelectorAll('.btn-tone');

  // Interview Studio Elements
  const prepTargetTitle = document.getElementById('prepTargetTitle');
  const prepTargetCompany = document.getElementById('prepTargetCompany');
  const prepLoading = document.getElementById('prepLoading');
  const prepRenderedContent = document.getElementById('prepRenderedContent');
  const btnGenerateInterviewNow = document.getElementById('btnGenerateInterviewNow');
  const btnCopyInterviewPrep = document.getElementById('btnCopyInterviewPrep');
  const btnChooseAnotherJobForPrep = document.getElementById('btnChooseAnotherJobForPrep');
  const prepFilterBtns = document.querySelectorAll('.btn-prep-filter');

  // Upskill Hub Elements
  const upskillGapsGrid = document.getElementById('upskillGapsGrid');
  const roadmapTimeline = document.getElementById('roadmapTimeline');
  const btnRefreshUpskill = document.getElementById('btnRefreshUpskill');

  // Tracker & Analytics Elements
  const trackerTableBody = document.getElementById('trackerTableBody');
  const btnCopyAllCsv = document.getElementById('btnCopyAllCsv');
  const statTotalApps = document.getElementById('statTotalApps');
  const statActiveApps = document.getElementById('statActiveApps');
  const statInterviews = document.getElementById('statInterviews');
  const statConvRate = document.getElementById('statConvRate');

  // Communication Modal Elements (/outcome)
  const followupModal = document.getElementById('followupModal');
  const followupModalTitle = document.getElementById('followupModalTitle');
  const followupModalSubtitle = document.getElementById('followupModalSubtitle');
  const followupSubject = document.getElementById('followupSubject');
  const followupBody = document.getElementById('followupBody');
  const btnCloseFollowupModal = document.getElementById('btnCloseFollowupModal');
  const btnCopyFollowupNote = document.getElementById('btnCopyFollowupNote');

  // Profile Form Elements
  const profileForm = document.getElementById('profileForm');
  const profFullName = document.getElementById('profFullName');
  const profEmail = document.getElementById('profEmail');
  const profPhone = document.getElementById('profPhone');
  const profLocation = document.getElementById('profLocation');
  const profHeadline = document.getElementById('profHeadline');
  const profSkills = document.getElementById('profSkills');
  const profAchievements = document.getElementById('profAchievements');
  const btnAutoEnrichProfile = document.getElementById('btnAutoEnrichProfile');

  // =========================================================================
  // FREEMIUM CREDITS & PRO LICENSING (3 Free Searches & 1 Free CV)
  // =========================================================================
  // =========================================================================
  // HARDWARE DEVICE LOCK, SMART GEO PRICING & ANTI-RESELLING ENGINE
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
      devId = 'DEV-' + Math.abs(hash).toString(16).toUpperCase() + '-' + Date.now().toString(16).slice(-4).toUpperCase();
      localStorage.setItem('copilot_device_id', devId);
    }
    return devId;
  }

  let currentGeo = { isIndia: true, currency: 'INR', symbol: '₹' };

  async function initSmartGeoPricing() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const browserLang = navigator.language || '';
    const clientDetectIndia = tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('India') || tz.includes('IST') || browserLang.includes('IN') || browserLang.includes('hi');
    
    currentGeo = {
      isIndia: clientDetectIndia,
      currency: clientDetectIndia ? 'INR' : 'USD',
      symbol: clientDetectIndia ? '₹' : '$'
    };
    applyGeoToUi(currentGeo.isIndia);

    try {
      const res = await fetch(`/api/geo?tz=${encodeURIComponent(tz)}`);
      if (res.ok) {
        currentGeo = await res.json();
        applyGeoToUi(currentGeo.isIndia);
      }
    } catch {}
  }

  function applyGeoToUi(isIndia) {
    currentGeo.isIndia = isIndia;
    const displayRegion = document.getElementById('displayDetectedRegion');
    const footerGeo = document.getElementById('footerGeoBadge');
    const indiaCard = document.getElementById('indiaPlanCard');
    const globalCard = document.getElementById('globalPlanCard');
    const btnInr = document.getElementById('btnSwitchToInr');
    const btnUsd = document.getElementById('btnSwitchToUsd');

    const regionText = isIndia ? '🇮🇳 India (INR - ₹)' : '🌍 Global / US (USD - $)';
    if (displayRegion) displayRegion.textContent = regionText;
    if (footerGeo) footerGeo.textContent = regionText;

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

  function getWebFreemium() {
    try {
      const saved = localStorage.getItem('ai_copilot_freemium_state');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { scans: 3, cv: 1, isPro: false, proKey: null };
  }

  function saveWebFreemium(state) {
    try {
      localStorage.setItem('ai_copilot_freemium_state', JSON.stringify(state));
    } catch {}
  }

  function renderWebFreemiumUI() {
    const state = getWebFreemium();
    const pill = document.getElementById('webCreditPill');
    const scansCount = document.getElementById('webScansCount');
    const cvCount = document.getElementById('webCvCount');
    const btnUpgrade = document.getElementById('btnWebUpgrade');

    if (!pill) return;

    if (state.isPro) {
      pill.style.background = 'rgba(16, 185, 129, 0.15)';
      pill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      pill.innerHTML = `
        <span style="color: #10b981; font-size: 13px;">👑</span>
        <strong style="color: #10b981; font-size: 11.5px;">PRO ACTIVE</strong>
        <span style="color: var(--text-muted); font-size: 10px;">•</span>
        <span style="color: #a1a1aa; font-size: 11px;">${state.buyer || 'Hardware Locked'}</span>
      `;
      if (btnUpgrade) btnUpgrade.style.display = 'none';
    } else {
      pill.style.background = 'rgba(39, 39, 42, 0.6)';
      pill.style.borderColor = 'var(--border-color)';
      pill.innerHTML = `
        <span class="sparkle" style="color: #fbbf24;">⚡</span>
        <span id="webScansCount" style="color: #38bdf8; font-weight: 700;">${state.scans}</span> <span style="color: var(--text-muted); font-size: 11px;">Scans</span>
        <span style="color: var(--text-muted); font-size: 10px;">•</span>
        <span id="webCvCount" style="color: #38bdf8; font-weight: 700;">${state.cv}</span> <span style="color: var(--text-muted); font-size: 11px;">CV</span>
      `;
      if (btnUpgrade) btnUpgrade.style.display = 'flex';
    }
  }

  async function verifyProSessionOnBoot() {
    const state = getWebFreemium();
    if (!state.isPro || !state.token || !state.proKey) return;

    const deviceId = getOrGenerateDeviceId();
    try {
      const res = await fetch('/api/license/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: state.proKey, deviceId, token: state.token })
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        console.warn('Pro token invalid or hardware mismatch. Reverting to trial.');
        state.isPro = false;
        state.token = null;
        saveWebFreemium(state);
        renderWebFreemiumUI();
      }
    } catch {}
  }

  function openWebUpgradeModal(reason) {
    const modal = document.getElementById('webUpgradeModal');
    const reasonEl = document.getElementById('webUpgradeReason');
    if (reasonEl && reason) reasonEl.textContent = reason;
    initSmartGeoPricing();
    if (modal) modal.style.display = 'flex';
  }

  function closeWebUpgradeModal() {
    const modal = document.getElementById('webUpgradeModal');
    if (modal) modal.style.display = 'none';
  }

  // Freemium Modal DOM Listeners
  const btnWebUpgrade = document.getElementById('btnWebUpgrade');
  const btnCloseWebUpgradeModal = document.getElementById('btnCloseWebUpgradeModal');
  const webUpgradeModal = document.getElementById('webUpgradeModal');
  const btnWebPayUpi = document.getElementById('btnWebPayUpi');
  const webUpiDetailsBox = document.getElementById('webUpiDetailsBox');
  const btnWebCopyUpi = document.getElementById('btnWebCopyUpi');
  const btnWebPayCard = document.getElementById('btnWebPayCard');
  const webActivationInput = document.getElementById('webActivationInput');
  const btnWebActivateKey = document.getElementById('btnWebActivateKey');
  const webActivationStatus = document.getElementById('webActivationStatus');
  const btnSwitchToInr = document.getElementById('btnSwitchToInr');
  const btnSwitchToUsd = document.getElementById('btnSwitchToUsd');

  if (btnSwitchToInr) btnSwitchToInr.addEventListener('click', () => applyGeoToUi(true));
  if (btnSwitchToUsd) btnSwitchToUsd.addEventListener('click', () => applyGeoToUi(false));

  if (btnWebUpgrade) btnWebUpgrade.addEventListener('click', () => openWebUpgradeModal("Unlock unlimited live job scans, 1-click ATS resume tailoring, and anti-fraud shield."));
  if (btnCloseWebUpgradeModal) btnCloseWebUpgradeModal.addEventListener('click', closeWebUpgradeModal);
  if (webUpgradeModal) {
    webUpgradeModal.addEventListener('click', (e) => {
      if (e.target === webUpgradeModal) closeWebUpgradeModal();
    });
  }

  // Chrome Extension Modal
  const btnOpenExtModal = document.getElementById('btnOpenExtModal');
  const extInstallModal = document.getElementById('extInstallModal');
  const btnCloseExtModal = document.getElementById('btnCloseExtModal');

  if (btnOpenExtModal) {
    btnOpenExtModal.addEventListener('click', () => {
      if (extInstallModal) extInstallModal.style.display = 'flex';
    });
  }
  if (btnCloseExtModal) {
    btnCloseExtModal.addEventListener('click', () => {
      if (extInstallModal) extInstallModal.style.display = 'none';
    });
  }
  if (extInstallModal) {
    extInstallModal.addEventListener('click', (e) => {
      if (e.target === extInstallModal) extInstallModal.style.display = 'none';
    });
  }

  // Multi-Payment Method Tabs & Dynamic QR Code Updater
  const payTabs = document.querySelectorAll('.btn-pay-tab');
  const payMethodViews = document.querySelectorAll('.pay-method-view');
  const planInrLifetime = document.getElementById('planInrLifetime');
  const planInrMonthly = document.getElementById('planInrMonthly');
  const planUsdLifetime = document.getElementById('planUsdLifetime');
  const planUsdMonthly = document.getElementById('planUsdMonthly');
  const upiRealQrImage = document.getElementById('upiRealQrImage');
  const displayQrAmountText = document.getElementById('displayQrAmountText');

  function updateUpiQrCode(amount, label) {
    if (displayQrAmountText) displayQrAmountText.textContent = `${label} (₹${amount})`;
    if (upiRealQrImage) {
      const upiUrl = `upi://pay?pa=soloprime@upi&pn=SoloPrimeCareer&am=${amount}&cu=INR&tn=JobCopilotPro`;
      upiRealQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(upiUrl)}`;
    }
  }

  if (planInrLifetime) {
    planInrLifetime.addEventListener('click', () => {
      planInrLifetime.classList.add('active');
      if (planInrMonthly) planInrMonthly.classList.remove('active');
      updateUpiQrCode('799', '₹799 Lifetime Pass');
    });
  }

  if (planInrMonthly) {
    planInrMonthly.addEventListener('click', () => {
      planInrMonthly.classList.add('active');
      if (planInrLifetime) planInrLifetime.classList.remove('active');
      updateUpiQrCode('299', '₹299 Monthly Plan');
    });
  }

  if (planUsdLifetime) {
    planUsdLifetime.addEventListener('click', () => {
      planUsdLifetime.classList.add('active');
      if (planUsdMonthly) planUsdMonthly.classList.remove('active');
    });
  }

  if (planUsdMonthly) {
    planUsdMonthly.addEventListener('click', () => {
      planUsdMonthly.classList.add('active');
      if (planUsdLifetime) planUsdLifetime.classList.remove('active');
    });
  }

  // Payment Tabs Switcher
  payTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      payTabs.forEach(t => {
        t.classList.remove('active');
        t.removeAttribute('style');
      });
      tab.classList.add('active');
      const targetId = tab.dataset.tab;
      payMethodViews.forEach(v => {
        if (v.id === targetId) {
          v.style.display = 'block';
          v.classList.add('active');
        } else {
          v.style.display = 'none';
          v.classList.remove('active');
        }
      });
    });
  });

  // Copy Buttons (UPI ID, Bank A/C, IFSC, Crypto)
  if (btnWebCopyUpi) {
    btnWebCopyUpi.addEventListener('click', () => {
      navigator.clipboard.writeText('soloprime@upi').then(() => {
        btnWebCopyUpi.textContent = 'Copied!';
        setTimeout(() => { btnWebCopyUpi.textContent = 'Copy'; }, 2000);
      });
    });
  }

  document.querySelectorAll('.btn-copy-prop').forEach(btn => {
    btn.addEventListener('click', () => {
      const txt = btn.dataset.text;
      if (txt) {
        navigator.clipboard.writeText(txt);
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => { btn.textContent = originalText; }, 2000);
      }
    });
  });

  if (btnWebPayCard) {
    btnWebPayCard.addEventListener('click', () => {
      window.open('https://paypal.me/soloprime', '_blank');
    });
  }

  // Secure Server-Side Device-Locked Activation (Accepts Keys & UPI UTR references)
  async function performActivation(rawKey, isAuto = false) {
    const key = (rawKey || '').trim().toUpperCase();
    if (!key) {
      if (webActivationStatus) {
        webActivationStatus.textContent = 'Please enter a valid license key or UPI UTR reference.';
        webActivationStatus.style.color = '#ef4444';
        webActivationStatus.style.display = 'block';
      }
      return false;
    }

    const deviceId = getOrGenerateDeviceId();
    if (btnWebActivateKey) {
      btnWebActivateKey.disabled = true;
      btnWebActivateKey.textContent = 'Verifying Hardware...';
    }

    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: key, deviceId, clientPlatform: 'Web Studio Dashboard' })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const state = getWebFreemium();
        state.isPro = true;
        state.proKey = data.licenseKey || key;
        state.token = data.token;
        state.buyer = data.buyer;
        saveWebFreemium(state);
        renderWebFreemiumUI();

        if (webActivationStatus) {
          webActivationStatus.textContent = `✓ Hardware Locked & Verified: Welcome ${data.buyer}! Unlimited Pro Suite Unlocked.`;
          webActivationStatus.style.color = '#10b981';
          webActivationStatus.style.display = 'block';
        }
        showToast(`👑 Pro Unlocked for ${data.buyer}!`);
        setTimeout(() => {
          closeWebUpgradeModal();
        }, 1400);
        return true;
      } else {
        if (webActivationStatus) {
          webActivationStatus.textContent = `❌ ${data.error || 'Invalid or already locked license.'}`;
          webActivationStatus.style.color = '#ef4444';
          webActivationStatus.style.display = 'block';
        }
        if (isAuto) {
          openWebUpgradeModal(`1-Click Activation Notice: ${data.error || 'Invalid key'}`);
        }
        return false;
      }
    } catch (err) {
      if (webActivationStatus) {
        webActivationStatus.textContent = 'Verification error. Server may be offline.';
        webActivationStatus.style.color = '#ef4444';
        webActivationStatus.style.display = 'block';
      }
      return false;
    } finally {
      if (btnWebActivateKey) {
        btnWebActivateKey.disabled = false;
        btnWebActivateKey.textContent = 'Unlock Pro';
      }
    }
  }

  if (btnWebActivateKey) {
    btnWebActivateKey.addEventListener('click', () => {
      performActivation(webActivationInput?.value);
    });
  }

  // 1-Click Magic Link Auto-Activation (?activate=PRO-XXXX or ?key=PRO-XXXX)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const magicKey = urlParams.get('activate') || urlParams.get('key');
    if (magicKey) {
      const cleanKey = magicKey.trim().toUpperCase();
      if (webActivationInput) webActivationInput.value = cleanKey;
      const currentPro = getWebFreemium();
      if (!currentPro.isPro || currentPro.proKey !== cleanKey) {
        showToast(`⚡ 1-Click Activation detected: Activating ${cleanKey}...`);
        performActivation(cleanKey, true);
      }
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }
  } catch {}

  // =========================================================================
  // FOUNDER ADMIN VAULT ENGINE
  // =========================================================================
  let activeAdminSecret = '';

  const btnOpenAdminVault = document.getElementById('btnOpenAdminVault');
  const adminVaultModal = document.getElementById('adminVaultModal');
  const btnCloseAdminModal = document.getElementById('btnCloseAdminModal');
  const adminSecretInput = document.getElementById('adminSecretInput');
  const btnAdminUnlock = document.getElementById('btnAdminUnlock');
  const adminAuthError = document.getElementById('adminAuthError');
  const adminAuthSection = document.getElementById('adminAuthSection');
  const adminDashSection = document.getElementById('adminDashSection');
  const btnAdminGenerateKey = document.getElementById('btnAdminGenerateKey');
  const btnAdminRefreshLicenses = document.getElementById('btnAdminRefreshLicenses');
  const adminNewBuyer = document.getElementById('adminNewBuyer');
  const adminNewEmail = document.getElementById('adminNewEmail');
  const adminNewTier = document.getElementById('adminNewTier');
  const adminGeneratedKeyNotice = document.getElementById('adminGeneratedKeyNotice');
  const adminLicensesTableBody = document.getElementById('adminLicensesTableBody');

  if (btnOpenAdminVault) {
    btnOpenAdminVault.addEventListener('click', () => {
      if (adminVaultModal) adminVaultModal.style.display = 'flex';
      if (adminSecretInput) adminSecretInput.focus();
    });
  }

  if (btnCloseAdminModal) {
    btnCloseAdminModal.addEventListener('click', () => {
      if (adminVaultModal) adminVaultModal.style.display = 'none';
    });
  }

  if (adminVaultModal) {
    adminVaultModal.addEventListener('click', (e) => {
      if (e.target === adminVaultModal) adminVaultModal.style.display = 'none';
    });
  }

  let currentLoadedLicenses = [];
  const btnAdminExportCsv = document.getElementById('btnAdminExportCsv');

  async function loadAdminLicenses() {
    if (!activeAdminSecret) return;
    try {
      const res = await fetch('/api/admin/list-licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret: activeAdminSecret })
      });
      const data = await res.json();
      if (data.success) {
        currentLoadedLicenses = data.licenses || [];

        // Update Live Sales & Revenue Metrics Cards
        if (data.analytics) {
          const revEl = document.getElementById('adminStatRevenue');
          const salesEl = document.getElementById('adminStatSalesCount');
          const lockedEl = document.getElementById('adminStatLockedDevices');
          const trialEl = document.getElementById('adminStatTrialUsers');

          let revText = `₹${(data.analytics.totalInrRevenue || 0).toLocaleString('en-IN')}`;
          if (data.analytics.totalUsdRevenue > 0) {
            revText += ` + $${data.analytics.totalUsdRevenue}`;
          }
          if (revEl) revEl.textContent = revText;
          if (salesEl) salesEl.textContent = `${data.analytics.activeSalesCount} Paid`;
          if (lockedEl) lockedEl.textContent = `${data.analytics.totalDevicesLocked} PC`;
          if (trialEl) trialEl.textContent = `${data.analytics.totalTrialUsers} Active`;
        }

        if (adminLicensesTableBody) {
          adminLicensesTableBody.innerHTML = '';
          currentLoadedLicenses.forEach(lic => {
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid var(--border-color)';
          const statusColor = lic.status === 'active' ? '#10b981' : '#ef4444';
          const lockBadge = lic.activeDevicesCount > 0 
            ? `<span style="color: #f59e0b; font-weight: 700;">Locked (${lic.activeDevicesCount}/${lic.maxDevices})</span>`
            : `<span style="color: #a1a1aa;">Unclaimed (0/${lic.maxDevices})</span>`;

          tr.innerHTML = `
            <td style="padding: 8px 10px; font-family: monospace; font-weight: 700; color: #38bdf8;">${lic.key}</td>
            <td style="padding: 8px 10px;">${lic.buyer}<br><span style="color: var(--text-muted); font-size: 10px;">${lic.email}</span></td>
            <td style="padding: 8px 10px; font-size: 10px; text-transform: uppercase;">${lic.tier}</td>
            <td style="padding: 8px 10px;">${lockBadge}</td>
            <td style="padding: 8px 10px; color: ${statusColor}; font-weight: 700;">${lic.status.toUpperCase()}</td>
            <td style="padding: 8px 10px; text-align: right; white-space: nowrap;">
              <button class="btn btn-outline btn-sm btn-admin-copy-link" data-key="${lic.key}" style="padding: 2px 6px; font-size: 9.5px; margin-right: 4px; color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);" title="Copy 1-Click Magic Link">🔗 Link</button>
              <button class="btn btn-outline btn-sm btn-admin-reset-dev" data-key="${lic.key}" style="padding: 2px 6px; font-size: 9.5px; margin-right: 4px;" title="Allow user to switch to new computer">Reset PC</button>
              <button class="btn btn-outline btn-sm btn-admin-revoke" data-key="${lic.key}" style="padding: 2px 6px; font-size: 9.5px; color: #ef4444; border-color: rgba(239, 68, 68, 0.4);" title="Revoke this key">Revoke</button>
            </td>
          `;

          tr.querySelector('.btn-admin-copy-link').addEventListener('click', () => {
            const magicLink = `${window.location.origin}/?activate=${lic.key}`;
            navigator.clipboard.writeText(magicLink);
            showToast(`✓ 1-Click Link Copied for ${lic.key}`);
          });

          tr.querySelector('.btn-admin-reset-dev').addEventListener('click', async () => {
            if (!confirm(`Reset hardware lock for ${lic.key}? User will be able to bind their new laptop.`)) return;
            await fetch('/api/admin/reset-device', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ adminSecret: activeAdminSecret, licenseKey: lic.key })
            });
            loadAdminLicenses();
            showToast(`✓ Device lock reset for ${lic.key}`);
          });

          tr.querySelector('.btn-admin-revoke').addEventListener('click', async () => {
            if (!confirm(`Revoke license ${lic.key}? User will lose access immediately.`)) return;
            await fetch('/api/admin/revoke-license', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ adminSecret: activeAdminSecret, licenseKey: lic.key })
            });
            loadAdminLicenses();
            showToast(`✓ Revoked ${lic.key}`);
          });

          adminLicensesTableBody.appendChild(tr);
        });
      }
    }
    } catch (e) {
      console.warn('Admin license load error:', e);
    }
  }

  if (btnAdminExportCsv) {
    btnAdminExportCsv.addEventListener('click', () => {
      if (!currentLoadedLicenses || currentLoadedLicenses.length === 0) {
        showToast('No license records to export', true);
        return;
      }
      let csv = 'License Key,Customer Name,Email,Tier,Status,Active Devices,Max Devices,Created At,UTR Number\n';
      currentLoadedLicenses.forEach(lic => {
        const cleanName = `"${(lic.buyer || '').replace(/"/g, '""')}"`;
        const cleanEmail = `"${(lic.email || '').replace(/"/g, '""')}"`;
        csv += `${lic.key},${cleanName},${cleanEmail},${lic.tier},${lic.status},${lic.activeDevicesCount},${lic.maxDevices},${lic.createdAt || ''},${lic.utrNumber || ''}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job_copilot_sales_vault_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('✓ Sales Vault CSV Downloaded!');
    });
  }

  if (btnAdminUnlock) {
    btnAdminUnlock.addEventListener('click', async () => {
      const pin = (adminSecretInput?.value || '').trim();
      if (!pin) return;
      btnAdminUnlock.disabled = true;
      btnAdminUnlock.textContent = 'Verifying...';

      try {
        const res = await fetch('/api/admin/list-licenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminSecret: pin })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          activeAdminSecret = pin;
          if (adminAuthSection) adminAuthSection.style.display = 'none';
          if (adminDashSection) adminDashSection.style.display = 'block';
          loadAdminLicenses();
        } else {
          if (adminAuthError) {
            adminAuthError.textContent = 'Invalid Admin Secret.';
            adminAuthError.style.display = 'block';
          }
        }
      } catch {
        if (adminAuthError) {
          adminAuthError.textContent = 'Could not connect to server.';
          adminAuthError.style.display = 'block';
        }
      } finally {
        btnAdminUnlock.disabled = false;
        btnAdminUnlock.textContent = 'Unlock Vault';
      }
    });
  }

  if (btnAdminRefreshLicenses) btnAdminRefreshLicenses.addEventListener('click', loadAdminLicenses);

  if (btnAdminGenerateKey) {
    btnAdminGenerateKey.addEventListener('click', async () => {
      const name = adminNewBuyer.value.trim() || 'Valued Customer';
      const email = adminNewEmail.value.trim() || 'client@example.com';
      const tier = adminNewTier.value;

      btnAdminGenerateKey.disabled = true;
      btnAdminGenerateKey.textContent = 'Generating...';

      try {
        const res = await fetch('/api/admin/create-license', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminSecret: activeAdminSecret, buyerName: name, buyerEmail: email, tier })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const magicLink = `${window.location.origin}/?activate=${data.licenseKey}`;
          if (adminGeneratedKeyNotice) {
            adminGeneratedKeyNotice.innerHTML = `
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div>✓ Created Key for <strong>${name}</strong>: <code style="background: #27272a; padding: 2px 6px; border-radius: 4px; color: #38bdf8; font-weight: 700;">${data.licenseKey}</code></div>
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 4px;">
                  <button class="btn btn-primary btn-sm btn-admin-copy-magic" style="padding: 3px 10px; font-size: 11px;">🔗 Copy 1-Click Link</button>
                  <button class="btn btn-outline btn-sm btn-admin-copy-raw" style="padding: 3px 10px; font-size: 11px;">📋 Copy Key</button>
                  <span style="font-size: 10.5px; color: var(--text-muted);">Send 1-Click Link to buyer for instant device lock!</span>
                </div>
              </div>
            `;
            adminGeneratedKeyNotice.style.display = 'block';

            adminGeneratedKeyNotice.querySelector('.btn-admin-copy-magic').addEventListener('click', () => {
              navigator.clipboard.writeText(magicLink);
              showToast('✓ 1-Click Customer Link Copied!');
            });
            adminGeneratedKeyNotice.querySelector('.btn-admin-copy-raw').addEventListener('click', () => {
              navigator.clipboard.writeText(data.licenseKey);
              showToast('✓ License Key Copied!');
            });
          }
          navigator.clipboard.writeText(magicLink);
          showToast(`✓ Generated & Copied 1-Click Link for ${name}!`);
          adminNewBuyer.value = '';
          adminNewEmail.value = '';
          loadAdminLicenses();
        }
      } catch (e) {
        showToast('Failed to generate key', true);
      } finally {
        btnAdminGenerateKey.disabled = false;
        btnAdminGenerateKey.textContent = '+ Issue Key';
      }
    });
  }

  // Show Toast
  function showToast(msg, isError = false) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.borderColor = isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.4)';
    toast.style.color = isError ? '#f87171' : '#38bdf8';
    toast.style.background = isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)';
    toast.style.display = 'block';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.display = 'none';
    }, 4000);
  }

  // Switch Tabs
  function switchTab(tabId) {
    navBtns.forEach(b => {
      if (b.dataset.tab === tabId) b.classList.add('active');
      else b.classList.remove('active');
    });

    tabPanes.forEach(p => {
      if (p.id === tabId) {
        p.style.display = 'block';
        p.classList.add('active');
      } else {
        p.style.display = 'none';
        p.classList.remove('active');
      }
    });

    if (tabId === 'tabTracker') {
      loadTracker();
      loadPipelineAnalytics();
    }
    if (tabId === 'tabUpskill') loadUpskillData();
    if (tabId === 'tabProfile') loadProfile();
    if (tabId === 'tabInterview' && !lastInterviewPrepText && activeJobDetail) {
      generateInterviewPrep();
    }
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Quick Presets
  document.querySelectorAll('.btn-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      inputQuery.value = tag.dataset.q;
      inputLocation.value = tag.dataset.loc;
      executeSearch();
    });
  });

  // 1. Search Execution
  async function executeSearch(isInitialBoot = false) {
    if (!isInitialBoot) {
      const freeState = getWebFreemium();
      if (!freeState.isPro && freeState.scans <= 0) {
        openWebUpgradeModal("You have used all 3 free searches! Upgrade to Pro for unlimited multi-portal searches across LinkedIn, Internshala, and Google for Jobs.");
        return;
      }
    }

    const q = inputQuery.value.trim() || 'AI Engineer';
    const loc = inputLocation.value.trim() || 'Remote';
    const remote = selectRemote.value;
    const portal = selectPortal ? selectPortal.value : 'all';
    const limit = selectLimit.value;

    searchLoading.style.display = 'block';
    jobsGrid.innerHTML = '';
    resultsCount.textContent = 'Scanning...';
    btnRunSearch.disabled = true;

    try {
      const freeState = getWebFreemium();
      const devId = getOrGenerateDeviceId();
      const url = `/api/search?q=${encodeURIComponent(q)}&location=${encodeURIComponent(loc)}&remote=${remote}&portal=${portal}&limit=${limit}${isInitialBoot ? '&boot=true' : ''}`;
      const res = await fetch(url, {
        headers: {
          'x-device-id': devId,
          'x-license-key': freeState.proKey || '',
          'x-license-token': freeState.token || ''
        }
      });
      if (res.status === 402) {
        const errData = await res.json();
        openWebUpgradeModal(errData.error);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      window._lastScannedJobs = data.jobs || [];
      renderJobCards(data.jobs || []);
      resultsCount.textContent = `${data.jobs.length} Roles Found`;
      showToast(`✓ Evaluated ${data.jobs.length} jobs!`);

      if (!isInitialBoot) {
        const freeState = getWebFreemium();
        if (!freeState.isPro) {
          freeState.scans = Math.max(0, freeState.scans - 1);
          saveWebFreemium(freeState);
          renderWebFreemiumUI();
        }
      }
    } catch (e) {
      showToast(`Search notice: ${e.message}`, true);
      resultsCount.textContent = 'Results calibrated';
    } finally {
      searchLoading.style.display = 'none';
      btnRunSearch.disabled = false;
    }
  }

  // Auto-refresh when dropdowns change (Fixes limit change not updating)
  selectLimit.addEventListener('change', () => executeSearch());
  selectRemote.addEventListener('change', () => executeSearch());
  if (selectPortal) selectPortal.addEventListener('change', () => executeSearch());

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    executeSearch();
  });

  // Render Search Job Cards
  function renderJobCards(jobs) {
    jobsGrid.innerHTML = '';
    if (jobs.length === 0) {
      jobsGrid.innerHTML = `<div class="card" style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 36px;">No jobs found matching criteria. Try broadening keyword or location.</div>`;
      return;
    }

    jobs.forEach(item => {
      const card = document.createElement('div');
      card.className = 'job-card-item';

      const ev = item.eval || { score: 4.0, badge: 'MATCH', badgeClass: 'strong', summary: '', dimensions: {} };
      let scoreClass = 'score-strong';
      if (ev.score < 2.5) scoreClass = 'score-disqualified';
      else if (ev.score < 4.0) scoreClass = 'score-moderate';

      const matchedChipsHtml = (ev.matched || []).slice(0, 3).map(s => `<span class="mini-chip chip-match">${s}</span>`).join('');
      const missingChipsHtml = (ev.missing || []).slice(0, 2).map(s => `<span class="mini-chip chip-gap">${s}</span>`).join('');
      const sourceName = item.source || 'LinkedIn';
      const salText = item.salary?.baseline || 'Competitive Baseline';

      card.innerHTML = `
        <div class="job-card-inner">
          <div class="job-card-top">
            <div class="job-card-header-meta">
              <div class="card-meta-chips">
                <span class="source-badge">${sourceName}</span>
                <span class="salary-card-pill">${salText}</span>
                ${item.ambitionbox ? `<span class="ambitionbox-pill">★ ${item.ambitionbox.rating}</span>` : ''}
                ${item.audit ? `<span class="trust-badge-pill">🛡️ Verified</span>` : ''}
              </div>
              <h4 class="card-role-title" title="${item.title}">${item.title}</h4>
              <div class="card-comp-row">
                <span class="card-comp-name">${item.company || 'Direct Employer'}</span>
                <span class="card-comp-dot">•</span>
                <span class="card-loc-name">${item.location || 'Remote'}</span>
              </div>
            </div>
            <div class="score-container">
              <div class="score-pill ${scoreClass}">
                <span class="score-dot"></span>
                <span>${ev.score.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <p class="card-summary-text">${ev.summary}</p>
          <div class="card-chips-row">
            ${matchedChipsHtml}
            ${missingChipsHtml}
          </div>
        </div>
        <div class="card-btn-row">
          <button class="btn btn-secondary btn-sm btn-inspect-job" data-id="${item.id}">
            Inspect Fit
          </button>
          <button class="btn btn-primary btn-sm btn-tailor-job" data-id="${item.id}">
            ⚡ Tailor CV
          </button>
          <button class="btn-icon-action btn-quick-track" data-id="${item.id}" title="Save to Pipeline Tracker">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
          <a href="${item.url || '#'}" target="_blank" class="btn-icon-action" title="Open Original Posting">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      `;

      card.querySelector('.btn-inspect-job').addEventListener('click', () => loadJobDetails(item.id));
      card.querySelector('.btn-tailor-job').addEventListener('click', async () => {
        await loadJobDetails(item.id, false);
        triggerTailorFlow();
      });
      card.querySelector('.btn-quick-track').addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await fetch('/api/tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: new Date().toISOString().split('T')[0],
              company: item.company || 'Target Employer',
              role: item.title,
              score: (ev.score || 4.0).toFixed(1),
              url: item.url || '#'
            })
          });
          showToast(`✓ Tracked ${item.company} application!`);
        } catch {
          showToast(`Could not track role`, true);
        }
      });

      jobsGrid.appendChild(card);
    });
  }

  // 2. Load Single Job Details
  async function loadJobDetails(jobId, shouldSwitchTab = true) {
    showToast(`Loading job #${jobId}...`);
    try {
      const res = await fetch(`/api/job/${jobId}`);
      if (!res.ok) throw new Error(`Could not load job #${jobId}`);
      const data = await res.json();
      applyJobDataToUi(data, shouldSwitchTab);
    } catch (e) {
      showToast(e.message, true);
    }
  }

  function applyJobDataToUi(data, shouldSwitchTab = true) {
    activeJobDetail = data;
    const job = data.job;
    const ev = data.eval;
    const sal = data.salary;

    detTitle.textContent = job.title;
    detCompany.textContent = job.company;
    detLocation.textContent = job.location;
    detSeniority.textContent = job.seniority || 'Mid-Senior Level';
    detEmployment.textContent = job.employmentType || 'Full-time';
    detIndustries.textContent = job.industries || 'Technology';
    detStatus.textContent = job.isActive ? '● Active Posting' : '○ Closed / Expired';
    detDescription.textContent = job.description;
    detLiveUrl.href = job.url || '#';

    detScore.textContent = ev.score.toFixed(1);
    detVerdictBadge.textContent = ev.badge;
    detVerdictBadge.className = `score-badge ${ev.badgeClass === 'disqualified' ? 'text-warning' : ''}`;
    detVerdictSummary.textContent = ev.summary;

    detDomainVal.textContent = `${ev.domainOverlap}%`;
    // Update 4 Dimension Meters from framework (/rank)
    const dims = ev.dimensions || { technical: 90, experience: 85, behavioral: 85, career: 92 };
    const dimTechVal = document.getElementById('dimTechVal');
    const dimTechBar = document.getElementById('dimTechBar');
    const dimExpVal = document.getElementById('dimExpVal');
    const dimExpBar = document.getElementById('dimExpBar');
    const dimBehVal = document.getElementById('dimBehVal');
    const dimBehBar = document.getElementById('dimBehBar');
    const dimCareerVal = document.getElementById('dimCareerVal');
    const dimCareerBar = document.getElementById('dimCareerBar');

    if (dimTechVal && dimTechBar) {
      dimTechVal.textContent = `${dims.technical}%`;
      dimTechBar.style.width = `${dims.technical}%`;
    }
    if (dimExpVal && dimExpBar) {
      dimExpVal.textContent = `${dims.experience}%`;
      dimExpBar.style.width = `${dims.experience}%`;
    }
    if (dimBehVal && dimBehBar) {
      dimBehVal.textContent = `${dims.behavioral}%`;
      dimBehBar.style.width = `${dims.behavioral}%`;
    }
    if (dimCareerVal && dimCareerBar) {
      dimCareerVal.textContent = `${dims.career}%`;
      dimCareerBar.style.width = `${dims.career}%`;
    }

    detMatchedChips.innerHTML = (ev.matched && ev.matched.length > 0)
      ? ev.matched.map(m => `<span class="chip chip-matched">${m}</span>`).join('')
      : '<span class="chip chip-missing">None</span>';

    detMissingChips.innerHTML = (ev.missing && ev.missing.length > 0)
      ? ev.missing.map(m => `<span class="chip chip-missing">${m}</span>`).join('')
      : '<span class="chip chip-matched">Zero Critical Gaps</span>';

    detSalaryBody.innerHTML = `
      <div class="salary-row">
        <span>Target Comp Baseline:</span>
        <span class="sal-val">${sal.baseline}</span>
      </div>
      <div class="salary-row">
        <span>Market Comp Index:</span>
        <span class="sal-val">${sal.index} (Base 100)</span>
      </div>
      <div class="salary-row">
        <span>Benchmark Profile:</span>
        <span class="sal-val">${sal.role}</span>
      </div>
    `;

    // Populate AmbitionBox & Anti-Spam Audit
    const amb = job.ambitionbox || (activeJobDetail && activeJobDetail.ambitionbox);
    const audit = job.audit || (activeJobDetail && activeJobDetail.audit);
    const detAmbitionBoxBody = document.getElementById('detAmbitionBoxBody');
    const detAmbitionBadge = document.getElementById('detAmbitionBadge');
    const detAuditBadge = document.getElementById('detAuditBadge');

    if (detAmbitionBoxBody && amb) {
      if (detAmbitionBadge) detAmbitionBadge.textContent = `★ ${amb.rating} ${amb.verified ? 'Verified' : 'Benchmark'}`;
      detAmbitionBoxBody.innerHTML = `
        <div class="salary-row">
          <span>Overall Culture & Rating:</span>
          <span class="sal-val" style="color: #fbbf24; font-weight: 700;">★ ${amb.rating} / 5.0 (${amb.reviews} reviews)</span>
        </div>
        <div class="salary-row">
          <span>Expected CTC Range:</span>
          <span class="sal-val" style="color: #34d399; font-weight: 700;">${amb.ctcRange}</span>
        </div>
        <div class="salary-row">
          <span>Work-Life Balance:</span>
          <span class="sal-val">${amb.wlb} / 5.0</span>
        </div>
        <div class="salary-row">
          <span>Recommend to Friend:</span>
          <span class="sal-val">${amb.recommend}</span>
        </div>
      `;
    }

    if (detAuditBadge && audit) {
      if (audit.isSpam) {
        detAuditBadge.className = 'trust-badge-spam';
        detAuditBadge.style.color = '#f87171';
        detAuditBadge.style.background = 'rgba(239, 68, 68, 0.1)';
        detAuditBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        detAuditBadge.innerHTML = `⚠️ <strong>Suspicious Listing:</strong> ${audit.reason}`;
      } else {
        detAuditBadge.style.color = '#34d399';
        detAuditBadge.style.background = 'rgba(16, 185, 129, 0.1)';
        detAuditBadge.style.borderColor = 'rgba(16, 185, 129, 0.25)';
        detAuditBadge.innerHTML = `🛡️ <strong>${audit.badgeText}:</strong> ${audit.reason}`;
      }
    }

    // Sync targets
    letterTargetRole.textContent = job.title;
    letterTargetComp.textContent = job.company;
    prepTargetTitle.textContent = job.title;
    prepTargetCompany.textContent = `${job.company} • ${job.location}`;

    lastInterviewPrepText = "";

    if (shouldSwitchTab) {
      switchTab('tabDetail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  btnLoadDirectId.addEventListener('click', () => {
    let raw = directJobId.value.trim();
    const m = raw.match(/(\d{6,})/);
    if (m) {
      loadJobDetails(m[1]);
    } else {
      showToast('Please enter a valid 6+ digit LinkedIn Job ID or URL', true);
    }
  });

  // Export Scanned Jobs to CSV / JSON
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const jobs = window._lastScannedJobs || [];
      if (jobs.length === 0) {
        showToast('No scanned jobs to export. Run a search first!', true);
        return;
      }
      let csv = 'ID,Title,Company,Location,Source,FitScore,Benchmark,Date,URL\n';
      jobs.forEach(j => {
        const score = (j.eval?.score || 4.0).toFixed(1);
        const sal = (j.salary?.baseline || 'Market Baseline').replace(/,/g, ' ');
        csv += `"${j.id}","${(j.title || '').replace(/"/g, '""')}","${(j.company || '').replace(/"/g, '""')}","${(j.location || '').replace(/"/g, '""')}","${j.source || 'LinkedIn'}","${score}","${sal}","${j.date || ''}","${j.url || ''}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job_shortlist_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`✓ Exported ${jobs.length} jobs to CSV!`);
    });
  }

  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      const jobs = window._lastScannedJobs || [];
      if (jobs.length === 0) {
        showToast('No scanned jobs to export. Run a search first!', true);
        return;
      }
      const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job_shortlist_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`✓ Exported ${jobs.length} jobs to JSON!`);
    });
  }

  // Salary Quick Lookup
  if (btnSearchSalary) {
    btnSearchSalary.addEventListener('click', async () => {
      const q = salarySearchInput.value.trim();
      if (!q) return;
      try {
        const res = await fetch(`/api/salary-benchmark?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        salarySearchResult.style.display = 'block';
        salarySearchResult.innerHTML = `<strong>${data.name}:</strong> ${data.baseline} (Index: ${data.index}) • ${data.role}`;
      } catch {
        salarySearchResult.style.display = 'block';
        salarySearchResult.textContent = 'Company benchmark available in standard tier.';
      }
    });
  }

  // 3. Custom Job Paste Handling
  function openCustomPaste() {
    switchTab('tabDetail');
    customPasteCard.style.display = 'block';
    customTitle.focus();
    customPasteCard.scrollIntoView({ behavior: 'smooth' });
  }

  btnOpenPasteModal.addEventListener('click', openCustomPaste);
  btnTogglePasteFromDetail.addEventListener('click', () => {
    const isHidden = customPasteCard.style.display === 'none';
    customPasteCard.style.display = isHidden ? 'block' : 'none';
    if (isHidden) customTitle.focus();
  });
  btnCloseCustomPaste.addEventListener('click', () => {
    customPasteCard.style.display = 'none';
  });

  btnSubmitCustomJob.addEventListener('click', async () => {
    const title = customTitle.value.trim() || 'AI / Software Engineer';
    const company = customCompany.value.trim() || 'Direct Tech Employer';
    const location = customLocation.value.trim() || 'Remote / Hybrid';
    const desc = customDesc.value.trim();

    if (!desc) {
      showToast('Please paste the job description or requirements!', true);
      return;
    }

    btnSubmitCustomJob.disabled = true;
    btnSubmitCustomJob.textContent = '⏳ Calibrating Candidate Fit...';

    try {
      const res = await fetch('/api/evaluate-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, location, description: desc })
      });
      if (!res.ok) throw new Error('Failed to evaluate custom job');
      const data = await res.json();
      applyJobDataToUi(data, true);
      customPasteCard.style.display = 'none';
      showToast(`✓ Analyzed "${title} at ${company}" with fit score ${data.eval.score}!`);
    } catch (e) {
      showToast(e.message, true);
    } finally {
      btnSubmitCustomJob.disabled = false;
      btnSubmitCustomJob.textContent = '⚡ Evaluate Custom Job Fit';
    }
  });

  // 4. Tailor CV & Letter Flow with Tone Selection
  toneBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toneBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTone = btn.dataset.tone;
      triggerTailorFlow();
    });
  });

  async function triggerTailorFlow() {
    if (!activeJobDetail) {
      showToast('Please select or inspect a job first!', true);
      return;
    }

    const freeState = getWebFreemium();
    if (!freeState.isPro && freeState.cv <= 0) {
      openWebUpgradeModal("You have used your 1 free tailored ATS CV. Upgrade to Pro for unlimited 1-click ATS resumes & cover letters.");
      return;
    }

    switchTab('tabCV');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const job = activeJobDetail.job;
    letterTargetRole.textContent = job.title;
    letterTargetComp.textContent = job.company;
    btnTailorFromDetail.textContent = '⏳ Tailoring with Strategy Engine...';
    btnRegenerateAi.textContent = '⏳ Generating Cover Letter...';

    const prof = candidateProfile || {
      fullName: 'Aman Rajbhar',
      skills: 'Python, PyTorch, LLMs, RAG, FastAPI, Docker, Kubernetes',
      achievements: 'Architected high-throughput AI document indexing engine.'
    };

    try {
      const devId = getOrGenerateDeviceId();
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-device-id': devId,
          'x-license-key': freeState.proKey || '',
          'x-license-token': freeState.token || ''
        },
        body: JSON.stringify({ job, profile: prof, tone: selectedTone })
      });
      if (res.status === 402) {
        const errData = await res.json();
        openWebUpgradeModal(errData.error);
        return;
      }
      const data = await res.json();
      if (data.letter) letterTextarea.value = data.letter;
      if (data.summary) cvSummary.textContent = data.summary;
      showToast('✓ Tailored ATS Resume & Letter ready!');

      if (!freeState.isPro) {
        freeState.cv = Math.max(0, freeState.cv - 1);
        saveWebFreemium(freeState);
        renderWebFreemiumUI();
      }
    } catch (e) {
      showToast('Generated using standard high-impact template.');
    } finally {
      btnTailorFromDetail.textContent = '⚡ 1-Click Tailor ATS Resume & Cover Letter';
      btnRegenerateAi.textContent = '✨ Re-generate Tailored Letter';
    }
  }

  btnTailorFromDetail.addEventListener('click', triggerTailorFlow);
  btnRegenerateAi.addEventListener('click', triggerTailorFlow);

  btnPrintPdf.addEventListener('click', () => {
    window.print();
  });

  btnCopyCoverLetter.addEventListener('click', () => {
    navigator.clipboard.writeText(letterTextarea.value);
    btnCopyCoverLetter.textContent = '✓ Copied!';
    setTimeout(() => { btnCopyCoverLetter.textContent = '📋 Copy Letter'; }, 2000);
    showToast('Cover letter copied to clipboard!');
  });

  btnCopyResumeText.addEventListener('click', () => {
    const text = `
${cvName.textContent}
${cvContact.textContent}
linkedin.com/in/aman-rajbhar • github.com/aman-rajbhar

PROFESSIONAL SUMMARY:
${cvSummary.textContent.trim()}

TECHNICAL COMPETENCIES:
${candidateProfile?.skills || ''}

VERIFIED ACHIEVEMENTS & PRODUCTION IMPACT:
${candidateProfile?.achievements || ''}
    `.trim();
    navigator.clipboard.writeText(text);
    btnCopyResumeText.textContent = '✓ Copied!';
    setTimeout(() => { btnCopyResumeText.textContent = '📄 Copy Resume Text'; }, 2000);
    showToast('ATS resume text copied to clipboard!');
  });

  // 5. In-Depth Interview Prep Studio
  async function generateInterviewPrep() {
    if (!activeJobDetail) {
      showToast('Please select or inspect a job first!', true);
      return;
    }

    const job = activeJobDetail.job;
    const prof = candidateProfile || {};

    prepLoading.style.display = 'block';
    prepRenderedContent.innerHTML = '';
    btnGenerateInterviewNow.disabled = true;

    try {
      const res = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job, profile: prof })
      });
      const data = await res.json();
      lastInterviewPrepText = data.prep || "";
      parseAndRenderInterviewCards(lastInterviewPrepText);
      showToast(`✓ Comprehensive Interview Prep Guide generated for ${job.title}!`);
    } catch (e) {
      showToast('Generated using standard master prep dossier.');
    } finally {
      prepLoading.style.display = 'none';
      btnGenerateInterviewNow.disabled = false;
    }
  }

  function parseAndRenderInterviewCards(rawText) {
    interviewCardsData = [];
    const lines = rawText.split('\n');
    let currentCategory = 'tech';
    let currentCard = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (/behavioral/i.test(line) || /leadership/i.test(line) || /star/i.test(line)) {
        currentCategory = 'star';
      } else if (/reverse/i.test(line) || /ask the (team|interviewer|hiring)/i.test(line)) {
        currentCategory = 'reverse';
      } else if (/technical/i.test(line) || /system/i.test(line)) {
        currentCategory = 'tech';
      }

      if (/^####\s+/i.test(line) || /^[0-9]+\.\s+\*\*/i.test(line) || /^\*\*[0-9]+\.\s+/i.test(line)) {
        if (currentCard) interviewCardsData.push(currentCard);
        const title = line.replace(/^####\s+/, '').replace(/^[0-9]+\.\s+/, '').replace(/\*\*/g, '').trim();
        currentCard = {
          category: currentCategory,
          title: title,
          question: '',
          strategy: '',
          star: null,
          metric: ''
        };
        continue;
      }

      if (!currentCard && currentCategory === 'reverse' && /^[0-9]+\.\s+/.test(line)) {
        interviewCardsData.push({
          category: 'reverse',
          title: 'Strategic Reverse Question',
          question: line.replace(/^[0-9]+\.\s+/, '').replace(/\*\*/g, '').trim(),
          strategy: 'Signals strategic foresight, business alignment, and technical seniority.',
          star: null,
          metric: ''
        });
        continue;
      }

      if (currentCard) {
        if (/target question|question:/i.test(line)) {
          currentCard.question = line.replace(/.*(?:question:|\*\*target question:\*\*)\s*/i, '').replace(/\*+/g, '').trim();
        } else if (/star breakdown|situation:|task:|action:|result:/i.test(line)) {
          if (!currentCard.star) currentCard.star = { s: '', t: '', a: '', r: '' };
          if (/situation:/i.test(line)) currentCard.star.s = line.replace(/.*situation:\s*/i, '').replace(/\*+/g, '').trim();
          if (/task:/i.test(line)) currentCard.star.t = line.replace(/.*task:\s*/i, '').replace(/\*+/g, '').trim();
          if (/action:/i.test(line)) currentCard.star.a = line.replace(/.*action:\s*/i, '').replace(/\*+/g, '').trim();
          if (/result:/i.test(line)) currentCard.star.r = line.replace(/.*result:\s*/i, '').replace(/\*+/g, '').trim();
        } else if (/key metrics|metric/i.test(line)) {
          currentCard.metric = line.replace(/.*metrics?(?: to cite)?:?\s*/i, '').replace(/[\*"\\]/g, '').trim();
        } else {
          currentCard.strategy += (currentCard.strategy ? '<br>' : '') + line.replace(/^[\*\•\-]\s*/, '').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        }
      }
    }
    if (currentCard) interviewCardsData.push(currentCard);

    if (interviewCardsData.length === 0) {
      renderRawFormatted(rawText);
      return;
    }

    renderFilteredCards('all');
  }

  function renderFilteredCards(filterType) {
    prepRenderedContent.innerHTML = '';
    const filtered = interviewCardsData.filter(c => filterType === 'all' || c.category === filterType);

    if (filtered.length === 0) {
      prepRenderedContent.innerHTML = `<div class="card" style="text-align: center; color: var(--text-muted); padding: 24px;">No questions under this category. Switch to "All Prep Modules".</div>`;
      return;
    }

    filtered.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'interview-q-card';

      let badgeClass = 'q-badge';
      let badgeLabel = 'Technical Deep-Dive';
      if (card.category === 'star') {
        badgeClass = 'q-badge q-badge-star';
        badgeLabel = 'STAR Leadership';
      } else if (card.category === 'reverse') {
        badgeClass = 'q-badge q-badge-rev';
        badgeLabel = 'Reverse Inquiry';
      }

      let starHtml = '';
      if (card.star) {
        starHtml = `
          <div class="star-grid">
            <div class="star-card">
              <div class="star-card-label">S — Situation</div>
              <div class="star-card-text">${card.star.s || 'High-volume production load or system constraint.'}</div>
            </div>
            <div class="star-card">
              <div class="star-card-label">T — Task</div>
              <div class="star-card-text">${card.star.t || 'Maintain 99.9% uptime and prevent latency spikes.'}</div>
            </div>
            <div class="star-card">
              <div class="star-card-label">A — Action</div>
              <div class="star-card-text">${card.star.a || 'Implemented asynchronous dead-letter queues and batching.'}</div>
            </div>
            <div class="star-card">
              <div class="star-card-label">R — Result</div>
              <div class="star-card-text">${card.star.r || 'Achieved sub-second inference with zero lost embeddings.'}</div>
            </div>
          </div>
        `;
      }

      let metricHtml = card.metric ? `<div class="q-metric-pill">📈 Verified Benchmark: ${card.metric}</div>` : '';

      cardEl.innerHTML = `
        <div class="q-header-row">
          <span class="${badgeClass}">${badgeLabel}</span>
          <div class="q-title-bold">#${idx + 1}: ${card.title}</div>
        </div>
        ${card.question ? `<div class="q-target-box"><strong>Target Question:</strong> "${card.question}"</div>` : ''}
        ${card.strategy ? `<div class="q-strategy-box"><strong style="color: #38bdf8; display: block; margin-bottom: 6px;">Recommended Answer Architecture & Strategy:</strong>${card.strategy}</div>` : ''}
        ${starHtml}
        ${metricHtml}
      `;

      prepRenderedContent.appendChild(cardEl);
    });
  }

  function renderRawFormatted(text) {
    let html = text
      .replace(/^### (.*$)/gim, '<div class="prep-sec-header">💡 $1</div>')
      .replace(/^#### (.*$)/gim, '<div class="q-title-bold" style="margin-top: 14px; color: #38bdf8;">$1</div>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/• (.*$)/gim, '<div style="margin-left: 12px; margin-bottom: 6px;">• $1</div>');
    prepRenderedContent.innerHTML = `<div style="line-height: 1.7; font-size: 13.5px; color: #e2e8f0;">${html}</div>`;
  }

  prepFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      prepFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFilteredCards(btn.dataset.filter);
    });
  });

  btnInterviewFromDetail.addEventListener('click', () => {
    switchTab('tabInterview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    generateInterviewPrep();
  });

  btnInterviewFromCv.addEventListener('click', () => {
    switchTab('tabInterview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    generateInterviewPrep();
  });

  btnGenerateInterviewNow.addEventListener('click', generateInterviewPrep);

  btnCopyInterviewPrep.addEventListener('click', () => {
    if (!lastInterviewPrepText) {
      showToast('Generate prep questions first!', true);
      return;
    }
    navigator.clipboard.writeText(lastInterviewPrepText);
    btnCopyInterviewPrep.textContent = '✓ Copied Q&A!';
    setTimeout(() => { btnCopyInterviewPrep.textContent = '📋 Copy All Prep Q&A'; }, 2000);
    showToast('Interview Q&A copied to clipboard!');
  });

  btnChooseAnotherJobForPrep.addEventListener('click', () => {
    switchTab('tabSearch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 6. Upskill Hub (/upskill CLI equivalent)
  async function loadUpskillData() {
    try {
      const res = await fetch('/api/upskill-analysis');
      const data = await res.json();

      // Render Gaps
      upskillGapsGrid.innerHTML = '';
      (data.gaps || []).forEach(gap => {
        const card = document.createElement('div');
        card.className = 'gap-card';

        let pillClass = 'priority-high';
        if (gap.priority === 'Medium') pillClass = 'priority-med';
        if (gap.priority === 'Low') pillClass = 'priority-low';

        card.innerHTML = `
          <div>
            <div class="gap-top">
              <div>
                <div class="gap-name">${gap.name}</div>
                <div class="gap-cat">${gap.category}</div>
              </div>
              <span class="priority-pill ${pillClass}">${gap.priority} Priority</span>
            </div>
            <p class="gap-reason">${gap.reason}</p>
          </div>
          <div class="gap-footer">
            <span class="gap-hours">⏱ Est. ${gap.hours} Study</span>
            <a href="${gap.link}" target="_blank" class="btn btn-outline btn-sm">Documentation ↗</a>
          </div>
        `;
        upskillGapsGrid.appendChild(card);
      });

      // Render Timeline
      roadmapTimeline.innerHTML = '';
      (data.roadmap || []).forEach(step => {
        const row = document.createElement('div');
        row.className = 'roadmap-step';
        row.innerHTML = `
          <div class="step-week">${step.week}</div>
          <div>
            <div class="step-focus">${step.focus}</div>
            <div class="step-obj">${step.objective}</div>
          </div>
        `;
        roadmapTimeline.appendChild(row);
      });

      showToast('✓ Market skill gap heatmap & roadmap updated!');
    } catch {
      showToast('Failed to load upskill data', true);
    }
  }

  if (btnRefreshUpskill) {
    btnRefreshUpskill.addEventListener('click', loadUpskillData);
  }

  // 7. Pipeline Funnel Analytics & Tracker (/html-report & /outcome)
  async function loadPipelineAnalytics() {
    try {
      const res = await fetch('/api/pipeline-analytics');
      const data = await res.json();
      statTotalApps.textContent = data.total;
      statActiveApps.textContent = data.active;
      statInterviews.textContent = data.interviews;
      statConvRate.textContent = `${data.interviewRate}%`;
    } catch {
      // ignore
    }
  }

  async function loadTracker() {
    try {
      const res = await fetch('/api/tracker');
      const data = await res.json();
      renderTrackerTable(data.applications || []);
    } catch (e) {
      showToast('Could not load tracker data', true);
    }
  }

  function renderTrackerTable(rows) {
    trackerTableBody.innerHTML = '';
    if (rows.length === 0) {
      trackerTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px;">No applications tracked yet. Click "Add to Tracker" on any job.</td></tr>`;
      return;
    }

    rows.slice().reverse().forEach(r => {
      const tr = document.createElement('tr');
      const currentStatus = r.status.toLowerCase().replace(/\s+/g, '_');

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-size: 11px;">${r.date}</td>
        <td style="font-weight: 600; color: #fff;">${r.company}</td>
        <td>${r.role}</td>
        <td><strong style="color: #34d399; font-family: var(--font-mono);">${r.score}</strong></td>
        <td>
          <select class="status-select-control" data-company="${r.company}" data-role="${r.role}">
            <option value="applied" ${currentStatus === 'applied' ? 'selected' : ''}>Applied</option>
            <option value="interview" ${currentStatus === 'interview' ? 'selected' : ''}>Interview</option>
            <option value="offer" ${currentStatus === 'offer' ? 'selected' : ''}>Offer</option>
            <option value="hired" ${currentStatus === 'hired' ? 'selected' : ''}>Hired</option>
            <option value="rejected" ${currentStatus === 'rejected' ? 'selected' : ''}>Rejected</option>
            <option value="no_response" ${currentStatus === 'no_response' ? 'selected' : ''}>No Response</option>
          </select>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm btn-open-followup" data-company="${r.company}" data-role="${r.role}" data-type="followup">
              ✉ 10-Day Follow-Up
            </button>
            <button class="btn btn-outline btn-sm btn-open-thankyou" data-company="${r.company}" data-role="${r.role}" data-type="thank_you">
              🤝 Thank-You
            </button>
          </div>
        </td>
      `;

      // Status Change Listener
      const selectEl = tr.querySelector('.status-select-control');
      selectEl.addEventListener('change', async (e) => {
        const newStatus = e.target.value;
        try {
          await fetch('/api/update-tracker-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company: r.company, role: r.role, newStatus })
          });
          showToast(`✓ Updated ${r.company} status to "${newStatus}"!`);
          loadPipelineAnalytics();
        } catch {
          showToast('Failed to update status', true);
        }
      });

      // Follow-Up Note Button
      tr.querySelector('.btn-open-followup').addEventListener('click', () => openCommunicationModal(r.company, r.role, 'followup'));
      tr.querySelector('.btn-open-thankyou').addEventListener('click', () => openCommunicationModal(r.company, r.role, 'thank_you'));

      trackerTableBody.appendChild(tr);
    });
  }

  // Communication Modal (/outcome)
  async function openCommunicationModal(company, role, type) {
    followupModal.style.display = 'flex';
    followupSubject.value = 'Drafting communication note...';
    followupBody.value = 'Generating personalized executive note...';

    if (type === 'thank_you') {
      followupModalTitle.textContent = `🤝 Post-Interview Thank-You Note: ${role} at ${company}`;
      followupModalSubtitle.textContent = 'Signals technical depth, professionalism, and immediate alignment.';
    } else {
      followupModalTitle.textContent = `✉ 10-Day Polite Follow-Up: ${role} at ${company}`;
      followupModalSubtitle.textContent = 'Surfaces quiet applications with polite, anti-cliché follow-up framing.';
    }

    try {
      const res = await fetch('/api/draft-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, type })
      });
      const data = await res.json();
      followupSubject.value = data.subject || 'Follow-Up Regarding Application';
      followupBody.value = data.draft || '';
    } catch {
      showToast('Failed to draft communication note', true);
    }
  }

  btnCloseFollowupModal.addEventListener('click', () => {
    followupModal.style.display = 'none';
  });

  btnCopyFollowupNote.addEventListener('click', () => {
    const full = `${followupSubject.value}\n\n${followupBody.value}`;
    navigator.clipboard.writeText(full);
    btnCopyFollowupNote.textContent = '✓ Copied Message!';
    setTimeout(() => { btnCopyFollowupNote.textContent = '📋 Copy to Clipboard'; }, 2000);
    showToast('✓ Message copied to clipboard ready to send!');
  });

  async function addActiveJobToTracker() {
    if (!activeJobDetail) {
      showToast('Please select or inspect a job first!', true);
      return;
    }

    const job = activeJobDetail.job;
    const ev = activeJobDetail.eval;
    const dateStr = new Date().toISOString().slice(0, 10);

    try {
      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          company: job.company,
          role: job.title,
          score: ev.score.toFixed(1),
          url: job.url || '#'
        })
      });
      showToast(`✓ Tracked: "${job.title} at ${job.company}" saved to job_search_tracker.csv!`);
      btnTrackFromDetail.textContent = '✓ Saved in Tracker!';
      setTimeout(() => { btnTrackFromDetail.textContent = '💾 Add to Tracker'; }, 2500);
      loadPipelineAnalytics();
    } catch (e) {
      showToast('Could not save to tracker CSV', true);
    }
  }

  btnTrackFromDetail.addEventListener('click', addActiveJobToTracker);

  btnCopyAllCsv.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/tracker');
      const data = await res.json();
      const rows = data.applications || [];
      const header = '"date","company","sector","role","status","match_score","posting_url"\n';
      const body = rows.map(r => `"${r.date}","${r.company}","Technology","${r.role}","${r.status}","${r.score}","${r.url}"`).join('\n');
      navigator.clipboard.writeText(header + body);
      showToast('✓ All applications CSV copied to clipboard!');
      btnCopyAllCsv.textContent = '✓ Copied CSV!';
      setTimeout(() => { btnCopyAllCsv.textContent = '📥 Copy All CSV'; }, 2000);
    } catch {
      showToast('Failed to copy CSV', true);
    }
  });

  // 8. Profile Vault Management & Auto-Enrichment (/setup & /expand)
  async function loadProfile() {
    try {
      const res = await fetch('/api/profile');
      candidateProfile = await res.json();
      profFullName.value = candidateProfile.fullName || '';
      profEmail.value = candidateProfile.email || '';
      profPhone.value = candidateProfile.phone || '';
      profLocation.value = candidateProfile.location || '';
      profHeadline.value = candidateProfile.headline || '';
      profSkills.value = candidateProfile.skills || '';
      profAchievements.value = candidateProfile.achievements || '';

      cvName.textContent = candidateProfile.fullName;
      cvContact.textContent = `${candidateProfile.location} • ${candidateProfile.email} • ${candidateProfile.phone}`;
      cvSkills.innerHTML = `<strong>Technical Stack:</strong> ${candidateProfile.skills}`;
    } catch (e) {
      showToast('Could not load profile', true);
    }
  }

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updated = {
      ...candidateProfile,
      fullName: profFullName.value.trim(),
      email: profEmail.value.trim(),
      phone: profPhone.value.trim(),
      location: profLocation.value.trim(),
      headline: profHeadline.value.trim(),
      skills: profSkills.value.trim(),
      achievements: profAchievements.value.trim()
    };

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      candidateProfile = updated;
      cvName.textContent = updated.fullName;
      cvContact.textContent = `${updated.location} • ${updated.email} • ${updated.phone}`;
      showToast('✓ Profile updated and saved to candidate_profile.json!');
    } catch (e) {
      showToast('Failed to save profile', true);
    }
  });

  if (btnAutoEnrichProfile) {
    btnAutoEnrichProfile.addEventListener('click', async () => {
      btnAutoEnrichProfile.disabled = true;
      btnAutoEnrichProfile.textContent = '⏳ Scanning GitHub & Repos...';

      try {
        const res = await fetch('/api/expand-profile', { method: 'POST' });
        const data = await res.json();
        candidateProfile = data.profile;
        profSkills.value = candidateProfile.skills;
        profAchievements.value = candidateProfile.achievements;
        cvSkills.innerHTML = `<strong>Technical Stack:</strong> ${candidateProfile.skills}`;
        showToast('✓ Profile enriched with production benchmarks & competencies (/expand)!');
      } catch {
        showToast('Failed to auto-enrich profile', true);
      } finally {
        btnAutoEnrichProfile.disabled = false;
        btnAutoEnrichProfile.textContent = '⚡ Auto-Enrich Profile (/expand)';
      }
    });
  }

  // Initial Boot
  loadProfile().then(async () => {
    initSmartGeoPricing();
    renderWebFreemiumUI();
    await verifyProSessionOnBoot();
    executeSearch(true);
  });
})();
