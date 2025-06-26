// Version: 1.0.1 - Updated for GitHub tracking
import React, { useState } from 'react';
import { ChatWidget } from './content/ChatWidget';
import { RealShopifyParserTest } from './test/real-shopify-parser-test';
import { TestTube, MessageCircle, Code, Zap } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'preview' | 'test' | 'extension'>('preview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle size={18} />
              Extension Preview
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'test'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Zap size={18} />
              Real Parser Test
            </button>
            <button
              onClick={() => setActiveTab('extension')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'extension'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Code size={18} />
              Extension Build
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'preview' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Browseable.ai Development Preview
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                This is a development preview of the Browseable.ai Chrome extension. 
                The chat widget below demonstrates the core functionality that will appear 
                on e-commerce sites.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Extension Preview
              </h2>
              <p className="text-gray-600 mb-6">
                Click the chat bubble in the bottom right to test the AI shopping assistant.
                In the actual extension, this will appear on supported e-commerce sites.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Features Implemented:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Floating chat bubble with animations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Expandable chat drawer with product recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    AI response generation (mock implementation)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Product search and filtering
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Interactive product cards with add to cart functionality
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Chrome extension structure (ready for build)
                  </li>
                </ul>
              </div>
            </div>
            
            <ChatWidget />
          </div>
        )}

        {activeTab === 'test' && <RealShopifyParserTest />}

        {activeTab === 'extension' && (
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Chrome Extension Build
            </h2>
            <p className="text-gray-600 mb-6">
              Build and install the Chrome extension to test on real e-commerce sites.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">Build Instructions:</h3>
              <ol className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  Run <code className="bg-blue-100 px-2 py-1 rounded text-sm">npm run build:extension</code>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  Open Chrome and go to <code className="bg-blue-100 px-2 py-1 rounded text-sm">chrome://extensions/</code>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  Enable "Developer mode" in the top right
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                  Click "Load unpacked\" and select the <code className=\"bg-blue-100 px-2 py-1 rounded text-sm">dist</code> folder
                </li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-green-900 mb-3">Test Sites:</h3>
              <p className="text-green-800 mb-3">Once installed, visit these Shopify stores to test the extension:</p>
              <ul className="space-y-2 text-green-700">
                <li>• <a href="https://gymshark.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">Gymshark</a> - Fitness apparel</li>
                <li>• <a href="https://allbirds.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">Allbirds</a> - Sustainable shoes</li>
                <li>• <a href="https://brooklinen.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">Brooklinen</a> - Home goods</li>
                <li>• <a href="https://warbyparker.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">Warby Parker</a> - Eyewear</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;