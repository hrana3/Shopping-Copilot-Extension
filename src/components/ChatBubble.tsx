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
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
      style={{ zIndex: 2147483647 }}
    >
      <div className="relative">
        <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
        <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
      </div>
      
      {hasNewMessage && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}
      
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-ping opacity-25"></div>
    </button>
  );
};