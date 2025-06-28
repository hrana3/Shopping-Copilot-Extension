// Chrome Extension Content Script for Browseable.ai
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget } from './ChatWidget';
import { detectEcommerceSite } from '../utils/dom-utils';
import { initShopifyParser } from './shopifyParser';

// Comprehensive logging for debugging
console.log('🚀 Browseable.ai content script loaded!');
console.log('📍 Current URL:', window.location.href);
console.log('📄 Document ready state:', document.readyState);

function initializeChatWidget() {
  console.log('🔍 Initializing chat widget...');
  
  // Check if widget already exists
  if (document.getElementById('browseable-ai-widget')) {
    console.log('⚠️ Widget already exists, skipping initialization');
    return;
  }

  // Initialize Shopify parser first
  try {
    initShopifyParser();
    console.log('✅ Shopify parser initialized');
  } catch (error) {
    console.warn('⚠️ Shopify parser initialization failed:', error);
  }

  // Check if we're on an e-commerce site
  const siteInfo = detectEcommerceSite();
  console.log('🏪 Site detection result:', siteInfo);
  
  // For debugging, let's be more permissive initially
  const shouldInitialize = siteInfo.isProductPage || 
                          siteInfo.isListingPage || 
                          window.location.hostname.includes('shopify') ||
                          window.location.pathname.includes('product') ||
                          window.location.pathname.includes('shop') ||
                          window.location.pathname.includes('collection') ||
                          true; // Enable on all sites for testing
  
  if (!shouldInitialize) {
    console.log('❌ Not an e-commerce page, skipping widget initialization');
    return;
  }

  console.log('✅ Initializing on', siteInfo.platform, 'site');

  try {
    // Create container for the chat widget
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'browseable-ai-widget';
    
    // Create React container
    const reactContainer = document.createElement('div');
    reactContainer.style.cssText = `
      position: relative !important;
      width: 100% !important;
      height: 100% !important;
    `;
    widgetContainer.appendChild(reactContainer);

    // Mount React component
    console.log('⚛️ Mounting React component...');
    const root = createRoot(reactContainer);
    root.render(React.createElement(ChatWidget));
    console.log('✅ React component mounted');

    // Add to page
    document.body.appendChild(widgetContainer);
    console.log('🎯 Widget added to page');

    // Verify widget is in DOM
    const verifyWidget = document.getElementById('browseable-ai-widget');
    console.log('🔍 Widget verification:', !!verifyWidget);
    
    if (verifyWidget) {
      console.log('🎉 Chat widget initialized successfully!');
    } else {
      console.error('❌ Widget not found in DOM after insertion');
    }

    // Send extracted products to background script for sharing between tabs
    if ((window as any).__browseableAiProducts || (window as any).__BROWSEABLE_PRODUCTS) {
      const products = (window as any).__browseableAiProducts || (window as any).__BROWSEABLE_PRODUCTS;
      if (chrome && chrome.runtime && products && products.length > 0) {
        chrome.runtime.sendMessage({ 
          type: 'SAVE_PRODUCTS', 
          products: products 
        }, (response) => {
          console.log('🔄 Saved products to background script:', response);
        });
      }
    }

  } catch (error) {
    console.error('💥 Error initializing chat widget:', error);
  }
}

// Multiple initialization strategies
function attemptInitialization() {
  console.log('🎯 Attempting widget initialization...');
  
  // Strategy 1: Immediate initialization if DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('📄 DOM is ready, initializing immediately');
    setTimeout(initializeChatWidget, 500);
  } else {
    console.log('⏳ DOM not ready, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📄 DOMContentLoaded fired');
      setTimeout(initializeChatWidget, 500);
    });
  }
  
  // Strategy 2: Fallback initialization after page load
  window.addEventListener('load', () => {
    console.log('🏁 Window load event fired');
    setTimeout(() => {
      if (!document.getElementById('browseable-ai-widget')) {
        console.log('🔄 Fallback initialization triggered');
        initializeChatWidget();
      }
    }, 1000);
  });
  
  // Strategy 3: Final fallback
  setTimeout(() => {
    if (!document.getElementById('browseable-ai-widget')) {
      console.log('⏱️ Timeout fallback initialization triggered');
      initializeChatWidget();
    }
  }, 2000);
}

// Start the initialization process
attemptInitialization();

// Handle dynamic page changes (SPA navigation)
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    console.log('🔄 URL changed to:', currentUrl);
    setTimeout(() => {
      if (!document.getElementById('browseable-ai-widget')) {
        console.log('🔄 Re-initializing after navigation');
        initializeChatWidget();
      }
    }, 1000);
  }
});

// Start observing when body is available
if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  });
}

console.log('🎬 Content script setup complete');