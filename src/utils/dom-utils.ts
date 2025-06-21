export function detectEcommerceSite(): {
  platform: string;
  isProductPage: boolean;
  isListingPage: boolean;
} {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Shopify detection
  if (hostname.includes('.myshopify.com') || 
      document.querySelector('script[src*="shopify"]') ||
      document.querySelector('meta[name="shopify-checkout-api-token"]')) {
    return {
      platform: 'shopify',
      isProductPage: pathname.includes('/products/'),
      isListingPage: pathname.includes('/collections/') || pathname.includes('/search')
    };
  }
  
  // WooCommerce detection
  if (document.querySelector('script[src*="woocommerce"]') ||
      document.querySelector('body.woocommerce')) {
    return {
      platform: 'woocommerce',
      isProductPage: pathname.includes('/product/'),
      isListingPage: pathname.includes('/shop/') || pathname.includes('/category/')
    };
  }
  
  // Generic e-commerce patterns
  const productPatterns = ['/product/', '/products/', '/item/', '/p/'];
  const listingPatterns = ['/shop/', '/category/', '/collection/', '/search'];
  
  const isProductPage = productPatterns.some(pattern => pathname.includes(pattern));
  const isListingPage = listingPatterns.some(pattern => pathname.includes(pattern));
  
  return {
    platform: 'custom',
    isProductPage,
    isListingPage
  };
}

export function createShadowRoot(container: HTMLElement): ShadowRoot {
  if (container.shadowRoot) {
    return container.shadowRoot;
  }
  return container.attachShadow({ mode: 'open' });
}

export function injectStyles(shadowRoot: ShadowRoot, styles: string): void {
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
    '.product-grid-item'
  ];
  
  const priceSelectors = [
    '.price',
    '.product-price',
    '.money',
    '[data-price]',
    '.price-current',
    '.sale-price'
  ];
  
  const titleSelectors = [
    '.product-title',
    '.product-name',
    'h1',
    'h2',
    'h3',
    '.title',
    '[data-product-title]'
  ];
  
  const imageSelectors = [
    '.product-image img',
    '.product-photo img',
    '.featured-image img',
    '[data-product-image]'
  ];
  
  return {
    products: productSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel))),
    prices: priceSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel))),
    titles: titleSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel))),
    images: imageSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel)))
  };
}