// Popup script for Browseable.ai Chrome Extension
document.addEventListener('DOMContentLoaded', () => {
  console.log('Browseable.ai popup loaded');
  
  // Check if we're on a supported site
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const tab = tabs[0];
    if (tab && tab.url) {
      const url = new URL(tab.url);
      const supportedSites = ['shopify', 'amazon', 'ebay', 'etsy', 'target', 'walmart'];
      const isSupported = supportedSites.some(site => url.hostname.includes(site)) ||
                         url.pathname.includes('/product') ||
                         url.pathname.includes('/shop');
      
      const statusEl = document.querySelector('.status');
      if (statusEl) {
        if (isSupported) {
          statusEl.textContent = '✅ Active on this site';
          statusEl.classList.add('active');
        } else {
          statusEl.textContent = '⚠️ Navigate to an e-commerce site to use';
          statusEl.classList.remove('active');
        }
      }
    }
  });
});