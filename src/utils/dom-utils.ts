export function detectEcommerceSite(): {
  platform: string;
  isProductPage: boolean;
  isListingPage: boolean;
} {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  console.log('🔍 Detecting e-commerce site:', { hostname, pathname });
  
  // Shopify detection
  if (hostname.includes('.myshopify.com') || 
      hostname.includes('shopify') ||
      document.querySelector('script[src*="shopify"]') ||
      document.querySelector('meta[name="shopify-checkout-api-token"]') ||
      window.Shopify ||
      (window as any).ShopifyAnalytics) {
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
      document.querySelector('.woocommerce')) {
    console.log('🛒 Detected WooCommerce site');
    return {
      platform: 'woocommerce',
      isProductPage: pathname.includes('/product/'),
      isListingPage: pathname.includes('/shop/') || pathname.includes('/category/')
    };
  }
  
  // Major e-commerce platforms
  const platforms = [
    { name: 'amazon', domains: ['amazon.com', 'amazon.co.uk', 'amazon.ca'], productPath: '/dp/', listingPath: '/s?' },
    { name: 'ebay', domains: ['ebay.com', 'ebay.co.uk'], productPath: '/itm/', listingPath: '/sch/' },
    { name: 'etsy', domains: ['etsy.com'], productPath: '/listing/', listingPath: '/search?' },
    { name: 'target', domains: ['target.com'], productPath: '/p/', listingPath: '/c/' },
    { name: 'walmart', domains: ['walmart.com'], productPath: '/ip/', listingPath: '/browse/' }
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
  
  // Generic e-commerce patterns
  const productPatterns = ['/product/', '/products/', '/item/', '/p/', '/listing/'];
  const listingPatterns = ['/shop/', '/category/', '/collection/', '/search', '/browse/'];
  
  const isProductPage = productPatterns.some(pattern => pathname.includes(pattern));
  const isListingPage = listingPatterns.some(pattern => pathname.includes(pattern));
  
  if (isProductPage || isListingPage) {
    console.log('🛍️ Detected generic e-commerce patterns');
    return {
      platform: 'custom',
      isProductPage,
      isListingPage
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
  // Common selectors for product elements
  const productSelectors = [
    '.product',
    '.product-item',
    '.product-card',
    '[data-product-id]',
    '.grid-product',
    '.product-grid-item',
    '[data-product]',
    '[data-product-handle]'
  ];
  
  const priceSelectors = [
    '.price',
    '.product-price',
    '.money',
    '[data-price]',
    '.price-current',
    '.sale-price',
    '[itemprop="price"]'
  ];
  
  const titleSelectors = [
    '.product-title',
    '.product-name',
    'h1',
    'h2',
    'h3',
    '.title',
    '[data-product-title]',
    '[itemprop="name"]'
  ];
  
  const imageSelectors = [
    '.product-image img',
    '.product-photo img',
    '.featured-image img',
    '[data-product-image]',
    'img',
    '[itemprop="image"]'
  ];
  
  return {
    products: productSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel)) as HTMLElement[]),
    prices: priceSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel)) as HTMLElement[]),
    titles: titleSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel)) as HTMLElement[]),
    images: imageSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel)) as HTMLElement[])
  };
}