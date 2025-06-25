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
  interface Window extends ShopifyGlobals {
    Shopify?: any;
  }
}

/**
 * Detects if the current page is a Shopify store
 */
export function detectShopify(): boolean {
  try {
    console.log('🔍 Starting Shopify detection...');
    
    // Check for Shopify globals
    console.log('🔍 Checking for ShopifyAnalytics:', !!window.ShopifyAnalytics);
    console.log('🔍 Checking for __st:', !!window.__st);
    console.log('🔍 Checking for Shopify:', !!window.Shopify);
    
    if (window.ShopifyAnalytics || window.__st || window.Shopify) {
      console.log('✅ Found Shopify globals');
      return true;
    }

    // Check for Shopify script tags
    const shopifySettings = document.querySelector('script#ShopifySettings');
    console.log('🔍 Found ShopifySettings script:', !!shopifySettings);
    if (shopifySettings) {
      console.log('✅ Found ShopifySettings script');
      return true;
    }

    // Check for Shopify meta tags
    const shopifyMeta = document.querySelector('meta[name="shopify-checkout-api-token"]');
    console.log('🔍 Found Shopify meta tag:', !!shopifyMeta);
    if (shopifyMeta) {
      console.log('✅ Found Shopify meta tag');
      return true;
    }
    
    // Check for Shopify in URL
    if (window.location.hostname.includes('shopify') || 
        window.location.hostname.includes('myshopify')) {
      console.log('✅ Found Shopify in URL');
      return true;
    }

    console.log('❌ No Shopify indicators found');
    return false;
  } catch (error) {
    console.warn('⚠️ Error detecting Shopify:', error);
    return false;
  }
}

/**
 * Checks if the current URL matches a Shopify product or collection page
 */
export function matchesShopifyPage(): boolean {
  try {
    const pathname = window.location.pathname;
    console.log('🔍 Checking pathname:', pathname);
    const isMatch = pathname.includes('/collections/') || 
                   pathname.includes('/products/') || 
                   pathname.includes('/product/');
    console.log('🔍 Page matches Shopify pattern:', isMatch);
    return isMatch;
  } catch (error) {
    console.warn('⚠️ Error matching Shopify page:', error);
    return false;
  }
}

/**
 * Extracts products from ShopifyAnalytics global
 */
function extractFromShopifyAnalytics(): ShopifyProduct[] {
  try {
    console.log('🔍 Extracting from ShopifyAnalytics...');
    const analytics = window.ShopifyAnalytics;
    if (!analytics?.meta) {
      console.log('❌ No ShopifyAnalytics.meta found');
      return [];
    }

    const products: ShopifyProduct[] = [];
    
    if (analytics.meta.product) {
      console.log('✅ Found product in ShopifyAnalytics.meta');
      products.push(analytics.meta.product);
    }
    
    if (analytics.meta.products) {
      console.log('✅ Found products array in ShopifyAnalytics.meta:', analytics.meta.products.length);
      products.push(...analytics.meta.products);
    }

    console.log('✅ ShopifyAnalytics extraction result:', products.length, 'products');
    return products;
  } catch (error) {
    console.warn('⚠️ Error extracting from ShopifyAnalytics:', error);
    return [];
  }
}

/**
 * Extracts products from window.__st global
 */
function extractFromWindowSt(): ShopifyProduct[] {
  try {
    console.log('🔍 Extracting from window.__st...');
    const st = window.__st;
    if (!st?.meta) {
      console.log('❌ No window.__st.meta found');
      return [];
    }

    const products: ShopifyProduct[] = [];
    
    if (st.meta.product) {
      console.log('✅ Found product in window.__st.meta');
      products.push(st.meta.product);
    }
    
    if (st.meta.products) {
      console.log('✅ Found products array in window.__st.meta:', st.meta.products.length);
      products.push(...st.meta.products);
    }

    console.log('✅ window.__st extraction result:', products.length, 'products');
    return products;
  } catch (error) {
    console.warn('⚠️ Error extracting from window.__st:', error);
    return [];
  }
}

/**
 * Extracts products from JSON-LD structured data
 */
