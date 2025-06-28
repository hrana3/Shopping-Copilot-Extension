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
          padding: '16px 20px', /* Increased from 12px 16px to 16px 20px */
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}> {/* Increased from 10px to 12px */}
            <div style={{
              width: '36px', /* Increased from 32px to 36px */
              height: '36px', /* Increased from 32px to 36px */
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              borderRadius: '10px', /* Increased from 8px to 10px */
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)'
            }}>
              <Sparkles size={18} color="white" /> {/* Increased from 16px to 18px */}
            </div>
            <div>
              <h2 style={{
                fontSize: '17px', /* Increased from 16px to 17px */
                fontWeight: '700',
                color: '#0f172a',
                margin: '0',
                lineHeight: '1.2',
                letterSpacing: '-0.025em'
              }}>BROWSEABLE.AI</h2>
              <p style={{
                fontSize: '12px', /* Increased from 11px to 12px */
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
              padding: '8px', /* Increased from 6px to 8px */
              background: 'transparent',
              border: 'none',
              borderRadius: '8px', /* Increased from 6px to 8px */
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} color="#64748b" /> {/* Increased from 16px to 18px */}
          </button>
        </div>

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          style={{
            flex: '1',
            overflowY: 'auto',
            padding: '16px', /* Increased from 12px to 16px */
            display: 'flex',
            flexDirection: 'column',
            gap: '12px' /* Increased from 10px to 12px */
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 16px' }}> {/* Increased from 24px 12px to 28px 16px */}
              <div style={{
                width: '48px', /* Increased from 40px to 48px */
                height: '48px', /* Increased from 40px to 48px */
                background: 'linear-gradient(135deg, #f3e8ff 0%, #dbeafe 100%)',
                borderRadius: '12px', /* Increased from 10px to 12px */
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px' /* Increased from 0 auto 12px to 0 auto 16px */
              }}>
                <ShoppingBag size={24} color="#8b5cf6" /> {/* Increased from 20px to 24px */}
              </div>
              <h3 style={{
                fontSize: '16px', /* Increased from 15px to 16px */
                fontWeight: '700',
                color: '#0f172a',
                margin: '0 0 8px', /* Increased from 0 0 6px to 0 0 8px */
                lineHeight: '1.3',
                letterSpacing: '-0.025em'
              }}>
                Welcome to your AI Shopping Assistant!
              </h3>
              <p style={{
                fontSize: '14px', /* Increased from 13px to 14px */
                color: '#64748b',
                margin: '0 0 20px', /* Increased from 0 0 16px to 0 0 20px */
                lineHeight: '1.5',
                fontWeight: '400'
              }}>
                I'll help you find the perfect products based on your style and preferences.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}> {/* Increased from 6px to 8px */}
                <p style={{
                  fontSize: '12px', /* Increased from 11px to 12px */
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0 0 8px' /* Increased from 0 0 6px to 0 0 8px */
                }}>Try asking me:</p>
                {suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(query)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 14px', /* Increased from 10px 12px to 12px 14px */
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '12px', /* Increased from 11px to 12px */
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
                  marginBottom: '12px' /* Increased from 10px to 12px */
                }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: '12px 16px', /* Increased from 10px 14px to 12px 16px */
                    borderRadius: '14px',
                    background: message.type === 'user' 
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
                      : '#f8fafc',
                    color: message.type === 'user' ? 'white' : '#0f172a',
                    borderBottomRightRadius: message.type === 'user' ? '4px' : '14px',
                    borderBottomLeftRadius: message.type === 'user' ? '14px' : '4px',
                    boxShadow: message.type === 'user' 
                      ? '0 2px 4px rgba(139, 92, 246, 0.2)' 
                      : '0 1px 3px rgba(0, 0, 0, 0.05)',
                    border: message.type === 'user' ? 'none' : '1px solid #e2e8f0'
                  }}>
                    <p style={{
                      fontSize: '14px', /* Increased from 13px to 14px */
                      lineHeight: '1.5',
                      margin: '0',
                      fontWeight: '500'
                    }}>{message.content}</p>
                  </div>
                </div>
              ))}
              
              {/* Products Grid */}
              {validProducts.length > 0 && (
                <div style={{ marginTop: '16px', marginBottom: '12px' }}> {/* Increased from 12px/8px to 16px/12px */}
                  <h3 style={{
                    fontSize: '15px', /* Increased from 14px to 15px */
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: '0 0 12px', /* Increased from 0 0 10px to 0 0 12px */
                    letterSpacing: '-0.025em',
                    padding: '0 4px' /* Added padding to prevent text from touching edges */
                  }}>
                    RECOMMENDED PRODUCTS
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}> {/* Increased from 10px to 16px */}
                    {validProducts.slice(0, 4).map((product) => (
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
                borderRadius: '14px',
                borderBottomLeftRadius: '4px',
                padding: '12px 16px', /* Increased from 10px 14px to 12px 16px */
                display: 'flex',
                alignItems: 'center',
                gap: '8px' /* Increased from 6px to 8px */
              }}>
                <Loader2 size={14} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite' }} /> {/* Increased from 12px to 14px */}
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>AI is thinking...</span> {/* Increased from 12px to 13px */}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          borderTop: '1px solid #f1f5f9',
          padding: '16px', /* Increased from 12px to 16px */
          background: '#fafbfc'
        }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}> {/* Increased from 8px to 10px */}
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about products, styles, or recommendations..."
              style={{
                flex: '1',
                padding: '12px 16px', /* Increased from 10px 14px to 12px 16px */
                border: '1px solid #e2e8f0',
                borderRadius: '12px', /* Increased from 10px to 12px */
                fontSize: '14px', /* Increased from 13px to 14px */
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
                padding: '12px 16px', /* Increased from 10px 14px to 12px 16px */
                background: inputMessage.trim() && !isLoading 
                  ? 'linear-gradient(135deg, #8b5cf6 0%,  #7c3aed 100%)' 
                  : '#cbd5e1',
                color: 'white',
                border: 'none',
                borderRadius: '12px', /* Increased from 10px to 12px */
                cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px', /* Increased from 6px to 8px */
                fontWeight: '600',
                fontSize: '14px', /* Increased from 13px to 14px */
                boxShadow: inputMessage.trim() && !isLoading 
                  ? '0 2px 4px rgba(139, 92, 246, 0.2)' 
                  : 'none'
              }}
            >
              {isLoading ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> /* Increased from 14px to 16px */
              ) : (
                <Send size={16} /> /* Increased from 14px to 16px */
              )}
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};