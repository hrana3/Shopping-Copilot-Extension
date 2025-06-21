import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget } from './ChatWidget';
import { detectEcommerceSite, createShadowRoot, injectStyles } from '../utils/dom-utils';
import { initShopifyParser } from './shopifyParser';

// Tailwind CSS styles - in a real extension, this would be built and injected
const styles = `
  @import 'https://cdn.tailwindcss.com/3.4.1';
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

function initializeChatWidget() {
  // Initialize Shopify parser first
  initShopifyParser();

  // Check if we're on an e-commerce site
  const siteInfo = detectEcommerceSite();
  
  if (!siteInfo.isProductPage && !siteInfo.isListingPage) {
    console.log('Browseable.ai: Not an e-commerce page, skipping widget initialization');
    return;
  }

  console.log('Browseable.ai: Initializing on', siteInfo.platform, 'site');

  // Create container for the chat widget
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'browseable-ai-widget';
  widgetContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2147483647;
  `;

  // Create shadow root to isolate styles
  const shadowRoot = createShadowRoot(widgetContainer);
  
  // Inject styles
  injectStyles(shadowRoot, styles);

  // Create React container inside shadow root
  const reactContainer = document.createElement('div');
  reactContainer.style.cssText = `
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: auto;
  `;
  shadowRoot.appendChild(reactContainer);

  // Mount React component
  const root = createRoot(reactContainer);
  root.render(<ChatWidget />);

  // Add to page
  document.body.appendChild(widgetContainer);

  console.log('Browseable.ai: Chat widget initialized successfully');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChatWidget);
} else {
  initializeChatWidget();
}

// Handle dynamic page changes (SPA navigation)
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    // Re-check if we need to initialize on the new page
    setTimeout(initializeChatWidget, 1000);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});