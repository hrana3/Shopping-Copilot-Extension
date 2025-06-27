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
        width: '36px',
        height: '36px',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
        borderRadius: '8px 0 0 8px',
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
        <MessageCircle size={18} color="white" />
        <Sparkles 
          size={8} 
          color="#fbbf24" 
          style={{ 
            position: 'absolute', 
            top: '-3px', 
            right: '-3px',
            animation: 'pulse 2s infinite'
          }} 
        />
      </div>
      
      {hasNewMessage && (
        <div style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '10px',
          height: '10px',
          background: '#ef4444',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '4px',
            height: '4px',
            background: 'white',
            borderRadius: '50%'
          }}></div>
        </div>
      )}
    </button>
  );
};