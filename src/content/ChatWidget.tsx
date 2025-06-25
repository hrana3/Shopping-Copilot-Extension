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
  const [hasRealProducts, setHasRealProducts] = useState(false);

  useEffect(() => {
    console.log('🔄 ChatWidget mounted, checking for products...');
    
    // Check if we're on a product page
    const isProductPage = window.location.pathname.includes('/product') || 
                          window.location.pathname.includes('/products');
    
    // Try to extract products from the page
    const extractProductsFromPage = () => {
      console.log('🔍 Attempting to extract products from page...');
      
      // Check for Shopify products first
      const shopifyProducts = (window as any).__browseableAiProducts;
      if (shopifyProducts && shopifyProducts.length > 0) {
        console.log('✅ Found Shopify products:', shopifyProducts.length);
        setProducts(shopifyProducts);
        setHasRealProducts(true);
        
        // Add a system message about finding products
        const systemMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `I found ${shopifyProducts.length} products on this page! I can help you explore them or find similar items.`,
          timestamp: new Date(),
          products: shopifyProducts.slice(0, 3) // Show first 3 as preview
        };
        setMessages([systemMessage]);
        return true;
      }
      
      // Try to extract products from the page using DOM
      try {
        // Look for product elements
        const productElements = document.querySelectorAll('[data-product-id], .product, .product-item, .product-card');
        if (productElements.length > 0) {
          console.log('✅ Found product elements:', productElements.length);
          
          const extractedProducts: Product[] = [];
          
          productElements.forEach((element, index) => {
            if (index >= 10) return; // Limit to 10 products
            
            // Try to extract product info
            const productId = element.getAttribute('data-product-id') || `dom-product-${index}`;
            
            // Find title
            let title = '';
            const titleElement = element.querySelector('.product-title, .product-name, h1, h2, h3, .title');
            if (titleElement) {
              title = titleElement.textContent?.trim() || '';
            }
            
            // Find price
            let price = 0;
            const priceElement = element.querySelector('.price, .product-price, .money');
            if (priceElement) {
              const priceText = priceElement.textContent?.trim() || '';
              const priceMatch = priceText.match(/[\d,.]+/);
              if (priceMatch) {
                price = parseFloat(priceMatch[0].replace(/,/g, ''));
              }
            }
            
            // Find image
            let image = '';
            const imageElement = element.querySelector('img');
            if (imageElement) {
              image = imageElement.getAttribute('src') || imageElement.getAttribute('data-src') || '';
            }
            
            // Only add if we have at least title and price
            if (title && price) {
              extractedProducts.push({
                id: productId,
                title,
                description: 'Product found on this page',
                price,
                currency: 'USD',
                image,
                category: 'General',
                tags: ['extracted'],
                availability: 'in_stock',
                url: window.location.href
              });
            }
          });
          
          if (extractedProducts.length > 0) {
            console.log('✅ Extracted products:', extractedProducts.length);
            setProducts(extractedProducts);
            setHasRealProducts(true);
            
            // Add a system message about finding products
            const systemMessage: ChatMessage = {
              id: Date.now().toString(),
              type: 'assistant',
              content: `I found ${extractedProducts.length} products on this page! I can help you explore them or find similar items.`,
              timestamp: new Date(),
              products: extractedProducts.slice(0, 3) // Show first 3 as preview
            };
            setMessages([systemMessage]);
            return true;
          }
        }
      } catch (error) {
        console.error('❌ Error extracting products from DOM:', error);
      }
      
      return false;
    };
    
    // Try to extract products
    const foundProducts = extractProductsFromPage();
    
    // If we couldn't find products, use demo products
    if (!foundProducts) {
      console.log('⚠️ No products found on page, using demo products');
      setProducts(demoProducts as Product[]);
      
      // If we're on a product page, add a message about not finding products
      if (isProductPage) {
        const systemMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: "I couldn't find product information on this page. How can I help with your shopping today?",
          timestamp: new Date()
        };
        setMessages([systemMessage]);
      }
    }
    
    // Listen for Shopify parser results
    const handleShopifyProducts = (event: CustomEvent) => {
      const { products: shopifyProducts } = event.detail;
      console.log('📦 Received Shopify products:', shopifyProducts);
      
      if (shopifyProducts && shopifyProducts.length > 0) {
        // Replace demo products with real Shopify products
        setProducts(shopifyProducts);
        setHasRealProducts(true);
        
        // Add a system message about finding products
        const systemMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `I found ${shopifyProducts.length} products on this page! I can help you explore them or find similar items.`,
          timestamp: new Date(),
          products: shopifyProducts.slice(0, 3) // Show first 3 as preview
        };
        setMessages(prev => prev.length === 0 ? [systemMessage] : prev);
      }
    };

    // Listen for Shopify parser events
    window.addEventListener('browseableAiProductsExtracted', handleShopifyProducts as EventListener);

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
      // Use current products (real or demo) for search
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
      
      // Only update products if we found relevant ones
      if (relevantProducts.length > 0) {
        setProducts(relevantProducts);
      }
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
        hasNewMessage={hasRealProducts && messages.length <= 1}
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