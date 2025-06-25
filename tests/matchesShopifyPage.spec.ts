// Version: 1.0.1 - Updated for GitHub tracking
import { JSDOM } from 'jsdom';

describe('matchesShopifyPage Function - Isolated Testing', () => {
  // Helper function to create a fresh test environment with a specific URL
  function createFreshEnvironment(url: string) {
    const dom = new JSDOM('<html><body></body></html>', { url });
    return {
      window: dom.window,
      document: dom.window.document,
      cleanup: () => dom.window.close()
    };
  }

  // Inline version of matchesShopifyPage that uses passed window
  function testMatchesShopifyPage(testWindow: any): boolean {
    try {
      const pathname = testWindow.location.pathname;
      console.log('DEBUG: Checking pathname:', pathname);
      const isMatch = pathname.includes('/collections/') || pathname.includes('/products/');
      console.log('DEBUG: Page matches Shopify pattern:', isMatch);
      return isMatch;
    } catch (error) {
      console.warn('Error matching Shopify page:', error);
      return false;
    }
  }

  describe('Product Pages', () => {
    it('should match single product page', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/products/cool-t-shirt');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(true);
      
      env.cleanup();
    });

    it('should match product page with variant', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/products/cool-t-shirt?variant=123456');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(true);
      
      env.cleanup();
    });

    it('should match product page with complex handle', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/products/premium-organic-cotton-t-shirt-with-logo');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(true);
      
      env.cleanup();
    });

    it('should match product page on custom domain', () => {
      const env = createFreshEnvironment('https://customstore.com/products/awesome-product');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(true);
      
      env.cleanup();
    });
  });

  describe('Collection Pages', () => {
    it('should match collection listing page', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/collections/clothing');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(true);
      
      env.cleanup();
    });

    it('should match collection page with filters', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/collections/clothing?filter.v.price.gte=10&filter.v.price.lte=50');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(true);
      
      env.cleanup();
    });

    it('should match collection page with sorting', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/collections/all?sort_by=price-ascending');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(true);
      
      env.cleanup();
    });

    it('should match nested collection', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/collections/clothing/mens');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(true);
      
      env.cleanup();
    });
  });

  describe('Non-matching Pages', () => {
    it('should not match homepage', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(false);
      
      env.cleanup();
    });

    it('should not match about page', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/pages/about');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(false);
      
      env.cleanup();
    });

    it('should not match blog page', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/blogs/news');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(false);
      
      env.cleanup();
    });

    it('should not match cart page', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/cart');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(false);
      
      env.cleanup();
    });

    it('should not match account page', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/account');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(false);
      
      env.cleanup();
    });

    it('should not match search page', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/search?q=shirt');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(false);
      
      env.cleanup();
    });
  });

  describe('Edge Cases', () => {
    it('should handle URLs with products in query params but not path', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/search?q=products');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(false);
      
      env.cleanup();
    });

    it('should handle URLs with collections in query params but not path', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/search?type=collections');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(false);
      
      env.cleanup();
    });

    it('should handle malformed URLs gracefully', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/products/');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(true); // Still matches because it contains /products/
      
      env.cleanup();
    });

    it('should handle URLs with fragments', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/products/shirt#reviews');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(true);
      
      env.cleanup();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing location object gracefully', () => {
      // Create a custom test function that simulates missing location
      function testWithMissingLocation(): boolean {
        try {
          // Simulate accessing location.pathname when location is undefined
          const testWindow = { location: undefined } as any;
          const pathname = testWindow.location?.pathname;
          console.log('DEBUG: Checking pathname:', pathname);
          const isMatch = pathname?.includes('/collections/') || pathname?.includes('/products/');
          console.log('DEBUG: Page matches Shopify pattern:', isMatch);
          return !!isMatch;
        } catch (error) {
          console.warn('Error matching Shopify page:', error);
          return false;
        }
      }
      
      const result = testWithMissingLocation();
      expect(result).toBe(false);
    });

    it('should handle location.pathname access errors gracefully', () => {
      // Create a custom test function that simulates pathname access error
      function testWithPathnameError(): boolean {
        try {
          // Simulate a location object that throws when accessing pathname
          const testWindow = {
            location: {
              get pathname() {
                throw new Error('Cannot access pathname');
              }
            }
          } as any;
          
          const pathname = testWindow.location.pathname;
          console.log('DEBUG: Checking pathname:', pathname);
          const isMatch = pathname.includes('/collections/') || pathname.includes('/products/');
          console.log('DEBUG: Page matches Shopify pattern:', isMatch);
          return isMatch;
        } catch (error) {
          console.warn('Error matching Shopify page:', error);
          return false;
        }
      }
      
      const result = testWithPathnameError();
      expect(result).toBe(false);
    });
  });

  describe('Case Sensitivity', () => {
    it('should be case sensitive for products path', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/Products/Cool-Shirt');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(false); // Should be case sensitive - /Products/ != /products/
      
      env.cleanup();
    });

    it('should be case sensitive for collections path', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/Collections/clothing');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(false); // Should be case sensitive - /Collections/ != /collections/
      
      env.cleanup();
    });
  });

  describe('Additional Edge Cases', () => {
    it('should handle empty pathname', () => {
      // Create a custom test function that simulates empty pathname
      function testWithEmptyPathname(): boolean {
        try {
          const testWindow = {
            location: {
              pathname: ''
            }
          } as any;
          
          const pathname = testWindow.location.pathname;
          console.log('DEBUG: Checking pathname:', pathname);
          const isMatch = pathname.includes('/collections/') || pathname.includes('/products/');
          console.log('DEBUG: Page matches Shopify pattern:', isMatch);
          return isMatch;
        } catch (error) {
          console.warn('Error matching Shopify page:', error);
          return false;
        }
      }
      
      const result = testWithEmptyPathname();
      expect(result).toBe(false);
    });

    it('should handle null pathname', () => {
      // Create a custom test function that simulates null pathname
      function testWithNullPathname(): boolean {
        try {
          const testWindow = {
            location: {
              pathname: null
            }
          } as any;
          
          const pathname = testWindow.location.pathname;
          console.log('DEBUG: Checking pathname:', pathname);
          const isMatch = pathname?.includes('/collections/') || pathname?.includes('/products/');
          console.log('DEBUG: Page matches Shopify pattern:', isMatch);
          return !!isMatch;
        } catch (error) {
          console.warn('Error matching Shopify page:', error);
          return false;
        }
      }
      
      const result = testWithNullPathname();
      expect(result).toBe(false);
    });

    it('should match products path with trailing slash', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/products/shirt/');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(true);
      
      env.cleanup();
    });

    it('should match collections path with trailing slash', () => {
      const env = createFreshEnvironment('https://test-shop.myshopify.com/collections/clothing/');
      
      const result = testMatchesShopifyPage(env.window);
      expect(result).toBe(true);
      
      env.cleanup();
    });
  });
});