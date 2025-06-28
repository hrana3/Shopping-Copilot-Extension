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
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
    console.log('Adding to cart:', product);
    // Here you would implement the actual add to cart functionality
    // For now, just show a notification
    alert(`Added ${product.title} to cart!`);
  };

  const handleAddToWishlist = (product: Product) => {
    console.log('Adding to wishlist:', product);
    // Here you would implement the actual add to wishlist functionality
    // For now, just show a notification
    alert(`Added ${product.title} to wishlist!`);
  };

  const suggestedQueries = [
    "Show me trendy winter outfits under $100",
    "I need professional attire for work",
    "Find sustainable and eco-friendly options",
    "What's popular in streetwear right now?"
  ];

  if (!isOpen) return null;

  // Filter out duplicate products based on title and price
  const uniqueProducts = products.filter((product, index, self) => 
    index === self.findIndex(p => 
      p.title === product.title && 
      Math.abs((p.price || 0) - (product.price || 0)) < 0.01
    )
  );

  // Filter out products with invalid images
  const validProducts = uniqueProducts.filter(product => {
    if (!product.image) return false;
    
    const invalidPatterns = ['cart', 'placeholder', 'loading', 'spinner'];
    return !invalidPatterns.some(pattern => 
      product.image.toLowerCase().includes(pattern)
    );
  });

  return (
    <>
      {/* Backdrop */}
      <div className="browseable-chat-backdrop" onClick={onClose} />
      
      {/* Drawer */}
      <div className="browseable-chat-drawer browseable-slide-in">
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px', /* Increased padding for better spacing */
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}> {/* Increased gap */}
            <div style={{
              width: '40px', /* Increased size for better visibility */
              height: '40px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)'
            }}>
              <Sparkles size={20} color="white" /> {/* Increased size */}
            </div>
            <div>
              <h2 style={{
                fontSize: '18px', /* Increased for better readability */
                fontWeight: '700',
                color: '#0f172a',
                margin: '0',
                lineHeight: '1.2',
                letterSpacing: '-0.025em'
              }}>BROWSEABLE.AI</h2>
              <p style={{
                fontSize: '13px', /* Increased for better readability */
                color: '#64748b',
                margin: '0',
                lineHeight: '1.2',
                fontWeight: '500'
              }}>Your AI Shopping Co-Pilot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} color="#64748b" /> {/* Increased size */}
          </button>
        </div>

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          style={{
            flex: '1',
            overflowY: 'auto',
            padding: '20px', /* Increased padding for better spacing */
            display: 'flex',
            flexDirection: 'column',
            gap: '16px' /* Increased gap between messages */
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}> {/* Increased padding */}
              <div style={{
                width: '56px', /* Increased size */
                height: '56px',
                background: 'linear-gradient(135deg, #f3e8ff 0%, #dbeafe 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px' /* Increased margin */
              }}>
                <ShoppingBag size={28} color="#8b5cf6" /> {/* Increased size */}
              </div>
              <h3 style={{
                fontSize: '18px', /* Increased for better readability */
                fontWeight: '700',
                color: '#0f172a',
                margin: '0 0 10px', /* Increased margin */
                lineHeight: '1.3',
                letterSpacing: '-0.025em'
              }}>
                Welcome to your AI Shopping Assistant!
              </h3>
              <p style={{
                fontSize: '15px', /* Increased for better readability */
                color: '#64748b',
                margin: '0 0 24px', /* Increased margin */
                lineHeight: '1.5',
                fontWeight: '400'
              }}>
                I'll help you find the perfect products based on your style and preferences.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}> {/* Increased gap */}
                <p style={{
                  fontSize: '14px', /* Increased for better readability */
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0 0 8px' /* Increased margin */
                }}>Try asking me:</p>
                {suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(query)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px 16px', /* Increased padding */
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px', /* Increased border radius */
                      fontSize: '14px', /* Increased for better readability */
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      lineHeight: '1.4',
                      fontWeight: '500'
                    }}
                  >
                    "{query}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '16px' /* Increased margin */
                }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: '14px 18px', /* Increased padding */
                    borderRadius: '16px', /* Increased border radius */
                    background: message.type === 'user' 
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
                      : '#f8fafc',
                    color: message.type === 'user' ? 'white' : '#0f172a',
                    borderBottomRightRadius: message.type === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: message.type === 'user' ? '16px' : '4px',
                    boxShadow: message.type === 'user' 
                      ? '0 2px 4px rgba(139, 92, 246, 0.2)' 
                      : '0 1px 3px rgba(0, 0, 0, 0.05)',
                    border: message.type === 'user' ? 'none' : '1px solid #e2e8f0'
                  }}>
                    <p style={{
                      fontSize: '15px', /* Increased for better readability */
                      lineHeight: '1.5',
                      margin: '0',
                      fontWeight: '500'
                    }}>{message.content}</p>
                  </div>
                </div>
              ))}
              
              {/* Products Grid */}
              {validProducts.length > 0 && (
                <div style={{ marginTop: '20px', marginBottom: '16px' }}> {/* Increased margins */}
                  <h3 style={{
                    fontSize: '16px', /* Increased for better readability */
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: '0 0 16px', /* Increased margin */
                    letterSpacing: '-0.025em',
                    padding: '0 4px' /* Added padding to prevent text from touching edges */
                  }}>
                    RECOMMENDED PRODUCTS
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '20px', /* Increased gap between product cards */
                    maxHeight: '600px', /* Set max height to enable scrolling if many products */
                    overflowY: 'auto', /* Enable vertical scrolling */
                    padding: '4px' /* Add padding to prevent products from touching edges */
                  }}>
                    {/* Show all products instead of limiting to 4 */}
                    {validProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onAddToWishlist={handleAddToWishlist}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '0 4px' }}> {/* Added padding */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px', /* Increased border radius */
                borderBottomLeftRadius: '4px',
                padding: '14px 18px', /* Increased padding */
                display: 'flex',
                alignItems: 'center',
                gap: '10px' /* Increased gap */
              }}>
                <Loader2 size={16} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite' }} /> {/* Increased size */}
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>AI is thinking...</span> {/* Increased font size */}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          borderTop: '1px solid #f1f5f9',
          padding: '20px', /* Increased padding */
          background: '#fafbfc'
        }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}> {/* Increased gap */}
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about products, styles, or recommendations..."
              style={{
                flex: '1',
                padding: '14px 18px', /* Increased padding */
                border: '1px solid #e2e8f0',
                borderRadius: '14px', /* Increased border radius */
                fontSize: '15px', /* Increased for better readability */
                outline: 'none',
                transition: 'all 0.2s ease',
                background: 'white',
                fontWeight: '500'
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              style={{
                padding: '14px 18px', /* Increased padding */
                background: inputMessage.trim() && !isLoading 
                  ? 'linear-gradient(135deg, #8b5cf6 0%,  #7c3aed 100%)' 
                  : '#cbd5e1',
                color: 'white',
                border: 'none',
                borderRadius: '14px', /* Increased border radius */
                cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px', /* Increased gap */
                fontWeight: '600',
                fontSize: '15px', /* Increased for better readability */
                boxShadow: inputMessage.trim() && !isLoading 
                  ? '0 2px 4px rgba(139, 92, 246, 0.2)' 
                  : 'none'
              }}
            >
              {isLoading ? (
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> /* Increased size */
              ) : (
                <Send size={18} /> /* Increased size */
              )}
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};