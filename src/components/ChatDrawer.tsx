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
    console.log('Adding to cart:', product);
  };

  const handleAddToWishlist = (product: Product) => {
    console.log('Adding to wishlist:', product);
  };

  const suggestedQueries = [
    "Show me trendy winter outfits under $100",
    "I need professional attire for work",
    "Find sustainable and eco-friendly options",
    "What's popular in streetwear right now?"
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="browseable-chat-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          zIndex: 2147483645,
          pointerEvents: 'auto'
        }}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className="browseable-chat-drawer"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          bottom: '16px',
          width: '420px',
          maxWidth: 'calc(100vw - 32px)',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 2147483646,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 24px 20px 24px',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}>
              <Sparkles size={22} color="white" />
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0f172a',
                margin: 0,
                lineHeight: '1.2',
                letterSpacing: '-0.025em'
              }}>Browseable.ai</h2>
              <p style={{
                fontSize: '13px',
                color: '#64748b',
                margin: 0,
                lineHeight: '1.2',
                fontWeight: '500'
              }}>Your AI Shopping Co-Pilot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '10px',
              background: 'transparent',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #f3e8ff 0%, #dbeafe 100%)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <ShoppingBag size={28} color="#8b5cf6" />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#0f172a',
                margin: '0 0 12px',
                lineHeight: '1.3',
                letterSpacing: '-0.025em'
              }}>
                Welcome to your AI Shopping Assistant!
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#64748b',
                margin: '0 0 24px',
                lineHeight: '1.5',
                fontWeight: '400'
              }}>
                I'll help you find the perfect products based on your style and preferences.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0 0 12px'
                }}>Try asking me:</p>
                {suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(query)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      fontSize: '13px',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      lineHeight: '1.4',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
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
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: '14px 18px',
                    borderRadius: '18px',
                    background: message.type === 'user' 
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
                      : '#f8fafc',
                    color: message.type === 'user' ? 'white' : '#0f172a',
                    borderBottomRightRadius: message.type === 'user' ? '6px' : '18px',
                    borderBottomLeftRadius: message.type === 'user' ? '18px' : '6px',
                    boxShadow: message.type === 'user' 
                      ? '0 4px 12px rgba(139, 92, 246, 0.3)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.05)',
                    border: message.type === 'user' ? 'none' : '1px solid #e2e8f0'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: '1.5',
                      margin: 0,
                      fontWeight: '500'
                    }}>{message.content}</p>
                  </div>
                </div>
              ))}
              
              {/* Products Grid */}
              {products.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: '0 0 16px',
                    letterSpacing: '-0.025em'
                  }}>
                    Recommended Products
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {products.slice(0, 4).map((product) => (
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
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '18px',
                borderBottomLeftRadius: '6px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Loader2 size={14} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>AI is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          borderTop: '1px solid #f1f5f9',
          padding: '20px 24px 24px 24px',
          background: '#fafbfc'
        }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about products, styles, or recommendations..."
              style={{
                flex: 1,
                padding: '14px 18px',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                background: 'white',
                fontWeight: '500'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#8b5cf6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              style={{
                padding: '14px 20px',
                background: inputMessage.trim() && !isLoading 
                  ? 'linear-gradient(135deg, #8b5cf6 0%,  #7c3aed 100%)' 
                  : '#cbd5e1',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: inputMessage.trim() && !isLoading 
                  ? '0 4px 12px rgba(139, 92, 246, 0.3)' 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (inputMessage.trim() && !isLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (inputMessage.trim() && !isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                }
              }}
            >
              {isLoading ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Send size={16} />
              )}
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};