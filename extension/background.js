// Background Service Worker (Manifest V3)
chrome.runtime.onInstalled.addListener(() => {
  console.log('[AI Job Copilot] Extension installed successfully.');
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
      console.warn('Could not set openPanelOnActionClick:', err);
    });
  }
});

// Relay communication between SidePanel and Content Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'GET_ACTIVE_TAB_JOB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        sendResponse({ success: false, error: 'No active tab' });
        return;
      }
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: 'SCRAPE_CURRENT_PAGE' }, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
            tabUrl: activeTab.url
          });
        } else {
          sendResponse({ success: true, data: response });
        }
      });
    });
    return true; // Keep channel open for async response
  }
});
