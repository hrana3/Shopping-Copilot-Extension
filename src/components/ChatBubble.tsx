import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';

interface ChatBubbleProps {
  onClick: () => void;
  hasNewMessage?: boolean;
  isVisible?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  onClick, 
  hasNewMessage,
  isVisible = true 
}) => {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className="browseable-chat-bubble browseable-fade-in"
      style={{
        position: 'fixed',
        top: '50%',
        right: '0',
        transform: 'translateY(-50%)',
        width: '48px', /* Increased from 36px to 48px */
        height: '48px', /* Increased from 36px to 48px */
        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
        borderRadius: '12px 0 0 12px', /* Increased from 8px to 12px */
        boxShadow: '-2px 2px 8px rgba(0, 0, 0, 0.15)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2147483647,
        pointerEvents: 'auto',
        border: 'none',
        color: 'white',
        outline: 'none'
      }}
    >
      <div style={{ position: 'relative' }}>
        <MessageCircle size={24} color="white" /> {/* Increased from 18px to 24px */}
        <Sparkles 
          size={10} /* Increased from 8px to 10px */
          color="#fbbf24" 
          style={{ 
            position: 'absolute', 
            top: '-4px', /* Adjusted position */
            right: '-4px', /* Adjusted position */
            animation: 'pulse 2s infinite'
          }} 
        />
      </div>
      
      {hasNewMessage && (
        <div style={{
          position: 'absolute',
          top: '-4px', /* Adjusted position */
          right: '-4px', /* Adjusted position */
          width: '12px', /* Increased from 10px to 12px */
          height: '12px', /* Increased from 10px to 12px */
          background: '#ef4444',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '6px', /* Increased from 4px to 6px */
            height: '6px', /* Increased from 4px to 6px */
            background: 'white',
            borderRadius: '50%'
          }}></div>
        </div>
      )}
    </button>
  );
};