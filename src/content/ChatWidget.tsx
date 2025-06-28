// Version: 1.0.1 - Updated for GitHub tracking
import React, { useState, useEffect } from 'react';
import { ChatBubble } from '../components/ChatBubble';
import { ChatDrawer } from '../components/ChatDrawer';
import { Product, ChatMessage } from '../types/product';
import { aiClient } from '../utils/ai-client';

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
      
      // Check for products set by shopifyParser
      // First check window.__browseableAiProducts (old format)
      let extractedProducts = (window as any).__browseableAiProducts;
      
      // Then check window.__BROWSEABLE_PRODUCTS (new format)
      if (!extractedProducts || extractedProducts.length === 0) {
        extractedProducts = (window as any).__BROWSEABLE_PRODUCTS;
      }
      
      if (extractedProducts && extractedProducts.length > 0) {
        console.log('✅ Found extracted products:', extractedProducts.length);
        
        // Filter out products with invalid images or duplicates
        const validProducts = extractedProducts.filter(product => {
          if (!product.image) return false;
          
          const invalidPatterns = ['cart', 'placeholder', 'loading', 'spinner'];
          return !invalidPatterns.some(pattern => 
            product.image.toLowerCase().includes(pattern)
          );
        });
        
        // Remove duplicates
        const uniqueProducts = validProducts.filter((product, index, self) => 
          index === self.findIndex(p => 
            p.title === product.title && 
            Math.abs((p.price || 0) - (product.price || 0)) < 0.01
          )
        );
        
        console.log('✅ After filtering: ', uniqueProducts.length, 'valid products');
        
        setProducts(uniqueProducts);
        setHasRealProducts(true);
        
        // Add a system message about finding products
        const systemMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `I found ${uniqueProducts.length} products on this page! I can help you explore them or find similar items. What are you looking for today?`,
          timestamp: new Date(),
          products: uniqueProducts.slice(0, 3) // Show first 3 as preview
        };
        setMessages([systemMessage]);
        return true;
      }
      
      // Try to extract products from the page using DOM as fallback
      try {
        // Look for product elements
        const productElements = document.querySelectorAll([
          '[data-product-id]',
          '.product',
          '.product-item',
          '.product-card',
          '[data-product-handle]',
          '[data-product]',
          '[itemtype*="Product"]'
        ].join(','));
        
        if (productElements.length > 0) {
          console.log('✅ Found product elements:', productElements.length);
          
          const extractedProducts: Product[] = [];
          
          productElements.forEach((element, index) => {
            if (index >= 20) return; // Limit to 20 products
            
            // Try to extract product info
            const productId = element.getAttribute('data-product-id') || 
                             element.getAttribute('data-product') || 
                             element.getAttribute('data-id') || 
                             `dom-product-${index}`;
            
            // Find title
            let title = '';
            const titleSelectors = [
              '.product-title', '.product-name', 'h1', 'h2', 'h3', 'h4', '.title', 
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
              description = `${title} - Product found on ${window.location.hostname}`;
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
            
            // Only add if we have at least title and valid image
            if (title && image && !image.toLowerCase().includes('cart') && !image.toLowerCase().includes('placeholder')) {
              extractedProducts.push({
                id: String(productId),
                title,
                description,
                price: price || 0,
                currency: 'USD',
                image,
                category: 'General',
                tags: ['extracted'],
                availability: 'in_stock',
                url
              });
            }
          });
          
          // Remove duplicates
          const uniqueProducts = extractedProducts.filter((product, index, self) => 
            index === self.findIndex(p => 
              p.title === product.title && 
              Math.abs((p.price || 0) - (product.price || 0)) < 0.01
            )
          );
          
          if (uniqueProducts.length > 0) {
            console.log('✅ Extracted products:', uniqueProducts.length);
            setProducts(uniqueProducts);
            setHasRealProducts(true);
            
            // Add a system message about finding products
            const systemMessage: ChatMessage = {
              id: Date.now().toString(),
              type: 'assistant',
              content: `I found ${uniqueProducts.length} products on this page! I can help you explore them or find similar items.`,
              timestamp: new Date(),
              products: uniqueProducts.slice(0, 3) // Show first 3 as preview
            };
            setMessages([systemMessage]);
            return true;
          }
        }
      } catch (error) {
        console.error('❌ Error extracting products from DOM:', error);
      }
      
      // Try to get products from chrome.runtime messaging
      if (chrome && chrome.runtime) {
        try {
          chrome.runtime.sendMessage({ type: 'GET_PRODUCTS' }, (response) => {
            if (response && response.products && response.products.length > 0) {
              console.log('✅ Received products from background script:', response.products.length);
              
              // Filter and deduplicate products
              const validProducts = response.products.filter(product => {
                if (!product.image) return false;
                
                const invalidPatterns = ['cart', 'placeholder', 'loading', 'spinner'];
                return !invalidPatterns.some(pattern => 
                  product.image.toLowerCase().includes(pattern)
                );
              });
              
              const uniqueProducts = validProducts.filter((product, index, self) => 
                index === self.findIndex(p => 
                  p.title === product.title && 
                  Math.abs((p.price || 0) - (product.price || 0)) < 0.01
                )
              );
              
              if (uniqueProducts.length > 0) {
                setProducts(uniqueProducts);
                setHasRealProducts(true);
                
                // Add a system message about finding products
                const systemMessage: ChatMessage = {
                  id: Date.now().toString(),
                  type: 'assistant',
                  content: `I found ${uniqueProducts.length} products on this page! I can help you explore them or find similar items.`,
                  timestamp: new Date(),
                  products: uniqueProducts.slice(0, 3) // Show first 3 as preview
                };
                setMessages([systemMessage]);
                return true;
              }
            }
            return false;
          });
        } catch (error) {
          console.error('❌ Error getting products from background script:', error);
        }
      }
      
      return false;
    };
    
    // Try to extract products immediately
    const foundProducts = extractProductsFromPage();
    
    // If we couldn't find products, we'll wait for them to be extracted
    if (!foundProducts) {
      console.log('⚠️ No products found on page yet, waiting for extraction events');
    }
    
    // Listen for product extraction events
    const handleProductsExtracted = (event: CustomEvent) => {
      const { products: extractedProducts } = event.detail;
      console.log('📦 Received extracted products:', extractedProducts);
      
      if (extractedProducts && extractedProducts.length > 0) {
        // Filter out products with invalid images or duplicates
        const validProducts = extractedProducts.filter(product => {
          if (!product.image) return false;
          
          const invalidPatterns = ['cart', 'placeholder', 'loading', 'spinner'];
          return !invalidPatterns.some(pattern => 
            product.image.toLowerCase().includes(pattern)
          );
        });
        
        // Remove duplicates
        const uniqueProducts = validProducts.filter((product, index, self) => 
          index === self.findIndex(p => 
            p.title === product.title && 
            Math.abs((p.price || 0) - (product.price || 0)) < 0.01
          )
        );
        
        // Replace demo products with real extracted products
        setProducts(uniqueProducts);
        setHasRealProducts(true);
        
        // Add a system message about finding products
        const systemMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `I found ${uniqueProducts.length} products on this page! I can help you explore them or find similar items.`,
          timestamp: new Date(),
          products: uniqueProducts.slice(0, 3) // Show first 3 as preview
        };
        setMessages(prev => prev.length === 0 ? [systemMessage] : prev);
      }
    };

    // Listen for product extraction events (both old and new format)
    window.addEventListener('browseableAiProductsExtracted', handleProductsExtracted as EventListener);
    window.addEventListener('BROWSEABLE_PRODUCTS_EXTRACTED', handleProductsExtracted as EventListener);

    // Check if products are already available (parser ran before widget loaded)
    const existingProducts = (window as any).__browseableAiProducts || (window as any).__BROWSEABLE_PRODUCTS;
    if (existingProducts && existingProducts.length > 0) {
      handleProductsExtracted({ detail: { products: existingProducts } } as CustomEvent);
    }

    // Retry extraction after a delay for dynamic content
    const retryTimeout = setTimeout(() => {
      if (!hasRealProducts) {
        console.log('🔄 Retrying product extraction...');
        extractProductsFromPage();
      }
    }, 2000);

    return () => {
      window.removeEventListener('browseableAiProductsExtracted', handleProductsExtracted as EventListener);
      window.removeEventListener('BROWSEABLE_PRODUCTS_EXTRACTED', handleProductsExtracted as EventListener);
      clearTimeout(retryTimeout);
    };
  }, [hasRealProducts]);

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
      // Use real products for search instead of demo products
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