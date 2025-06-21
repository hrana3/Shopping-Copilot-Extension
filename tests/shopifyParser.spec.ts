import { JSDOM } from 'jsdom';

describe('Shopify Parser - Single Test Focus', () => {
  let originalWindow: any;
  let originalDocument: any;

  beforeEach(() => {
    // Store original globals
    originalWindow = global.window;
    originalDocument = global.document;
  });

  afterEach(() => {
    // Restore original globals
    global.window = originalWindow;
    global.document = originalDocument;
  });

  // Simple inline version of detectShopify for testing
  function testDetectShopify(): boolean {
    try {
      console.log('Testing Shopify detection...');
      
      // Check for Shopify globals
      const hasShopifyAnalytics = !!(global.window as any)?.ShopifyAnalytics;
      const hasSt = !!(global.window as any)?.__st;
      console.log('ShopifyAnalytics exists:', hasShopifyAnalytics);
      console.log('__st exists:', hasSt);
      
      if (hasShopifyAnalytics || hasSt) {
        console.log('Found Shopify globals');
        return true;
      }

      // Check for Shopify script tags
      const shopifySettings = global.document?.querySelector('script#ShopifySettings');
      console.log('ShopifySettings script exists:', !!shopifySettings);
      if (shopifySettings) {
        console.log('Found ShopifySettings script');
        return true;
      }

      // Check for Shopify meta tags
      const shopifyMeta = global.document?.querySelector('meta[name="shopify-checkout-api-token"]');
      console.log('Shopify meta tag exists:', !!shopifyMeta);
      if (shopifyMeta) {
        console.log('Found Shopify meta tag');
        return true;
      }

      console.log('No Shopify indicators found');
      return false;
    } catch (error) {
      console.warn('Error detecting Shopify:', error);
      return false;
    }
  }

  describe('detectShopify', () => {
    it('should detect Shopify via global variables', () => {
      // Create clean DOM
      const dom = new JSDOM('<html><body></body></html>');
      
      // Set up globals
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      // Add Shopify global
      (global.window as any).ShopifyAnalytics = { meta: {} };
      
      // Test the function
      const result = testDetectShopify();
      
      // Verify result
      expect(result).toBe(true);
      
      // Clean up
      dom.window.close();
    });

    it('should return false for non-Shopify sites', () => {
      // Create completely clean DOM
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Regular Website</title>
          </head>
          <body>
            <h1>Not a Shopify site</h1>
          </body>
        </html>
      `);
      
      // Set up globals
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      // Explicitly ensure NO Shopify globals exist
      delete (global.window as any).ShopifyAnalytics;
      delete (global.window as any).__st;
      
      // Double-check that globals are actually deleted
      console.log('Before test - ShopifyAnalytics:', (global.window as any).ShopifyAnalytics);
      console.log('Before test - __st:', (global.window as any).__st);
      
      // Test the function
      const result = testDetectShopify();
      
      // Verify result
      expect(result).toBe(false);
      
      // Clean up
      dom.window.close();
    });
  });
});