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

// Inline styles for the widget
const createStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    /* Browseable.ai Widget Styles */
    #browseable-ai-widget {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      pointer-events: none !important;
      z-index: 2147483647 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    
    #browseable-ai-widget * {
      box-sizing: border-box !important;
    }
    
    .browseable-chat-bubble {
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      width: 56px !important;
      height: 56px !important;
      background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%) !important;
      border-radius: 50% !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 2147483647 !important;
      pointer-events: auto !important;
      border: none !important;
      color: white !important;
    }
    
    .browseable-chat-bubble:hover {
      transform: scale(1.1) !important;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
    }
    
    .browseable-chat-drawer {
      position: fixed !important;
      top: 16px !important;
      right: 16px !important;
      bottom: 16px !important;
      width: 400px !important;
      max-width: calc(100vw - 32px) !important;
      background: white !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
      z-index: 2147483646 !important;
      pointer-events: auto !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }
    
    .browseable-chat-backdrop {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(0, 0, 0, 0.3) !important;
      backdrop-filter: blur(4px) !important;
      z-index: 2147483645 !important;
      pointer-events: auto !important;
    }
  `;
  return style;
};

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
                          window.location.pathname.includes('collection');
  
  if (!shouldInitialize) {
    console.log('❌ Not an e-commerce page, but initializing anyway for testing');
    // For debugging, let's initialize on all pages temporarily
  }

  console.log('✅ Initializing on', siteInfo.platform, 'site');

  try {
    // Add styles to document head
    const styles = createStyles();
    document.head.appendChild(styles);
    console.log('🎨 Styles added to document head');

    // Create container for the chat widget
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'browseable-ai-widget';

    // Create React container
    const reactContainer = document.createElement('div');
    reactContainer.style.cssText = `
      position: relative !important;
      width: 100% !important;
      height: 100% !important;
      pointer-events: auto !important;
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
    setTimeout(initializeChatWidget, 100);
  } else {
    console.log('⏳ DOM not ready, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📄 DOMContentLoaded fired');
      setTimeout(initializeChatWidget, 100);
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
    }, 500);
  });
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