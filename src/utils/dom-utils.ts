// Version: 1.0.1 - Updated for GitHub tracking
export function detectEcommerceSite(): {
  platform: string;
  isProductPage: boolean;
  isListingPage: boolean;
} {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  console.log('🔍 Detecting e-commerce site:', { hostname, pathname });
  
  // Shopify detection (enhanced)
  if (hostname.includes('.myshopify.com') || 
      hostname.includes('shopify') ||
      document.querySelector('script[src*="shopify"]') ||
      document.querySelector('meta[name="shopify-checkout-api-token"]') ||
      window.Shopify ||
      (window as any).ShopifyAnalytics ||
      document.body?.innerHTML.includes('cdn.shopify.com') ||
      document.body?.innerHTML.includes('shopify-section')) {
    console.log('🛍️ Detected Shopify site');
    return {
      platform: 'shopify',
      isProductPage: pathname.includes('/products/'),
      isListingPage: pathname.includes('/collections/') || pathname.includes('/search')
    };
  }
  
  // WooCommerce detection
  if (document.querySelector('script[src*="woocommerce"]') ||
      document.querySelector('body.woocommerce') ||
      document.querySelector('.woocommerce') ||
      document.body?.innerHTML.includes('wc-') ||
      document.body?.innerHTML.includes('woocommerce')) {
    console.log('🛒 Detected WooCommerce site');
    return {
      platform: 'woocommerce',
      isProductPage: pathname.includes('/product/'),
      isListingPage: pathname.includes('/shop/') || pathname.includes('/category/')
    };
  }
  
  // Magento detection
  if (document.body?.innerHTML.includes('Magento') ||
      document.querySelector('script[src*="magento"]') ||
      document.querySelector('[data-mage-init]') ||
      document.querySelector('.page-wrapper')) {
    console.log('🏪 Detected Magento site');
    return {
      platform: 'magento',
      isProductPage: pathname.includes('/product/') || pathname.includes('.html'),
      isListingPage: pathname.includes('/category/') || pathname.includes('/catalog/')
    };
  }
  
  // BigCommerce detection
  if (hostname.includes('bigcommerce') ||
      document.body?.innerHTML.includes('bigcommerce') ||
      document.querySelector('script[src*="bigcommerce"]')) {
    console.log('🏬 Detected BigCommerce site');
    return {
      platform: 'bigcommerce',
      isProductPage: pathname.includes('/products/'),
      isListingPage: pathname.includes('/categories/') || pathname.includes('/search')
    };
  }
  
  // Major e-commerce platforms
  const platforms = [
    { name: 'amazon', domains: ['amazon.com', 'amazon.co.uk', 'amazon.ca', 'amazon.de', 'amazon.fr'], productPath: '/dp/', listingPath: '/s?' },
    { name: 'ebay', domains: ['ebay.com', 'ebay.co.uk', 'ebay.de'], productPath: '/itm/', listingPath: '/sch/' },
    { name: 'etsy', domains: ['etsy.com'], productPath: '/listing/', listingPath: '/search?' },
    { name: 'target', domains: ['target.com'], productPath: '/p/', listingPath: '/c/' },
    { name: 'walmart', domains: ['walmart.com'], productPath: '/ip/', listingPath: '/browse/' },
    { name: 'bestbuy', domains: ['bestbuy.com'], productPath: '/site/', listingPath: '/site/' },
    { name: 'homedepot', domains: ['homedepot.com'], productPath: '/p/', listingPath: '/b/' },
    { name: 'lowes', domains: ['lowes.com'], productPath: '/pd/', listingPath: '/pl/' }
  ];
  
  for (const platform of platforms) {
    if (platform.domains.some(domain => hostname.includes(domain))) {
      console.log(`🏪 Detected ${platform.name} site`);
      return {
        platform: platform.name,
        isProductPage: pathname.includes(platform.productPath),
        isListingPage: pathname.includes(platform.listingPath)
      };
    }
  }
  
  // Generic e-commerce patterns (enhanced)
  const productPatterns = ['/product/', '/products/', '/item/', '/p/', '/listing/', '/goods/'];
  const listingPatterns = ['/shop/', '/category/', '/collection/', '/collections/', '/search', '/browse/', '/catalog/'];
  
  const isProductPage = productPatterns.some(pattern => pathname.includes(pattern));
  const isListingPage = listingPatterns.some(pattern => pathname.includes(pattern));
  
  // Check for e-commerce indicators in the page content
  const hasProductElements = document.querySelectorAll([
    '.product',
    '.product-item',
    '.product-card',
    '[data-product]',
    '[data-product-id]',
    '.add-to-cart',
    '.buy-now',
    '.price',
    '.product-price'
  ].join(',')).length > 0;
  
  const hasEcommerceKeywords = document.body?.innerHTML.toLowerCase().includes('add to cart') ||
                              document.body?.innerHTML.toLowerCase().includes('buy now') ||
                              document.body?.innerHTML.toLowerCase().includes('shopping cart') ||
                              document.body?.innerHTML.toLowerCase().includes('checkout');
  
  if (isProductPage || isListingPage || hasProductElements || hasEcommerceKeywords) {
    console.log('🛍️ Detected generic e-commerce patterns');
    return {
      platform: 'custom',
      isProductPage: isProductPage || hasProductElements,
      isListingPage: isListingPage || (hasProductElements && !isProductPage)
    };
  }
  
  console.log('❌ No e-commerce patterns detected');
  return {
    platform: 'unknown',
    isProductPage: false,
    isListingPage: false
  };
}

