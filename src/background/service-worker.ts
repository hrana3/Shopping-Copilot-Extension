// Version: 1.0.1 - Updated for GitHub tracking
// Background service worker for the Chrome extension
console.log('Browseable.ai service worker loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Browseable.ai extension installed');
    
    // Set default settings
    chrome.storage.sync.set({
      enabled: true,
      aiProvider: 'openai',
      preferences: {
        style: [],
        budget_range: [0, 1000],
        sizes: [],
        brands: []
      }
    });
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Service worker received message:', request);
  
  switch (request.type) {
    case 'GET_SETTINGS':
      chrome.storage.sync.get(['enabled', 'preferences'], (result) => {
        sendResponse(result);
      });
      return true; // Keep the message channel open for async response
      
    case 'SAVE_SETTINGS':
      chrome.storage.sync.set(request.settings, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'TRACK_EVENT':
      // Analytics tracking would go here
      console.log('Event tracked:', request.event);
      sendResponse({ success: true });
      break;
      
    case 'GET_PRODUCTS':
      // In a real implementation, this might fetch from an API
      sendResponse({ products: [] });
      break;
      
    default:
      console.warn('Unknown message type:', request.type);
  }
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    
    // Check if it's an e-commerce site
    const ecommerceDomains = [
      'shopify.com',
      'amazon.com',
      'ebay.com',
      'etsy.com',
      'target.com',
      'walmart.com'
    ];
    
    const isEcommerce = ecommerceDomains.some(domain => 
      url.hostname.includes(domain) || 
      url.pathname.includes('/product') ||
      url.pathname.includes('/shop')
    );
    
    if (isEcommerce) {
      console.log('E-commerce site detected:', url.hostname);
    }
  }
});

// Keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
  console.log('Port connected:', port.name);
});

export {};