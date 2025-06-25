// Version: 1.0.1 - Updated for GitHub tracking
import { JSDOM } from 'jsdom';
import { detectShopify, matchesShopifyPage, extractProducts } from '../src/content/shopifyParser';

describe('Shopify Parser - Comprehensive Tests', () => {
  let originalWindow: any;
  let originalDocument: any;

  beforeEach(() => {
    // Store original globals
    originalWindow = global.window;
    originalDocument = global.document;
  });

  afterEach(() => {
    // Clean up any Shopify globals that might have been added
    if (global.window) {
      delete (global.window as any).ShopifyAnalytics;
      delete (global.window as any).__st;
      delete (global.window as any).__browseableAiProducts;
    }
    
    // Restore original globals
    global.window = originalWindow;
    global.document = originalDocument;
  });

  describe('detectShopify', () => {
    it('should detect Shopify via ShopifyAnalytics global', () => {
      const dom = new JSDOM('<html><body></body></html>');
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      (global.window as any).ShopifyAnalytics = { meta: {} };
      
      expect(detectShopify()).toBe(true);
      dom.window.close();
    });

    it('should detect Shopify via __st global', () => {
      const dom = new JSDOM('<html><body></body></html>');
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      (global.window as any).__st = { meta: {} };
      
      expect(detectShopify()).toBe(true);
      dom.window.close();
    });

    it('should detect Shopify via script tag', () => {
      const dom = new JSDOM(`
        <html>
          <head>
            <script id="ShopifySettings" type="text/javascript">
              window.Shopify = { shop: "test-shop" };
            </script>
          </head>
          <body></body>
        </html>
      `);
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      expect(detectShopify()).toBe(true);
      dom.window.close();
    });

    it('should detect Shopify via meta tag', () => {
      const dom = new JSDOM(`
        <html>
          <head>
            <meta name="shopify-checkout-api-token" content="abc123">
          </head>
          <body></body>
        </html>
      `);
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      expect(detectShopify()).toBe(true);
      dom.window.close();
    });

    it('should return false for non-Shopify sites', () => {
      const dom = new JSDOM(`
        <html>
          <head><title>Regular Website</title></head>
          <body><h1>Not a Shopify site</h1></body>
        </html>
      `);
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      expect(detectShopify()).toBe(false);
      dom.window.close();
    });
  });

  describe('matchesShopifyPage', () => {
    it('should match product pages', () => {
      const dom = new JSDOM('<html><body></body></html>', {
        url: 'https://test-shop.myshopify.com/products/cool-t-shirt'
      });
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      expect(matchesShopifyPage()).toBe(true);
      dom.window.close();
    });

    it('should match collection pages', () => {
      const dom = new JSDOM('<html><body></body></html>', {
        url: 'https://test-shop.myshopify.com/collections/clothing'
      });
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      expect(matchesShopifyPage()).toBe(true);
      dom.window.close();
    });

    it('should not match homepage', () => {
      const dom = new JSDOM('<html><body></body></html>', {
        url: 'https://test-shop.myshopify.com/'
      });
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      expect(matchesShopifyPage()).toBe(false);
      dom.window.close();
    });
  });

  describe('extractProducts', () => {
    it('should extract products from ShopifyAnalytics', () => {
      const dom = new JSDOM('<html><body></body></html>');
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      // Mock realistic ShopifyAnalytics data
      (global.window as any).ShopifyAnalytics = {
        meta: {
          product: {
            id: 7234567890123,
            title: "Premium Cotton T-Shirt",
            handle: "premium-cotton-t-shirt",
            description: "Ultra-soft premium cotton t-shirt with modern fit",
            price: 2999, // Shopify stores prices in cents
            price_min: 2999,
            price_max: 3499,
            compare_at_price: 3999,
            compare_at_price_min: 3999,
            compare_at_price_max: 4499,
            featured_image: "https://cdn.shopify.com/s/files/1/0123/4567/products/tshirt.jpg",
            images: [
              "https://cdn.shopify.com/s/files/1/0123/4567/products/tshirt.jpg",
              "https://cdn.shopify.com/s/files/1/0123/4567/products/tshirt-back.jpg"
            ],
            vendor: "Premium Basics",
            product_type: "T-Shirts",
            tags: ["cotton", "premium", "basic", "comfortable"],
            variants: [
              {
                id: 41234567890123,
                title: "Small / Black",
                price: 2999,
                compare_at_price: 3999,
                available: true
              },
              {
                id: 41234567890124,
                title: "Medium / Black",
                price: 2999,
                compare_at_price: 3999,
                available: true
              },
              {
                id: 41234567890125,
                title: "Large / Black",
                price: 3499,
                compare_at_price: 4499,
                available: false
              }
            ],
            available: true,
            url: "/products/premium-cotton-t-shirt"
          }
        }
      };
      
      const products = extractProducts();
      
      expect(products).toHaveLength(1);
      expect(products[0]).toMatchObject({
        id: "7234567890123",
        title: "Premium Cotton T-Shirt",
        description: "Ultra-soft premium cotton t-shirt with modern fit",
        price: 29.99, // Converted from cents
        originalPrice: 39.99,
        brand: "Premium Basics",
        category: "T-Shirts",
        tags: ["cotton", "premium", "basic", "comfortable"],
        availability: "limited", // Because Large size is out of stock
        discount_percentage: 25 // (39.99 - 29.99) / 39.99 * 100
      });
      
      dom.window.close();
    });

    it('should extract products from window.__st', () => {
      const dom = new JSDOM('<html><body></body></html>');
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      // Mock realistic window.__st data
      (global.window as any).__st = {
        meta: {
          products: [
            {
              id: 7234567890124,
              title: "Organic Cotton Hoodie",
              handle: "organic-cotton-hoodie",
              description: "Cozy organic cotton hoodie perfect for layering",
              price: 6999,
              compare_at_price: 8999,
              featured_image: "https://cdn.shopify.com/s/files/1/0123/4567/products/hoodie.jpg",
              vendor: "Eco Wear",
              product_type: "Hoodies",
              tags: ["organic", "cotton", "hoodie", "sustainable"],
              available: true,
              url: "/products/organic-cotton-hoodie"
            },
            {
              id: 7234567890125,
              title: "Denim Jacket",
              handle: "denim-jacket",
              description: "Classic denim jacket with vintage wash",
              price: 8999,
              featured_image: "https://cdn.shopify.com/s/files/1/0123/4567/products/jacket.jpg",
              vendor: "Vintage Co",
              product_type: "Jackets",
              tags: ["denim", "jacket", "vintage", "classic"],
              available: true,
              url: "/products/denim-jacket"
            }
          ]
        }
      };
      
      const products = extractProducts();
      
      expect(products).toHaveLength(2);
      
      // Check first product (with discount)
      expect(products[0]).toMatchObject({
        id: "7234567890124",
        title: "Organic Cotton Hoodie",
        price: 69.99,
        originalPrice: 89.99,
        brand: "Eco Wear",
        category: "Hoodies",
        availability: "in_stock",
        discount_percentage: 22
      });
      
      // Check second product (no discount)
      expect(products[1]).toMatchObject({
        id: "7234567890125",
        title: "Denim Jacket",
        price: 89.99,
        originalPrice: undefined,
        brand: "Vintage Co",
        category: "Jackets",
        availability: "in_stock",
        discount_percentage: undefined
      });
      
      dom.window.close();
    });

    it('should extract products from JSON-LD structured data', () => {
      const dom = new JSDOM(`
        <html>
          <head>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Wireless Bluetooth Headphones",
              "description": "High-quality wireless headphones with noise cancellation",
              "productID": "7234567890126",
              "sku": "WBH-001",
              "brand": {
                "@type": "Brand",
                "name": "AudioTech"
              },
              "image": [
                "https://cdn.shopify.com/s/files/1/0123/4567/products/headphones.jpg",
                "https://cdn.shopify.com/s/files/1/0123/4567/products/headphones-side.jpg"
              ],
              "offers": {
                "@type": "Offer",
                "price": "149.99",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "url": "/products/wireless-bluetooth-headphones"
              }
            }
            </script>
          </head>
          <body></body>
        </html>
      `);
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      const products = extractProducts();
      
      expect(products).toHaveLength(1);
      expect(products[0]).toMatchObject({
        id: "7234567890126",
        title: "Wireless Bluetooth Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 149.99,
        brand: "AudioTech",
        availability: "in_stock",
        url: "/products/wireless-bluetooth-headphones"
      });
      
      dom.window.close();
    });

    it('should extract products from DOM elements', () => {
      const dom = new JSDOM(`
        <html>
          <body>
            <div class="product-grid">
              <div class="product-item" data-product-id="7234567890127">
                <a href="/products/summer-dress">
                  <img src="https://cdn.shopify.com/s/files/1/0123/4567/products/dress.jpg" alt="Summer Dress">
                  <h3 class="product-title">Floral Summer Dress</h3>
                  <p class="product-description">Light and airy summer dress with floral print</p>
                  <span class="price">$79.99</span>
                </a>
              </div>
              <div class="product-item" data-product-id="7234567890128">
                <a href="/products/leather-boots">
                  <img src="https://cdn.shopify.com/s/files/1/0123/4567/products/boots.jpg" alt="Leather Boots">
                  <h3 class="product-title">Genuine Leather Boots</h3>
                  <p class="product-description">Handcrafted leather boots for all seasons</p>
                  <span class="price">$199.99</span>
                </a>
              </div>
            </div>
          </body>
        </html>
      `);
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      const products = extractProducts();
      
      expect(products).toHaveLength(2);
      
      expect(products[0]).toMatchObject({
        id: "7234567890127",
        title: "Floral Summer Dress",
        price: 79.99,
        availability: "in_stock",
        url: "/products/summer-dress"
      });
      
      expect(products[1]).toMatchObject({
        id: "7234567890128",
        title: "Genuine Leather Boots",
        price: 199.99,
        availability: "in_stock",
        url: "/products/leather-boots"
      });
      
      dom.window.close();
    });

    it('should handle products with no available variants', () => {
      const dom = new JSDOM('<html><body></body></html>');
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      (global.window as any).ShopifyAnalytics = {
        meta: {
          product: {
            id: 7234567890129,
            title: "Sold Out Item",
            price: 4999,
            variants: [
              { id: 1, title: "Small", price: 4999, available: false },
              { id: 2, title: "Medium", price: 4999, available: false },
              { id: 3, title: "Large", price: 4999, available: false }
            ],
            available: false
          }
        }
      };
      
      const products = extractProducts();
      
      expect(products).toHaveLength(1);
      expect(products[0].availability).toBe("out_of_stock");
      
      dom.window.close();
    });

    it('should return empty array when no products found', () => {
      const dom = new JSDOM('<html><body><h1>No products here</h1></body></html>');
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      const products = extractProducts();
      
      expect(products).toHaveLength(0);
      
      dom.window.close();
    });

    it('should handle malformed JSON-LD gracefully', () => {
      const dom = new JSDOM(`
        <html>
          <head>
            <script type="application/ld+json">
            {
              "invalid": "json",
              "missing": "required fields"
            }
            </script>
          </head>
          <body></body>
        </html>
      `);
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      const products = extractProducts();
      
      expect(products).toHaveLength(0);
      
      dom.window.close();
    });
  });

  describe('Price conversion', () => {
    it('should correctly convert Shopify cents to dollars', () => {
      const dom = new JSDOM('<html><body></body></html>');
      global.window = dom.window as any;
      global.document = dom.window.document;
      
      (global.window as any).ShopifyAnalytics = {
        meta: {
          product: {
            id: 123,
            title: "Test Product",
            price: 2999, // $29.99 in cents
            compare_at_price: 3999 // $39.99 in cents
          }
        }
      };
      
      const products = extractProducts();
      
      expect(products[0].price).toBe(29.99);
      expect(products[0].originalPrice).toBe(39.99);
      expect(products[0].discount_percentage).toBe(25);
      
      dom.window.close();
    });
  });
});