export function createShadowRoot(container: HTMLElement): ShadowRoot {
  if (container.shadowRoot) {
    console.log('🎭 Using existing shadow root');
    return container.shadowRoot;
  }
  console.log('🎭 Creating new shadow root');
  return container.attachShadow({ mode: 'open' });
}

export function injectStyles(shadowRoot: ShadowRoot, styles: string): void {
  console.log('🎨 Injecting styles into shadow root');
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  shadowRoot.appendChild(styleElement);
}

export function findProductElements(): {
  products: HTMLElement[];
  prices: HTMLElement[];
  titles: HTMLElement[];
  images: HTMLElement[];
} {
  // Enhanced selectors for product elements
  const productSelectors = [
    // Shopify specific
    '[data-product-id]',
    '[data-product-handle]',
    '.shopify-product',
    
    // Generic e-commerce
    '.product',
    '.product-item',
    '.product-card',
    '.product-grid-item',
    '.product-list-item',
    '.product-tile',
    '.product-block',
    '.product-container',
    '.product-wrapper',
    
    // Schema.org
    '[itemtype*="Product"]',
    
    // Common patterns
    '.js-product',
    '.c-product',
    '.m-product'
  ];
  
  const priceSelectors = [
    '.price',
    '.product-price',
    '.money',
    '[data-price]',
    '.price-current',
    '.price-now',
    '.sale-price',
    '.regular-price',
    '.price__current',
    '.price-item',
    '.cost',
    '.amount',
    '[itemprop="price"]'
  ];
  
  const titleSelectors = [
    '.product-title',
    '.product-name',
    '.product-card-title',
    'h1', 'h2', 'h3', 'h4',
    '.title',
    '.name',
    '[data-product-title]',
    '[itemprop="name"]'
  ];
  
  const imageSelectors = [
    '.product-image img',
    '.product-photo img',
    '.product-img img',
    '.featured-image img',
    '[data-product-image]',
    'img[src*="product"]',
    'img[alt*="product"]',
    '[itemprop="image"]'
  ];
  
  return {
    products: productSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel)) as HTMLElement[]),
    prices: priceSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel)) as HTMLElement[]),
    titles: titleSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel)) as HTMLElement[]),
    images: imageSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel)) as HTMLElement[])
  };
}

/**
 * Enhanced function to extract product data from any e-commerce site
 */
export function extractProductsFromPage(): any[] {
  console.log('🔍 Starting enhanced product extraction...');
  
  const products: any[] = [];
  const { products: productElements } = findProductElements();
  
  console.log(`🔍 Found ${productElements.length} potential product elements`);
  
  productElements.forEach((element, index) => {
    if (index >= 50) return; // Limit for performance
    
    try {
      // Extract basic product info
      const id = element.getAttribute('data-product-id') || 
                element.getAttribute('data-product') || 
                element.getAttribute('data-id') ||
                `extracted-${index}`;
      
      // Find title
      let title = '';
      const titleElement = element.querySelector('h1, h2, h3, h4, .product-title, .product-name, .title, [itemprop="name"]');
      if (titleElement) {
        title = titleElement.textContent?.trim() || '';
      }
      
      // Find price
      let price = 0;
      const priceElement = element.querySelector('.price, .product-price, .money, [data-price], [itemprop="price"]');
      if (priceElement) {
        const priceText = priceElement.textContent || '';
        const priceMatch = priceText.match(/[\d,.]+/);
        if (priceMatch) {
          price = parseFloat(priceMatch[0].replace(/,/g, ''));
        }
      }
      
      // Find image
      let image = '';
      const imgElement = element.querySelector('img') as HTMLImageElement;
      if (imgElement) {
        image = imgElement.src || imgElement.getAttribute('data-src') || '';
      }
      
      // Find URL
      let url = '';
      const linkElement = element.querySelector('a[href]') as HTMLAnchorElement;
      if (linkElement) {
        url = linkElement.href;
      }
      
      if (title && (price > 0 || image || url)) {
        products.push({
          id,
          title,
          price,
          image,
          url: url || window.location.href,
          description: `${title} - Found on ${window.location.hostname}`,
          category: 'General',
          tags: ['extracted'],
          availability: 'in_stock',
          currency: 'USD'
        });
      }
    } catch (error) {
      console.warn(`Error extracting product ${index}:`, error);
    }
  });
  
  console.log(`✅ Extracted ${products.length} products from page`);
  return products;
}