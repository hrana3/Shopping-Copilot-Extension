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

// Comprehensive CSS styles for the widget
const createStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    /* Browseable.ai Widget Styles - Comprehensive Reset and Styling */
    #browseable-ai-widget {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      pointer-events: none !important;
      z-index: 2147483647 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      color: #374151 !important;
    }
    
    #browseable-ai-widget *,
    #browseable-ai-widget *::before,
    #browseable-ai-widget *::after {
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    #browseable-ai-widget button,
    #browseable-ai-widget input,
    #browseable-ai-widget a,
    #browseable-ai-widget [role="button"] {
      pointer-events: auto !important;
    }
    
    /* Chat Bubble Styles */
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
      outline: none !important;
    }
    
    .browseable-chat-bubble:hover {
      transform: scale(1.1) !important;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
    }
    
    .browseable-chat-bubble:focus {
      outline: 2px solid #8b5cf6 !important;
      outline-offset: 2px !important;
    }
    
    /* Chat Drawer Styles */
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
    
    /* Backdrop Styles */
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
    
    /* Responsive Design */
    @media (max-width: 640px) {
      .browseable-chat-drawer {
        top: 8px !important;
        right: 8px !important;
        bottom: 8px !important;
        left: 8px !important;
        width: auto !important;
        max-width: none !important;
      }
      
      .browseable-chat-bubble {
        bottom: 16px !important;
        right: 16px !important;
        width: 48px !important;
        height: 48px !important;
      }
    }
    
    /* Animation Keyframes */
    @keyframes browseableFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes browseableSlideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    /* Animation Classes */
    .browseable-fade-in {
      animation: browseableFadeIn 0.3s ease-out !important;
    }
    
    .browseable-slide-in {
      animation: browseableSlideIn 0.3s ease-out !important;
    }
    
    /* Ensure no conflicts with page styles */
    #browseable-ai-widget .reset {
      all: initial !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
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
                          window.location.pathname.includes('collection') ||
                          true; // Enable on all sites for testing
  
  if (!shouldInitialize) {
    console.log('❌ Not an e-commerce page, skipping widget initialization');
    return;
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