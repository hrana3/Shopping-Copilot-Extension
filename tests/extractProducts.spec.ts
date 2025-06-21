import { JSDOM } from 'jsdom';

describe('extractProducts Function - Isolated Testing', () => {
  // Helper function to create a fresh test environment
  function createFreshEnvironment(htmlContent: string = '<html><body></body></html>', url?: string) {
    const dom = new JSDOM(htmlContent, url ? { url } : undefined);
    return {
      window: dom.window,
      document: dom.window.document,
      cleanup: () => dom.window.close()
    };
  }

  // Mock implementation of the key extraction functions for testing
  function mockExtractFromShopifyAnalytics(testWindow: any) {
    try {
      console.log('DEBUG: Extracting from ShopifyAnalytics...');
      const analytics = testWindow.ShopifyAnalytics;
      if (!analytics?.meta) {
        console.log('DEBUG: No ShopifyAnalytics.meta found');
        return [];
      }

      const products: any[] = [];
      
      if (analytics.meta.product) {
        console.log('DEBUG: Found product in ShopifyAnalytics.meta');
        products.push({ ...analytics.meta.product, _source: 'shopify_analytics' });
      }
      
      if (analytics.meta.products) {
        console.log('DEBUG: Found products array in ShopifyAnalytics.meta:', analytics.meta.products.length);
        products.push(...analytics.meta.products.map((p: any) => ({ ...p, _source: 'shopify_analytics' })));
      }

      console.log('DEBUG: ShopifyAnalytics extraction result:', products.length, 'products');
      return products;
    } catch (error) {
      console.warn('Error extracting from ShopifyAnalytics:', error);
      return [];
    }
  }

  function mockExtractFromWindowSt(testWindow: any) {
    try {
      console.log('DEBUG: Extracting from window.__st...');
      const st = testWindow.__st;
      if (!st?.meta) {
        console.log('DEBUG: No window.__st.meta found');
        return [];
      }

      const products: any[] = [];
      
      if (st.meta.product) {
        console.log('DEBUG: Found product in window.__st.meta');
        products.push({ ...st.meta.product, _source: 'window_st' });
      }
      
      if (st.meta.products) {
        console.log('DEBUG: Found products array in window.__st.meta:', st.meta.products.length);
        products.push(...st.meta.products.map((p: any) => ({ ...p, _source: 'window_st' })));
      }

      console.log('DEBUG: window.__st extraction result:', products.length, 'products');
      return products;
    } catch (error) {
      console.warn('Error extracting from window.__st:', error);
      return [];
    }
  }

  function mockExtractFromJsonLd(testDocument: any) {
    try {
      console.log('DEBUG: Extracting from JSON-LD...');
      const products: any[] = [];
      
      const jsonLdScripts = testDocument.querySelectorAll('script[type="application/ld+json"]');
      console.log('DEBUG: Found JSON-LD scripts:', jsonLdScripts.length);

      jsonLdScripts.forEach((script: any, index: number) => {
        try {
          console.log(`DEBUG: Processing JSON-LD script ${index + 1}`);
          
          if (!script.textContent?.trim()) {
            console.log(`DEBUG: Script ${index + 1} has no content`);
            return;
          }
          
          const data = JSON.parse(script.textContent);
          const items = Array.isArray(data) ? data : [data];
          console.log(`DEBUG: JSON-LD script ${index + 1} contains ${items.length} items`);

          items.forEach((item: any, itemIndex: number) => {
            console.log(`DEBUG: Processing item ${itemIndex + 1}, type:`, item['@type']);
            if (item['@type'] === 'Product') {
              console.log('DEBUG: Found Product in JSON-LD');
              const product: any = {
                id: item.productID || item.sku,
                title: item.name,
                description: item.description,
                vendor: item.brand?.name,
                url: item.url,
                featured_image: item.image?.[0] || item.image,
                images: Array.isArray(item.image) ? item.image : item.image ? [item.image] : undefined,
                _source: 'json_ld'
              };

              // Extract price from offers - JSON-LD prices are already in dollars
              if (item.offers) {
                const offers = Array.isArray(item.offers) ? item.offers : [item.offers];
                const offer = offers[0];
                if (offer) {
                  product.price = parseFloat(offer.price); // Already in dollars, no conversion needed
                  product.available = offer.availability === 'https://schema.org/InStock';
                  console.log('DEBUG: Extracted price from offers:', product.price);
                }
              }

              products.push(product);
              console.log('DEBUG: Added product from JSON-LD:', product.title);
            }
          });
        } catch (parseError) {
          console.warn(`Error parsing JSON-LD script ${index + 1}:`, parseError);
        }
      });

      console.log('DEBUG: JSON-LD extraction result:', products.length, 'products');
      return products;
    } catch (error) {
      console.warn('Error extracting from JSON-LD:', error);
      return [];
    }
  }

  // Improved price extraction function
  function extractPrice(text: string): number | undefined {
    try {
      // Remove currency symbols and non-numeric characters except decimal points
      const cleaned = text.replace(/[^\d.]/g, '');
      const price = parseFloat(cleaned);
      return isNaN(price) ? undefined : price;
    } catch (error) {
      return undefined;
    }
  }

  function mockExtractFromDom(testDocument: any) {
    try {
      console.log('DEBUG: Extracting from DOM...');
      const products: any[] = [];
      
      const productElements = testDocument.querySelectorAll('[data-product-id]');
      console.log('DEBUG: Found DOM elements with data-product-id:', productElements.length);

      productElements.forEach((element: any, index: number) => {
        try {
          console.log(`DEBUG: Processing DOM element ${index + 1}`);
          const productId = element.getAttribute('data-product-id');
          if (!productId) {
            console.log(`DEBUG: Element ${index + 1} missing product ID`);
            return;
          }

          console.log(`DEBUG: Element ${index + 1} product ID:`, productId);

          // Extract title
          const titleSelectors = [
            '[data-product-title]',
            '.product-title',
            '.product-name',
            'h2',
            'h3',
            '.title'
          ];
          
          let title = '';
          for (const selector of titleSelectors) {
            const titleEl = element.querySelector(selector);
            if (titleEl?.textContent?.trim()) {
              title = titleEl.textContent.trim();
              console.log(`DEBUG: Found title using selector "${selector}":`, title);
              break;
            }
          }

          if (!title) {
            console.log(`DEBUG: Element ${index + 1} missing title, skipping`);
            return;
          }

          // Extract image
          const imgEl = element.querySelector('img');
          const image = imgEl?.src || imgEl?.getAttribute('data-src');
          console.log(`DEBUG: Found image:`, image);

          // Extract price - DOM prices are already in dollars with $ symbol
          const priceSelectors = [
            '.price',
            '.product-price',
            '.money',
            '[data-price]',
            '.price-current'
          ];
          
          let price: number | undefined;
          for (const selector of priceSelectors) {
            const priceEl = element.querySelector(selector);
            if (priceEl?.textContent) {
              price = extractPrice(priceEl.textContent); // Use improved extraction
              if (price !== undefined) {
                console.log(`DEBUG: Found price using selector "${selector}":`, price);
                break;
              }
            }
          }

          // Extract URL
          const linkEl = element.querySelector('a[href]') as HTMLAnchorElement;
          const url = linkEl?.href;
          console.log(`DEBUG: Found URL:`, url);

          const product: any = {
            id: productId,
            title,
            featured_image: image,
            price,
            url,
            available: true,
            _source: 'dom'
          };

          products.push(product);
          console.log(`DEBUG: Added DOM product:`, product.title);
        } catch (elementError) {
          console.warn(`Error extracting product from DOM element ${index + 1}:`, elementError);
        }
      });

      console.log('DEBUG: DOM extraction result:', products.length, 'products');
      return products;
    } catch (error) {
      console.warn('Error extracting from DOM:', error);
      return [];
    }
  }

  // Mock product mapping function with source-aware price handling
  function mockMapShopifyToProduct(shopifyProduct: any) {
    try {
      if (!shopifyProduct.id || !shopifyProduct.title) {
        console.log('DEBUG: Skipping product mapping - missing ID or title');
        return null;
      }

      // Determine price based on source
      let price = shopifyProduct.price;
      const source = shopifyProduct._source;
      
      // Only convert from cents for Shopify sources (analytics and window.__st)
      if ((source === 'shopify_analytics' || source === 'window_st') && typeof price === 'number' && price > 100) {
        // Assume it's in cents if > 100 (Shopify format)
        price = price / 100;
      }
      
      if (price === undefined) {
        price = shopifyProduct.price_min;
        if ((source === 'shopify_analytics' || source === 'window_st') && typeof price === 'number' && price > 100) {
          price = price / 100;
        }
      }
      if (price === undefined) {
        console.log('DEBUG: Skipping product mapping - missing price');
        return null;
      }

      // Determine original price - only convert from cents for Shopify sources
      let originalPrice = shopifyProduct.compare_at_price;
      if ((source === 'shopify_analytics' || source === 'window_st') && typeof originalPrice === 'number' && originalPrice > 100) {
        originalPrice = originalPrice / 100;
      }
      if (originalPrice === undefined) {
        originalPrice = shopifyProduct.compare_at_price_min;
        if ((source === 'shopify_analytics' || source === 'window_st') && typeof originalPrice === 'number' && originalPrice > 100) {
          originalPrice = originalPrice / 100;
        }
      }

      // Calculate discount percentage
      let discountPercentage: number | undefined;
      if (originalPrice && originalPrice > price) {
        discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
      }

      // Determine availability
      let availability: 'in_stock' | 'out_of_stock' | 'limited' = 'in_stock';
      if (shopifyProduct.available === false) {
        availability = 'out_of_stock';
      } else if (shopifyProduct.variants) {
        const availableVariants = shopifyProduct.variants.filter((v: any) => v.available);
        if (availableVariants.length === 0) {
          availability = 'out_of_stock';
        } else if (availableVariants.length < shopifyProduct.variants.length) {
          availability = 'limited';
        }
      }

      const product = {
        id: String(shopifyProduct.id),
        title: shopifyProduct.title,
        description: shopifyProduct.description || '',
        price: price,
        originalPrice: originalPrice,
        currency: 'USD',
        image: shopifyProduct.featured_image || '',
        images: shopifyProduct.images,
        brand: shopifyProduct.vendor,
        category: shopifyProduct.product_type || 'General',
        tags: shopifyProduct.tags || [],
        availability: availability,
        url: shopifyProduct.url || '#',
        discount_percentage: discountPercentage
      };

      console.log('DEBUG: Successfully mapped product:', product.title, 'price:', product.price, 'source:', source);
      return product;
    } catch (error) {
      console.warn('Error mapping Shopify product:', error);
      return null;
    }
  }

  // Main test function that mimics extractProducts
  function testExtractProducts(testWindow: any, testDocument: any) {
    console.log('DEBUG: Starting product extraction...');
    
    const allProducts: any[] = [];

    // Try extraction methods in priority order
    const extractionMethods = [
      () => mockExtractFromShopifyAnalytics(testWindow),
      () => mockExtractFromWindowSt(testWindow),
      () => mockExtractFromJsonLd(testDocument),
      () => mockExtractFromDom(testDocument)
    ];

    for (const method of extractionMethods) {
      try {
        const shopifyProducts = method();
        if (shopifyProducts.length > 0) {
          console.log(`Extracted ${shopifyProducts.length} products`);
          
          // Map to our Product interface
          const mappedProducts = shopifyProducts
            .map(mockMapShopifyToProduct)
            .filter((product: any) => product !== null);
          
          console.log(`DEBUG: Successfully mapped ${mappedProducts.length} products`);
          allProducts.push(...mappedProducts);
          break; // Use first successful method
        }
      } catch (error) {
        console.warn(`Error in extraction method:`, error);
      }
    }

    // Remove duplicates based on ID
    const uniqueProducts = allProducts.filter((product, index, array) => 
      array.findIndex(p => p.id === product.id) === index
    );

    console.log(`Final extracted products: ${uniqueProducts.length}`);
    return uniqueProducts;
  }

  describe('ShopifyAnalytics Extraction', () => {
    it('should extract single product from ShopifyAnalytics', () => {
      const env = createFreshEnvironment();
      
      env.window.ShopifyAnalytics = {
        meta: {
          product: {
            id: 7234567890123,
            title: "Premium Cotton T-Shirt",
            description: "Ultra-soft premium cotton t-shirt",
            price: 2999, // $29.99 in cents
            compare_at_price: 3999, // $39.99 in cents
            featured_image: "https://example.com/tshirt.jpg",
            vendor: "Premium Basics",
            product_type: "T-Shirts",
            tags: ["cotton", "premium"],
            available: true,
            url: "/products/premium-cotton-t-shirt"
          }
        }
      };
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(1);
      expect(products[0]).toMatchObject({
        id: "7234567890123",
        title: "Premium Cotton T-Shirt",
        price: 29.99,
        originalPrice: 39.99,
        brand: "Premium Basics",
        category: "T-Shirts",
        availability: "in_stock",
        discount_percentage: 25
      });
      
      env.cleanup();
    });

    it('should extract multiple products from ShopifyAnalytics', () => {
      const env = createFreshEnvironment();
      
      env.window.ShopifyAnalytics = {
        meta: {
          products: [
            {
              id: 1,
              title: "Product 1",
              price: 1999,
              available: true
            },
            {
              id: 2,
              title: "Product 2",
              price: 2999,
              available: true
            }
          ]
        }
      };
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(2);
      expect(products[0].title).toBe("Product 1");
      expect(products[1].title).toBe("Product 2");
      
      env.cleanup();
    });

    it('should handle products with variants correctly', () => {
      const env = createFreshEnvironment();
      
      env.window.ShopifyAnalytics = {
        meta: {
          product: {
            id: 123,
            title: "Variant Product",
            price: 2999,
            variants: [
              { id: 1, title: "Small", available: true },
              { id: 2, title: "Medium", available: true },
              { id: 3, title: "Large", available: false }
            ],
            available: true
          }
        }
      };
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(1);
      expect(products[0].availability).toBe("limited"); // Some variants unavailable
      
      env.cleanup();
    });

    it('should handle out of stock products', () => {
      const env = createFreshEnvironment();
      
      env.window.ShopifyAnalytics = {
        meta: {
          product: {
            id: 123,
            title: "Out of Stock Product",
            price: 2999,
            available: false,
            variants: [
              { id: 1, title: "Small", available: false },
              { id: 2, title: "Medium", available: false }
            ]
          }
        }
      };
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(1);
      expect(products[0].availability).toBe("out_of_stock");
      
      env.cleanup();
    });
  });

  describe('Window.__st Extraction', () => {
    it('should extract products from window.__st', () => {
      const env = createFreshEnvironment();
      
      env.window.__st = {
        meta: {
          products: [
            {
              id: 456,
              title: "Hoodie",
              price: 6999,
              compare_at_price: 8999,
              vendor: "Eco Wear",
              product_type: "Hoodies",
              available: true
            }
          ]
        }
      };
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(1);
      expect(products[0]).toMatchObject({
        id: "456",
        title: "Hoodie",
        price: 69.99,
        originalPrice: 89.99,
        brand: "Eco Wear",
        category: "Hoodies"
      });
      
      env.cleanup();
    });
  });

  describe('JSON-LD Extraction', () => {
    it('should extract product from JSON-LD structured data', () => {
      const env = createFreshEnvironment(`
        <html>
          <head>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Wireless Headphones",
              "description": "High-quality wireless headphones",
              "productID": "789",
              "brand": {
                "@type": "Brand",
                "name": "AudioTech"
              },
              "image": "https://example.com/headphones.jpg",
              "offers": {
                "@type": "Offer",
                "price": "149.99",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "url": "/products/wireless-headphones"
              }
            }
            </script>
          </head>
          <body></body>
        </html>
      `);
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(1);
      expect(products[0]).toMatchObject({
        id: "789",
        title: "Wireless Headphones",
        price: 149.99,
        brand: "AudioTech",
        availability: "in_stock"
      });
      
      env.cleanup();
    });

    it('should handle malformed JSON-LD gracefully', () => {
      const env = createFreshEnvironment(`
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
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(0);
      
      env.cleanup();
    });

    it('should handle empty JSON-LD script', () => {
      const env = createFreshEnvironment(`
        <html>
          <head>
            <script type="application/ld+json"></script>
          </head>
          <body></body>
        </html>
      `);
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(0);
      
      env.cleanup();
    });
  });

  describe('DOM Extraction', () => {
    it('should extract products from DOM elements', () => {
      const env = createFreshEnvironment(`
        <html>
          <body>
            <div class="product-grid">
              <div class="product-item" data-product-id="101">
                <a href="/products/summer-dress">
                  <img src="https://example.com/dress.jpg" alt="Summer Dress">
                  <h3 class="product-title">Floral Summer Dress</h3>
                  <span class="price">$79.99</span>
                </a>
              </div>
              <div class="product-item" data-product-id="102">
                <a href="/products/leather-boots">
                  <img src="https://example.com/boots.jpg" alt="Leather Boots">
                  <h3 class="product-title">Genuine Leather Boots</h3>
                  <span class="price">$199.99</span>
                </a>
              </div>
            </div>
          </body>
        </html>
      `);
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(2);
      expect(products[0]).toMatchObject({
        id: "101",
        title: "Floral Summer Dress",
        price: 79.99
      });
      expect(products[1]).toMatchObject({
        id: "102",
        title: "Genuine Leather Boots",
        price: 199.99
      });
      
      env.cleanup();
    });

    it('should skip DOM elements without required data', () => {
      const env = createFreshEnvironment(`
        <html>
          <body>
            <div class="product-item" data-product-id="103">
              <!-- Missing title -->
              <span class="price">$50.00</span>
            </div>
            <div class="product-item">
              <!-- Missing product ID -->
              <h3 class="product-title">Some Product</h3>
              <span class="price">$60.00</span>
            </div>
          </body>
        </html>
      `);
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(0);
      
      env.cleanup();
    });
  });

  describe('Extraction Priority', () => {
    it('should prioritize ShopifyAnalytics over other methods', () => {
      const env = createFreshEnvironment(`
        <html>
          <head>
            <script type="application/ld+json">
            {
              "@type": "Product",
              "name": "JSON-LD Product",
              "productID": "json-ld-1"
            }
            </script>
          </head>
          <body>
            <div data-product-id="dom-1">
              <h3 class="product-title">DOM Product</h3>
              <span class="price">$100</span>
            </div>
          </body>
        </html>
      `);
      
      // Add ShopifyAnalytics data
      env.window.ShopifyAnalytics = {
        meta: {
          product: {
            id: "analytics-1",
            title: "Analytics Product",
            price: 5000
          }
        }
      };
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(1);
      expect(products[0].id).toBe("analytics-1");
      expect(products[0].title).toBe("Analytics Product");
      
      env.cleanup();
    });

    it('should fall back to window.__st when ShopifyAnalytics unavailable', () => {
      const env = createFreshEnvironment();
      
      env.window.__st = {
        meta: {
          product: {
            id: "st-1",
            title: "ST Product",
            price: 3000
          }
        }
      };
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(1);
      expect(products[0].id).toBe("st-1");
      
      env.cleanup();
    });
  });

  describe('Error Handling', () => {
    it('should handle extraction errors gracefully', () => {
      const env = createFreshEnvironment();
      
      // Create invalid data that will cause mapping to fail
      env.window.ShopifyAnalytics = {
        meta: {
          product: {
            // Missing required fields
            id: null,
            title: null
          }
        }
      };
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(0);
      
      env.cleanup();
    });

    it('should remove duplicate products', () => {
      const env = createFreshEnvironment();
      
      env.window.ShopifyAnalytics = {
        meta: {
          products: [
            { id: "duplicate-1", title: "Product 1", price: 1000 },
            { id: "duplicate-1", title: "Product 1 Again", price: 1000 }, // Same ID
            { id: "unique-1", title: "Product 2", price: 2000 }
          ]
        }
      };
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products).toHaveLength(2); // Duplicates removed
      expect(products.map(p => p.id)).toEqual(["duplicate-1", "unique-1"]);
      
      env.cleanup();
    });
  });

  describe('Price Conversion', () => {
    it('should convert cents to dollars correctly', () => {
      const env = createFreshEnvironment();
      
      env.window.ShopifyAnalytics = {
        meta: {
          product: {
            id: "price-test",
            title: "Price Test Product",
            price: 2999, // $29.99 in cents
            compare_at_price: 3999 // $39.99 in cents
          }
        }
      };
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products[0].price).toBe(29.99);
      expect(products[0].originalPrice).toBe(39.99);
      expect(products[0].discount_percentage).toBe(25);
      
      env.cleanup();
    });

    it('should handle prices already in dollars', () => {
      const env = createFreshEnvironment();
      
      env.window.ShopifyAnalytics = {
        meta: {
          product: {
            id: "price-test-2",
            title: "Price Test Product 2",
            price: 29.99, // Already in dollars
            compare_at_price: 39.99
          }
        }
      };
      
      const products = testExtractProducts(env.window, env.document);
      
      expect(products[0].price).toBe(29.99);
      expect(products[0].originalPrice).toBe(39.99);
      
      env.cleanup();
    });
  });
});