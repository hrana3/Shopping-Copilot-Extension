// Version: 1.0.1 - Updated for GitHub tracking
import { Product, ChatMessage } from '../types/product';

export class AIClient {
  private apiKey: string | null = null;
  
  constructor() {
    // In production, this would come from environment variables or user settings
    this.apiKey = null; // Set via extension options
  }
  
  async generateResponse(userMessage: string, products: Product[], context?: any): Promise<string> {
    // This function now uses real products instead of mocked data
    
    // If no products found, return a helpful message
    if (products.length === 0) {
      return "I couldn't find any products matching your request. Could you try a different search term or category?";
    }
    
    // If only one product found, provide a specific response
    if (products.length === 1) {
      const product = products[0];
      return `I found this ${product.category.toLowerCase()} that matches your request! It's a ${product.title} ${product.brand ? `from ${product.brand}` : ''} priced at $${product.price.toFixed(2)}.`;
    }
    
    // For multiple products, provide a more detailed response
    const categories = [...new Set(products.map(p => p.category))];
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    const priceRange = {
      min: Math.min(...products.map(p => p.price)),
      max: Math.max(...products.map(p => p.price))
    };
    
    // Simple keyword matching for more relevant responses
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
      return `I've found ${products.length} budget-friendly options ranging from $${priceRange.min.toFixed(2)} to $${priceRange.max.toFixed(2)}. These items offer great value while matching your style preferences.`;
    }
    
    if (lowerMessage.includes('luxury') || lowerMessage.includes('premium') || lowerMessage.includes('high-end')) {
      return `I've selected ${products.length} premium pieces ${brands.length > 0 ? `from brands like ${brands.slice(0, 3).join(', ')}` : ''} that offer exceptional quality and craftsmanship. These investment pieces will elevate your wardrobe.`;
    }
    
    if (lowerMessage.includes('casual') || lowerMessage.includes('everyday')) {
      return `Here are ${products.length} casual items perfect for everyday wear! These pieces are comfortable, versatile, and effortlessly stylish.`;
    }
    
    if (lowerMessage.includes('formal') || lowerMessage.includes('professional') || lowerMessage.includes('work')) {
      return `I've found ${products.length} sophisticated pieces perfect for professional settings while maintaining your personal style. ${brands.length > 0 ? `Featuring items from ${brands.slice(0, 2).join(' and ')}.` : ''}`;
    }
    
    // Default response with product information
    return `I found ${products.length} products that match your request! ${categories.length > 1 ? `They span categories including ${categories.slice(0, 3).join(', ')}` : `They're all in the ${categories[0]} category`} with prices ranging from $${priceRange.min.toFixed(2)} to $${priceRange.max.toFixed(2)}.`;
  }
  
  async searchProducts(query: string, allProducts: Product[]): Promise<Product[]> {
    console.log('🔍 Searching products with query:', query);
    console.log('🔍 Available products:', allProducts.length);
    
    if (allProducts.length === 0) {
      console.log('⚠️ No products available to search');
      return [];
    }
    
    // More sophisticated keyword-based search
    const searchTerms = query.toLowerCase().split(' ')
      .filter(term => term.length > 2) // Filter out short words
      .map(term => term.replace(/[^\w\s]/gi, '')); // Remove special characters
    
    console.log('🔍 Search terms:', searchTerms);
    
    if (searchTerms.length === 0) {
      console.log('⚠️ No valid search terms found, returning all products');
      return allProducts;
    }
    
    // Score each product based on matches
    const scoredProducts = allProducts.map(product => {
      // Create a searchable text from all product fields
      const searchText = `${product.title} ${product.description || ''} ${product.category || ''} ${(product.tags || []).join(' ')} ${product.brand || ''}`.toLowerCase();
      
      let score = 0;
      
      // Check for exact matches in title (highest weight)
      searchTerms.forEach(term => {
        if (product.title.toLowerCase().includes(term)) {
          score += 10;
        }
        
        // Check for matches in other fields
        if (searchText.includes(term)) {
          score += 5;
        }
        
        // Bonus for exact tag matches
        if (product.tags && product.tags.some(tag => tag.toLowerCase() === term)) {
          score += 3;
        }
        
        // Bonus for brand matches
        if (product.brand && product.brand.toLowerCase().includes(term)) {
          score += 4;
        }
        
        // Bonus for category matches
        if (product.category && product.category.toLowerCase().includes(term)) {
          score += 4;
        }
        
        // Price matching for terms like "under $50" or "$100-$200"
        if (term.includes('under') && searchTerms.some(t => t.startsWith('$'))) {
          const priceLimit = parseFloat(searchTerms.find(t => t.startsWith('$'))?.substring(1) || '0');
          if (priceLimit > 0 && product.price < priceLimit) {
            score += 8;
          }
        }
        
        // Check for price range
        const priceRangeMatch = query.match(/\$(\d+)\s*-\s*\$(\d+)/);
        if (priceRangeMatch) {
          const minPrice = parseFloat(priceRangeMatch[1]);
          const maxPrice = parseFloat(priceRangeMatch[2]);
          if (product.price >= minPrice && product.price <= maxPrice) {
            score += 8;
          }
        }
      });
      
      return { product, score };
    });
    
    // Sort by score and filter out zero scores
    const results = scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
    
    console.log(`🔍 Found ${results.length} matching products`);
    
    // If no results, return all products
    if (results.length === 0) {
      console.log('⚠️ No matching products found, returning all products');
      return allProducts;
    }
    
    // Remove duplicates based on title and price
    const uniqueResults = results.filter((product, index, self) => 
      index === self.findIndex(p => 
        p.title === product.title && 
        Math.abs((p.price || 0) - (product.price || 0)) < 0.01
      )
    );
    
    console.log(`🔍 After removing duplicates: ${uniqueResults.length} products`);
    
    // Filter out products with invalid images
    const validResults = uniqueResults.filter(product => {
      if (!product.image) return false;
      
      const invalidPatterns = ['cart', 'placeholder', 'loading', 'spinner'];
      return !invalidPatterns.some(pattern => 
        product.image.toLowerCase().includes(pattern)
      );
    });
    
    console.log(`🔍 After filtering invalid images: ${validResults.length} products`);
    
    return validResults;
  }
  
  async categorizeProducts(products: Product[]): Promise<{ [category: string]: Product[] }> {
    // Group products by category
    return products.reduce((acc, product) => {
      const category = product.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as { [category: string]: Product[] });
  }
  
  async recommendProducts(userProfile: any, products: Product[]): Promise<Product[]> {
    // For real implementation, this would use user preferences to filter and sort products
    // For now, return products sorted by availability and price
    return products
      .filter(p => p.availability === 'in_stock')
      .sort((a, b) => {
        // First sort by availability
        if (a.availability !== b.availability) {
          return a.availability === 'in_stock' ? -1 : 1;
        }
        
        // Then by discount percentage (if available)
        const aDiscount = a.discount_percentage || 0;
        const bDiscount = b.discount_percentage || 0;
        if (aDiscount !== bDiscount) {
          return bDiscount - aDiscount; // Higher discount first
        }
        
        // Then by price (lower first)
        return a.price - b.price;
      })
      .slice(0, 6); // Limit to 6 products
  }
}

export const aiClient = new AIClient();