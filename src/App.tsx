import React from 'react';
import { ChatWidget } from './content/ChatWidget';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
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
      </div>
      
      <ChatWidget />
    </div>
  );
}

export default App;