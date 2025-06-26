import React, { useState } from 'react';
import { TestTube, Globe, Search, Package, AlertCircle, CheckCircle, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Product } from '../types/product';

interface TestResult {
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
  };
}

export const ShopifyParserTest: React.FC = () => {
  const [testUrl, setTestUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const quickTestSites = [
    { name: 'Gymshark', url: 'https://gymshark.com/collections/all', category: 'Fitness Apparel' },
    { name: 'Allbirds', url: 'https://allbirds.com/collections/mens', category: 'Sustainable Shoes' },
    { name: 'Brooklinen', url: 'https://brooklinen.com/collections/sheet-sets', category: 'Home Goods' },
    { name: 'Warby Parker', url: 'https://warbyparker.com/eyeglasses/men', category: 'Eyewear' },
    { name: 'Outdoor Voices', url: 'https://outdoorvoices.com/collections/womens', category: 'Activewear' },
    { name: 'Everlane', url: 'https://everlane.com/collections/womens-sweaters', category: 'Sustainable Fashion' }
  ];

  // Mock test function that simulates what would happen on a real Shopify site
  const runMockTest = async (url: string): Promise<TestResult> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock different scenarios based on URL
    const isShopifyUrl = url.includes('shopify') || 
                        quickTestSites.some(site => url.includes(site.url.split('//')[1].split('/')[0]));
    
    const hasProductsPath = url.includes('/products/') || url.includes('/collections/');
    
    if (!isShopifyUrl) {
      return {
        isShopify: false,
        matchesPage: false,
        products: [],
        debugInfo: {
          hasShopifyAnalytics: false,
          hasWindowSt: false,
          hasJsonLd: false,
          domElements: 0,
          extractionMethod: 'none',
          errors: ['Not a Shopify site']
        }
      };
    }

    // Mock successful extraction
    const mockProducts: Product[] = [
      {
        id: 'mock-1',
        title: 'Premium Cotton T-Shirt',
        description: 'Ultra-soft premium cotton t-shirt with modern fit',
        price: 29.99,
        originalPrice: 39.99,
        currency: 'USD',
        image: 'https://images.pexels.com/photos/5864245/pexels-photo-5864245.jpeg?auto=compress&cs=tinysrgb&w=800',
        brand: 'Test Brand',
        category: 'Clothing',
        tags: ['cotton', 'premium', 'basic'],
        availability: 'in_stock',
        url: url + '/products/premium-cotton-t-shirt',
        discount_percentage: 25
      },
      {
        id: 'mock-2',
        title: 'Organic Cotton Hoodie',
        description: 'Cozy organic cotton hoodie perfect for layering',
        price: 69.99,
        originalPrice: 89.99,
        currency: 'USD',
        image: 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=800',
        brand: 'Eco Brand',
        category: 'Clothing',
        tags: ['organic', 'cotton', 'hoodie'],
        availability: 'in_stock',
        url: url + '/products/organic-cotton-hoodie',
        discount_percentage: 22
      },
      {
        id: 'mock-3',
        title: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 149.99,
        currency: 'USD',
        image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800',
        brand: 'Audio Tech',
        category: 'Electronics',
        tags: ['wireless', 'headphones', 'audio'],
        availability: 'limited',
        url: url + '/products/wireless-headphones'
      }
    ];

    return {
      isShopify: true,
      matchesPage: hasProductsPath,
      products: mockProducts,
      debugInfo: {
        hasShopifyAnalytics: true,
        hasWindowSt: true,
        hasJsonLd: false,
        domElements: 12,
        extractionMethod: 'ShopifyAnalytics',
        errors: []
      }
    };
  };

  const runTest = async (url?: string) => {
    const targetUrl = url || testUrl;
    if (!targetUrl) {
      setError('Please enter a URL to test');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const result = await runMockTest(targetUrl);
      setTestResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <TestTube className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Shopify Parser Testing Lab
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Test the Shopify product parser on real e-commerce sites. This tool simulates how the extension 
          would extract product data from various Shopify stores.
        </p>
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
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => runTest()}
            disabled={isLoading || !testUrl}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Run Test
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
                className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
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
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Test Results */}
      {testResult && (
        <div className="space-y-6">
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {testResult.debugInfo.hasShopifyAnalytics ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">ShopifyAnalytics</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {testResult.debugInfo.hasWindowSt ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">window.__st</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {testResult.debugInfo.hasJsonLd ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">JSON-LD</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {testResult.debugInfo.domElements}
                </div>
                <div className="text-sm text-gray-600">DOM Elements</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">Extraction Method:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {testResult.debugInfo.extractionMethod}
              </span>
            </div>
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
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No products extracted from this page</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};