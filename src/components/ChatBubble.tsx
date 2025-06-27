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
        bottom: '24px',
        right: '24px',
        width: '48px',
        height: '48px',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
        borderRadius: '50%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
        <MessageCircle size={22} color="white" />
        <Sparkles 
          size={10} 
          color="#fbbf24" 
          style={{ 
            position: 'absolute', 
            top: '-4px', 
            right: '-4px',
            animation: 'pulse 2s infinite'
          }} 
        />
      </div>
      
      {hasNewMessage && (
        <div style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '14px',
          height: '14px',
          background: '#ef4444',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            background: 'white',
            borderRadius: '50%'
          }}></div>
        </div>
      )}
    </button>
  );
};