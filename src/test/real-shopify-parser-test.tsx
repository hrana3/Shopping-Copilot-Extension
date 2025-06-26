import React, { useState } from 'react';
import { TestTube, Globe, Search, Package, AlertCircle, CheckCircle, XCircle, ExternalLink, RefreshCw, Code, Eye } from 'lucide-react';
import { Product } from '../types/product';

interface RealTestResult {
  url: string;
  isShopify: boolean;
  matchesPage: boolean;
  products: Product[];
  debugInfo: {
    hasShopifyAnalytics: boolean;
    hasWindowSt: boolean;
    hasJsonLd: boolean;
    domElements: number;
    extractionMethod: string;
    errors: string[];
    rawData?: any;
    proxyUsed?: string;
  };
  pageContent?: {
    title: string;
    description: string;
    scripts: string[];
    metas: string[];
  };
}

export const RealShopifyParserTest: React.FC = () => {
  const [testUrl, setTestUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<RealTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);

  const quickTestSites = [
    { name: 'Gymshark', url: 'https://gymshark.com/collections/all', category: 'Fitness Apparel' },
    { name: 'Allbirds', url: 'https://allbirds.com/collections/mens', category: 'Sustainable Shoes' },
    { name: 'Brooklinen', url: 'https://brooklinen.com/collections/sheet-sets', category: 'Home Goods' },
    { name: 'Warby Parker', url: 'https://warbyparker.com/eyeglasses/men', category: 'Eyewear' },
    { name: 'Outdoor Voices', url: 'https://outdoorvoices.com/collections/womens', category: 'Activewear' },
    { name: 'Everlane', url: 'https://everlane.com/collections/womens-sweaters', category: 'Sustainable Fashion' }
  ];

  // Multiple CORS proxy services for fallback
  const corsProxies = [
    {
      name: 'AllOrigins',
      url: (targetUrl: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
      extractContent: (data: any) => data.contents
    },
    {
      name: 'CORS Anywhere (Heroku)',
      url: (targetUrl: string) => `https://cors-anywhere.herokuapp.com/${targetUrl}`,
      extractContent: (data: any) => data
    },
    {
      name: 'ThingProxy',
      url: (targetUrl: string) => `https://thingproxy.freeboard.io/fetch/${targetUrl}`,
      extractContent: (data: any) => data
    },
    {
      name: 'CORS.SH',
      url: (targetUrl: string) => `https://cors.sh/${targetUrl}`,
      extractContent: (data: any) => data
    }
  ];

  // Function to fetch with timeout
  const fetchWithTimeout = async (url: string, timeout = 10000): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Function to try multiple CORS proxies
  const fetchWithFallback = async (targetUrl: string): Promise<{ content: string; proxyUsed: string }> => {
    const errors: string[] = [];
    
    for (const proxy of corsProxies) {
      try {
        console.log(`🔄 Trying ${proxy.name} proxy...`);
        const proxyUrl = proxy.url(targetUrl);
        
        const response = await fetchWithTimeout(proxyUrl, 15000);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.text();
        let content: string;
        
        // Handle different proxy response formats
        if (proxy.name === 'AllOrigins') {
          try {
            const jsonData = JSON.parse(data);
            content = proxy.extractContent(jsonData);
          } catch {
            content = data; // Fallback to raw data if JSON parsing fails
          }
        } else {
          content = proxy.extractContent(data);
        }
        
        if (!content || content.length < 100) {
          throw new Error('Received empty or too short content');
        }
        
        console.log(`✅ Successfully fetched via ${proxy.name}`);
        return { content, proxyUsed: proxy.name };
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${proxy.name}: ${errorMsg}`);
        console.warn(`❌ ${proxy.name} failed:`, errorMsg);
        continue;
      }
    }
    
    // If all proxies fail, throw an error with details
    throw new Error(`All CORS proxies failed:\n${errors.join('\n')}`);
  };

  // Function to test a URL by fetching it and analyzing the content
  const runRealTest = async (url: string): Promise<RealTestResult> => {
    try {
      console.log('🚀 Starting real test for:', url);
      
      // Try to fetch the page content with fallback proxies
      const { content: htmlContent, proxyUsed } = await fetchWithFallback(url);
      
      // Create a temporary DOM to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Extract page metadata
      const pageContent = {
        title: doc.title || 'No title',
        description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'No description',
        scripts: Array.from(doc.querySelectorAll('script')).map(s => s.src || 'inline').filter(Boolean),
        metas: Array.from(doc.querySelectorAll('meta')).map(m => `${m.getAttribute('name') || m.getAttribute('property')}=${m.getAttribute('content')}`).filter(Boolean)
      };
      
      // Test Shopify detection
      const hasShopifyAnalytics = htmlContent.includes('ShopifyAnalytics') || htmlContent.includes('Shopify.analytics');
      const hasWindowSt = htmlContent.includes('window.__st') || htmlContent.includes('"__st"');
      const hasShopifyMeta = doc.querySelector('meta[name="shopify-checkout-api-token"]') !== null;
      const hasShopifyScript = doc.querySelector('script#ShopifySettings') !== null;
      const hasShopifyInUrl = url.includes('shopify') || url.includes('myshopify');
      
      const isShopify = hasShopifyAnalytics || hasWindowSt || hasShopifyMeta || hasShopifyScript || hasShopifyInUrl;
      
      // Test page pattern matching
      const pathname = new URL(url).pathname;
      const matchesPage = pathname.includes('/collections/') || pathname.includes('/products/') || pathname.includes('/product/');
      
      // Extract JSON-LD data
      const jsonLdScripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
      const hasJsonLd = jsonLdScripts.length > 0;
      let jsonLdProducts: any[] = [];
      
      jsonLdScripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '');
          const items = Array.isArray(data) ? data : [data];
          items.forEach(item => {
            if (item['@type'] === 'Product') {
              jsonLdProducts.push(item);
            }
          });
        } catch (e) {
          console.warn('Failed to parse JSON-LD:', e);
        }
      });
      
      // Extract DOM product elements
      const productSelectors = [
        '[data-product-id]',
        '.product',
        '.product-item',
        '.product-card',
        '[data-product]',
        '[data-product-handle]'
      ];
      
      let domElements = 0;
      productSelectors.forEach(selector => {
        domElements += doc.querySelectorAll(selector).length;
      });
      
      // Try to extract ShopifyAnalytics data from script content
      let shopifyAnalyticsData = null;
      const analyticsMatch = htmlContent.match(/ShopifyAnalytics\.meta\s*=\s*({[^}]+})/);
      if (analyticsMatch) {
        try {
          shopifyAnalyticsData = JSON.parse(analyticsMatch[1]);
        } catch (e) {
          console.warn('Failed to parse ShopifyAnalytics data:', e);
        }
      }
      
      // Try to extract window.__st data
      let windowStData = null;
      const stMatch = htmlContent.match(/window\.__st\s*=\s*({[^}]+})/);
      if (stMatch) {
        try {
          windowStData = JSON.parse(stMatch[1]);
        } catch (e) {
          console.warn('Failed to parse window.__st data:', e);
        }
      }
      
      // Convert extracted data to Product format
      const products: Product[] = [];
      let extractionMethod = 'none';
      
      // Try ShopifyAnalytics first
      if (shopifyAnalyticsData?.product) {
        extractionMethod = 'ShopifyAnalytics';
        const p = shopifyAnalyticsData.product;
        products.push({
          id: String(p.id || 'unknown'),
          title: p.title || 'Unknown Product',
          description: p.description || '',
          price: typeof p.price === 'number' ? (p.price > 100 ? p.price / 100 : p.price) : 0,
          originalPrice: typeof p.compare_at_price === 'number' ? (p.compare_at_price > 100 ? p.compare_at_price / 100 : p.compare_at_price) : undefined,
          currency: 'USD',
          image: p.featured_image || '',
          brand: p.vendor,
          category: p.product_type || 'General',
          tags: p.tags || [],
          availability: p.available ? 'in_stock' : 'out_of_stock',
          url: p.url || url
        });
      }
      // Try window.__st
      else if (windowStData?.product) {
        extractionMethod = 'window.__st';
        const p = windowStData.product;
        products.push({
          id: String(p.id || 'unknown'),
          title: p.title || 'Unknown Product',
          description: p.description || '',
          price: typeof p.price === 'number' ? (p.price > 100 ? p.price / 100 : p.price) : 0,
          originalPrice: typeof p.compare_at_price === 'number' ? (p.compare_at_price > 100 ? p.compare_at_price / 100 : p.compare_at_price) : undefined,
          currency: 'USD',
          image: p.featured_image || '',
          brand: p.vendor,
          category: p.product_type || 'General',
          tags: p.tags || [],
          availability: p.available ? 'in_stock' : 'out_of_stock',
          url: p.url || url
        });
      }
      // Try JSON-LD
      else if (jsonLdProducts.length > 0) {
        extractionMethod = 'JSON-LD';
        jsonLdProducts.forEach(item => {
          const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
          products.push({
            id: String(item.productID || item.sku || 'unknown'),
            title: item.name || 'Unknown Product',
            description: item.description || '',
            price: offer ? parseFloat(offer.price) : 0,
            currency: 'USD',
            image: Array.isArray(item.image) ? item.image[0] : item.image || '',
            brand: item.brand?.name,
            category: 'General',
            tags: [],
            availability: offer?.availability === 'https://schema.org/InStock' ? 'in_stock' : 'out_of_stock',
            url: item.url || url
          });
        });
      }
      // Try DOM extraction as fallback
      else if (domElements > 0) {
        extractionMethod = 'DOM';
        // This would require more complex DOM parsing
        // For now, we'll indicate that DOM elements were found but not extracted
      }
      
      const result: RealTestResult = {
        url,
        isShopify,
        matchesPage,
        products,
        debugInfo: {
          hasShopifyAnalytics,
          hasWindowSt,
          hasJsonLd,
          domElements,
          extractionMethod,
          errors: [],
          proxyUsed,
          rawData: {
            shopifyAnalyticsData,
            windowStData,
            jsonLdProducts: jsonLdProducts.slice(0, 2) // Limit for display
          }
        },
        pageContent
      };
      
      console.log('✅ Test completed:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  };

  const runTest = async (url?: string) => {
    const targetUrl = url || testUrl;
    if (!targetUrl) {
      setError('Please enter a URL to test');
      return;
    }

    // Validate URL
    try {
      new URL(targetUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const result = await runRealTest(targetUrl);
      setTestResult(result);
      if (url) setTestUrl(url); // Update input if using quick test
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed';
      setError(errorMessage);
      console.error('Test error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <TestTube className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Real Shopify Parser Test
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Test the actual Shopify parser on real websites. This tool fetches live pages and runs 
          the same extraction logic used in the Chrome extension.
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This test uses multiple CORS proxy services with automatic fallback. 
            Some sites may block proxies or return different content than what the extension would see.
          </p>
        </div>
      </div>

      {/* Test Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Test URL
        </h2>
        
        <div className="flex gap-3 mb-4">
          <input
            type="url"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter Shopify store URL (e.g., https://gymshark.com/collections/all)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={() => runTest()}
            disabled={isLoading || !testUrl}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Run Real Test
              </>
            )}
          </button>
        </div>

        {/* Quick Test Sites */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Test Sites:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickTestSites.map((site) => (
              <button
                key={site.name}
                onClick={() => runTest(site.url)}
                disabled={isLoading}
                className="p-3 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-gray-900">{site.name}</div>
                <div className="text-sm text-gray-500">{site.category}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Test Error</span>
          </div>
          <div className="text-red-700 mt-1">
            <p className="font-medium">Failed to fetch the webpage</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm hover:underline">Show error details</summary>
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto whitespace-pre-wrap">
                {error}
              </pre>
            </details>
            <p className="text-sm mt-2">
              This usually happens when:
              <br />• The website blocks CORS proxy requests
              <br />• The proxy services are temporarily unavailable
              <br />• The target website is down or unreachable
              <br />• Network connectivity issues
            </p>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResult && (
        <div className="space-y-6">
          {/* Page Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Page Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Page Details</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Title:</strong> {testResult.pageContent?.title}</div>
                  <div><strong>URL:</strong> <a href={testResult.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{testResult.url}</a></div>
                  <div><strong>Description:</strong> {testResult.pageContent?.description}</div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Technical Details</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Scripts Found:</strong> {testResult.pageContent?.scripts.length || 0}</div>
                  <div><strong>Meta Tags:</strong> {testResult.pageContent?.metas.length || 0}</div>
                  <div><strong>Extraction Method:</strong> <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{testResult.debugInfo.extractionMethod}</span></div>
                  {testResult.debugInfo.proxyUsed && (
                    <div><strong>Proxy Used:</strong> <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">{testResult.debugInfo.proxyUsed}</span></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detection Results */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detection Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {testResult.isShopify ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <div>
                  <div className="font-medium text-gray-900">Shopify Detection</div>
                  <div className="text-sm text-gray-600">
                    {testResult.isShopify ? 'Shopify site detected' : 'Not a Shopify site'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {testResult.matchesPage ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <div>
                  <div className="font-medium text-gray-900">Page Pattern</div>
                  <div className="text-sm text-gray-600">
                    {testResult.matchesPage ? 'Product/Collection page' : 'Other page type'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Debug Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Debug Information</h2>
              <button
                onClick={() => setShowRawData(!showRawData)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Code className="w-4 h-4" />
                {showRawData ? 'Hide' : 'Show'} Raw Data
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {testResult.debugInfo.hasShopifyAnalytics ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">ShopifyAnalytics</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {testResult.debugInfo.hasWindowSt ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">window.__st</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {testResult.debugInfo.hasJsonLd ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">JSON-LD</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {testResult.debugInfo.domElements}
                </div>
                <div className="text-sm text-gray-600">DOM Elements</div>
              </div>
            </div>

            {showRawData && testResult.debugInfo.rawData && (
              <div className="mt-4 p-4 bg-gray-900 text-green-400 rounded-lg overflow-auto">
                <pre className="text-xs">
                  {JSON.stringify(testResult.debugInfo.rawData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Extracted Products */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Extracted Products ({testResult.products.length})
              </h2>
            </div>

            {testResult.products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testResult.products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        {product.discount_percentage && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            -{product.discount_percentage}%
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs rounded ${
                          product.availability === 'in_stock' 
                            ? 'bg-green-100 text-green-800'
                            : product.availability === 'limited'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.availability.replace('_', ' ')}
                        </span>
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      {product.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {product.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No products extracted from this page</p>
                <p className="text-sm mt-2">
                  {testResult.debugInfo.extractionMethod === 'none' 
                    ? 'No extraction method was successful'
                    : `Extraction method: ${testResult.debugInfo.extractionMethod}`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};