function extractFromJsonLd(): ShopifyProduct[] {
  try {
    console.log('🔍 Extracting from JSON-LD...');
    
    const products: ShopifyProduct[] = [];
    
    // Get all JSON-LD scripts
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    console.log('🔍 Found JSON-LD scripts:', jsonLdScripts.length);

    jsonLdScripts.forEach((script, index) => {
      try {
        console.log(`🔍 Processing JSON-LD script ${index + 1}`);
        
        if (!script.textContent?.trim()) {
          console.log(`❌ Script ${index + 1} has no content`);
          return;
        }
        
        const data = JSON.parse(script.textContent);
        const items = Array.isArray(data) ? data : [data];
        console.log(`🔍 JSON-LD script ${index + 1} contains ${items.length} items`);

        items.forEach((item, itemIndex) => {
          console.log(`🔍 Processing item ${itemIndex + 1}, type:`, item['@type']);
          if (item['@type'] === 'Product') {
            console.log('✅ Found Product in JSON-LD');
            const product: ShopifyProduct = {
              id: item.productID || item.sku || `jsonld-${Date.now()}-${itemIndex}`,
              title: item.name,
              description: item.description,
              vendor: item.brand?.name,
              url: item.url,
              featured_image: Array.isArray(item.image) ? item.image[0] : item.image,
              images: Array.isArray(item.image) ? item.image : item.image ? [item.image] : undefined
            };

            // Extract price from offers
            if (item.offers) {
              const offers = Array.isArray(item.offers) ? item.offers : [item.offers];
              const offer = offers[0];
              if (offer) {
                product.price = parseFloat(offer.price);
                product.available = offer.availability === 'https://schema.org/InStock';
                console.log('✅ Extracted price from offers:', product.price);
              }
            }

            products.push(product);
            console.log('✅ Added product from JSON-LD:', product.title);
          }
        });
      } catch (parseError) {
        console.warn(`⚠️ Error parsing JSON-LD script ${index + 1}:`, parseError);
      }
    });

    console.log('✅ JSON-LD extraction result:', products.length, 'products');
    return products;
  } catch (error) {
    console.warn('⚠️ Error extracting from JSON-LD:', error);
    return [];
  }
}

/**
 * Extracts price from text by removing non-numeric characters
 */
