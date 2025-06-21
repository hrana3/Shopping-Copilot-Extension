import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Sparkles, ShoppingBag } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product, ChatMessage } from '../types/product';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSendMessage: (message: string) => Promise<void>;
  messages: ChatMessage[];
  isLoading: boolean;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onSendMessage,
  messages,
  isLoading
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    await onSendMessage(message);
  };

  const handleAddToCart = (product: Product) => {
    // In a real implementation, this would integrate with the site's cart
    console.log('Adding to cart:', product);
    // Show a toast notification or similar feedback
  };

  const handleAddToWishlist = (product: Product) => {
    console.log('Adding to wishlist:', product);
    // In a real implementation, save to user's wishlist
  };

  const suggestedQueries = [
    "Show me trendy winter outfits under $100",
    "I need professional attire for work",
    "Find sustainable and eco-friendly options",
    "What's popular in streetwear right now?"
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 z-50"
      style={{ zIndex: 2147483646 }}
      onClick={onClose}
    >
      <div 
        className="fixed right-4 top-4 bottom-4 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 flex flex-col rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Browseable.ai</h2>
              <p className="text-xs text-gray-600">Your AI Shopping Co-Pilot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Welcome to your AI Shopping Assistant!
              </h3>
              <p className="text-sm text-gray-600 mb-4 px-2">
                I'll help you find the perfect products based on your style and preferences.
              </p>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-2">Try asking me:</p>
                {suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(query)}
                    className="block w-full text-left p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs text-gray-700 transition-colors"
                  >
                    "{query}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {/* Products Grid */}
              {products.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Recommended Products
                  </h3>
                  <div className="space-y-3">
                    {products.slice(0, 4).map((product) => (
                      <div key={product.id} className="transform scale-95">
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          onAddToWishlist={handleAddToWishlist}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-3 py-2 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
                <span className="text-xs text-gray-600">AI is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about products, styles, or recommendations..."
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};