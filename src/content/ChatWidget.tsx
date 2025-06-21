import React, { useState, useEffect } from 'react';
import { ChatBubble } from '../components/ChatBubble';
import { ChatDrawer } from '../components/ChatDrawer';
import { Product, ChatMessage } from '../types/product';
import { aiClient } from '../utils/ai-client';
import demoProducts from '../data/demo-products.json';

export const ChatWidget: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load demo products initially
    setProducts(demoProducts as Product[]);

    // Listen for Shopify parser results
    const handleShopifyProducts = (event: CustomEvent) => {
      const { products: shopifyProducts } = event.detail;
      console.log('Received Shopify products:', shopifyProducts);
      
      if (shopifyProducts && shopifyProducts.length > 0) {
        // Replace demo products with real Shopify products
        setProducts(shopifyProducts);
        
        // Add a system message about finding products
        const systemMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `I found ${shopifyProducts.length} products on this page! I can help you explore them or find similar items.`,
          timestamp: new Date(),
          products: shopifyProducts.slice(0, 3) // Show first 3 as preview
        };
        setMessages(prev => [systemMessage, ...prev]);
      }
    };

    // Listen for Shopify parser events
    window.addEventListener('browseableAiProductsExtracted', handleShopifyProducts as EventListener);

    // Check if products are already available (parser ran before widget loaded)
    const existingProducts = (window as any).__browseableAiProducts;
    if (existingProducts && existingProducts.length > 0) {
      handleShopifyProducts({ detail: { products: existingProducts } } as CustomEvent);
    }

    return () => {
      window.removeEventListener('browseableAiProductsExtracted', handleShopifyProducts as EventListener);
    };
  }, []);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleSendMessage = async (messageContent: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Use current products (Shopify or demo) for search
      const relevantProducts = await aiClient.searchProducts(messageContent, products);
      
      // Generate AI response
      const aiResponse = await aiClient.generateResponse(messageContent, relevantProducts);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        products: relevantProducts
      };

      setMessages(prev => [...prev, assistantMessage]);
      setProducts(relevantProducts.length > 0 ? relevantProducts : products);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ChatBubble 
        onClick={handleOpenDrawer} 
        isVisible={!isDrawerOpen}
        hasNewMessage={products.length > 0 && messages.length === 0}
      />
      <ChatDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        products={products}
        onSendMessage={handleSendMessage}
        messages={messages}
        isLoading={isLoading}
      />
    </>
  );
};