function extractPrice(text: string): number | undefined {
  try {
    // Remove currency symbols and non-numeric characters except decimal points
    const cleaned = text.replace(/[^\d.,]/g, '').replace(',', '.');
    const price = parseFloat(cleaned);
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
    console.log('🔍 Extracting from DOM...');
    
    const products: ShopifyProduct[] = [];
    
    // Try multiple selectors to find product elements
    const selectors = [
      '[data-product-id]',
      '.product',
      '.product-item',
      '.product-card',
      '.product-grid-item',
      '.product-list-item',
      '[data-product]',
      '[data-product-handle]',
      '[itemtype="http://schema.org/Product"]',
      '[itemtype="https://schema.org/Product"]'
    ];
    
    let productElements: NodeListOf<Element> | Element[] = document.querySelectorAll(selectors.join(','));
    console.log('🔍 Found DOM elements with product selectors:', productElements.length);
    
    // If no elements found with standard selectors, try a more aggressive approach
    if (productElements.length === 0) {
      console.log('🔍 Trying alternative product detection...');
      
      // Look for elements with product-like attributes
      const allElements = document.querySelectorAll('*');
      const productEls: Element[] = [];
      
      allElements.forEach(element => {
        // Check for product-related attributes
        const attrs = Array.from(element.attributes || []);
        const hasProductAttr = attrs.some(attr => 
          attr.name.includes('product') || 
          attr.value.includes('product')
        );
        
        if (hasProductAttr) {
          productEls.push(element);
        }
      });
      
      productElements = productEls;
      console.log('🔍 Found product elements with alternative detection:', productElements.length);
    }

    // Process each product element
    Array.from(productElements).forEach((element, index) => {
      try {
        if (index >= 20) return; // Limit to 20 products to avoid performance issues
        
        console.log(`🔍 Processing DOM element ${index + 1}`);
        
        // Try to get product ID
        const productId = element.getAttribute('data-product-id') || 
                         element.getAttribute('data-product') || 
                         element.getAttribute('data-id') || 
                         `dom-product-${index}`;
        
        console.log(`🔍 Element ${index + 1} product ID:`, productId);

        // Extract title
        const titleSelectors = [
          '[data-product-title]',
          '.product-title',
          '.product-name',
          'h1',
          'h2',
          'h3',
          '.title',
          '[itemprop="name"]'
        ];
        
        let title = '';
        for (const selector of titleSelectors) {
          const titleEl = element.querySelector(selector);
          if (titleEl?.textContent?.trim()) {
            title = titleEl.textContent.trim();
            console.log(`✅ Found title using selector "${selector}":`, title);
            break;
          }
        }
        
        // If no title found with selectors, try the element itself
        if (!title && element.textContent) {
          const text = element.textContent.trim();
          if (text.length > 0 && text.length < 100) {
            title = text;
            console.log(`✅ Found title from element text:`, title);
          }
        }

        if (!title) {
          console.log(`❌ Element ${index + 1} missing title, skipping`);
          return; // Skip if no title found
        }

        // Extract image
        const imgSelectors = [
          'img',
          '[data-product-image] img',
          '.product-image img',
          '.product-img img',
          '[itemprop="image"]'
        ];
        
        let image = '';
        for (const selector of imgSelectors) {
          const imgEl = element.querySelector(selector) as HTMLImageElement;
          if (imgEl) {
            image = imgEl.src || imgEl.getAttribute('data-src') || imgEl.getAttribute('data-lazy-src') || '';
            if (image) {
              console.log(`✅ Found image using selector "${selector}":`, image);
              break;
            }
          }
        }

        // Extract price
        const priceSelectors = [
          '.price',
          '.product-price',
          '.money',
          '[data-price]',
          '.price-current',
          '[itemprop="price"]',
          '.price__current',
          '.price-item'
        ];
        
        let price: number | undefined;
        for (const selector of priceSelectors) {
          const priceEl = element.querySelector(selector);
          if (priceEl?.textContent) {
            price = extractPrice(priceEl.textContent);
            if (price !== undefined) {
              console.log(`✅ Found price using selector "${selector}":`, price);
              break;
            }
          }
        }
        
        // If no price found, try to find any number in the element
        if (price === undefined && element.textContent) {
          const priceMatch = element.textContent.match(/\$\s?(\d+(\.\d{1,2})?)/);
          if (priceMatch && priceMatch[1]) {
            price = parseFloat(priceMatch[1]);
            console.log(`✅ Found price from text:`, price);
          }
        }

        // If still no price, set a default
        if (price === undefined) {
          price = 0;
          console.log(`⚠️ No price found, using default:`, price);
        }

        // Extract URL
        let url = '';
        const linkEl = element.querySelector('a[href]') as HTMLAnchorElement;
        if (linkEl) {
          url = linkEl.href;
          console.log(`✅ Found URL:`, url);
        }
        
        // If no URL found, try to construct one
        if (!url) {
          const handle = element.getAttribute('data-product-handle') || title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
          url = `/products/${handle}`;
          console.log(`✅ Constructed URL:`, url);
        }
        
        // Make sure URL is absolute
        if (url && url.startsWith('/')) {
          url = `${window.location.origin}${url}`;
          console.log(`✅ Made URL absolute:`, url);
        }

        // Extract description
        let description = '';
        const descSelectors = [
          '.product-description',
          '.description',
          '[itemprop="description"]'
        ];
        
        for (const selector of descSelectors) {
          const descEl = element.querySelector(selector);
          if (descEl?.textContent) {
            description = descEl.textContent.trim();
            if (description) {
              console.log(`✅ Found description using selector "${selector}"`);
              break;
            }
          }
        }
        
        // Default description if none found
        if (!description) {
          description = `${title} - Product found on ${window.location.hostname}`;
          console.log(`⚠️ No description found, using default`);
        }

        const product: ShopifyProduct = {
          id: productId,
          title,
          description,
          featured_image: image,
          price,
          url,
          available: true, // Assume available if found in DOM
          vendor: element.querySelector('.vendor')?.textContent?.trim() || undefined
        };

        products.push(product);
        console.log(`✅ Added DOM product:`, product.title);
      } catch (elementError) {
        console.warn(`⚠️ Error extracting product from DOM element ${index + 1}:`, elementError);
      }
    });

    console.log('✅ DOM extraction result:', products.length, 'products');
    return products;
  } catch (error) {
    console.warn('⚠️ Error extracting from DOM:', error);
    return [];
  }
}

/**
 * Maps Shopify product data to our Product interface
 */
