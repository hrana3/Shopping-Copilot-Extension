// Version: 1.0.1 - Updated for GitHub tracking
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
      className="browseable-chat-bubble"
    >
      <div style={{ position: 'relative' }}>
        <MessageCircle size={24} color="white" />
        <Sparkles 
          size={12} 
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
          width: '16px',
          height: '16px',
          background: '#ef4444',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%'
          }}></div>
        </div>
      )}
    </button>
  );
};