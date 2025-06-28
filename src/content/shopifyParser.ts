// Version: 1.0.1 - Updated for GitHub tracking
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
    __browseableAiProducts?: Product[];
    __BROWSEABLE_PRODUCTS?: Product[];
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

    // Check for Shopify-specific patterns in page content
    const bodyText = document.body?.innerHTML || '';
    const shopifyPatterns = [
      'cdn.shopify.com',
      'shopify-section',
      'shopify_pay',
      'Shopify.theme',
      'shopify-product',
      'shopify-cart'
    ];
    
    for (const pattern of shopifyPatterns) {
      if (bodyText.includes(pattern)) {
        console.log(`✅ Found Shopify pattern: ${pattern}`);
        return true;
      }
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
                   pathname.includes('/product/') ||
                   pathname.includes('/pages/shop');
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
    // Handle different currency formats
    const cleanText = text.replace(/[^\d.,£$€¥]/g, '');
    
    // Handle comma as thousands separator vs decimal separator
    let price: number;
    if (cleanText.includes('.') && cleanText.includes(',')) {
      // Both comma and dot - assume comma is thousands separator
      price = parseFloat(cleanText.replace(/,/g, ''));
    } else if (cleanText.includes(',') && !cleanText.includes('.')) {
      // Only comma - could be decimal separator (European) or thousands
      const parts = cleanText.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        // Likely decimal separator
        price = parseFloat(cleanText.replace(',', '.'));
      } else {
        // Likely thousands separator
        price = parseFloat(cleanText.replace(/,/g, ''));
      }
    } else {
      // Standard format
      price = parseFloat(cleanText);
    }
    
    return isNaN(price) ? undefined : price;
  } catch (error) {
    return undefined;
  }
}

/**
 * Enhanced DOM extraction specifically optimized for Gymshark and similar sites
 */
