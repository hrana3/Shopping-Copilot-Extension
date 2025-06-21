import { Product } from '../types/product';

interface ShopifyProduct {
  id?: string | number;
  title?: string;
  handle?: string;
  description?: string;
  price?: number;
  price_min?: number;
  price_max?: number;
  compare_at_price?: number;
  compare_at_price_min?: number;
  compare_at_price_max?: number;
  featured_image?: string;
  images?: string[];
  vendor?: string;
  product_type?: string;
  tags?: string[];
  variants?: Array<{
    id: string | number;
    title: string;
    price: number;
    compare_at_price?: number;
    available: boolean;
  }>;
  available?: boolean;
  url?: string;
}

interface ShopifyAnalyticsMeta {
  product?: ShopifyProduct;
  products?: ShopifyProduct[];
}

interface ShopifyGlobals {
  ShopifyAnalytics?: {
    meta?: ShopifyAnalyticsMeta;
  };
  __st?: {
    meta?: {
      product?: ShopifyProduct;
      products?: ShopifyProduct[];
    };
  };
}

declare global {
  interface Window extends ShopifyGlobals {}
}

/**
 * Debug function to inspect document context
 */
function debugDocumentContext(context: string): void {
  console.log(`DEBUG [${context}]: Document context inspection:`);
  console.log(`DEBUG [${context}]: document === global.document:`, document === (global as any).document);
  console.log(`DEBUG [${context}]: document.constructor.name:`, document.constructor.name);
  console.log(`DEBUG [${context}]: document.documentElement exists:`, !!document.documentElement);
  console.log(`DEBUG [${context}]: document.head exists:`, !!document.head);
  console.log(`DEBUG [${context}]: document.body exists:`, !!document.body);
  console.log(`DEBUG [${context}]: document.querySelectorAll exists:`, typeof document.querySelectorAll);
  
  // Test basic query
  const allElements = document.querySelectorAll('*');
  console.log(`DEBUG [${context}]: Total elements in document:`, allElements.length);
  
  // Test specific queries that are failing
  const scripts = document.querySelectorAll('script');
  console.log(`DEBUG [${context}]: Script tags found:`, scripts.length);
  
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  console.log(`DEBUG [${context}]: JSON-LD scripts found:`, jsonLdScripts.length);
  
  const dataProductElements = document.querySelectorAll('[data-product-id]');
  console.log(`DEBUG [${context}]: Elements with data-product-id:`, dataProductElements.length);
  
  // Log first few script tags for inspection
  scripts.forEach((script, index) => {
    if (index < 3) {
      console.log(`DEBUG [${context}]: Script ${index + 1} - type: "${script.type}", id: "${script.id}", content length: ${script.textContent?.length || 0}`);
    }
  });
  
  // Find elements with data attributes using a different approach
  try {
    const elementsWithDataAttrs: Element[] = [];
    allElements.forEach((element) => {
      const hasDataAttrs = Array.from(element.attributes).some(attr => attr.name.startsWith('data-'));
      if (hasDataAttrs) {
        elementsWithDataAttrs.push(element);
      }
    });
    
    console.log(`DEBUG [${context}]: Elements with data-* attributes:`, elementsWithDataAttrs.length);
    elementsWithDataAttrs.forEach((element, index) => {
      if (index < 3) {
        const attrs = Array.from(element.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .map(attr => `${attr.name}="${attr.value}"`)
          .join(', ');
        console.log(`DEBUG [${context}]: Element ${index + 1} - tag: ${element.tagName}, data attrs: [${attrs}]`);
      }
    });
  } catch (error) {
    console.warn(`DEBUG [${context}]: Error finding data attributes:`, error);
  }
}

/**
 * Detects if the current page is a Shopify store
 */
export function detectShopify(): boolean {
  try {
    console.log('DEBUG: Starting Shopify detection...');
    debugDocumentContext('detectShopify');
    
    // Check for Shopify globals
    console.log('DEBUG: Checking for ShopifyAnalytics:', !!window.ShopifyAnalytics);
    console.log('DEBUG: Checking for __st:', !!window.__st);
    if (window.ShopifyAnalytics || window.__st) {
      console.log('DEBUG: Found Shopify globals');
      return true;
    }

    // Check for Shopify script tags
    const shopifySettings = document.querySelector('script#ShopifySettings');
    console.log('DEBUG: Found ShopifySettings script:', !!shopifySettings);
    if (shopifySettings) {
      console.log('DEBUG: Found ShopifySettings script');
      return true;
    }

    // Check for Shopify meta tags
    const shopifyMeta = document.querySelector('meta[name="shopify-checkout-api-token"]');
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

/**
 * Checks if the current URL matches a Shopify product or collection page
 */
export function matchesShopifyPage(): boolean {
  try {
    const pathname = window.location.pathname;
    console.log('DEBUG: Checking pathname:', pathname);
    const isMatch = pathname.includes('/collections/') || pathname.includes('/products/');
    console.log('DEBUG: Page matches Shopify pattern:', isMatch);
    return isMatch;
  } catch (error) {
    console.warn('Error matching Shopify page:', error);
    return false;
  }
}

/**
 * Extracts products from ShopifyAnalytics global
 */
function extractFromShopifyAnalytics(): ShopifyProduct[] {
  try {
    console.log('DEBUG: Extracting from ShopifyAnalytics...');
    const analytics = window.ShopifyAnalytics;
    if (!analytics?.meta) {
      console.log('DEBUG: No ShopifyAnalytics.meta found');
      return [];
    }

    const products: ShopifyProduct[] = [];
    
    if (analytics.meta.product) {
      console.log('DEBUG: Found product in ShopifyAnalytics.meta');
      products.push(analytics.meta.product);
    }
    
    if (analytics.meta.products) {
      console.log('DEBUG: Found products array in ShopifyAnalytics.meta:', analytics.meta.products.length);
      products.push(...analytics.meta.products);
    }

    console.log('DEBUG: ShopifyAnalytics extraction result:', products.length, 'products');
    return products;
  } catch (error) {
    console.warn('Error extracting from ShopifyAnalytics:', error);
    return [];
  }
}

/**
 * Extracts products from window.__st global
 */
function extractFromWindowSt(): ShopifyProduct[] {
  try {
    console.log('DEBUG: Extracting from window.__st...');
    const st = window.__st;
    if (!st?.meta) {
      console.log('DEBUG: No window.__st.meta found');
      return [];
    }

    const products: ShopifyProduct[] = [];
    
    if (st.meta.product) {
      console.log('DEBUG: Found product in window.__st.meta');
      products.push(st.meta.product);
    }
    
    if (st.meta.products) {
      console.log('DEBUG: Found products array in window.__st.meta:', st.meta.products.length);
      products.push(...st.meta.products);
    }

    console.log('DEBUG: window.__st extraction result:', products.length, 'products');
    return products;
  } catch (error) {
    console.warn('Error extracting from window.__st:', error);
    return [];
  }
}

/**
 * Extracts products from JSON-LD structured data
 */
function extractFromJsonLd(): ShopifyProduct[] {
  try {
    console.log('DEBUG: Extracting from JSON-LD...');
    debugDocumentContext('extractFromJsonLd');
    
    const products: ShopifyProduct[] = [];
    
    // More robust script selection - try multiple approaches
    let jsonLdScripts: NodeListOf<HTMLScriptElement>;
    
    // First try the standard approach
    jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    console.log('DEBUG: Found JSON-LD scripts (standard query):', jsonLdScripts.length);
    
    // If that fails, try a more general approach
    if (jsonLdScripts.length === 0) {
      const allScripts = document.querySelectorAll('script');
      console.log('DEBUG: Total script tags found:', allScripts.length);
      
      const ldJsonScripts: HTMLScriptElement[] = [];
      allScripts.forEach((script, index) => {
        console.log(`DEBUG: Script ${index + 1} type: "${script.type}", id: "${script.id}"`);
        if (script.type === 'application/ld+json') {
          ldJsonScripts.push(script);
          console.log(`DEBUG: Found JSON-LD script at index ${index + 1}`);
        }
      });
      
      jsonLdScripts = {
        length: ldJsonScripts.length,
        forEach: (callback: (script: HTMLScriptElement, index: number) => void) => {
          ldJsonScripts.forEach(callback);
        }
      } as any;
      
      console.log('DEBUG: Found JSON-LD scripts (manual search):', jsonLdScripts.length);
    }

    jsonLdScripts.forEach((script, index) => {
      try {
        console.log(`DEBUG: Processing JSON-LD script ${index + 1}`);
        console.log(`DEBUG: Script content length:`, script.textContent?.length || 0);
        console.log(`DEBUG: Script content preview:`, script.textContent?.substring(0, 100));
        
        if (!script.textContent?.trim()) {
          console.log(`DEBUG: Script ${index + 1} has no content`);
          return;
        }
        
        const data = JSON.parse(script.textContent);
        const items = Array.isArray(data) ? data : [data];
        console.log(`DEBUG: JSON-LD script ${index + 1} contains ${items.length} items`);

        items.forEach((item, itemIndex) => {
          console.log(`DEBUG: Processing item ${itemIndex + 1}, type:`, item['@type']);
          if (item['@type'] === 'Product') {
            console.log('DEBUG: Found Product in JSON-LD');
            const product: ShopifyProduct = {
              id: item.productID || item.sku,
              title: item.name,
              description: item.description,
              vendor: item.brand?.name,
              url: item.url,
              featured_image: item.image?.[0] || item.image,
              images: Array.isArray(item.image) ? item.image : item.image ? [item.image] : undefined
            };

            // Extract price from offers
            if (item.offers) {
              const offers = Array.isArray(item.offers) ? item.offers : [item.offers];
              const offer = offers[0];
              if (offer) {
                product.price = parseFloat(offer.price);
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

/**
 * Extracts price from text by removing non-numeric characters
 */
function extractPrice(text: string): number | undefined {
  try {
    const cleaned = text.replace(/[^\d.,]/g, '');
    const price = parseFloat(cleaned.replace(',', ''));
    return isNaN(price) ? undefined : price;
  } catch (error) {
    return undefined;
  }
}

/**
 * Extracts products from DOM elements as fallback
 */
function extractFromDom(): ShopifyProduct[] {
  try {
    console.log('DEBUG: Extracting from DOM...');
    debugDocumentContext('extractFromDom');
    
    const products: ShopifyProduct[] = [];
    
    // More robust element selection
    let productElements: NodeListOf<Element>;
    
    // First try the standard approach
    productElements = document.querySelectorAll('[data-product-id]');
    console.log('DEBUG: Found DOM elements with data-product-id (standard query):', productElements.length);
    
    // If that fails, try a more general approach
    if (productElements.length === 0) {
      const allElements = document.querySelectorAll('*');
      console.log('DEBUG: Total elements found:', allElements.length);
      
      const productEls: Element[] = [];
      allElements.forEach((element, index) => {
        // Check multiple ways to detect data-product-id
        const hasDataProductId = element.hasAttribute('data-product-id');
        const dataProductIdValue = element.getAttribute('data-product-id');
        
        if (index < 10) { // Log first 10 elements for debugging
          console.log(`DEBUG: Element ${index + 1} - tag: ${element.tagName}, hasAttribute: ${hasDataProductId}, value: "${dataProductIdValue}"`);
        }
        
        if (hasDataProductId && dataProductIdValue) {
          console.log(`DEBUG: Found element with data-product-id at index ${index}:`, element.tagName, `value: "${dataProductIdValue}"`);
          productEls.push(element);
        }
      });
      
      productElements = {
        length: productEls.length,
        forEach: (callback: (element: Element, index: number) => void) => {
          productEls.forEach(callback);
        }
      } as any;
      
      console.log('DEBUG: Found DOM elements with data-product-id (manual search):', productElements.length);
    }

    productElements.forEach((element, index) => {
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
          return; // Skip if no title found
        }

        // Extract image
        const imgEl = element.querySelector('img');
        const image = imgEl?.src || imgEl?.getAttribute('data-src');
        console.log(`DEBUG: Found image:`, image);

        // Extract price
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
            price = extractPrice(priceEl.textContent);
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

        const product: ShopifyProduct = {
          id: productId,
          title,
          featured_image: image,
          price,
          url,
          available: true // Assume available if found in DOM
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

/**
 * Maps Shopify product data to our Product interface
 */
function mapShopifyToProduct(shopifyProduct: ShopifyProduct): Product | null {
  try {
    if (!shopifyProduct.id || !shopifyProduct.title) {
      console.log('DEBUG: Skipping product mapping - missing ID or title');
      return null;
    }

    // Determine price
    let price = shopifyProduct.price;
    if (price === undefined) {
      price = shopifyProduct.price_min;
    }
    if (price === undefined) {
      console.log('DEBUG: Skipping product mapping - missing price');
      return null; // Price is required
    }

    // Determine original price for discount calculation
    let originalPrice = shopifyProduct.compare_at_price;
    if (originalPrice === undefined) {
      originalPrice = shopifyProduct.compare_at_price_min;
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
      const availableVariants = shopifyProduct.variants.filter(v => v.available);
      if (availableVariants.length === 0) {
        availability = 'out_of_stock';
      } else if (availableVariants.length < shopifyProduct.variants.length) {
        availability = 'limited';
      }
    }

    // Build product URL
    let productUrl = shopifyProduct.url;
    if (!productUrl && shopifyProduct.handle) {
      productUrl = `/products/${shopifyProduct.handle}`;
    }
    if (!productUrl) {
      productUrl = window.location.href;
    }

    const product: Product = {
      id: String(shopifyProduct.id),
      title: shopifyProduct.title,
      description: shopifyProduct.description || '',
      price: price,
      originalPrice: originalPrice,
      currency: 'USD', // Default to USD, could be extracted from page
      image: shopifyProduct.featured_image || '',
      images: shopifyProduct.images,
      brand: shopifyProduct.vendor,
      category: shopifyProduct.product_type || 'General',
      tags: shopifyProduct.tags || [],
      availability: availability,
      url: productUrl,
      discount_percentage: discountPercentage
    };

    console.log('DEBUG: Successfully mapped product:', product.title);
    return product;
  } catch (error) {
    console.warn('Error mapping Shopify product:', error);
    return null;
  }
}

/**
 * Extracts all products from the current Shopify page
 */
export function extractProducts(): Product[] {
  console.log('DEBUG: Starting product extraction...');
  debugDocumentContext('extractProducts');
  
  const allProducts: Product[] = [];

  // Try extraction methods in priority order
  const extractionMethods = [
    extractFromShopifyAnalytics,
    extractFromWindowSt,
    extractFromJsonLd,
    extractFromDom
  ];

  for (const method of extractionMethods) {
    try {
      console.log(`DEBUG: Trying extraction method: ${method.name}`);
      const shopifyProducts = method();
      if (shopifyProducts.length > 0) {
        console.log(`Extracted ${shopifyProducts.length} products using ${method.name}`);
        
        // Map to our Product interface
        const mappedProducts = shopifyProducts
          .map(mapShopifyToProduct)
          .filter((product): product is Product => product !== null);
        
        console.log(`DEBUG: Successfully mapped ${mappedProducts.length} products`);
        allProducts.push(...mappedProducts);
        break; // Use first successful method
      }
    } catch (error) {
      console.warn(`Error in extraction method ${method.name}:`, error);
    }
  }

  // Remove duplicates based on ID
  const uniqueProducts = allProducts.filter((product, index, array) => 
    array.findIndex(p => p.id === product.id) === index
  );

  console.log(`Final extracted products: ${uniqueProducts.length}`);
  return uniqueProducts;
}

/**
 * Main initialization function for Shopify parser
 */
export function initShopifyParser(): void {
  try {
    // Check if this is a Shopify site
    if (!detectShopify()) {
      console.log('Not a Shopify site, skipping parser initialization');
      return;
    }

    // Check if this is a relevant Shopify page
    if (!matchesShopifyPage()) {
      console.log('Not a Shopify product/collection page, skipping parser initialization');
      return;
    }

    console.log('Initializing Shopify parser...');
    
    // Extract products
    const products = extractProducts();
    
    if (products.length > 0) {
      console.log(`Successfully extracted ${products.length} products from Shopify page`);
      
      // Store products for the chat widget to access
      (window as any).__browseableAiProducts = products;
      
      // Dispatch custom event to notify chat widget
      window.dispatchEvent(new CustomEvent('browseableAiProductsExtracted', {
        detail: { products }
      }));
    } else {
      console.log('No products found on this Shopify page');
    }
  } catch (error) {
    console.error('Error initializing Shopify parser:', error);
  }
}