// Universal Content Script for AI Job Copilot (LinkedIn, Naukri, Indeed, Web)
(function () {
  'use strict';

  function clean(str) {
    if (!str) return '';
    return str
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/ignore\s+(previous|all)\s+instructions/gi, '[SECURITY_FILTERED]')
      .replace(/system\s+override/gi, '[SECURITY_FILTERED]')
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

  function extractSingleJob() {
    const url = window.location.href;
    const hostname = window.location.hostname;

    // Strict Non-Job Filter (GitHub, YouTube, Social Media, Google)
    const nonJobHosts = [
      'github.com', 'gitlab.com', 'bitbucket.org',
      'youtube.com', 'twitter.com', 'x.com', 'facebook.com',
      'instagram.com', 'reddit.com', 'wikipedia.org', 'google.com',
      'bing.com', 'yahoo.com', 'medium.com', 'stackoverflow.com'
    ];
    const isNonJob = nonJobHosts.some(h => hostname === h || hostname.endsWith('.' + h));
    if (isNonJob) {
      const p = window.location.pathname.toLowerCase();
      if (!p.includes('/careers') && !p.includes('/jobs') && !p.includes('/job/')) {
        return { isNotJob: true, hostname: hostname };
      }
    }

    let title = '';
    let company = '';
    let location = '';
    let description = '';
    let portal = 'Web';

    // A. NAUKRI
    if (hostname.includes('naukri.com')) {
      portal = 'Naukri';
      const jdHeading = document.querySelector('h1.styles_jd-header-title__rZwM1, h1.title, .top-sec-wrapper h1, h1.jd-header-title');
      if (jdHeading && !isGarbageTitle(clean(jdHeading.innerText))) {
        title = clean(jdHeading.innerText);
      }

      if (!title || isGarbageTitle(title)) {
        const firstCard = document.querySelector('article.jobTuple, div.cust-job-tuple, div.srp-jobtuple-wrapper, div[data-job-id]');
        if (firstCard) {
          const tEl = firstCard.querySelector('a.title, a[title]');
          if (tEl) title = clean(tEl.getAttribute('title') || tEl.innerText);
          const cEl = firstCard.querySelector('a.comp-name, a.subTitle, .companyInfo a, [class*="comp-name"]');
          if (cEl) company = clean(cEl.getAttribute('title') || cEl.innerText);
          const lEl = firstCard.querySelector('.locWdth, span.loc-wrap, .location, [class*="loc"]');
          if (lEl) location = clean(lEl.innerText);
          const dEl = firstCard.querySelector('.job-desc, .job-description, ul.tags-gt');
          if (dEl) description = clean(dEl.innerText);
        }
      }

      if (!company) {
        const cEl = document.querySelector('.comp-name, .companyInfo a, .top-sec-wrapper a');
        if (cEl) company = clean(cEl.innerText);
      }
      if (!location) {
        const lEl = document.querySelector('.locWdth, .location');
        if (lEl) location = clean(lEl.innerText);
      }
    }
    // B. LINKEDIN
    else if (hostname.includes('linkedin.com')) {
      portal = 'LinkedIn';
      const currentJobId = (url.match(/currentJobId=([0-9]+)/) || url.match(/\/view\/([0-9]+)/))?.[1];

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
        if (compEl && !isGarbageTitle(clean(compEl.innerText))) company = clean(compEl.innerText);

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
          if (tEl && !isGarbageTitle(clean(tEl.innerText))) title = clean(tEl.innerText);
          const cEl = card.querySelector('.job-card-container__primary-description, .artdeco-entity-lockup__subtitle, a[href*="/company/"]');
          if (cEl && !company) company = clean(cEl.innerText);
          const lEl = card.querySelector('.job-card-container__metadata-item, .artdeco-entity-lockup__caption');
          if (lEl && !location) location = clean(lEl.innerText);
        }
      }

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
    // C. UNIVERSAL WEB SITES
    else {
      portal = hostname.replace('www.', '').split('.')[0];
      portal = portal.charAt(0).toUpperCase() + portal.slice(1);
      const titleEl = document.querySelector('main h1, article h1, h1, [class*="job-title"], [data-testid*="title"]');
      title = titleEl ? clean(titleEl.innerText || '') : '';
      const compEl = document.querySelector('[class*="company-name"], meta[property="og:site_name"]');
      company = compEl ? clean(compEl.innerText || compEl.content || '') : hostname.split('.')[0];
      const locEl = document.querySelector('[class*="location"]');
      location = locEl ? clean(locEl.innerText) : 'Unspecified';
      const descEl = document.querySelector('#job-description, .job-description, [class*="description"], main');
      description = descEl ? clean(descEl.innerText) : clean(document.body.innerText.slice(0, 3000));
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

  function extractBatchJobs() {
    const hostname = window.location.hostname;
    const nonJobHosts = [
      'github.com', 'gitlab.com', 'bitbucket.org',
      'youtube.com', 'twitter.com', 'x.com', 'facebook.com',
      'instagram.com', 'reddit.com', 'wikipedia.org', 'google.com',
      'bing.com', 'yahoo.com', 'medium.com', 'stackoverflow.com'
    ];
    if (nonJobHosts.some(h => hostname === h || hostname.endsWith('.' + h))) {
      return [];
    }

    const jobs = [];
    const seen = new Set();

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
    } else if (hostname.includes('linkedin.com')) {
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
    } else {
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

  // Listen for message from Extension Sidepanel
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'SCRAPE_CURRENT_PAGE') {
      const data = extractSingleJob();
      sendResponse(data);
    } else if (request.action === 'SCRAPE_BATCH_PAGE') {
      const list = extractBatchJobs();
      sendResponse(list);
    }
  });
})();