function mapShopifyToProduct(shopifyProduct: ShopifyProduct): Product | null {
  try {
    if (!shopifyProduct.id || !shopifyProduct.title) {
      console.log('❌ Skipping product mapping - missing ID or title');
      return null;
    }

    // Determine price
    let price = shopifyProduct.price;
    if (price === undefined) {
      price = shopifyProduct.price_min;
    }
    if (price === undefined) {
      console.log('❌ Skipping product mapping - missing price');
      return null; // Price is required
    }
    
    // Convert from cents to dollars if needed (Shopify stores prices in cents)
    if (typeof price === 'number' && price > 100 && !String(price).includes('.')) {
      price = price / 100;
      console.log('🔄 Converted price from cents to dollars:', price);
    }

    // Determine original price for discount calculation
    let originalPrice = shopifyProduct.compare_at_price;
    if (originalPrice === undefined) {
      originalPrice = shopifyProduct.compare_at_price_min;
    }
    
    // Convert original price from cents if needed
    if (typeof originalPrice === 'number' && originalPrice > 100 && !String(originalPrice).includes('.')) {
      originalPrice = originalPrice / 100;
      console.log('🔄 Converted original price from cents to dollars:', originalPrice);
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
    
    // Make sure URL is absolute
    if (productUrl && productUrl.startsWith('/')) {
      productUrl = `${window.location.origin}${productUrl}`;
    }
    
    // Extract tags
    let tags = shopifyProduct.tags || [];
    if (!tags.length && shopifyProduct.product_type) {
      tags = [shopifyProduct.product_type];
    }
    
    // Ensure we have at least one tag
    if (tags.length === 0) {
      tags = ['product'];
    }

    const product: Product = {
      id: String(shopifyProduct.id),
      title: shopifyProduct.title,
      description: shopifyProduct.description || 'No description available',
      price: price,
      originalPrice: originalPrice,
      currency: 'USD', // Default to USD, could be extracted from page
      image: shopifyProduct.featured_image || '',
      images: shopifyProduct.images,
      brand: shopifyProduct.vendor,
      category: shopifyProduct.product_type || 'General',
      tags: tags,
      availability: availability,
      url: productUrl,
      discount_percentage: discountPercentage
    };

    console.log('✅ Successfully mapped product:', product.title);
    return product;
  } catch (error) {
    console.warn('⚠️ Error mapping Shopify product:', error);
    return null;
  }
}

/**
 * Extracts all products from the current Shopify page
 */
export function extractProducts(): Product[] {
  console.log('🚀 Starting product extraction...');
  
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
      console.log(`🔍 Trying extraction method: ${method.name}`);
      const shopifyProducts = method();
      if (shopifyProducts.length > 0) {
        console.log(`✅ Extracted ${shopifyProducts.length} products using ${method.name}`);
        
        // Map to our Product interface
        const mappedProducts = shopifyProducts
          .map(mapShopifyToProduct)
          .filter((product): product is Product => product !== null);
        
        console.log(`✅ Successfully mapped ${mappedProducts.length} products`);
        allProducts.push(...mappedProducts);
        break; // Use first successful method
      }
    } catch (error) {
      console.warn(`⚠️ Error in extraction method ${method.name}:`, error);
    }
  }

  // Remove duplicates based on ID
  const uniqueProducts = allProducts.filter((product, index, array) => 
    array.findIndex(p => p.id === product.id) === index
  );

  console.log(`🎉 Final extracted products: ${uniqueProducts.length}`);
  return uniqueProducts;
}

/**
 * Main initialization function for Shopify parser
 */
export function initShopifyParser(): void {
  try {
    console.log('🚀 Initializing Shopify parser...');
    
    // Check if this is a Shopify site
    if (!detectShopify()) {
      console.log('❌ Not a Shopify site, trying generic product extraction');
      
      // Try to extract products from DOM anyway
      const domProducts = extractFromDom();
      if (domProducts.length > 0) {
        console.log(`✅ Found ${domProducts.length} products from DOM`);
        
        // Map to our Product interface
        const mappedProducts = domProducts
          .map(mapShopifyToProduct)
          .filter((product): product is Product => product !== null);
        
        if (mappedProducts.length > 0) {
          console.log(`✅ Mapped ${mappedProducts.length} DOM products`);
          
          // Store products for the chat widget to access
          (window as any).__browseableAiProducts = mappedProducts;
          
          // Dispatch custom event to notify chat widget
          window.dispatchEvent(new CustomEvent('browseableAiProductsExtracted', {
            detail: { products: mappedProducts }
          }));
        }
      }
      
      return;
    }

    // Check if this is a relevant Shopify page
    if (!matchesShopifyPage() && !window.location.pathname.includes('/product')) {
      console.log('❌ Not a Shopify product/collection page, trying generic extraction');
      
      // Try to extract products anyway
      const products = extractProducts();
      
      if (products.length > 0) {
        console.log(`✅ Successfully extracted ${products.length} products`);
        
        // Store products for the chat widget to access
        (window as any).__browseableAiProducts = products;
        
        // Dispatch custom event to notify chat widget
        window.dispatchEvent(new CustomEvent('browseableAiProductsExtracted', {
          detail: { products }
        }));
      }
      
      return;
    }

    console.log('✅ Initializing Shopify parser on Shopify page...');
    
    // Extract products
    const products = extractProducts();
    
    if (products.length > 0) {
      console.log(`✅ Successfully extracted ${products.length} products from Shopify page`);
      
      // Store products for the chat widget to access
      (window as any).__browseableAiProducts = products;
      
      // Dispatch custom event to notify chat widget
      window.dispatchEvent(new CustomEvent('browseableAiProductsExtracted', {
        detail: { products }
      }));
    } else {
      console.log('❌ No products found on this Shopify page');
    }
  } catch (error) {
    console.error('💥 Error initializing Shopify parser:', error);
  }
}