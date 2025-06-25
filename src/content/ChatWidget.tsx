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
    
    // Function to extract products from the page
    const extractProductsFromPage = () => {
      console.log('🔍 Attempting to extract products from page...');
      
      // Check for Shopify products first (set by shopifyParser)
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
        const productElements = document.querySelectorAll('[data-product-id], .product, .product-item, .product-card, [data-product-handle], [data-product]');
        if (productElements.length > 0) {
          console.log('✅ Found product elements:', productElements.length);
          
          const extractedProducts: Product[] = [];
          
          productElements.forEach((element, index) => {
            if (index >= 10) return; // Limit to 10 products
            
            // Try to extract product info
            const productId = element.getAttribute('data-product-id') || 
                             element.getAttribute('data-product') || 
                             element.getAttribute('data-id') || 
                             `dom-product-${index}`;
            
            // Find title
            let title = '';
            const titleSelectors = [
              '.product-title', '.product-name', 'h1', 'h2', 'h3', '.title', 
              '[data-product-title]', '[itemprop="name"]'
            ];
            
            for (const selector of titleSelectors) {
              const titleElement = element.querySelector(selector);
              if (titleElement && titleElement.textContent) {
                title = titleElement.textContent.trim();
                if (title) break;
              }
            }
            
            // If no title found with selectors, try the element itself
            if (!title && element.textContent) {
              const text = element.textContent.trim();
              if (text.length > 0 && text.length < 100) {
                title = text;
              }
            }
            
            // Find price
            let price = 0;
            const priceSelectors = [
              '.price', '.product-price', '.money', '[data-price]', 
              '.price-current', '[itemprop="price"]'
            ];
            
            for (const selector of priceSelectors) {
              const priceElement = element.querySelector(selector);
              if (priceElement && priceElement.textContent) {
                const priceText = priceElement.textContent.trim();
                // Extract numbers from price text
                const priceMatch = priceText.match(/[\d,.]+/);
                if (priceMatch) {
                  price = parseFloat(priceMatch[0].replace(/,/g, ''));
                  if (price) break;
                }
              }
            }
            
            // If no price found with selectors, try to find any number in the element
            if (!price && element.textContent) {
              const priceMatch = element.textContent.match(/\$\s?(\d+(\.\d{1,2})?)/);
              if (priceMatch && priceMatch[1]) {
                price = parseFloat(priceMatch[1]);
              }
            }
            
            // Find image
            let image = '';
            const imgSelectors = [
              'img', '[data-product-image] img', '.product-image img', 
              '.product-img img', '[itemprop="image"]'
            ];
            
            for (const selector of imgSelectors) {
              const imgElement = element.querySelector(selector) as HTMLImageElement;
              if (imgElement) {
                image = imgElement.src || 
                        imgElement.getAttribute('data-src') || 
                        imgElement.getAttribute('data-lazy-src') || '';
                if (image) break;
              }
            }
            
            // Find description
            let description = '';
            const descSelectors = [
              '.product-description', '.description', '[itemprop="description"]'
            ];
            
            for (const selector of descSelectors) {
              const descElement = element.querySelector(selector);
              if (descElement && descElement.textContent) {
                description = descElement.textContent.trim();
                if (description) break;
              }
            }
            
            // Default description if none found
            if (!description) {
              description = 'Product found on this page';
            }
            
            // Find URL
            let url = '';
            const linkElement = element.querySelector('a[href]') as HTMLAnchorElement;
            if (linkElement && linkElement.href) {
              url = linkElement.href;
            } else {
              // Try to construct URL from current page
              const handle = element.getAttribute('data-product-handle') || 
                           title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
              url = `${window.location.origin}/products/${handle}`;
            }
            
            // Only add if we have at least title and price
            if (title && price) {
              extractedProducts.push({
                id: productId,
                title,
                description,
                price,
                currency: 'USD',
                image,
                category: 'General',
                tags: ['extracted'],
                availability: 'in_stock',
                url
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