function extractFromDom(): ShopifyProduct[] {
  try {
    console.log('🔍 Extracting from DOM...');
    
    const products: ShopifyProduct[] = [];
    
    // Enhanced selectors specifically for modern e-commerce sites like Gymshark
    const selectors = [
      // Shopify specific
      '[data-product-id]',
      '[data-product-handle]',
      '.product-item[data-product]',
      '.shopify-product',
      
      // Modern e-commerce patterns
      '.product-card',
      '.product-tile',
      '.product-item',
      '.product',
      '.product-grid-item',
      '.product-list-item',
      '.product-block',
      '.product-container',
      '.product-wrapper',
      
      // Gymshark specific patterns (based on common class names)
      '.product-card-wrapper',
      '.product-grid-card',
      '.product-listing-item',
      '.product-summary',
      '.product-details',
      
      // Generic patterns
      '[data-testid*="product"]',
      '[class*="product"]',
      '[id*="product"]',
      
      // Schema.org
      '[itemtype="http://schema.org/Product"]',
      '[itemtype="https://schema.org/Product"]',
      
      // Common class patterns
      '.js-product',
      '.c-product',
      '.m-product'
    ];
    
    let productElements: Element[] = [];
    
    // Try each selector and collect unique elements
    for (const selector of selectors) {
      try {
        const elements = Array.from(document.querySelectorAll(selector));
        elements.forEach(el => {
          if (!productElements.includes(el)) {
            productElements.push(el);
          }
        });
      } catch (selectorError) {
        console.warn(`Error with selector ${selector}:`, selectorError);
      }
    }
    
    console.log('🔍 Found DOM elements with product selectors:', productElements.length);
    
    // If no elements found with standard selectors, try more aggressive detection
    if (productElements.length === 0) {
      console.log('🔍 Trying aggressive product detection...');
      
      // Look for elements that contain both price and title patterns
      const allElements = Array.from(document.querySelectorAll('*'));
      const productEls: Element[] = [];
      
      allElements.forEach(element => {
        if (element.children.length === 0) return; // Skip leaf elements
        
        const textContent = element.textContent || '';
        const innerHTML = element.innerHTML || '';
        
        // Check for price patterns
        const hasPricePattern = /[\$£€¥]\s*\d+(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?\s*[\$£€¥]|price/i.test(textContent);
        
        // Check for product-like content
        const hasProductContent = innerHTML.includes('img') && 
                                 (textContent.length > 10 && textContent.length < 500) &&
                                 !textContent.toLowerCase().includes('footer') &&
                                 !textContent.toLowerCase().includes('header') &&
                                 !textContent.toLowerCase().includes('navigation');
        
        // Check for product-related attributes
        const attrs = Array.from(element.attributes || []);
        const hasProductAttr = attrs.some(attr => 
          attr.name.toLowerCase().includes('product') || 
          attr.value.toLowerCase().includes('product')
        );
        
        if ((hasPricePattern && hasProductContent) || hasProductAttr) {
          productEls.push(element);
        }
      });
      
      productElements = productEls.slice(0, 100); // Limit to prevent performance issues
      console.log('🔍 Found product elements with aggressive detection:', productElements.length);
    }

    // Process each product element
    productElements.forEach((element, index) => {
      try {
        if (index >= 100) return; // Limit to 100 products to avoid performance issues
        
        console.log(`🔍 Processing DOM element ${index + 1}`);
        
        // Try to get product ID from various attributes
        const productId = element.getAttribute('data-product-id') || 
                         element.getAttribute('data-product') || 
                         element.getAttribute('data-id') ||
                         element.getAttribute('data-product-handle') ||
                         element.getAttribute('id') ||
                         element.getAttribute('data-testid') ||
                         `dom-product-${Date.now()}-${index}`;
        
        console.log(`🔍 Element ${index + 1} product ID:`, productId);

        // Extract title with comprehensive selectors
        const titleSelectors = [
          '[data-product-title]',
          '[itemprop="name"]',
          '.product-title',
          '.product-name',
          '.product-card-title',
          '.product-item-title',
          '.product-heading',
          '.title',
          '.name',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'a[href*="/product"]',
          'a[href*="/products/"]',
          '[data-testid*="title"]',
          '[data-testid*="name"]'
        ];
        
        let title = '';
        for (const selector of titleSelectors) {
          try {
            const titleEl = element.querySelector(selector);
            if (titleEl?.textContent?.trim()) {
              const candidateTitle = titleEl.textContent.trim();
              // Filter out obviously non-title text
              if (candidateTitle.length > 3 && 
                  candidateTitle.length < 200 && 
                  !candidateTitle.toLowerCase().includes('add to cart') &&
                  !candidateTitle.toLowerCase().includes('quick view') &&
                  !candidateTitle.toLowerCase().includes('sale') &&
                  !/^\$/.test(candidateTitle)) {
                title = candidateTitle;
                console.log(`✅ Found title using selector "${selector}":`, title);
                break;
              }
            }
          } catch (titleError) {
            console.warn(`Error with title selector ${selector}:`, titleError);
          }
        }
        
        // If no title found with selectors, try text analysis
        if (!title) {
          const textElements = Array.from(element.querySelectorAll('*'))
            .filter(el => el.children.length === 0) // Only leaf elements
            .map(el => el.textContent?.trim() || '')
            .filter(text => 
              text.length > 5 && 
              text.length < 150 &&
              !text.toLowerCase().includes('add to cart') &&
              !text.toLowerCase().includes('quick view') &&
              !text.toLowerCase().includes('£') &&
              !text.toLowerCase().includes('$') &&
              !text.toLowerCase().includes('sale') &&
              !/^\d+$/.test(text)
            )
            .sort((a, b) => b.length - a.length);
          
          if (textElements.length > 0) {
            title = textElements[0];
            console.log(`✅ Found title from text analysis:`, title);
          }
        }

        if (!title) {
          console.log(`❌ Element ${index + 1} missing title, skipping`);
          return; // Skip if no title found
        }

        // Extract image with comprehensive selectors
        const imgSelectors = [
          'img[data-product-image]',
          'img[itemprop="image"]',
          '.product-image img',
          '.product-photo img',
          '.product-img img',
          '.featured-image img',
          'img[src*="product"]',
          'img[alt*="product"]',
          'img[data-src]',
          'img[data-lazy-src]',
          'img[data-original]',
          'img'
        ];
        
        let image = '';
        for (const selector of imgSelectors) {
          try {
            const imgEl = element.querySelector(selector) as HTMLImageElement;
            if (imgEl) {
              const candidateImage = imgEl.src || 
                                   imgEl.getAttribute('data-src') || 
                                   imgEl.getAttribute('data-lazy-src') ||
                                   imgEl.getAttribute('data-original') ||
                                   imgEl.getAttribute('srcset')?.split(' ')[0] || '';
              
              if (candidateImage && 
                  !candidateImage.includes('placeholder') && 
                  !candidateImage.includes('loading') &&
                  !candidateImage.includes('spinner') &&
                  !candidateImage.includes('cart') &&
                  candidateImage.includes('http')) {
                image = candidateImage;
                console.log(`✅ Found image using selector "${selector}":`, image);
                break;
              }
            }
          } catch (imgError) {
            console.warn(`Error with image selector ${selector}:`, imgError);
          }
        }

        // Extract price with comprehensive selectors and patterns
        const priceSelectors = [
          '[data-price]',
          '[itemprop="price"]',
          '.price',
          '.product-price',
          '.money',
          '.price-current',
          '.price-now',
          '.sale-price',
          '.regular-price',
          '.price__current',
          '.price-item',
          '.cost',
          '.amount',
          '[data-testid*="price"]',
          '.price-display',
          '.product-cost'
        ];
        
        let price: number | undefined;
        for (const selector of priceSelectors) {
          try {
            const priceEl = element.querySelector(selector);
            if (priceEl?.textContent) {
              const candidatePrice = extractPrice(priceEl.textContent);
              if (candidatePrice !== undefined && candidatePrice > 0) {
                price = candidatePrice;
                console.log(`✅ Found price using selector "${selector}":`, price);
                break;
              }
            }
          } catch (priceError) {
            console.warn(`Error with price selector ${selector}:`, priceError);
          }
        }
        
        // If no price found with selectors, scan all text for price patterns
        if (price === undefined) {
          const allText = element.textContent || '';
          const pricePatterns = [
            /£(\d+(?:\.\d{2})?)/g,
            /\$(\d+(?:\.\d{2})?)/g,
            /€(\d+(?:\.\d{2})?)/g,
            /(\d+(?:\.\d{2})?)\s*£/g,
            /(\d+(?:\.\d{2})?)\s*\$/g,
            /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*[£$€]/g
          ];
          
          for (const pattern of pricePatterns) {
            const matches = Array.from(allText.matchAll(pattern));
            if (matches.length > 0) {
              const priceStr = matches[0][1];
              const candidatePrice = parseFloat(priceStr.replace(/,/g, ''));
              if (candidatePrice > 0) {
                price = candidatePrice;
                console.log(`✅ Found price from text pattern:`, price);
                break;
              }
            }
          }
        }

        // Extract URL
        let url = '';
        const linkSelectors = [
          'a[href*="/product"]',
          'a[href*="/products/"]',
          'a[data-product-url]',
          'a[href]'
        ];
        
        for (const selector of linkSelectors) {
          try {
            const linkEl = element.querySelector(selector) as HTMLAnchorElement;
            if (linkEl?.href && linkEl.href !== window.location.href) {
              url = linkEl.href;
              console.log(`✅ Found URL using selector "${selector}":`, url);
              break;
            }
          } catch (linkError) {
            console.warn(`Error with link selector ${selector}:`, linkError);
          }
        }
        
        // If no URL found, try to construct one
        if (!url) {
          const handle = element.getAttribute('data-product-handle') || 
                        title.toLowerCase()
                             .replace(/[^\w\s-]/g, '')
                             .replace(/\s+/g, '-')
                             .replace(/-+/g, '-')
                             .trim();
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
          '[data-product-description]',
          '[itemprop="description"]',
          '.product-description',
          '.product-summary',
          '.description',
          '.summary',
          'p'
        ];
        
        for (const selector of descSelectors) {
          try {
            const descEl = element.querySelector(selector);
            if (descEl?.textContent) {
              const candidateDesc = descEl.textContent.trim();
              if (candidateDesc && 
                  candidateDesc.length > 10 && 
                  candidateDesc.length < 500 &&
                  candidateDesc !== title) {
                description = candidateDesc;
                console.log(`✅ Found description using selector "${selector}"`);
                break;
              }
            }
          } catch (descError) {
            console.warn(`Error with description selector ${selector}:`, descError);
          }
        }
        
        // Default description if none found
        if (!description) {
          description = `${title} - Available on ${window.location.hostname}`;
          console.log(`⚠️ No description found, using default`);
        }

        // Extract brand/vendor
        let vendor = '';
        const brandSelectors = [
          '[data-brand]',
          '[itemprop="brand"]',
          '.brand',
          '.vendor',
          '.manufacturer'
        ];
        
        for (const selector of brandSelectors) {
          try {
            const brandEl = element.querySelector(selector);
            if (brandEl?.textContent) {
              vendor = brandEl.textContent.trim();
              if (vendor) {
                console.log(`✅ Found brand using selector "${selector}":`, vendor);
                break;
              }
            }
          } catch (brandError) {
            console.warn(`Error with brand selector ${selector}:`, brandError);
          }
        }

        // If no vendor found, try to extract from hostname
        if (!vendor) {
          const hostname = window.location.hostname;
          if (hostname.includes('gymshark')) {
            vendor = 'Gymshark';
          } else if (hostname.includes('allbirds')) {
            vendor = 'Allbirds';
          } else {
            vendor = hostname.split('.')[0];
            // Capitalize first letter
            vendor = vendor.charAt(0).toUpperCase() + vendor.slice(1);
          }
        }

        // Check if this is a duplicate product by comparing title and price
        const isDuplicate = products.some(p => 
          p.title?.toLowerCase() === title.toLowerCase() && 
          Math.abs((p.price || 0) - (price || 0)) < 0.01
        );

        if (isDuplicate) {
          console.log(`⚠️ Skipping duplicate product: ${title}`);
          return;
        }

        const product: ShopifyProduct = {
          id: productId,
          title,
          description,
          featured_image: image,
          price: price || 0,
          url,
          available: true, // Assume available if found in DOM
          vendor: vendor || undefined
        };

        products.push(product);
        console.log(`✅ Added DOM product:`, product.title, 'Price:', product.price);
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
    if (price === undefined || price === 0) {
      console.log('⚠️ Product has no price, setting to 0:', shopifyProduct.title);
      price = 0;
    }
    
    // Convert from cents to dollars if needed (Shopify stores prices in cents)
    // Only convert if price is a whole number > 100 (likely cents)
    if (typeof price === 'number' && price > 100 && Number.isInteger(price)) {
      price = price / 100;
      console.log('🔄 Converted price from cents to dollars:', price);
    }

    // Determine original price for discount calculation
    let originalPrice = shopifyProduct.compare_at_price;
    if (originalPrice === undefined) {
      originalPrice = shopifyProduct.compare_at_price_min;
    }
    
    // Convert original price from cents if needed
    if (typeof originalPrice === 'number' && originalPrice > 100 && Number.isInteger(originalPrice)) {
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
    
    // Add default tags based on vendor
    if (shopifyProduct.vendor) {
      tags.push(shopifyProduct.vendor.toLowerCase());
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
 * Extracts all products from the current page
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

  // Remove duplicates based on title similarity (since IDs might be generated)
  const uniqueProducts = allProducts.filter((product, index, array) => {
    const firstIndex = array.findIndex(p => 
      p.id === product.id || 
      (p.title.toLowerCase() === product.title.toLowerCase() && Math.abs(p.price - product.price) < 0.01)
    );
    return firstIndex === index;
  });

  console.log(`🎉 Final extracted products: ${uniqueProducts.length}`);
  
  // Store products in window global for other components to access
  // Use both old and new formats for backward compatibility
  window.__browseableAiProducts = uniqueProducts;
  window.__BROWSEABLE_PRODUCTS = uniqueProducts;
  
  return uniqueProducts;
}

/**
 * Main initialization function for product parser
 */
export function initShopifyParser(): void {
  try {
    console.log('🚀 Initializing product parser...');
    
    // Always try to extract products, regardless of site type
    console.log('✅ Attempting product extraction on current page...');
    
    // Function to run extraction
    const runExtraction = () => {
      const products = extractProducts();
      
      if (products.length > 0) {
        console.log(`✅ Successfully extracted ${products.length} products`);
        
        // Store products for the chat widget to access
        window.__browseableAiProducts = products;
        window.__BROWSEABLE_PRODUCTS = products;
        
        // Dispatch custom event to notify chat widget (both old and new format)
        window.dispatchEvent(new CustomEvent('browseableAiProductsExtracted', {
          detail: { products }
        }));
        
        window.dispatchEvent(new CustomEvent('BROWSEABLE_PRODUCTS_EXTRACTED', {
          detail: { products }
        }));
        
        return true;
      } else {
        console.log('❌ No products found on this page');
        return false;
      }
    };
    
    // Try immediate extraction
    const immediateSuccess = runExtraction();
    
    // If immediate extraction failed, try again after delays for dynamic content
    if (!immediateSuccess) {
      setTimeout(() => {
        console.log('🔄 Retrying product extraction after 2s...');
        const success = runExtraction();
        
        if (!success) {
          // Final attempt after longer delay
          setTimeout(() => {
            console.log('🔄 Final retry of product extraction after 5s...');
            runExtraction();
          }, 3000);
        }
      }, 2000);
    }
    
  } catch (error) {
    console.error('💥 Error initializing product parser:', error);
  }
}