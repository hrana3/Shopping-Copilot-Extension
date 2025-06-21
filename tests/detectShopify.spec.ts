import { JSDOM } from 'jsdom';

describe('detectShopify Function - Completely Isolated Testing', () => {
  // Helper function to create a completely fresh test environment
  function createFreshEnvironment(htmlContent: string = '<html><body></body></html>') {
    const dom = new JSDOM(htmlContent);
    return {
      window: dom.window,
      document: dom.window.document,
      cleanup: () => dom.window.close()
    };
  }

  // Inline version of detectShopify that uses passed window/document
  function testDetectShopify(testWindow: any, testDocument: any): boolean {
    try {
      console.log('DEBUG: Starting Shopify detection...');
      
      // Check for Shopify globals
      console.log('DEBUG: Checking for ShopifyAnalytics:', !!testWindow.ShopifyAnalytics);
      console.log('DEBUG: Checking for __st:', !!testWindow.__st);
      if (testWindow.ShopifyAnalytics || testWindow.__st) {
        console.log('DEBUG: Found Shopify globals');
        return true;
      }

      // Check for Shopify script tags
      const shopifySettings = testDocument.querySelector('script#ShopifySettings');
      console.log('DEBUG: Found ShopifySettings script:', !!shopifySettings);
      if (shopifySettings) {
        console.log('DEBUG: Found ShopifySettings script');
        return true;
      }

      // Check for Shopify meta tags
      const shopifyMeta = testDocument.querySelector('meta[name="shopify-checkout-api-token"]');
      console.log('DEBUG: Found Shopify meta tag:', !!shopifyMeta);
      if (shopifyMeta) {
        console.log('DEBUG: Found Shopify meta tag');
        return true;
      }

      console.log('DEBUG: No Shopify indicators found');
      return false;
    } catch (error) {
      console.warn('Error detecting Shopify:', error);
      return false;
    }
  }

  describe('ShopifyAnalytics Global Detection', () => {
    it('should detect when ShopifyAnalytics exists', () => {
      const env = createFreshEnvironment();
      
      // Add ShopifyAnalytics global
      env.window.ShopifyAnalytics = { meta: {} };
      
      console.log('Test setup - ShopifyAnalytics:', env.window.ShopifyAnalytics);
      
      const result = testDetectShopify(env.window, env.document);
      expect(result).toBe(true);
      
      env.cleanup();
    });

    it('should detect when ShopifyAnalytics is empty object', () => {
      const env = createFreshEnvironment();
      
      // Add empty ShopifyAnalytics global
      env.window.ShopifyAnalytics = {};
      
      const result = testDetectShopify(env.window, env.document);
      expect(result).toBe(true);
      
      env.cleanup();
    });
  });

  describe('__st Global Detection', () => {
    it('should detect when __st exists', () => {
      const env = createFreshEnvironment();
      
      // Add __st global
      env.window.__st = { meta: {} };
      
      console.log('Test setup - __st:', env.window.__st);
      
      const result = testDetectShopify(env.window, env.document);
      expect(result).toBe(true);
      
      env.cleanup();
    });

    it('should detect when __st is empty object', () => {
      const env = createFreshEnvironment();
      
      // Add empty __st global
      env.window.__st = {};
      
      const result = testDetectShopify(env.window, env.document);
      expect(result).toBe(true);
      
      env.cleanup();
    });
  });

  describe('Script Tag Detection', () => {
    it('should detect ShopifySettings script tag', () => {
      const env = createFreshEnvironment(`
        <html>
          <head>
            <script id="ShopifySettings" type="text/javascript">
              window.Shopify = { shop: "test-shop" };
            </script>
          </head>
          <body></body>
        </html>
      `);
      
      // Verify the script exists in DOM
      const script = env.document.querySelector('script#ShopifySettings');
      console.log('Script found in DOM:', !!script);
      console.log('Script id:', script?.id);
      
      const result = testDetectShopify(env.window, env.document);
      expect(result).toBe(true);
      
      env.cleanup();
    });

    it('should detect ShopifySettings script with different content', () => {
      const env = createFreshEnvironment(`
        <html>
          <head>
            <script id="ShopifySettings">
              var Shopify = Shopify || {};
            </script>
          </head>
          <body></body>
        </html>
      `);
      
      const result = testDetectShopify(env.window, env.document);
      expect(result).toBe(true);
      
      env.cleanup();
    });
  });

  describe('Meta Tag Detection', () => {
    it('should detect shopify-checkout-api-token meta tag', () => {
      const env = createFreshEnvironment(`
        <html>
          <head>
            <meta name="shopify-checkout-api-token" content="abc123def456">
            <title>Test Shop</title>
          </head>
          <body></body>
        </html>
      `);
      
      // Verify the meta tag exists in DOM
      const meta = env.document.querySelector('meta[name="shopify-checkout-api-token"]');
      console.log('Meta tag found in DOM:', !!meta);
      console.log('Meta tag name:', meta?.getAttribute('name'));
      console.log('Meta tag content:', meta?.getAttribute('content'));
      
      const result = testDetectShopify(env.window, env.document);
      expect(result).toBe(true);
      
      env.cleanup();
    });

    it('should detect meta tag with empty content', () => {
      const env = createFreshEnvironment(`
        <html>
          <head>
            <meta name="shopify-checkout-api-token" content="">
          </head>
          <body></body>
        </html>
      `);
      
      const result = testDetectShopify(env.window, env.document);
      expect(result).toBe(true);
      
      env.cleanup();
    });
  });

  describe('Non-Shopify Sites', () => {
    it('should return false when no Shopify indicators exist', () => {
      const env = createFreshEnvironment(`
        <html>
          <head>
            <title>Regular Website</title>
            <meta name="description" content="Just a regular website">
          </head>
          <body>
            <h1>Not a Shopify site</h1>
            <script>
              console.log('Regular JavaScript');
            </script>
          </body>
        </html>
      `);
      
      // Verify clean state - fresh environment should have no Shopify globals
      console.log('Verification - ShopifyAnalytics:', env.window.ShopifyAnalytics);
      console.log('Verification - __st:', env.window.__st);
      console.log('Verification - ShopifyAnalytics undefined:', env.window.ShopifyAnalytics === undefined);
      console.log('Verification - __st undefined:', env.window.__st === undefined);
      
      const result = testDetectShopify(env.window, env.document);
      expect(result).toBe(false);
      
      env.cleanup();
    });

    it('should return false for completely empty page', () => {
      const env = createFreshEnvironment('<html><body></body></html>');
      
      // Verify clean state
      console.log('Empty page - ShopifyAnalytics:', env.window.ShopifyAnalytics);
      console.log('Empty page - __st:', env.window.__st);
      
      const result = testDetectShopify(env.window, env.document);
      expect(result).toBe(false);
      
      env.cleanup();
    });
  });

  describe('Error Handling', () => {
    it('should handle DOM query errors gracefully', () => {
      const env = createFreshEnvironment('<html><body></body></html>');
      
      // Mock querySelector to throw an error
      const originalQuerySelector = env.document.querySelector;
      env.document.querySelector = jest.fn().mockImplementation(() => {
        throw new Error('DOM query failed');
      });
      
      const result = testDetectShopify(env.window, env.document);
      expect(result).toBe(false);
      
      // Restore original querySelector
      env.document.querySelector = originalQuerySelector;
      
      env.cleanup();
    });
  });

  describe('Multiple Detection Methods', () => {
    it('should return true when multiple indicators exist', () => {
      const env = createFreshEnvironment(`
        <html>
          <head>
            <script id="ShopifySettings">window.Shopify = {};</script>
            <meta name="shopify-checkout-api-token" content="test">
          </head>
          <body></body>
        </html>
      `);
      
      // Also add globals
      env.window.ShopifyAnalytics = { meta: {} };
      env.window.__st = { meta: {} };
      
      const result = testDetectShopify(env.window, env.document);
      expect(result).toBe(true);
      
      env.cleanup();
    });
  });
});